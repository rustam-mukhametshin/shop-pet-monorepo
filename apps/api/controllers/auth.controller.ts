import {NextFunction, Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";
import {NodeMailModel} from "../models/node-mail.model";
import {validationResult} from "express-validator";
import jwt, {JwtPayload} from "jsonwebtoken";
import {generateSecret, generateURI, verify} from "otplib";
import QRCode from "qrcode";
import {ProfileModel} from "../models/profile.model";
import {env} from "../env";
import {TwoFAModel} from "../models/two-fa.model";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyRegistrationResponse
} from "@simplewebauthn/server";


function createToken(user: any) {
  return jwt.sign({
    userId: user.id,
    status: user.status,
    // Todo: refactor
  }, process.env.JWT_SECRET!, {expiresIn: '1h'});
}

function createStateToken(user: any) {
  return jwt.sign({
    userId: user.id,
    status: user.status,
  }, process.env.JWT_STATE_SECRET!, {expiresIn: '10m'});
}

function validateStateToken(token: string) {
  return jwt.verify(token, process.env.JWT_STATE_SECRET!)
}

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: [errors.array()[0].msg],
    });
  }

  try {
    const user = await UserModel.findOne({email: email});

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(422).json({
        status: 'error',
        error: 'Incorrect user or password',
      })
    }

    const profile = await ProfileModel.findOne({userId: user._id});

    if (profile?.twoFA) {
      return res.status(200).json({
        status: "MFA_REQUIRED",
        message: 'MFA is required',
        "state_token": createStateToken(user),
        // Expires in 10 minutes
        "expires_at": Date.now() + 10 * 60 * 1000
      })
    } else {
      // Create token
      return res.status(200).json({
        status: 'success',
        message: 'Login successfully',
        userId: user._id,
        token: createToken(user),
      })
    }

  } catch (error: any) {
    next(new Error(error))
  }
};


export const postLoginWithTwoFa = async (req: Request, res: Response, next: NextFunction) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array(),
    });
  }

  const {twoFACode, stateToken} = req.body;

  let payload: string | JwtPayload = jwt.verify(stateToken, process.env.JWT_STATE_SECRET!);

  try {
    payload = jwt.verify(stateToken, process.env.JWT_STATE_SECRET!);

    if (!payload || typeof payload === "string") {
      return res.status(422).json({
        status: 'error',
        message: 'Login failed',
      })
    }

  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: error,
    })
  }

  const userId = payload.userId;

  const twoFASecret = await TwoFAModel.findOne({userId: userId})

  if (twoFASecret && twoFASecret.secret) {
    const result = await verify({
      secret: twoFASecret.secret,
      token: twoFACode
    })

    if (result.valid) {
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(422).json({
          status: 'error',
          message: 'Login failed',
        })
      }

      return res.status(200).json({
        status: 'success',
        userId: user._id,
        message: 'Login successfully',
        token: createToken(user),
      })
    }
    return res.status(422).json({
      status: 'error',
      message: 'Invalid 2FA code',
    })
  } else {
    return res.status(422).json({
      status: 'error',
      message: 'Login failed',
    })
  }
};

export const postSignup = (req: Request, res: Response, next: any) => {
  const {email, password} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: [errors.array()[0].msg],
    });
  }

  // If user already exists
  return UserModel.isUserExistByEmail(email)
    .then(async userDoc => {
      if (userDoc) {
        return null;
      }

      const hashedPassword: string = await bcrypt.hash(password, 12)

      const user = new UserModel({
        name: email.split('@')[0],
        email,
        password: hashedPassword,
        cart: {items: [],},
        status: 'active',
      })
      return user.save()
    })
    .then(user => {
      if (!user) {
        return null;
      }

      const profile = new ProfileModel({
        name: user.name,
        twoFA: false,
        userId: user._id,
      })

      return profile.save().then(_ => user);
    })
    .then(user => {
      if (!user) {
        return res.status(422).json({
          error: 'User or password are incorrect'
        })
      }

      return Promise.resolve()
        .then(() => NodeMailModel.sendWelcomeEmail(user.email, user.name))
        .then(_ => res.status(201).json({message: 'User created successfully',}))
    })
    .catch((err: any) => next(err));
};

export const getStatus = (req: Request, res: Response) => {
  const status = req.user.status;
  return res.status(200).json({
    status: status,
  })
}


export let getProfile = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const profile = await ProfileModel.findOne({
      userId: req.user.userId
    })

    return res.status(200).json(profile)
  } catch (error: Error | any) {
    return res.status(400).json({
      error: error,
      status: 'error',
    })
  }
}

export const get2FA = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user.userId);
  let twoFASecret: string;
  let qrCodeDataURL: string;

  if (!user) {
    return res.status(422).json({
      status: 'error',
      message: 'Login failed',
      error: 'No user found',
    })
  }

  const oldToken = await TwoFAModel.findOne({userId: req.user.userId});

  // Todo: refactor steps to create (maybe it should be Post)
  if (!oldToken) {
    twoFASecret = generateSecret();

    const otpAuthURI = generateURI(
      {
        secret: twoFASecret,
        issuer: env.projectLabel,
        label: user.email
      }
    )

    qrCodeDataURL = await QRCode.toDataURL(otpAuthURI);

    // Save the secret to the database
    await TwoFAModel.create({
      userId: req.user.userId,
      secret: twoFASecret
    });
  } else {
    twoFASecret = oldToken.secret;
    qrCodeDataURL = oldToken.qrCodeDataURL;
  }

  return res.status(200).json({
    twoFASecret: twoFASecret, // Todo: refactor secret exposure
    qrCode: qrCodeDataURL
  })
}

/**
 * TODO: refactor, now no TokenModel
 * @param req
 * @param res
 */
export const postReset = async (req: Request, res: Response) => {
  const {email} = req.body;
  if (!email || !UserModel.isValidEmail(email)) {
    return res.status(500).redirect('/reset');
  }

  const user = await UserModel.getUserByEmail(email)

  if (!user) {
    return res.status(500).redirect('/reset');
  }

  const token = NodeMailModel.createResetPasswordToken(email);

  // Save to db
  // await new TokenModel({
  //   userId: user._id,
  //   token,
  // }).save()

  return NodeMailModel
    .sendResetPasswordEmail(email, NodeMailModel.getResetPasswordTokenLink(email, token))
    .then(() => res.redirect('/'))
    .catch((err: any) => {
      throw new Error(err);
    });
}

export const getResetPassword = (req: Request, res: Response) => {
  const token = req.query['token'] as string;

  const payload = NodeMailModel.verifyResetPasswordToken(token);

  if (!token || !payload) {
    return res.status(422).redirect('/reset');
  }

  // Todo: check validation
  if (!payload) {
    return res.status(422).redirect('/reset');
  }

  return res.json({
    _email: payload.email,
    _token: token,
  });
}

/**
 * POST
 * reset password
 * TODO: refactor, now no TokenModel
 * @param req
 * @param res
 */
export const postResetPassword = async (req: Request, res: Response) => {
  const {password, confirmPassword, _email, _token} = req.body;

  // Todo: validate password

  const user = await UserModel.findOne({email: _email})

  if (!user) {
    return res.status(422).redirect('/reset-password');
  }

  user.password = await bcrypt.hash(password, 12);
  user.confirmPassword = await bcrypt.hash(confirmPassword, 12);
  await user.save()
    // .then(() => TokenModel.deleteOne({token: _token}))
    .catch((err: any) => {
      throw new Error(err);
    });
  res.redirect('/login');
}

/**
 * PUT
 * profile
 *
 * @param req
 * @param res
 * @param next
 */
export const putProfile = async (req: Request, res: Response, next: NextFunction) => {
  const {name, twoFA} = req.body;

  try {
    const profile = await ProfileModel.findOne({userId: req.user.userId});

    if (!profile) {
      return res.status(404).json({message: 'Not found'})
    }

    /**
     * Todo: refactor
     * We already checking in get2FA if token already created in db
     * If maybe user is deleted we should delete a secret from table
     * or moved to archive table
     */
    if (profile.twoFA && twoFA === false) {
      await TwoFAModel.deleteMany({userId: req.user.userId});
    }

    profile.name = name || profile?.name;
    profile.twoFA = twoFA === undefined ? profile.twoFA : twoFA;
    return profile.save()
      .then(updatedProfile => res.status(200).json(updatedProfile))


  } catch (error: Error | any) {
    return next(error)
  }
}

export const webAuthnRegisterOptions = async (req: Request, res: Response, next: NextFunction) => {

  // const email = req.user.email;
  const id = req.user.userId;

  const user = await UserModel.findById(id);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Not found'
    })
  }

  const options = await generateRegistrationOptions({
    rpName: env.projectLabel,
    rpID: env.projectName,
    // userID: id,
    userName: user.email,
  })

  return res.status(200).json(options)
}

export const webAuthnRegisterVerify = async (req: Request, res: Response, next: NextFunction) => {

  // const email = req.user.email;
  const id = req.user.userId;

  const user = await UserModel.findById(id);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Not found'
    })
  }

  const attestation = req.body.attestation;

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: user.challenge,
    expectedOrigin: 'http://localhost:3000',
    expectedRPID: 'localhost',
  })

  if (verification.verified) {
    return res.status(200).json({
      status: 'success',
      message: 'Verification successfully'
    })
  }
  return res.status(400)
    .json({
      status: 'error',
      message: 'Registration failed'
    })
}


export const webAuthnAuthenticateOptions = async (req: Request, res: Response, next: NextFunction) => {

  // const email = req.user.email;
  const id = req.user.userId;

  const user = await UserModel.findById(id);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Not found'
    })
  }

  const options = await generateAuthenticationOptions({
    rpID: env.projectName,
    userVerification: 'preferred',
    allowCredentials: user.credentials.map((cred: any) => ({
      id: cred.credentialId,
      type: 'public-key',
      transport: cred.transport,
    }))
  })

  // Todo: Save options.challenge in DB for this user/session

  return res.status(200).json(options);
}
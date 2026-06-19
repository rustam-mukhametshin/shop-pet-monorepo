import {NextFunction, Request, Response} from 'express';
import {UserModel} from "../models/user.model";
import bcrypt from "bcryptjs";
import {NodeMailModel} from "../models/node-mail.model";
import {TokenModel} from "../models/token.model";
import {validationResult} from "express-validator";
import jwt from "jsonwebtoken";
import {generateSecret, generateURI} from "otplib";
import QRCode from "qrcode";
import {ProfileModel} from "../models/profile.model";
import {env} from "../env";
import {TwoFAModel} from "../models/two-fa.model";


export const postLogin = (req: Request, res: Response) => {
  const {email, password} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: [errors.array()[0].msg],
    });
  }

  return UserModel.findOne({email: email})
    .then(user => {
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(422).json({
          error: 'Incorrect user or password',
        })
      }

      // Todo: refactor
      if (!process.env.JWT_SECRET) {
        return res.status(422).json({
          error: 'Unknown error',
        })
      }

      // Create token
      const token = jwt.sign({
        userId: user.id,
        status: user.status,
      }, process.env.JWT_SECRET, {expiresIn: '1h'});

      return res.status(200).json({
        userId: user._id,
        message: 'Login successfully',
        token: token,
      })
    })
    .catch((err: any) => {
      throw new Error(err);
    });
};

export const postSignup = (req: Request, res: Response, next: any) => {
  const {email, password} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: [errors.array()[0].msg],
    });
  }

  let user: any;

  // If user already exists
  return UserModel.isUserExistByEmail(email)
    .then(async userDoc => {
      if (userDoc) {
        return undefined;
      } else {
        const hashedPassword: string = await bcrypt.hash(password, 12)

        user = new UserModel({
          name: email.split('@')[0],
          email,
          password: hashedPassword,
          cart: {items: [],},
          status: 'active',
        })
        return user.save()
      }
    })
    .then(user => {
      const profile = new ProfileModel({
        name: user.name,
        twoFA: false,
        userId: user._id,
      })

      return profile.save();
    })
    .then(_ => {
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

  const profile = await ProfileModel.findOne({
    userId: req.user.userId
  })

  return res.status(200).json(profile)
}

export const get2FA = async (req: Request, res: Response) => {
  const userSecret = generateSecret();

  const user = await UserModel.findById(req.user.userId);

  const otpAuthURI = generateURI(
    {
      secret: userSecret,
      issuer: env.projectLabel,
      label: user.email
    }
  )

  const qrCodeDataURL = await QRCode.toDataURL(otpAuthURI);

  // Save the secret to the database
  await TwoFAModel.create({
    userId: req.user.userId,
    secret: userSecret
  });

  return res.status(200).json({
    userSecret,
    qrCode: qrCodeDataURL
  })
}

export const postReset = async (req: Request, res: Response) => {
  const {email} = req.body;
  if (!email || !UserModel.isValidEmail(email)) {
    req.flash('error', 'Invalid email format');
    return res.status(500).redirect('/reset');
  }

  const user = await UserModel.getUserByEmail(email)

  if (!user) {
    req.flash('error', 'Invalid email format');
    return res.status(500).redirect('/reset');
  }

  const token = NodeMailModel.createResetPasswordToken(email);

  // Save to db
  await new TokenModel({
    userId: user._id,
    token,
  }).save()

  return NodeMailModel
    .sendResetPasswordEmail(email, NodeMailModel.getResetPasswordTokenLink(email, token))
    .then(() => req.flash('success', 'Success. Check your email'))
    .then(() => res.redirect('/'))
    .catch((err: any) => {
      throw new Error(err);
    });
}

export const getResetPassword = (req: Request, res: Response) => {
  const token = req.query['token'] as string;

  const payload = NodeMailModel.verifyResetPasswordToken(token);

  if (!token || !payload) {
    req.flash('error', 'Invalid token');
    return res.status(422).redirect('/reset');
  }

  // Todo: check validation
  if (!payload) {
    req.flash('error', 'Invalid token');
    return res.status(422).redirect('/reset');
  }

  return res.json({
    errorMessage: req.flash('error'),
    _email: payload.email,
    _token: token,
  });
}

export const postResetPassword = async (req: Request, res: Response) => {
  const {password, confirmPassword, _email, _token} = req.body;

  // Todo: validate password

  const user = await UserModel.findOne({email: _email})

  if (!user) {
    req.flash('error', 'Unable to find user');
    return res.status(422).redirect('/reset-password');
  }

  user.password = await bcrypt.hash(password, 12);
  user.confirmPassword = await bcrypt.hash(confirmPassword, 12);
  await user.save()
    .then(() => TokenModel.deleteOne({token: _token}))
    .catch((err: any) => {
      throw new Error(err);
    });

  req.flash('success', 'Success. Password reset successfully')
  res.redirect('/login');
}

export const putProfile = async (req: Request, res: Response, next: NextFunction) => {
  const {name, twoFA} = req.body;
  return ProfileModel.findOne({userId: req.user.userId})
    .then((profile: any) => {
      if (!profile) {
        return res.status(404).json({message: 'Not found'})
      }

      profile.name = name || profile?.name;
      profile.twoFA = twoFA === undefined ? profile.twoFA : twoFA;
      return profile.save();
    })
    .then(updatedProfile => res.status(200).json(updatedProfile))
    .catch((err: any) => next(err));
}
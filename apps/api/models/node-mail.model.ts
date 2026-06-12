import nodemailer, {Transporter} from "nodemailer";
import jwt from 'jsonwebtoken';

export class NodeMailModel {
    private _transporterOptions = {
        service: process.env.NODE_MAIL_SERVICE!, // or use your SMTP server
        auth: {
            user: process.env.NODE_MAIL_USER!,
            pass: process.env.NODE_MAIL_PASSWORD!
        }
    }

    private _transporter: Transporter = nodemailer.createTransport(this._transporterOptions);

    private _mailOptions: {
        from: string;
        to: string,
        subject?: string,
        text?: string
    } = {
        from: this._transporterOptions.auth.user,
        to: 'test@mail.com',
        subject: 'Test Email',
        text: 'Hello from Node.js!'
    };

    /**
     * Send welcome email to user after registration
     * Only if env.prod = true
     *
     * @param email
     * @param name
     */
    static async sendWelcomeEmail(email: string, name: string) {
        try {
            return await new NodeMailModel().sendMail({
                to: email,
                subject: `Welcome to Your Account ${name}`,
                text: `Hello and welcome to Your Account ${name}`,
            });
        } catch (err) {
            console.error('Error sending welcome email:', err);
        }
    }

    /**
     * Send reset password email
     * Only if env.prod = true
     *
     * @param email
     * @param link
     */
    static async sendResetPasswordEmail(email: string, link: string) {
        try {
            return await new NodeMailModel().sendMail({
                to: email,
                subject: `Reset Password Reset for ${email}`,
                text: `
        You requested a password reset. Please click the link below to reset your password.
        ${link}
        `
            });
        } catch (err) {
            console.error('Error sending welcome email:', err);
        }
    }

    static getResetPasswordTokenLink(email: string, token: string) {
        return [
            process.env.MAIN_URL!,
            'reset-password',
            `?token=${token ?? NodeMailModel.createResetPasswordToken(email)}`,
        ].join('');
    }

    static createResetPasswordToken(email: string) {
        return jwt.sign(
            {email: email,},
            process.env.DB_SESSION_SECRET!,
            {expiresIn: '1h',}
        )
    }

    static verifyResetPasswordToken(token: string): { email: string, iat: number, exp: number } | null {
        return jwt.verify(token, process.env.DB_SESSION_SECRET!) as { email: string, iat: number, exp: number } | null;
    }

    /**
     * Default method to send email
     * Only if env.prod = true
     *
     * @param options
     */
    sendMail(options: {
        to: string,
        subject?: string,
        text?: string
    }) {
        this._mailOptions.to = options.to;
        this._mailOptions.subject = options.subject;
        this._mailOptions.text = options.text;

        if (process.env.ENV === 'prod') {
            return this._transporter.sendMail(
                this._mailOptions
            )
        }
        return new Promise(resolve => resolve('DEV ENVIRONMENT'));
    }
}
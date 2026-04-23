import nodemailer, {Transporter} from "nodemailer";
import {env} from "../env";

export class NodeMailModel {
    private _transporterOptions = {
        service: env.nodeMail.service, // or use your SMTP server
        auth: {
            user: env.nodeMail.user,
            pass: env.nodeMail.password
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

    sendMail(options: {
        to: string,
        subject?: string,
        text?: string
    }) {
        this._mailOptions.to = options.to;
        this._mailOptions.subject = options.subject;
        this._mailOptions.text = options.text;


        return this._transporter.sendMail(
            this._mailOptions
        )
    }
}
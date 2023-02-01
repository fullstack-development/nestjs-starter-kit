import { Injectable, Module } from '@nestjs/common';
import { Config, ConfigProvider } from '../../core/config/config.core';
// import { createTransport } from 'nodemailer';

@Injectable()
export class MailServiceProvider {
    // private transport: ReturnType<typeof createTransport>;

    constructor(private readonly config: ConfigProvider) {
        // this.transport = createTransport({
        //     host: 'smtp.sendgrid.net',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: 'apikey',
        //         pass: config.email.SENDGRID_API_KEY,
        //     },
        // });
    }

    async sendEmail(subject: string, body: string, to: string) {
        throw new Error(`Email service not configured. ${subject} ${body} ${to}`);
        // if (!this.config.config.TEST) {
        //     await this.transport.sendMail({
        //         from: `"CompanyName" <mail@${this.config.DOMAIN}>`,
        //         to,
        //         subject,
        //         text: body,
        //         html: body,
        //     });
        // }
    }
}

@Module({
    imports: [Config],
    providers: [MailServiceProvider],
    exports: [MailServiceProvider],
})
export class MailService {}

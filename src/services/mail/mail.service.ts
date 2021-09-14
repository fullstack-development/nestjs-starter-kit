import { Module } from '@nestjs/common';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { Injectable } from '@nestjs/common';
// import { createTransport } from 'nodemailer';

@Injectable()
export class MailServiceProvider {
    // private transport: ReturnType<typeof createTransport>;

    constructor(private readonly configService: ConfigServiceProvider) {
        // this.transport = createTransport({
        //     host: 'smtp.sendgrid.net',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: 'apikey',
        //         pass: configService.email.SENDGRID_API_KEY,
        //     },
        // });
    }

    async sendEmail(subject: string, body: string, to: string) {
        throw new Error(`Email service not configured. ${subject} ${body} ${to}`);
        // if (!this.configService.config.TEST) {
        //     await this.transport.sendMail({
        //         from: `"CompanyName" <mail@${this.configService.DOMAIN}>`,
        //         to,
        //         subject,
        //         text: body,
        //         html: body,
        //     });
        // }
    }
}

@Module({
    imports: [ConfigService],
    providers: [MailServiceProvider],
    exports: [MailServiceProvider],
})
export class MailService {}

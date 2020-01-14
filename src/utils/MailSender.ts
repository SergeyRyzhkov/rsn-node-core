import * as nodemailer from 'nodemailer';
import AppConfig from './Config';
import { SentMessageInfo } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export default class MailSender {

  public static smtpOptions = {
    host: AppConfig.mail.host,
    port: AppConfig.mail.port,
    pool: true,
    maxConnections: 1,
    maxMessages: 100
  };

  public static smtpTransport = nodemailer.createTransport(MailSender.smtpOptions);

  public static send (to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      to,
      subject,
      text,
      html,
      from: AppConfig.mail.from
    };

    const sendCallback = (err: Error | null, info: SentMessageInfo) => {
      const rr = err;
      const infoinfo = info;
    }


    this.smtpTransport.sendMail(mailOptions, sendCallback);
  }

  public static sendFromTemplate (to: string, subject: string, templateName: string, format: (template: string) => string) {
    const filePath = path.resolve('mail', templateName + '.html');
    if (fs.existsSync(filePath)) {
      const templateContent = fs.readFileSync(filePath, 'utf8');
      const text = format ? format(templateContent) : templateContent;
      this.send(to, subject, text, text);
    }
  }
}

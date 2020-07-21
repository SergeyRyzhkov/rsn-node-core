import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../utils/Config';
import { SentMessageInfo } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { IMailMessage } from './IMailMessage';
import { ISmtpOptions } from './ISmtpOptions';

export class MailSender {

  public smtpTransport;

  constructor (options: ISmtpOptions) {
    this.smtpTransport = nodemailer.createTransport(options);
  }

  public send (message: IMailMessage, sendCallback?: (err: Error | null, info: SentMessageInfo) => any) {
    const _sendCallback = (err: Error | null, info: SentMessageInfo) => {
      if (!!sendCallback) {
        sendCallback(err, info);
      }
    }

    this.smtpTransport.sendMail(message, _sendCallback);
  }

  public sendFromTemplate (message: IMailMessage, templateName: string, format: (template: string) => string) {
    const filePath = path.resolve('mail', templateName + '.html');
    if (fs.existsSync(filePath)) {
      const templateContent = fs.readFileSync(filePath, 'utf8');
      message.text = format ? format(templateContent) : templateContent;
      this.send(message);
    }
  }
}

import * as nodemailer from 'nodemailer';
import { AppConfig } from './Config';
import { SentMessageInfo } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

//FIXME: Вынести как сервис

export class MailSender {

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


// const nodemailer = require("nodemailer");

// let send = async args => {
//  try {
//    // Generate test SMTP service account from ethereal.email
//    // Only needed if you don't have a real mail account for testing
//    let testAccount = await nodemailer.createTestAccount();

//    // create reusable transporter object using the default SMTP transport
//    let transporter = nodemailer.createTransport({
//      host: "smtp.ethereal.email",
//      port: 587,
//      secure: false, // true for 465, false for other ports
//      auth: {
//        user: testAccount.user, // generated ethereal user
//        pass: testAccount.pass // generated ethereal password
//      }
//    });

//    // send mail with defined transport object
//    let info = await transporter.sendMail({
//      from: '"Sathish 👻" <sathish@example.com>', // sender address
//      to: args.email, // list of receivers
//      subject: args.subject, // Subject line
//      html: args.body // html body
//    });

//    console.log("Message sent: %s", info.messageId);
//    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//    // Preview only available when sending through an Ethereal account
//    console.log(nodemailer.getTestMessageUrl(info));
//    return nodemailer.getTestMessageUrl(info);
//    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
//  } catch (err) {
//    console.log(`Error: ${err}`);
//  }
// };

// module.exports = {
//  send
// };

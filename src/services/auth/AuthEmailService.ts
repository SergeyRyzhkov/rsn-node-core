import { AppConfig } from '@/utils/Config';
import { MailSender } from '@/services/mail/MailSender';
import { BaseService } from '../BaseService';
import { IMailMessage } from '../mail/IMailMessage';

export class AuthEmailService extends BaseService {


  private mailSender: MailSender = new MailSender(AppConfig.mail);

  // Отправляем письмо с подтверждением регистрации
  public sendVerifyRegistrationEmail (email: string, verifyToken: string) {
    const verifyLink = `${AppConfig.serverConfig.host}${AppConfig.serverConfig.restApiEndPoint}/user/register/verify/${verifyToken}`;

    const format = (template: string) => {
      return template.replace('{{verify_link}}', verifyLink)
    }

    this.mailSender.sendFromTemplate(this.createMailMessage(email, '[ГосТорги 24] Добро пожаловать!'), 'reg_confirm', format);
  }

  // Отправляем письмо для восстановления пароля
  public sendResetPasswordEmail (email: string, resetPasswordToken: string) {
    const verifyLink = `${AppConfig.serverConfig.host}${AppConfig.serverConfig.restApiEndPoint}/user/password/reset/verify/${resetPasswordToken}`;

    const format = (template: string) => {
      return template.replace('{{reset_password_link}}', verifyLink)
    }

    this.mailSender.sendFromTemplate(this.createMailMessage(email, '[ГосТорги 24] Восстановление пароля'), 'reset_password', format);
  }

  private createMailMessage (to: string, subject: string): IMailMessage {
    return {
      from: '',
      to,
      text: '',
      html: '',
      subject
    }
  }
}

import Guid from '@/utils/Guid';
import AppConfig from '@/utils/Config';
import MailSender from '@/utils/MailSender';

export default class AuthEmailService {

  // Отправляем письмо с подтверждением регистрации
  public sendVerifyRegistrationEmail (email: string, verifyToken: string) {
    const verifyLink = `${AppConfig.serverConfig.host}${AppConfig.serverConfig.restApiEndPoint}/user/register/verify/${verifyToken}`;

    const format = (template: string) => {
      return template.replace('{{verify_link}}', verifyLink)
    }

    MailSender.sendFromTemplate(email, '[ГосТорги 24] Добро пожаловать!', 'reg_confirm', format);
  }

  // Отправляем письмо для восстановления пароля
  public sendResetPasswordEmail (email: string, resetPasswordToken: string) {
    const verifyLink = `${AppConfig.serverConfig.host}${AppConfig.serverConfig.restApiEndPoint}/user/password/reset/verify/${resetPasswordToken}`;

    const format = (template: string) => {
      return template.replace('{{reset_password_link}}', verifyLink)
    }

    MailSender.sendFromTemplate(email, '[ГосТорги 24] Восстановление пароля', 'reset_password', format);
  }
}

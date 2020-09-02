import { AppConfig } from '@/utils/Config';

export class RegistrationOptions {


    // Для генерации хэша пароля 
    public bcryptSaltRounds = 10;

    // Логином явялется номер телефона или почта?
    public isLoginByPhone = true;

    // Требуется подтверждение регистрации по почте (имеет смысл только если isLoginByPhone = false)
    public isRequireConfirmationByEmail = true;

    // Требуется подтверждение регистрации по SMS (имеет смысл только если isLoginPhone = true && !isAutoLogin)
    public isRequireConfirmationBySms = true;

    // Путь (URL) для подтверждения регистрации (будет вставлен в почтовом сообщекнии)
    public сonfirMailUrl = `${AppConfig.serverConfig.host}${AppConfig.serverConfig.restApiEndPoint}/user/registration/confirm/mail`;

    // Заголовок в email подтверждения регистрации
    public сonfirmMailHeader = 'Подтверждение регистрации';

    // Наименование шаблона (в папке mail) email подтверждения регистрации
    public сonfirmMailTemplate = 'reg_confirm';

    // Выражение в шаблоне email (подтверждения регистрации) вместо которго будет вставлен URL для подтверждения
    public сonfirmUrlTemplateExpression = '{{verify_link}}';

    // Врекмя жизни ссылки по почте для подтверждения регистрации
    public emailConfirmationLifetime = 864000;


    // Сообщения для вывода на клиенте
    public registrationCompliteMessage = 'Регистрация завершена';

    public userAlreadyExistsMessage = 'Пользователь с данным логином уже существует';

    public invalidEmailMessage = 'Неверно указан email';

    public invalidPhoneMessage = 'Неверно указан телефон';

    public passwordNotStrenghtMessage = 'Пароль должен содержать не менее 8 символов включая цифры, прописные и строчные буквы'

    // Сообщение, если НЕ автологинили пользователя И необходимо подтвердить
    public requireConfirmationEmailMessage = 'В Ваш адрес отправлено письмо. Перейдите по ссылке из письма для завершения регистрации'

    public requireSmsConfirmationMessage = 'Подтвердитее регистрацию. Введите SMS код'

    public invalidConfirmationCodeMessage = 'Неверный код подтверждения или истек срок действия ссылки, или аккаунт был удален';

}

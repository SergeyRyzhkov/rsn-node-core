import { ConfigManager } from '@/ConfigManager';
import { ExpressConfig } from '@/ExpressConfig';
import { Exclude } from 'class-transformer';

export class ResetPasswordOptions {

    @Exclude()
    private appConfig = ConfigManager.instance.getOptionsAsClass(ExpressConfig, "ExpressConfig");

    // Подтверждение пароля по ссылке из письма? Иначе надо будет указать код по смс
    public resetPasswordEmailConfirm = true;

    // Путь (URL) для восстановления пароля (будет вставлен в почтовом сообщекнии)
    public resetPasswordUrl = `${this.appConfig.host}${this.appConfig.restApiBaseUrl}/user/password/reset/confirm`;

    // Заголовок в email 
    public resetPasswordMailHeader = 'Подтверждение регистрации';

    // Наименование шаблона (в папке mail) email 
    public resetPasswordMailTemplate = 'reset_password';

    // Выражение в шаблоне email вместо которго будет вставлен URL для сброса пароля
    public resetPasswordUrlTemplateExpression = '{{reset_password_link}}';

    // Врекмя жизни ссылки по почте для подтверждения регистрации
    public resetPasswordLifetimeInSeconds = 24 * 60 * 60;

    // Сообщение если пользователь с логином не найден
    public resetPasswordUserNotFoundMessage = 'Неверный логин пользователя';

    // Сообщение если пользователь с логином не найден
    public resetPasswordInvalidCodeMessage = 'Неверно указан код';

    // Сообщение если время жизни токена для восстановления вышло
    public resetPasswordExpareddMessage = 'Истек срок действия токена для восстановления пароля';

    // Сообщение после отправки письма
    public resetPasswordMailSendMessage = 'На почтовый ящик отправлено письмо с инструкциями для восстановления пароля';

    // Сообщение после отправки смс кода
    public resetPasswordSmsSendMessage = 'Введите SMS код';

    // Сообщение после усешного сброса пароля
    public resetPasswordOKMessage = 'Укажите новый пароль';

}

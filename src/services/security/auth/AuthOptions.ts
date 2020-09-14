export class AuthOptions {

    // Логином явялется номер телефона или почта?
    public isLoginByPhone = true;

    // FIXME: Треьуется подтверждение по коду в почте
    // Требуется подтверждение регистрации по SMS 
    public isRequireConfirmationBySms = true;

    // Сообщение, если была авторизация через соц.сеть, но пользователя нет еще
    public userNotFoundButSocialNetworkAuthOkMessage = 'Профиль не связан с какой-либо учетной записью на сайте. Войдите на сайт или зарегистрируйтесь, чтобы заходить в один аккаунт вводя логин и пароль или используя ';

    // Сообщение, если учетная запсиь блокирована
    public userBlockedMessage = 'Учетная запись заблокирована'

    public failedMessage = 'Ошибка входа. Неверный идентификатор пользователя или пароль'

    public errorMessage = 'Ошибка входа'

    public authOkMessage = 'Вход выполнен успешно'

    public requireSmsConfirmationMessage = 'Введите SMS код'

    public invalidConfirmationCodeMessage = 'Неверный код подтверждения или истек срок действия';

    public requireRegistrationConfirmationMessage = 'Регистрация не подтверждена';
}

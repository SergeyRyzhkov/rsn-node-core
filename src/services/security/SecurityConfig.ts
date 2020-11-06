import { RegistrationOptions } from './registration/RegistrationOptions';
import { AuthOptions } from './auth/AuthOptions';
import { SignOptions } from 'jsonwebtoken';
import { ResetPasswordOptions } from './reset/ResetPasswordOptions';

export class SecurityConfig {
    public cookieDomain = ".example.com"
    public jwtCookieName = "auth-rsn-cookie";
    public jwtSecretKey = "gostorgiryzhkov1976";
    public jwtSignOptions: SignOptions = {
        "expiresIn": 600
    }
    public refreshTokenAgeInSeconds = 30 * 24 * 60 * 60;

    public registrationOptions: RegistrationOptions = new RegistrationOptions();
    public authOptions: AuthOptions = new AuthOptions();
    public resetPasswordOptions: ResetPasswordOptions = new ResetPasswordOptions();

}
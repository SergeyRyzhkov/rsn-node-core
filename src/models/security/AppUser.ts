import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("app_user")
export class AppUser {
    @PrimaryGeneratedColumn({
        name: "app_user_id",
    })
    public appUserId: number;

    @Column("text", {
        nullable: true,
        name: "app_user_full_name",
    })
    public appUserFullName: string;

    @Column("text", {
        nullable: true,
        name: "app_user_login",
    })
    public appUserLogin: string;

    @Column("text", {
        nullable: true,
        name: "app_user_pwd_hash",
    })
    public appUserPwdHash: string;

    @Column({
        name: "app_user_reg_date",
    })
    public appUserRegDate: string;

    @Column("numeric", {
        nullable: true,
        name: "app_user_blocked_ind",
    })
    public appUserBlockedInd: number;

    @Column({
        name: "app_user_blocked_date",
    })
    public appUserBlockedDate: string;

    @Column("numeric", {
        name: "app_user_reg_verified_ind",
    })
    public appUserRegVerifiedInd: number;

    @Column({
        name: "app_user_reg_token",
    })
    public appUserRegToken: string;

    @Column("text", {
        nullable: true,
        name: "app_user_reset_pwd",
    })
    public appUserResetPwd: string;

    @Column({
        name: "app_user_reset_pwd_date",
    })
    public appUserResetPwdDate: string;

    @Column({
        name: "app_user_sms_code",
    })
    public appUserSmsCode: number;

    @Column({
        name: "app_user_phone",
    })
    public appUserPhone: string;

    @Column({
        name: "app_user_mail",
    })
    public appUserMail: string;

    public roleIdList: number;

    @Column({ name: "app_user_admin_ind" })
    public appUserAdminInd: boolean;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthRepository } from '../abstract/i-auth-repository';
import { LoginModel } from '../login.model';
import { Member } from '../member.model';
import { RegisterModel } from '../register.model';
import { ReturnModel } from '../return.model';
import { SecurityCodeModel } from '../security-code.model';
import { AuthService } from '../services/auth.service';
import { TokenMemberModel } from '../token-member.model';
import {  HttpResponse } from '@angular/common/http';

@Injectable()
export class AuthRepository implements IAuthRepository {

    constructor(private service: AuthService) { }
   
    authenticate(loginModel: LoginModel, recaptchaToken: string): Observable<HttpResponse<TokenMemberModel>> {
        return this.service.authenticate(loginModel, recaptchaToken);
    }
    refreshToken(tokenMemberModel: TokenMemberModel): Observable<TokenMemberModel> {
        return this.service.refreshToken(tokenMemberModel);
    }
    revoke(): Observable<void> {
        return this.service.revoke();
    }

    register(registerModel: RegisterModel, recaptchaToken: string): Observable<ReturnModel<number>> {
        return this.service.register(registerModel, recaptchaToken);
    }
    
    isSecurityCodeFoundAndValid(securityCode: string): Observable<boolean> {
        return this.service.isSecurityCodeFoundAndValid(securityCode);
    }
    requestForgotPasswordEmail(email: string, recaptchaToken: string): Observable<ReturnModel<null>> {
        return this.service.requestForgotPasswordEmail(email, recaptchaToken);
    }
    setUpNewPassword(securityCodeModel: SecurityCodeModel, recaptchaToken: string): Observable<ReturnModel<null>> {
        return this.service.setUpNewPassword(securityCodeModel, recaptchaToken);
    }






}

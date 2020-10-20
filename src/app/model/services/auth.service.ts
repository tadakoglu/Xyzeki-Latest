import { Injectable } from '@angular/core';

import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { LoginModel } from '../login.model';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Member } from '../member.model';
import { ReturnModel } from '../return.model';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { RegisterModel } from '../register.model';
import { SecurityCodeModel } from '../security-code.model';
import { GoogleReCaptcha_SecretKey } from 'src/infrastructure/google-captcha';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
import { Tuple } from '../tuple.model';
import { TokenMemberModel } from '../token-member.model';


@Injectable()
export class AuthService {
  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  getRecaptchaUserResponse(token: string): Observable<any> { //https://developers.google.com/recaptcha/docs/verify
    return this.http.post("https://www.google.com/recaptcha/api/siteverify", null, { params: { 'secret': GoogleReCaptcha_SecretKey, 'response': token } })
  }
  //   Response is a JSON object.
  //   {
  //   "success": true|false,
  //   "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  //   "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
  //   "error-codes": [...]        // optional
  // }

  authenticate(loginModel: LoginModel, recaptchaToken): Observable<HttpResponse<TokenMemberModel>> { // get token with member data
    //loginModel.Password = this.cryptoHelpers.encryptWithAES(loginModel.Password); // Later will be decrypt in .NET 
    return this.http.post<TokenMemberModel>(this.baseURL + "api/Auth/Authenticate", loginModel,
      {
        observe: "response", headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        params: { 'recaptchaToken': recaptchaToken }
      })
    // Pipe will open up the observable returned by 'post' method and transform the pure object through a set of functions seperated by comma.
  }
  refreshToken(tokenMemberModel: TokenMemberModel): Observable<TokenMemberModel> { // send old, get new
    console.log('giden token member model' + JSON.stringify(tokenMemberModel))
    return this.http.post<TokenMemberModel>(`${this.baseURL}api/Auth/Refresh`, tokenMemberModel);
  }

  revoke(): Observable<void> {
    return this.http.post<void>(`${this.baseURL}api/Auth/Revoke`, null);
  }

  SetSessionString(key: string, value: string): Observable<any> {
    return this.http.post(`${this.baseURL}api/Auth/SetSessionString?key=${key}`, value, this.getOptions1());
  }
  SetSessionObject(key: string, value: object): Observable<any> {
    return this.http.post(`${this.baseURL}api/Auth/SetSessionObject?key=${key}`, value);
  }

  GetSessionString(key: string): Observable<string> {
    return this.http.get(`${this.baseURL}api/Auth/GetSessionString?key=${key}`, { responseType: 'text' });
  }
  GetSessionObject(key: string): Observable<object> {
    return this.http.get<object>(`${this.baseURL}api/Auth/GetSessionObject?key=${key}`);
  }
  DeleteSessionObject(key: string): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}api/Auth/DeleteSessionObject?key=${key}`);
  }

  register(registerModel: RegisterModel, recaptchaToken: string): Observable<ReturnModel<number | null>> {
    //registerModel.Password = this.cryptoHelpers.encryptWithAES(registerModel.Password); // Later will be decrypt in .NET 
    return this.http.post(this.baseURL + "api/Auth/Register", registerModel, { observe: "response", headers: new HttpHeaders({ 'Content-Type': 'application/json', }), params: { 'recaptchaToken': recaptchaToken }, responseType: 'text' }).
      pipe(map(response => {
        switch (response.status) {   // 200 OK, 200 OK but with error code, 503ServiceUnavailable.. 
          case 200:
            if (response.body == "#-1:ME")
              return new ReturnModel(ErrorCodes.MemberAlreadyExistsError, null);
            else
              return new ReturnModel(ErrorCodes.OK, parseInt(response.body));
        }
      })) // Pipe will open up the observable returned by 'post' method and transform the pure object through a set of functions seperated by comma.
  }

  requestForgotPasswordEmail(email: string, recaptchaToken: string): Observable<ReturnModel<null>> {
    return this.http.get(this.baseURL + "api/Auth/ForgotPassword/" + email, { observe: "response", params: { 'recaptchaToken': recaptchaToken } }).
      pipe(map(response => {
        switch (response.status) {
          case 200:
            return new ReturnModel(ErrorCodes.OK);
          case 404:
            return new ReturnModel(ErrorCodes.ItemNotFoundError);
          default:// 503
            return new ReturnModel(ErrorCodes.DatabaseError);
        }
      }))
  }
  isSecurityCodeFoundAndValid(securityCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseURL}api/Auth/IsSecurityCodeFoundAndValid/` + securityCode);
  }
  setUpNewPassword(securityCodeModel: SecurityCodeModel, recaptchaToken: string = ''): Observable<ReturnModel<null>> {
    //securityCodeModel.NewPassword = this.cryptoHelpers.encryptWithAES(securityCodeModel.NewPassword); // Later will be decrypt in .NET 

    return this.http.post(this.baseURL + "api/Auth/SetUpNewPassword", securityCodeModel, { observe: "response", params: { 'recaptchaToken': recaptchaToken }, headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }).
      pipe(map(response => {
        switch (response.status) {
          case 200:
            return new ReturnModel(ErrorCodes.OK);
          case 404:
            return new ReturnModel(ErrorCodes.ItemNotFoundError); // expired or no such user in forgotpassword sql table.
          default:// 503
            return new ReturnModel(ErrorCodes.DatabaseError);
        }
      }));
  }

  getOptions3() {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' };

  }
  getOptions1(): object {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' };

  }
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      // if (error.status == 401) {
      // //  new ReturnModel<string>(ErrorCodes.WrongCredentials, null); 
      // }
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
  // authenticate(loginModel: LoginModel): Observable<ReturnModel<string>> {
  //   return this.http.post(this.baseURL + "api/Auth/Authenticate", loginModel, { observe: "response", headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' }).
  //     pipe(map(response => {
  //       switch (response.status) {  //200 OK or 401 Unauthorized    
  //         case 200:
  //           return new ReturnModel<string>(ErrorCodes.OK, response.body);
  //       }
  //     })) // Pipe will open up the observable returned by 'post' method and transform the pure object through a set of functions seperated by comma.
  // }
}


import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { Member } from '../member.model';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import { RegisterModel } from '../register.model';
import { ReturnModel } from '../return.model';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MembersService {

  baseURL: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  
  getMember(username: string): Observable<Member> {
    return this.http.get<Member>(this.baseURL + "api/Members/GetUser/" + username)
  }
  updateMember(registerModel: RegisterModel): Observable<ReturnModel<object>> {
    return this.http.put(`${this.baseURL}api/Members/${registerModel.Username}`, registerModel, { observe: "response", headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' }).
      pipe(map(response => {
        switch (response.status) {   // 200 OK, 200 OK but with error code, 503ServiceUnavailable.. 
          case 200:
            if (response.body == "#-1:ME")
              return new ReturnModel(ErrorCodes.MemberAlreadyExistsError, null);
          case 204:
            return new ReturnModel(ErrorCodes.OK, null);

        }
      }))
  }
  grantAccess(passwordTry: string): Observable<boolean> {
    return this.http.get<boolean>(this.baseURL + "api/Members/GrantAccess/" + passwordTry)
  }



}

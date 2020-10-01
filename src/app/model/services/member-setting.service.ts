import { Injectable } from '@angular/core';
import { XyzekiAuthService } from '../xyzeki-auth-service';

import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { MemberSetting } from '../member-setting.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MemberSettingService {

  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  mySetting(): Observable<MemberSetting> {
    return this.http.get<MemberSetting>(this.baseURL + `api/MemberSetting/MySetting`)
  }
  updateMySetting(mSetting: MemberSetting): Observable<null> {
    return this.http.put<null>(this.baseURL + "api/MemberSetting/" + mSetting.Username, mSetting)
  }



}

import { Injectable } from '@angular/core';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';

import { Observable, of } from 'rxjs';
import { MemberLicense } from '../member-license.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MemberLicenseSM } from '../member-license-sm.model';
import { switchMap } from 'rxjs/operators';
import { MemberLicenseUsedStorage } from '../member-license-used-storage.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MemberLicenseService {

  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }

  primaryAccessGranted(): Observable<boolean> { // kurumsal(ekip) lisansı, ml.LicenseType=="kurumsal"
    return this.http.get<boolean>(this.baseURL + `api/MemberLicense/PrimaryAccessGranted`)
  }
  accessGranted(): Observable<boolean> {  // herhangi bir çeşit lisans var mı.
    return this.http.get<boolean>(this.baseURL + `api/MemberLicense/AccessGranted`)
  }
  allLicenses(): Observable<MemberLicense[]> {
    return this.http.get<MemberLicense[]>(this.baseURL + `api/MemberLicense/AllLicenses`)
  }
  newLicense(memberLicense: MemberLicense): Observable<string> {
    return this.http.post<string>(this.baseURL + "api/MemberLicense", memberLicense)
  }
  deleteLicense(licenseId: string): Observable<MemberLicense> {
    return this.http.delete<MemberLicense>(`${this.baseURL}api/MemberLicense/${licenseId}`)
  }
  myLicense(): Observable<MemberLicense> {
    return this.http.get<MemberLicense>(this.baseURL + `api/MemberLicense/MyLicense`)
  }
  usedStorage(licenseId: string): Observable<MemberLicenseUsedStorage> {
    return this.http.get<MemberLicenseUsedStorage>(this.baseURL + `api/MemberLicense/${licenseId}/UsedStorage`)
  }


}


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class TimeService {
  baseURL: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }

  getUnixTimestamp(): Observable<number> {
    return this.http.get<number>(this.baseURL + `api/Auth/GetUnixTimestamp`)
  }
  getNow(): Observable<string> {
    return this.http.get(this.baseURL + `api/Auth/GetNow`, { responseType: 'text' })
  }




}

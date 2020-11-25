import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkReceiversService {
    baseURL: string;

    constructor(private http: HttpClient) {
        this.baseURL = BackEndWebServer + '/'
    }
    myPrivateTalkReceivers(searchValue?): Observable<PrivateTalkReceiver[]> {
        return this.http.get<PrivateTalkReceiver[]>(this.baseURL + `api/PrivateTalkReceivers/PrivateTalk/MyAll/Search/${searchValue ? searchValue : ''}`)
    }
    privateTalkReceivers(privateTalkId: number): Observable<PrivateTalkReceiver[]> {
        return this.http.get<PrivateTalkReceiver[]>(this.baseURL + `api/PrivateTalkReceivers/PrivateTalk/${privateTalkId}`)
    }
    findPrivateTalkReceiver(privateTalkReceiverId: number): Observable<PrivateTalkReceiver> {
        return this.http.get<PrivateTalkReceiver>(this.baseURL + `api/PrivateTalkReceivers/${privateTalkReceiverId}`)
    }
    savePrivateTalkReceiver(privateTalkReceiver: PrivateTalkReceiver): Observable<number> {
        return this.http.post<number>(this.baseURL + "api/PrivateTalkReceivers", privateTalkReceiver);
    }
    savePrivateTalkReceivers(privateTalkReceivers: PrivateTalkReceiver[]): Observable<null> {
        return this.http.post<null>(this.baseURL + "api/PrivateTalkReceivers", privateTalkReceivers);
    }
    deletePrivateTalkReceivers(privateTalkId: number): Observable<PrivateTalkReceiver[]> {
        return this.http.delete<PrivateTalkReceiver[]>(`${this.baseURL}api/PrivateTalkReceivers/PrivateTalk/${privateTalkId}`)
    }

}

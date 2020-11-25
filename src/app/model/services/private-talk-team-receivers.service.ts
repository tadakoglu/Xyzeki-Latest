import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkTeamReceiversService {
    baseURL: string;

    constructor(private http: HttpClient) {
        this.baseURL = BackEndWebServer + '/'
    }

    myPrivateTalkTeamReceivers(searchValue?): Observable<PrivateTalkTeamReceiver[]> {
        return this.http.get<PrivateTalkTeamReceiver[]>(this.baseURL + `api/PrivateTalkTeamReceivers/PrivateTalk/MyAll/Search/${searchValue ? searchValue : ''}`)
    }
    privateTalkTeamReceivers(privateTalkId: number): Observable<PrivateTalkTeamReceiver[]> {
        return this.http.get<PrivateTalkTeamReceiver[]>(this.baseURL + `api/PrivateTalkTeamReceivers/PrivateTalk/${privateTalkId}`)
    }
    findPrivateTalkTeamReceiver(privateTalkTeamReceiverId: number): Observable<PrivateTalkTeamReceiver> {
        return this.http.get<PrivateTalkTeamReceiver>(this.baseURL + `api/PrivateTalkTeamReceivers/${privateTalkTeamReceiverId}`)
    }
    savePrivateTalkTeamReceiver(privateTalkTeamReceiver: PrivateTalkTeamReceiver): Observable<number> {
        return this.http.post<number>(this.baseURL + "api/PrivateTalkTeamReceivers", privateTalkTeamReceiver);
    }
    savePrivateTalkTeamReceivers(privateTalkTeamReceivers: PrivateTalkTeamReceiver[]): Observable<null> {
        return this.http.post<null>(this.baseURL + "api/PrivateTalkTeamReceivers", privateTalkTeamReceivers);
    }
    deletePrivateTalkTeamReceivers(privateTalkId: number): Observable<PrivateTalkTeamReceiver[]> {
        return this.http.delete<PrivateTalkTeamReceiver[]>(`${this.baseURL}api/PrivateTalkTeamReceivers/PrivateTalk/${privateTalkId}`)
    }

}

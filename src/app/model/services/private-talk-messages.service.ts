import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from '../xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkMessage } from '../private-talk-message.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkMessagesService {
    baseURL: string;

    constructor(private http: HttpClient) {
        this.baseURL = BackEndWebServer + '/'
    }
    privateTalkMessages(privateTalkId: number, pageNo = 1, pageSize?: number): Observable<PrivateTalkMessage[]> {
        return this.http.get<PrivateTalkMessage[]>(this.baseURL + `api/PrivateTalkMessages/PrivateTalk/${privateTalkId}/Page/${pageNo}/PageSize/${pageSize}`)
    }
    findPrivateTalkMessage(privateTalkMessageId: number): Observable<PrivateTalkMessage> {
        return this.http.get<PrivateTalkMessage>(this.baseURL + `api/PrivateTalkMessages/${privateTalkMessageId}`)
    }
    savePrivateTalkMessage(privateTalkMessage: PrivateTalkMessage): Observable<number> {
        return this.http.post<number>(this.baseURL + "api/PrivateTalkMessages", privateTalkMessage)
    }
    deletePrivateTalkMessage(privateTalkMessageId: number): Observable<PrivateTalkMessage> {
        return this.http.delete<PrivateTalkMessage>(`${this.baseURL}api/PrivateTalkMessages/${privateTalkMessageId}`)
    }

}

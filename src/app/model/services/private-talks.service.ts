import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from  '../xyzeki-auth-service';
import { switchMap } from 'rxjs/operators';
import { PrivateTalk } from '../private-talk.model';
import { MessageCountModel } from '../message-count.model';
import { PrivateTalkLastSeen } from '../private-talk-last-seen.model';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { PrivateTalkInsideOut } from '../private-talk-inside-out.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalksService {

    baseURL: string;

    constructor(private http: HttpClient) {
        this.baseURL = BackEndWebServer + '/'
    }
    isMyPrivateTalk(privateTalkId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
        return this.http.get<boolean>(this.baseURL + `api/PrivateTalks/isMyPrivateTalk/${privateTalkId}`)
    }
    isPrivateTalkJoined(privateTalkId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
        return this.http.get<boolean>(this.baseURL + `api/PrivateTalks/isPrivateTalkJoined/${privateTalkId}`)
    }
    myPrivateTalks(pageNo = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalk[]> {
       return this.http.get<PrivateTalk[]>(`${this.baseURL}api/PrivateTalks/MyPrivateTalks/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
    }
    privateTalksReceived(pageNo = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalk[]> {
        return this.http.get<PrivateTalk[]>(`${this.baseURL}api/PrivateTalks/Received/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
    }
    myPrivateTalkMessagesCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<MessageCountModel[]> {
        return this.http.get<MessageCountModel[]>(this.baseURL + `api/PrivateTalks/My/MessagesCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
    }
    receivedPrivateTalkMessagesCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<MessageCountModel[]> {
       return this.http.get<MessageCountModel[]>(this.baseURL + `api/PrivateTalks/Received/MessagesCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
    }
    unreadMyPtCount(): Observable<number> {
        return this.http.get<number>(this.baseURL + `api/PrivateTalks/MyPTUnreadCount`)
    }
    unreadReceivedPtCount(): Observable<number> {
      return this.http.get<number>(this.baseURL + `api/PrivateTalks/ReceivedPTUnreadCount`)
    }
    getNewUnreadPrivateTalk(privateTalkId: number): Observable<PrivateTalkInsideOut> {
       return this.http.get<PrivateTalkInsideOut>(this.baseURL + `api/PrivateTalks/GetNewUnreadPrivateTalk/${privateTalkId}`)
    }
    saveOrUpdatePrivateTalkLastSeen(privateTalkLastSeen: PrivateTalkLastSeen): Observable<null> {
        return this.http.post<null>(this.baseURL + "api/PrivateTalks/PrivateTalkLastSeen", privateTalkLastSeen) 
    }
    findPrivateTalk(privateTalkId: number): Observable<PrivateTalk> {
        return this.http.get<PrivateTalk>(this.baseURL + "api/PrivateTalks/" + privateTalkId)
    }
    savePrivateTalk(privateTalk: PrivateTalk): Observable<number> {
        return this.http.post<number>(this.baseURL + "api/PrivateTalks", privateTalk)
    }
    updatePrivateTalk(privateTalk: PrivateTalk): Observable<null> {
      return this.http.put<null>(`${this.baseURL}api/PrivateTalks/${privateTalk.PrivateTalkId}`, privateTalk)
    }
    deletePrivateTalk(privateTalkId: number): Observable<PrivateTalk> {
        return this.http.delete<PrivateTalk>(`${this.baseURL}api/PrivateTalks/${privateTalkId}`)
    }
}

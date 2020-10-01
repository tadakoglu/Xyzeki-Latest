import { Injectable, } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from '../xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { QuickTaskComment } from '../quick-task-comment.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class QuickToDoCommentsService {

  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  quickTaskComments(taskId: number): Observable<QuickTaskComment[]> {
    return this.http.get<QuickTaskComment[]>(this.baseURL + `api/QuickToDoComments/QuickToDo/${taskId}`)
  }
  findQuickTaskComment(messageId: number): Observable<QuickTaskComment> {
    return this.http.get<QuickTaskComment>(this.baseURL + `api/QuickToDoComments/${messageId}`)
  }
  saveQuickTaskComment(quickTaskComment: QuickTaskComment): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/QuickToDoComments", quickTaskComment)
  }
  updateQuickTaskComment(quickTaskComment: QuickTaskComment): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/QuickToDoComments/${quickTaskComment.MessageId}`, quickTaskComment)
  }
  deleteQuickTaskComment(messageId: number): Observable<QuickTaskComment> {
    return this.http.delete<QuickTaskComment>(`${this.baseURL}api/QuickToDoComments/${messageId}`,)
  }


}

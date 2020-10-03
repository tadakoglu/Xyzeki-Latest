import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { QuickTask } from '../quick-task.model';
import { switchMap } from 'rxjs/operators';
import { CommentCountModel } from '../comment-count.model';
import { TaskOrderModel } from '../task-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class QuickToDosService {

  baseURL: string;
  
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  saveAllTOMs(TOMs: TaskOrderModel[]): Observable<boolean> {
    return this.http.post<boolean>(this.baseURL + "api/QuickToDos/TOMs", TOMs)
  }
  myQuickToDos(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<QuickTask[]> {
    return this.http.get<QuickTask[]>(this.baseURL + `api/QuickToDos/My/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
  }
  assignedToMe(searchValue?: string): Observable<QuickTask[]> {
    return this.http.get<QuickTask[]>(this.baseURL + `api/QuickToDos/AssignedToMe/Search/${searchValue}`)
  }
  myAndAssignedToMeQTCommentsCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<CommentCountModel[]> {
    return this.http.get<CommentCountModel[]>(this.baseURL + `api/QuickToDos/MyAndAssignedToMe/CommentsCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`)
  }
  saveQuickTodo(quickToDo: QuickTask): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/QuickToDos", quickToDo,)
  }
  updateQuickTodo(quickToDo: QuickTask): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/QuickToDos/${quickToDo.TaskId}`, quickToDo,)
  }
  deleteQuickTodo(quickToDoId: number): Observable<QuickTask> {
    return this.http.delete<QuickTask>(`${this.baseURL}api/QuickToDos/${quickToDoId}`,)
  }
  findQuickToDo(taskId: number): Observable<QuickTask> {
    return this.http.get<QuickTask>(this.baseURL + `api/QuickToDos/${taskId}`,)
  }
  complete(quickToDoId: number): Observable<QuickTask> {
    return this.http.put<QuickTask>(`${this.baseURL}api/QuickToDos/Complete/${quickToDoId}`, null,)
  }
  deComplete(quickToDoId: number): Observable<QuickTask> {
    return this.http.put<QuickTask>(`${this.baseURL}api/QuickToDos/DeComplete/${quickToDoId}`, null,)
  }

}

import { Injectable, } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from  '../auth-services/xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { ProjectTaskComment } from '../project-task-comment.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectToDoCommentsService {
  
  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  projectTaskComments(taskId: number): Observable<ProjectTaskComment[]> {
    return this.http.get<ProjectTaskComment[]>(this.baseURL + `api/ProjectToDoComments/ProjectToDo/${taskId}`) 
  }
  findProjectTaskComment(messageId: number): Observable<ProjectTaskComment> {
    return this.http.get<ProjectTaskComment>(this.baseURL + `api/ProjectToDoComments/${messageId}`) 
  }
  saveProjectTaskComment(projectTaskComment: ProjectTaskComment): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/ProjectToDoComments", projectTaskComment) 
  }
  updateProjectTaskComment(projectTaskComment: ProjectTaskComment): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/ProjectToDoComments/${projectTaskComment.MessageId}`, projectTaskComment)
  }
  deleteProjectTaskComment(messageId: number): Observable<ProjectTaskComment> {
    return this.http.delete<ProjectTaskComment>(`${this.baseURL}api/ProjectToDoComments/${messageId}`)
  }
 

}

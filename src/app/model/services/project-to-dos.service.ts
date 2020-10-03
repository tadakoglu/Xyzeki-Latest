import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProjectTask } from '../project-task.model';
import { Observable, timer, of } from 'rxjs';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { CommentCountModel } from '../comment-count.model';
import { TaskOrderModel } from '../task-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectToDosService {
  baseURL: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  saveAllTOMs(TOMs: TaskOrderModel[], projectId: number): Observable<boolean> {
    return this.http.post<boolean>(this.baseURL + "api/ProjectToDos/TOMs", TOMs, { params: { 'projectId': projectId.toString() } })
  }
  projectToDos(projectId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseURL + `api/ProjectToDos/Project/${projectId}`)
  }
  projectToDosAssignedToMe(searchValue?: string): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseURL + `api/ProjectToDos/AssignedToMe/Search/${searchValue}`)
  }
  assignedToMePTCommentsCount(searchValue?: string): Observable<CommentCountModel[]> {
    return this.http.get<CommentCountModel[]>(this.baseURL + `api/ProjectToDos/AssignedToMe/CommentsCount/Search/${searchValue}`)
  }
  projectToDosCommentsCount(projectId: number): Observable<CommentCountModel[]> {
    return this.http.get<CommentCountModel[]>(this.baseURL + `api/ProjectToDos/Project/${projectId}/CommentsCount`)
  }
  complete(projectTodoId: number): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseURL}api/ProjectToDos/Complete/${projectTodoId}`, null)
  }
  projectToDo(projectToDoId: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(this.baseURL + `api/ProjectToDos/${projectToDoId}`)
  }
  saveProjectToDo(projectTask: ProjectTask): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/ProjectToDos", projectTask)
  }
  updateProjectToDo(projectTask: ProjectTask): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/ProjectToDos/${projectTask.TaskId}`, projectTask)
  }
  deleteProjectToDo(taskId: number): Observable<ProjectTask> {
    return this.http.delete<ProjectTask>(`${this.baseURL}api/ProjectToDos/${taskId}`)
  }
}

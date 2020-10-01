import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Project } from '../project.model';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from '../xyzeki-auth-service';
import { switchMap } from 'rxjs/operators';
import { ProjectOrderModel } from '../project-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectsService {
  baseURL: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  saveAllPOMs(POMs: ProjectOrderModel[]): Observable<boolean> {
    return this.http.post<boolean>(this.baseURL + "api/Projects/POMs", POMs)
  }
  isShareholder(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<boolean>(this.baseURL + `api/Projects/isShareholder/${projectId}`)
  }
  isMyProject(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<boolean>(this.baseURL + `api/Projects/isMyProject/${projectId}`)
  }
  isProjectAssigned(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<boolean>(this.baseURL + `api/Projects/isProjectAssigned/${projectId}`)
  }
  myProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseURL + "api/Projects/MyProjects")
  }
  myProjectsAssigned(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseURL + "api/Projects/MyProjects/Assigned")
  }
  findProject(projectId: number): Observable<Project> {
    return this.http.get<Project>(this.baseURL + "api/Projects/" + projectId)
  }
  saveProject(project: Project): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/Projects", project)
  }
  updateProject(project: Project): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/Projects/${project.ProjectId}`, project)
  }
  deleteProject(projectId: number): Observable<Project> {
    return this.http.delete<Project>(`${this.baseURL}api/Projects/${projectId}`)
  }


}

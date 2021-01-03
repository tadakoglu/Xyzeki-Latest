import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CloudContainers } from '../azure-models/cloud-containers.model';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class ContainersService {

  baseURL: string;
  
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  showContainers(): Observable<CloudContainers> {
    return this.http.get<CloudContainers>(this.baseURL + 'api/Files/ListContainers');
  }
  createContainer(containerName: string): Observable<CloudContainer> {
    return this.http.get<CloudContainer>(this.baseURL + `api/Files/CreateContainer/${containerName}`);
  }
  deleteContainer(containerName: string): Observable<boolean> {
    return this.http.delete<boolean>(this.baseURL + `api/Files/DeleteContainer/${containerName}`)
  }

}

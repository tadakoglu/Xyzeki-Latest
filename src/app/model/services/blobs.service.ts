import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CloudFiles } from '../azure-models/cloud-files.model';
import { CloudContainers } from '../azure-models/cloud-containers.model';
import { CloudFile } from '../azure-models/cloud-file.model';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class BlobsService {

  baseURL: string;

  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }

  showBlobs(containerName): Observable<CloudFiles> {
    return this.http.get<CloudFiles>(this.baseURL + `api/Files/ListFiles/Container/${containerName}`);
  }
  downloadFile(containerName: string, fileName: string): Observable<any> {
    return this.http.get(this.baseURL + `api/Files/DownloadFile/${fileName}/Container/${containerName}`, { responseType: "blob" })
  }

  insertFile(containerName: string, fileToUpload: FormData): Observable<CloudFile> {
    return this.http.post<CloudFile>(this.baseURL + `api/Files/InsertFile/Container/${containerName}`, fileToUpload);
  }
  deleteFile(containerName: string, fileName: string): Observable<boolean> {
    return this.http.delete<boolean>(this.baseURL + `api/Files/DeleteFile/${fileName}/Container/${containerName}`)

  }

}

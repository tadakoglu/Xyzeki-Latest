import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TeamMember } from '../team-member.model.';
import { Observable, of } from 'rxjs';
import { Member } from '../member.model';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { distinctUntilChanged, take, switchMap } from 'rxjs/operators';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class TeamMembersService {
  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }
  teamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Team/${teamId}`)
  }
  teamMembersJoined(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Joined`)
  }
  teamMembersOwned(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Owned`)
  }
  teamMembersJoinedAsMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/Joined/AsMembers`)
  }
  teamMembersOwnedAsMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/Owned/AsMembers`)
  }
  allTeamMembersPT(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/AllTeamMembersPT`)
  }
  allTeamMembersPTAsMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/AllTeamMembersPTAsMembers`)
  }
  saveTeamMember(teamMember: TeamMember): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/TeamMembers", teamMember)
  }
  updateTeamMember(teamMember: TeamMember): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/TeamMembers/${teamMember.TeamMemberId}`, teamMember)
  }
  deleteTeamMember(teamMemberId: number): Observable<TeamMember> {
    return this.http.delete<TeamMember>(`${this.baseURL}api/TeamMembers/${teamMemberId}`)
  }

}




  /* Code Help */

  // getOptions(token) {
  //   return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  // }
  // getOptions2(teamMember: TeamMember) { // Special for delete methods.
  //   return {
  //     headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }),
  //     params: { "teamId": teamMember.TeamId.toString(), "username": teamMember.Username }
  //   };
  // }
  // getOptions3() {
  //   return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  // }
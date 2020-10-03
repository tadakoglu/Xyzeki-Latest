import { Injectable } from '@angular/core';
import { Observable, timer, throwError, of } from 'rxjs';
import { Team } from '../team.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class TeamsService {

  baseURL: string;
  constructor(private http: HttpClient) {
    this.baseURL = BackEndWebServer + '/'
  }

  myTeams(): Observable<Team[]> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<Team[]>(this.baseURL + "api/Teams/MyTeams")
  }
  isMyTeam(teamId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<boolean>(this.baseURL + `api/Teams/isMyTeam/${teamId}`)
  }
  isTeamJoined(teamId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<boolean>(this.baseURL + `api/Teams/isTeamJoined/${teamId}`)
  }
  teamsJoined(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseURL + "api/Teams/Joined")
  }
  allTeamsPT(): Observable<Team[]> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.http.get<Team[]>(this.baseURL + "api/Teams/AllTeamsPT")
  }
  findTeam(teamId: number): Observable<Team> {
    return this.http.get<Team>(this.baseURL + "api/Teams/" + teamId)
  }
  saveTeam(team: Team): Observable<number> {
    return this.http.post<number>(this.baseURL + "api/Teams", team)
  }
  updateTeam(team: Team): Observable<null> {
    return this.http.put<null>(`${this.baseURL}api/Teams/${team.TeamId}`, team)
  }
  deleteTeam(teamId: number): Observable<Team> {
    return this.http.delete<Team>(`${this.baseURL}api/Teams/${teamId}`)
  }


}
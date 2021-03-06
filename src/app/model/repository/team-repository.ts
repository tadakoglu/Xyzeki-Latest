import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITeamRepository } from '../abstract/i-team-repository';
import { DataService } from '../services/shared/data.service';
import { TeamsService } from '../services/teams.service';
import { Team } from '../team.model';

@Injectable()
export class TeamRepository implements ITeamRepository {
    // Note: C# auto-properties return attributes with lowercase letters  !!! TS models should be start with lowercase or same, unless, Angular won't model bind!
    constructor(private service: TeamsService, private dataService: DataService) {
        this.dataService.loadAllRepositoriesEvent.subscribe(() => { this.loadMYRelateds(); this.loadPTRelateds() });
        this.dataService.clearAllRepositoriesEvent.subscribe(() => { this.clearTeams() })
        this.loadRepository();
    }
    loadRepository(){
        this.loadMYRelateds();
        this.loadPTRelateds();
    }
    clearTeams() {
        this.myTeams = [] // sahip olduğum takımlar
        this.myTeamsJoined = [] // katılmış olduğum takılmlar
        this.allTeamsPT = [] // sahip olduğum ve katılmış olduğum takımlar(ikisi bir arada)
        this.informUser = undefined
    }
    loadMYRelateds() { // ##load this when team comp destroyed.
        this.service.myTeams().subscribe(teams => {
       this.myTeams = teams;

        })
        this.service.teamsJoined().subscribe(teamsJoined => {
    
            this.myTeamsJoined = teamsJoined
        })
    }
    loadPTRelateds() { // ##load this when team comp destroyed.
        this.service.allTeamsPT().subscribe(teams => {
           
            this.allTeamsPT = teams;
        })
    }
    loadMyTeamsViaResolver(myTeams: Team[]) {
      
        this.myTeams = myTeams;

     
    }
    private myTeams: Team[] = []
    private myTeamsJoined: Team[] = []

    private allTeamsPT: Team[] = [];

    public teamToOpen = new EventEmitter<Team>();
    getMyTeams(): Team[] {
        return this.myTeams;
    }
    getMyTeamsJoined(): Team[] {
        return this.myTeamsJoined;
    }
    getAllTeamsPT(): Team[] {
        return this.allTeamsPT;
    }
    getTeam(teamId: number): Observable<Team> {
        return this.service.findTeam(teamId);
    }
    getError(): string {
        return this.informUser;
    }
    private informUser;
    saveTeam(team: Team) {
        if (team.TeamId == 0 || team.TeamId == null) { // Add a new team
            this.service.saveTeam(team).subscribe(teamId => {
                team.TeamId = teamId;
                this.myTeams.push(team); // myTeams is initialized in constructor so in ng zone, Angular will invoke update on UI after saving.
                this.teamToOpen.next(team)
            }, (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 403: //forbidden
                        this.informUser = "Üzgünüz, bu işlemi gerçekleştiremiyoruz. Başka birilerinin takımında yer alıyorken, takım sahibi olamazsınız."
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break;
                    case 503: ; case 0:
                        this.informUser = "Servis şu anda ulaşılabilir değildir.  "
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break;
                }

            })
        }
        else {
            this.service.updateTeam(team).subscribe(() => { // Update an existing team
                let index = this.myTeams.findIndex((value) => value.TeamId == team.TeamId);
                if (-1 != index)
                    this.myTeams.splice(index, 1, team);
            });
        }
    }
    deleteTeam(teamId: number) {
        this.service.deleteTeam(teamId).subscribe(team => {
            let index = this.myTeams.findIndex((value) => value.TeamId == team.TeamId);
            if (-1 != index) {
                this.myTeams.splice(index, 1);
            }

        })
    }
}

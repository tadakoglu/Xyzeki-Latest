import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITeamMemberRepository } from '../abstract/i-team-member-repository';
import { XyzekiAuthHelpersService } from '../auth-services/xyzeki-auth-helpers-service';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { Member } from '../member.model';
import { AuthService } from '../services/auth.service';
import { MembersService } from '../services/members.service';
import { DataService } from '../services/shared/data.service';
import { TeamMembersService } from '../services/team-members.service';
import { TeamsService } from '../services/teams.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TeamMember } from '../team-member.model.';
// import { mergeMap, flatMap, switchMap, map, concat, concatMap } from 'rxjs/operators';
import { Team } from '../team.model';
import { MemberLicenseRepository } from './member-license-repository';
import { TeamRepository } from './team-repository';


@Injectable()
export class TeamMemberRepository implements ITeamMemberRepository {

    constructor(private xyzekiAuthService: XyzekiAuthService, private teamRepo: TeamRepository, private mLicense: MemberLicenseRepository, private service: TeamMembersService, private service2: TeamsService, private serviceMember: AuthService, private signalService: XyzekiSignalrService, private membersService: MembersService, public xyzekiAuthHelpersService: XyzekiAuthHelpersService, private permissions: MemberLicenseRepository, private dataService: DataService) {
        //incoming signals
        this.signalService.newTeamMemberJoinedAvailable.subscribe(teamMemberJ => { // add operation
            this.saveTeamMemberJoinedViaSignalR(teamMemberJ);
            let teamId = teamMemberJ.TeamId;
            this.service2.findTeam(teamId).subscribe(team => {
                let index: number = this.teamsJoined.findIndex(val => val.TeamId == teamId);
                if (-1 == index)
                    this.teamsJoined.push(team);
                else {
                    this.teamsJoined.splice(index, 1, team);
                }
            })
            this.service.teamMembersJoinedAsMembers().subscribe(tmjAsM => {
              this.teamMembersJoinedAsMembers = tmjAsM
            })
        });

        this.signalService.newTeamMemberAvailable.subscribe(teamMember => { // update operation
            this.saveTeamMemberViaSignalR(teamMember);
            this.saveTeamMemberOwnedViaSignalR(teamMember);
            this.saveTeamMemberJoinedViaSignalR(teamMember); // for update operation
        });

        this.signalService.deletedTeamMemberAvailable.subscribe(teamMemberDeleted => {
            this.deleteTeamMemberViaSignalR(teamMemberDeleted);
        });

        this.dataService.loadAllRepositoriesEvent.subscribe(() => { this.loadMYRelateds(); this.loadPTRelateds() });

        this.dataService.clearAllRepositoriesEvent.subscribe(() => { this.clearTeamMembers() })

        this.loadRepository();

    }
    loadRepository(){
        this.loadMYRelateds();
        this.loadPTRelateds();
    }

    clearTeamMembers() {
        this.TeamId = 0
        this.teamMembers = [] // üyemizin seçmiş olduğu takım'daki takım üyeleri

        this.teamMembersOwned = [] // sahip olduğum takımlardaki takım üyeleri
        this.teamMembersJoined = [] // katılmış olduğum takımlardaki takım üyeleri
        this.teamsJoined = []; // katılmış olduğum takımlar
        this.teamMembersOwnedAsMembers = [];  // sahip olduğum takımlardaki takım üyelerinin üyelik bilgileri(member) dizisi
        this.teamMembersJoinedAsMembers = []; // katılmış olduğum takımlardaki takım üyelerinin üyelik bilgileri(member) dizisi

        this.allTeamMembersPT = []; // sahip olduğum ve katılmış olduğum takımlardaki takım üyeleri
        this.allTeamMembersPTAsMembers = []; // sahip olduğum ve katılmış olduğum takımlardaki takım üyelerinin üyelik bilgileri(member) dizisi; burası yukarıdakilerin düzgünce birleşimidir.
        this.informUser = undefined;

    }
    loadMYRelateds() { // ##load this when team comp destroyed.
        //Start: For assign autocomplete components
        this.service.teamMembersOwned().subscribe(tmo => {
            this.teamMembersOwned = tmo
        }
        )

        //Start: For invitations
        this.service.teamMembersJoined().subscribe(tmsj => {
            this.teamMembersJoined = tmsj
        }
        );
        this.service2.teamsJoined().subscribe(tj => {
            this.teamsJoined = tj
        }
        );


        this.service.teamMembersOwnedAsMembers().subscribe(tmoAsM => {
            this.teamMembersOwnedAsMembers = tmoAsM
        })
        this.service.teamMembersJoinedAsMembers().subscribe(tmjAsM => {
            this.teamMembersJoinedAsMembers = tmjAsM
        })
    }
    loadPTRelateds() { // ##load this when team comp destroyed. // private talk or project manager assignment box
        this.service.allTeamMembersPT().subscribe(teamMembers => {
            this.allTeamMembersPT = teamMembers
        })

        this.service.allTeamMembersPTAsMembers().subscribe(teamMembersAs => {
            this.allTeamMembersPTAsMembers = teamMembersAs
        })
    }
    loadTeamMembers(teamId: number) {
        //add and update here with id on signalr
        this.service.teamMembers(teamId).subscribe(members => {
            this.teamMembers = members;
            this.TeamId = teamId;
        });
        //Start: For my-accounts and transformation tm=> member syste
    }
    loadTeamMembersViaResolver(teamMembers: TeamMember[], teamId: number) {
        this.TeamId = teamId;
        this.teamMembers = teamMembers;
    }


    private teamMembers: TeamMember[] = []
    public TeamId: number = 0

    private teamMembersOwned: TeamMember[] = []

    private teamMembersJoined: TeamMember[] = []
    private teamsJoined: Team[] = []; // accompanying to teamMembersJoined

    private teamMembersOwnedAsMembers: Member[] = [];
    private teamMembersJoinedAsMembers: Member[] = [];

    private allTeamMembersPT: TeamMember[] = [];
    private allTeamMembersPTAsMembers: Member[] = [];

    getTeamMembers(): TeamMember[] {
        return this.teamMembers;
    }

    getTeamMembersOwned(): TeamMember[] {
        return this.teamMembersOwned;
    }
    getTeamMembersJoined(): TeamMember[] {
        return this.teamMembersJoined;
    }

    getTeamMembersOwnedAsMembers(): Member[] {
        return this.teamMembersOwnedAsMembers;
    }
    getTeamMembersJoinedAsMembers(): Member[] {
        return this.teamMembersJoinedAsMembers;
    }
    getTeamJoined(teamId: number): Team {
        return this.teamsJoined.find(val => val.TeamId == teamId);
    }
    getMyTeamsJoined() {
        return this.teamsJoined;
    }

    getAllTeamMembersPT(): TeamMember[] {
        return this.allTeamMembersPT;
    }
    getAllTeamMembersPTAsMembers(): Member[] {
        return this.allTeamMembersPTAsMembers;
    }
    private informUser;

    getError(): string {
        return this.informUser;
    }
    saveTeamMember(teamMember: TeamMember) {
        if (teamMember.TeamMemberId == 0 || teamMember.TeamMemberId == null) {
            this.service.saveTeamMember(teamMember).subscribe((id) => {
                teamMember.TeamMemberId = id;

                if (this.xyzekiAuthService.Username == teamMember.Username)
                    teamMember.Status = true;

                this.teamMembers.push(teamMember);

                if (this.xyzekiAuthService.Username != teamMember.Username)
                    this.signalService.notifyNewTeamMember(teamMember, 'new');

                let index: number = this.teamMembersOwnedAsMembers.findIndex(m => m.Username == teamMember.Username);
                if (-1 == index) {
                    this.membersService.getMember(teamMember.Username).subscribe(member => {
                        this.teamMembersOwnedAsMembers.push(member);
                    })
                }
            }, (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 403: //forbidden
                        this.informUser = "Üzgünüz, bu işlemi gerçekleştiremiyoruz. Lisansınızda tanımlı bulunan maksimum çalışan sayısından daha fazla sayıda farklı kişiye istek gönderemezsiniz. Lütfen şirket içi maksimum çalışan sayısı kapasite arttırımı için bize ulaşın."
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 7000);
                        break;
                    case 503: ; case 0:
                        this.informUser = "Servis şu anda ulaşılabilir değildir.  "
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 7000);
                        break;
                }

            })

        }
        else {
            // check permissions
            this.service.updateTeamMember(teamMember).subscribe(() => {
                let index: number = this.teamMembers.findIndex(val => val.TeamMemberId == teamMember.TeamMemberId);
                if (-1 != index)
                    this.teamMembers.splice(index, 1, teamMember)

                let index2: number = this.teamMembersJoined.findIndex(val => val.TeamMemberId == teamMember.TeamMemberId);
                if (-1 != index2)
                    this.teamMembersJoined.splice(index2, 1, teamMember)

                let index3: number = this.teamMembersOwned.findIndex(val => val.TeamMemberId == teamMember.TeamMemberId);
                if (-1 != index3)
                    this.teamMembersOwned.splice(index3, 1, teamMember)

                // this.mLicense.loadLicenseRelateds(); // gain license without refreshing..

                this.signalService.notifyNewTeamMember(teamMember, 'update');

            }, (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 403: //forbidden
                        this.informUser = "Üzgünüz, bu işlemi gerçekleştiremiyoruz. Aynı anda farklı kişilerin takımlarında bulunmak veya kendi takımınız varken başka birisinin takımına katılmak geçersiz eylemlerdir."
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break;
                    case 503: ; case 0:
                        this.informUser = "Servis şu anda ulaşılabilir değildir. "
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break; // 0 status code = ERR_CONNECTION_REFUSED
                }

            })
        }

    }
    deleteTeamMember(teamMemberId: number) {
        let index: number = this.teamMembers.findIndex(value => value.TeamMemberId == teamMemberId);
        if (-1 != index) {
            let teamMember = this.teamMembers.find((val, valIndex, obj) => valIndex == index);
            this.signalService.notifyDeletedTeamMember(teamMember); //for all.
        }

        let index2: number = this.teamMembersJoined.findIndex(value => value.TeamMemberId == teamMemberId);
        if (-1 != index2) // if exists.
        {
            let teamMember = this.teamMembersJoined.find((val, valIndex, obj) => valIndex == index2);
            this.signalService.notifyDeletedTeamMember(teamMember); //for all.

        }
        this.service.deleteTeamMember(teamMemberId).subscribe(() => {
            if (-1 != index) {
                this.teamMembers.splice(index, 1)
            }
            if (-1 != index2) {
                this.teamMembersJoined.splice(index2, 1)
            }
        });
    }
    deleteTeamMemberViaSignalR(teamMemberDeleted: TeamMember) {

        let status = teamMemberDeleted.Status;

        let index: number = this.teamMembers.findIndex(val => val.TeamMemberId == teamMemberDeleted.TeamMemberId); // for team' teamMembers page.
        if (-1 != index)
            this.teamMembers.splice(index, 1);

        let index2: number = this.teamMembersJoined.findIndex(val => val.TeamMemberId == teamMemberDeleted.TeamMemberId);//for invitations page
        if (-1 != index2) {

            this.teamMembersJoined.splice(index2, 1);

            if (status) {
                if (this.teamMembersJoined.length == 0 && this.permissions) {
                    this.permissions.removeMemberLicenseForJoinedTeamMember();
                    this.xyzekiAuthHelpersService.DeAuth();
                }
            }



        }

        let index3: number = this.teamMembersOwned.findIndex(val => val.TeamMemberId == teamMemberDeleted.TeamMemberId);
        if (-1 != index3)
            this.teamMembersOwned.splice(index3, 1);


    }


    removeTMJFromRepo(teamMemberId: number) {
        let index: number = this.teamMembersJoined.findIndex(value => value.TeamMemberId == teamMemberId);
        if (-1 != index) {
            this.teamMembersJoined.splice(index, 1)
            if (this.teamMembersJoined.length == 0 && this.permissions) {
                this.permissions.removeMemberLicenseForJoinedTeamMember();

            }

        }
    }
    saveTeamMemberJoinedViaSignalR(teamMemberJ: TeamMember) {
        let isMyTeam: boolean = this.teamRepo.getMyTeams().find(t => t.TeamId == teamMemberJ.TeamId) != undefined
        if (isMyTeam)
            return;

        let index = this.teamMembersJoined.findIndex(val => val.TeamMemberId == teamMemberJ.TeamMemberId)
        if (-1 == index) //if they come to that team.
        {
            this.teamMembersJoined.push(teamMemberJ); // we checked that teamMemberJ's assigned property is same with this member in angular signalr service.
        }
        else {
            this.teamMembersJoined.splice(index, 1, teamMemberJ); //change appearance     
        }


    }

    saveTeamMemberViaSignalR(teamMember: TeamMember) { // for update

        if (teamMember.TeamId == this.TeamId) {
            let index = this.teamMembers.findIndex(val => val.TeamMemberId == teamMember.TeamMemberId)
            if (-1 == index) //if they come to that team.
            {
                this.teamMembers.push(teamMember);
            }
            else {
                this.teamMembers.splice(index, 1, teamMember); //change appearance     
            }

        }
    }

    saveTeamMemberOwnedViaSignalR(teamMemberO: TeamMember) { // for update

        let index = this.teamMembersOwned.findIndex(val => val.TeamMemberId == teamMemberO.TeamMemberId)
        if (-1 != index) //if exists.
            this.teamMembersOwned.splice(index, 1, teamMemberO); //change appearance     

    }




}




    //http://reactivex.io/documentation/operators/flatmap.html
    //https://stackoverflow.com/questions/44593900/rxjs-one-observable-feeding-into-another

    // saveTeamMember(teamMember: TeamMember) {
    //     // one-observable-feeding-into-another
    //     this.service.saveTeamMember(teamMember).pipe(concatMap( ()=> {
    //         return this.serviceMember.getMember(teamMember.Username)
    //     })).subscribe(member=> {
    //         this.teamMembers.push(member);

    //     })
    // }
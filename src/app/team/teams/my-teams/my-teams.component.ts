import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { DataService } from 'src/app/model/services/shared/data.service';
import { Team } from 'src/app/model/team.model';


@Component({
  selector: 'app-my-teams',
  templateUrl: './my-teams.component.html',
  styleUrls: ['./my-teams.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MyTeamsComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscription ? this.subscription.unsubscribe() : () => { };
    this.dataService.loadAllRepositoriesEvent.next(); // Reload all Xyzeki software to get license, team members joined etc...
  }
  private subscription: Subscription
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
   
    // this.route.data.subscribe((resolvedData: { myTeams: Team[] }) => {
    //   this.repository.loadMyTeamsViaResolver(resolvedData.myTeams);
    // })

   
  }
  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  constructor(private permissions: MemberLicenseRepository, private route: ActivatedRoute, private repository: TeamRepository, private dataService: DataService, private router: Router, public xyzekiAuthService : XyzekiAuthService ) {
  }
  public getError(): string {
    return this.repository.getError();
  }
  public teamModel = new Team("");


  public myTeams() {
    return this.repository.getMyTeams();
  }
  

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  //edit mechanism
  updateTeamPanelOpen: boolean = false;
  oldTeamId: number = 0;

  toggleUpdateTeamPanel(teamId) {

    this.modelSubmitted = false; // RESET

    if (this.newTeamPanelOpen) //close add panel if it were open, we'll use same addTeam methot and model for both update and adding purposes.
      this.newTeamPanelOpen = false;

    if (this.oldTeamId == 0 || this.oldTeamId == teamId) { // if first click or the click on the open panel's team edit/x.. do the casual.

      if (this.updateTeamPanelOpen == false) {
        this.updateTeamPanelOpen = true;
        Object.assign(this.teamModel, this.repository.getMyTeams().find(val => val.TeamId == teamId))
        this.focusOnInput();
      }
      else {
        this.updateTeamPanelOpen = false;
        this.teamModel = new Team(""); //RESET 
      }

    }
    else { // if user clicked another team's edit without closing the first one.
      this.updateTeamPanelOpen = true;
      Object.assign(this.teamModel, this.repository.getMyTeams().find(val => val.TeamId == teamId))
      this.focusOnInput();
    }
    this.oldTeamId = teamId;
  }
  //edit mechanism end
  selectedTeamId;
  newTeamPanelOpen: boolean = false;
  toggleTeamPanel() {
    this.modelSubmitted = false; // RESET
    if (this.updateTeamPanelOpen) //close update panel if it were open, we'll use same addTeam methot and model for both update and adding purposes.
      this.updateTeamPanelOpen = false;

    if (this.newTeamPanelOpen == false) {
      this.newTeamPanelOpen = true;
      this.teamModel = new Team(""); //RESET MODEL 
      this.focusOnInput();
    }
    else
      this.newTeamPanelOpen = false;
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  addTeam(teamForm: NgForm) {
    if (this.permissions.getPrimaryAccessGranted()) {
      this.modelSubmitted = true;
      if (teamForm.valid) {
        this.teamModel.Owner = this.xyzekiAuthService .Username; // or imply on hidden input
        this.repository.saveTeam(this.teamModel);
        this.modelSent = true;
        this.modelSubmitted = false;
        this.teamModel = new Team(""); //RESET MODEL
        this.oldTeamId = 0;
        this.updateTeamPanelOpen = false; // this is needed for update functinality of addTeam method.
      }
      // }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  invalidLicensePanelOpen: boolean = false;

  deleteTeam(teamId) {
    if (this.permissions.getPrimaryAccessGranted()) {
      this.repository.deleteTeam(teamId);
      this.router.navigate(['/takimlar'])
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }


}


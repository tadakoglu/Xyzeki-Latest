import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { Member } from 'src/app/model/member.model';
import { MessageCountModel } from 'src/app/model/message-count.model';
import { PrivateTalkReceiver } from 'src/app/model/private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from 'src/app/model/private-talk-team-receiver.model';
import { PrivateTalk } from 'src/app/model/private-talk.model';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { PrivateTalkReceiverRepository } from 'src/app/model/repository/private-talk-receiver-repository';
import { PrivateTalkRepository } from 'src/app/model/repository/private-talk-repository';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { AuthService } from 'src/app/model/services/auth.service';
import { MembersService } from 'src/app/model/services/members.service';
import { DataService } from 'src/app/model/services/shared/data.service';
import { TeamMembersService } from 'src/app/model/services/team-members.service';
import { TeamsService } from 'src/app/model/services/teams.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { Team } from 'src/app/model/team.model';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-my-private-talks',
  templateUrl: './my-private-talks.component.html',
  styleUrls: ['./my-private-talks.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MyPrivateTalksComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnDestroy(): void {

  }
  private searchSubscription: Subscription;
  private subscription: Subscription;
  ngAfterViewInit(): void {
    this.searchSubscription = this.dataService.newDeepSearchEvent.subscribe(searchValue => {
      this.deepSearchPT(searchValue);
    })
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.resetReceiverModels();
  }


  private firstPrivateTalkAvailable(): PrivateTalk {
    return this.repository.getMyPrivateTalks().find((val, index, arr) => index == 0);
  }

  constructor(private repositoryTM: TeamMemberRepository, private dataService: DataService,
    private permissions: MemberLicenseRepository, private teamRepository: TeamRepository,
    private receiverRepo: PrivateTalkReceiverRepository, private route: ActivatedRoute,
    private router: Router, private repository: PrivateTalkRepository,
    public xyzekiAuthService: XyzekiAuthService) {
    this.resetReceiverModels();
  }


  get getUnreadMyPTCount(): number {
    return this.repository.getUnreadMyPTCount();
  }
  get getUnreadReceivedPTCount(): number {
    return this.repository.getUnreadReceivedPTCount();
  }
  get getUnreadTotalPTCount(): number {
    return this.repository.getUnreadTotalPTCount();
  }


  public privateTalkModel = new PrivateTalk(null, this.xyzekiAuthService.Username, null); //Reset

  get myPrivateTalks_Ongoing(): PrivateTalk[] {
    return this.repository.getMyPrivateTalks();
  }
  get myPrivateTalks_Incoming(): PrivateTalk[] {
    return this.repository.getPrivateTalksReceived()
  }

  get primaryAccessGranted() {
    return this.permissions.getPrimaryAccessGranted();    
  }
  get accessGranted() {
    return this.permissions.getAccessGranted();    
  }



  public getMyPTMessagesForCount(privateTalkId): MessageCountModel {
    return this.repository.getMyPTMessagesCount().find(pt => pt.PrivateTalkId == privateTalkId)
  }
  public getReceivedPTMessagesForCount(privateTalkId): MessageCountModel {
    return this.repository.getReceivedPTMessagesCount().find(pt => pt.PrivateTalkId == privateTalkId)
  }


  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }
  getTeamPT(teamId): Team {
    return this.teamRepository.getAllTeamsPT().find(team => team.TeamId == teamId);
  }
  public getReceivers(privateTalkId): PrivateTalkReceiver[] {
    return this.receiverRepo.getPrivateTalkReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId);
  }
  public getTeamReceivers(privateTalkId): PrivateTalkTeamReceiver[] {
    return this.receiverRepo.getPrivateTalkTeamReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId);
  }

  public tabMy: boolean = true // true means my, false means received
  switchTab(value) {
    this.tabMy = value;
  }
  deepSearchPT(searchValue) { // connect to 'input' event with fromEvent observable
    this.repository.searchValue = searchValue;
    this.repository.loadAll(this.repository.searchValue);
    // this.privateTalkId = 0;

  }




  newPrivateTalkPanelOpen: boolean = false;
  togglePrivateTalkPanel() {
    if (this.newPrivateTalkPanelOpen == false) {
      this.newPrivateTalkPanelOpen = true;
      this.privateTalkId = 0;
      this.router.navigate(['/is-konusmalari']);
      this.focusOnInputBT();
    }
    else {
      this.newPrivateTalkPanelOpen = false;
      this.resetReceiverModels();

    }
  }

  saveLastSeen() { // In case our member changes private talk id route param
    if (this.oldPrivateTalkId != 0) {
      this.repository.signalService.notifyPrivateTalkLastSeen(this.oldPrivateTalkId);

    }
  }

  public privateTalkId: number = 0
  public oldPrivateTalkId: number = 0;
  onSelectTopic(privateTalkId) {
    this.oldPrivateTalkId = this.privateTalkId;
    this.privateTalkId = privateTalkId;
    this.router.navigate(['is-konusmalari', privateTalkId, 'sohbet'])
    this.saveLastSeen();

    if (this.newPrivateTalkPanelOpen)
      this.togglePrivateTalkPanel();


  }

  resetReceiverModels() {
    this.receiversModel = [];
    this.teamReceiversModel = [];
  }

  public receiversModel: string[];
  public teamReceiversModel: number[];


  onReceiverEventForPTalk($event, rNo: number) {  //select
    if ($event[0]) {
      if ($event[1]) { // is team = true
        let teamId = ($event[0] as number);
        this.teamReceiversModel[rNo] = teamId;
        this.receiversModel[rNo] = null;
      } else {
        let username: string = ($event[0] as string);
        this.receiversModel[rNo] = username;
        this.teamReceiversModel[rNo] = 0;
      }

    } else {
      this.receiversModel[rNo] = null;
      this.teamReceiversModel[rNo] = 0;
    }


  }

  deletePrivateTalk(privateTalkId) {
    this.repository.deletePrivateTalk(privateTalkId);
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false;

  addPrivateTalk(privateTalkForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      // if (this.receiversModel[0] == null && this.teamReceiversModel[0] == 0)
      //   return;
      this.tabMy = true;
      this.privateTalkId = 0;
      this.modelSubmitted = true;
      if (privateTalkForm.valid) {
        this.repository.savePrivateTalk(this.privateTalkModel, this.receiversModel, this.teamReceiversModel);
        this.modelSent = true;
        this.modelSubmitted = false;

        this.privateTalkModel = new PrivateTalk(null, this.xyzekiAuthService.Username, null); //Reset
        this.resetReceiverModels();
        this.togglePrivateTalkPanel();
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  invalidLicensePanelOpen: boolean = false;

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }


  focusOnInputBT() {
    setTimeout(() => {
      if (document.getElementById('inputToFocusBT'))
        document.getElementById('inputToFocusBT').focus();
    }, 10);
  }

  public innerWidth: any;
  public innerHeight: any;


  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;



  }
  searchBarOpen = false;


}




import { Component, OnInit, HostListener, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ContainerRepository } from 'src/app/model/repository/container-repository';
import { XyzekiAuthService } from  'src/app/model/auth-services/xyzeki-auth-service';
import { DataService } from 'src/app/model/services/shared/data.service';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { NgForm } from '@angular/forms';
import { CloudContainer } from 'src/app/model/azure-models/cloud-container.model';
import { MemberLicense } from 'src/app/model/member-license.model';
import { Subscription } from 'rxjs';
import { CloudContainers } from 'src/app/model/azure-models/cloud-containers.model';


@Component({
  selector: 'app-containers',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ContainersComponent implements OnInit, AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    this.searchSubscription = this.dataService.newContainerSearchEvent.subscribe(searchValue => {
      this.localSearchCC(searchValue);
    })
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
    this.subscription ? this.subscription.unsubscribe() : () => { };
  }
  private searchSubscription: Subscription;

  constructor(public xyzekiAuthService: XyzekiAuthService, private repositoryTM: TeamMemberRepository, 
    private dataService: DataService, public mLicenseRepository: MemberLicenseRepository,
     private route: ActivatedRoute, private router: Router, private repository: ContainerRepository) { }

  private subscription: Subscription
  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    
   

  }

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

  }
  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }

  public containerModel = new CloudContainer(null, null, null, null);

  containers(): CloudContainer[] {
      return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  }

  // get containers(): CloudContainer[] { // a pipe will sort items in here.
  //   // return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  //   return this.repository.getContainers().filter(cC => this.searchFilter(cC))
  // }

  get myLicense(): MemberLicense {
    return this.mLicenseRepository.getMemberLicense();
  }

  // pageNo = 1;
  localSearchCC(searchValue) { // connect to 'input' event with fromEvent observable
    // this.pageNo = 1;
    this.searchValue = searchValue;
  }
  // get loaded() {
  //   return this.repository.loaded;
  // }
  loaded = true;
  searchFilter(cContainer: CloudContainer): boolean {
    if (this.searchValue == undefined)
      return true
    else
      return cContainer.ContainerName.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase());
  }
  public searchValue: string;



  newContainerPanelOpen: boolean = false;
  toggleContainerPanel() {
    if (this.newContainerPanelOpen == false) {
      this.newContainerPanelOpen = true;
      this.containerName = undefined;
      this.router.navigate(['/dosyalar']);
      this.focusOnInputCT();
    }
    else {
      this.newContainerPanelOpen = false;
    }
  }
  focusOnInputCT() {
    setTimeout(() => {
      if (document.getElementById('inputToFocusCT'))
        document.getElementById('inputToFocusCT').focus();
    }, 10);
  }
  onScrollDown() {
    //to-do
  }
  public containerName: string;

  public oldContainerName: string
  onSelectContainer(containerName) {
    this.oldContainerName = this.containerName;
    this.containerName = containerName;
 
      this.router.navigate(['dosyalar', containerName])
  
    if (this.newContainerPanelOpen)
      this.toggleContainerPanel();
  }


  deleteContainer(containerName) {
    if (this.mLicenseRepository.getAccessGranted()) {
      this.repository.deleteContainer(containerName);
      
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false;

  addContainer(containerForm: NgForm) {
    if (this.mLicenseRepository.getAccessGranted()) {
      this.modelSubmitted = true;
      if (containerForm.valid) {
        this.containerModel.CreatedAt = new Date().toISOString()
        this.containerModel.CreatedBy = this.xyzekiAuthService .Username;
        this.repository.saveContainer(this.containerModel);
        this.modelSent = true;
        this.modelSubmitted = false;
        this.containerModel = new CloudContainer(null, null, null, null);
        this.toggleContainerPanel();
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

  searchBarOpen = false;
}







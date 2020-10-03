import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { LoginModel } from 'src/app/model/login.model';
import { Member } from 'src/app/model/member.model';
import { AdminRepository } from 'src/app/model/repository/admin-repository';
import { AuthRepository } from 'src/app/model/repository/auth-repository';
import { ContainerRepository } from 'src/app/model/repository/container-repository';
import { FileRepository } from 'src/app/model/repository/file-repository';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { MemberRepository } from 'src/app/model/repository/member-repository';
import { PrivateTalkMessageRepository } from 'src/app/model/repository/private-talk-message-repository';
import { PrivateTalkReceiverRepository } from 'src/app/model/repository/private-talk-receiver-repository';
import { PrivateTalkRepository } from 'src/app/model/repository/private-talk-repository';
import { ProjectRepository } from 'src/app/model/repository/project-repository';
import { ProjectToDoCommentRepository } from 'src/app/model/repository/project-to-do-comment-repository';
import { ProjectToDoRepository } from 'src/app/model/repository/project-to-do-repository';
import { QuickToDoCommentRepository } from 'src/app/model/repository/quick-to-do-comment-repository';
import { QuickToDoRepository } from 'src/app/model/repository/quick-to-do-repository';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { ReturnModel } from 'src/app/model/return.model';
import { MemberSettingService } from 'src/app/model/services/member-setting.service';
import { DataService } from 'src/app/model/services/shared/data.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { Tuple } from 'src/app/model/tuple.model';
import { GoogleReCaptcha_LoginAction } from 'src/infrastructure/google-captcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [{ provide: LoginModel, useClass: LoginModel },
    

  ]
  , changeDetection: ChangeDetectionStrategy.Default
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  innerHeight: number;
  innerWidth: number;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  ngAfterViewInit(): void {
    this.focusOnInput();
  }
  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  ngOnDestroy(): void {
    // this.subscription ? this.subscription.unsubscribe() : '';
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  constructor(private recaptchaV3Service: ReCaptchaV3Service, private router: Router, private repository: AuthRepository,
    public loginModel: LoginModel, public xyzekiAuthService: XyzekiAuthService, public xyzekiSignalService: XyzekiSignalrService, private memberSettingService: MemberSettingService, private dataService: DataService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  failNav() {
    this.modelSent = false;
  }
  isLoading = false;
  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  authenticate(loginForm: NgModel) {
    this.modelSubmitted = true;
    if (loginForm.valid) {
      this.isLoading = true;
      this.subscription = this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
        recaptchaToken => { return this.repository.authenticate(Object.assign({}, this.loginModel), recaptchaToken) })).subscribe((tokenAndMember: ReturnModel<Tuple<string, Member>>) => {
          this.xyzekiAuthService.Auth(tokenAndMember);
          this.informUser = "Başarıyla giriş yaptınız."
          this.router.navigate(['/isler'])
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;

        }, (error: HttpErrorResponse) => {
          switch (error.status) {
            case 401:
              this.informUser = "Girdiğiniz bilgiler yanlıştır, lütfen tekrar deneyiniz."
              break;
            case 503: ; case 0:
              this.informUser = "Servis şu anda ulaşılabilir değildir."
              break;

          }
          this.isLoading = false;
        }
        ).add(() => {
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;
        })





    }
  }
  
  informUser: string;
  ngOnInit() { }



  subscription: Subscription;
 

}

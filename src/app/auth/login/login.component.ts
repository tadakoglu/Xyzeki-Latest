import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { XyzekiAuthHelpersService } from 'src/app/model/auth-services/xyzeki-auth-helpers-service';
import { LoginModel } from 'src/app/model/login.model';
import { AuthRepository } from 'src/app/model/repository/auth-repository';
import { MemberSettingService } from 'src/app/model/services/member-setting.service';
import { DataService } from 'src/app/model/services/shared/data.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { TokenMemberModel } from 'src/app/model/token-member.model';
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
    public loginModel: LoginModel, public xyzekiAuthHelpersService: XyzekiAuthHelpersService, public xyzekiSignalService: XyzekiSignalrService, private memberSettingService: MemberSettingService, private dataService: DataService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  failNav() {
    this.modelSent = false;
  }
  isLoading = false;
  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  authenticate2(loginForm: NgModel) {
    this.modelSubmitted = true;
    if (loginForm.valid) {
      this.isLoading = true;
      this.subscription = this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
        recaptchaToken => { return this.repository.authenticate(Object.assign({}, this.loginModel), recaptchaToken) })).subscribe((response) => {
          let tokenMemberModel: TokenMemberModel = response.body;
          console.log(JSON.stringify(tokenMemberModel.Member) + 'üye')
          this.xyzekiAuthHelpersService.Auth(tokenMemberModel);
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

            case 406:
              this.informUser = "Lütfen cihazınızın zamanını güncelleyip tekrar deneyiniz."
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
  authenticate(loginForm: NgModel) {
    this.modelSubmitted = true;
    if (loginForm.valid) {
      this.isLoading = true;
      this.repository.authenticate(Object.assign({}, this.loginModel), '').subscribe((response) => {
        let tokenMemberModel: TokenMemberModel = response.body;
        console.log(JSON.stringify(tokenMemberModel.Member) + 'üye')
        this.xyzekiAuthHelpersService.Auth(tokenMemberModel);
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
          case 406:
            this.informUser = "Lütfen cihazınızın zamanını güncelleyip tekrar deneyiniz."
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

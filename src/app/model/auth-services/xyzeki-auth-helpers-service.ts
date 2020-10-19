import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { fromEvent, Subscription } from 'rxjs';
import { filter, first, take, tap } from 'rxjs/operators';
import { CryptoHelpers } from 'src/infrastructure/cryptoHelpers';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { isNullOrUndefined } from 'util';
import { Member } from '../member.model';
import { ReturnModel } from '../return.model';
import { AuthService } from '../services/auth.service';
import { MemberSettingService } from '../services/member-setting.service';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TokenMemberModel } from '../token-member.model';
import { XyzekiAuthService } from './xyzeki-auth-service';

const jwtHelper = new JwtHelperService();
const cryptoHelper = new CryptoHelpers();

@Injectable()
export class XyzekiAuthHelpersService {
    constructor(public authService: AuthService, public xyzekiAuthService: XyzekiAuthService, private dataService: DataService,
        private memberSettingService: MemberSettingService, private xyzekiSignalService: XyzekiSignalrService, private router: Router) {
        this.StartTabEventListener();
    }
    public subs: Subscription[] = []

    Auth(tmm: TokenMemberModel) {

        let member = tmm.Member;
        let accessToken = tmm.AccessToken;
        let refreshToken = tmm.RefreshToken
        let refreshTokenExpiryTime = tmm.RefreshTokenExpiryTime
        
        this.SaveMember(member); // only once
        this.SaveAccessToken(accessToken); // only once
        this.SaveRefreshToken(refreshToken, refreshTokenExpiryTime)

        this.LoadMemberSettings(); // every time
        this.LoadAllRepositories(); // every time
        this.StartSignalR(accessToken); // every time

        // First auth event trigger for other tabs/pages       
        this.FireTabEvent('Xyzeki-Auth-Event');



    }

    DeAuth(val = true) {
        this.RemoveMember();
        this.RemoveAccessToken();
        this.RemoveRefreshToken();
        this.ClearMemberSettings();
        this.ClearAllRepositories();
        this.StopSignalR();



        if (val) {

            this.FireTabEvent('Xyzeki-DeAuth-Event');

        }



        // this.ClearLocalStorage();
        this.NavigateToLogin();

    }

    AuthAutoIfPossible() {
        if (this.xyzekiAuthService.LoggedIn) {
            this.LoadMemberSettings();
            this.LoadAllRepositories();
            this.StartSignalR(this.xyzekiAuthService.AccessToken);
        }
    }


    //#region Browser Helpers

    FireTabEvent(type: 'Xyzeki-Auth-Event' | 'Xyzeki-DeAuth-Event') {
        let authEvent = localStorage.getItem(type)
        if (isNullOrUndefined(authEvent)) {
            localStorage.setItem(type, '0')
        }
        else {
            if (authEvent == '1') {
                localStorage.setItem(type, '0')
            }
            else {
                localStorage.setItem(type, '1')
            }
        }
    }

    StartTabEventListener() {
        // this.subs.push(fromEvent(window, 'storage').pipe(
        //     filter((event: any) => event.key == 'Xyzeki-Auth-Event'),
        // ).subscribe(() => {
        //     if (!this.xyzekiAuthService.AccessToken) {
        //         this.AuthMinimal();
        //         this.NavigateToHome();

        //     }
        // }))

        // this.subs.push(fromEvent(window, 'storage').pipe(
        //     filter((event: any) => event.key == 'Xyzeki-DeAuth-Event'),
        // ).subscribe(() => {
        //     console.log('deauth ateşlendi')
        //     this.DeAuth(false);
        // }))

    }
    //#endregion Browser Helpers

    //#region  Auth Helpers

    SaveMember(member: Member) {
        localStorage.setItem("Xyzeki-Member", cryptoHelper.encrypt(JSON.stringify(member))); // Persistance

    }
    SaveAccessToken(access: string) {
        localStorage.setItem("Xyzeki-Access-Token", access); // Persistance
    }
    SaveRefreshToken(refresh: string, refreshExpiryTime) {
        localStorage.setItem("Xyzeki-Refresh-Token", refresh); // Persistance
        localStorage.setItem("Xyzeki-Refresh-Token-Expiry", refreshExpiryTime); // Persistance
    }
    LoadAllRepositories() {
        this.dataService.loadAllRepositoriesEvent.next();
    }
    StartSignalR(token) {
        this.xyzekiSignalService.createHubConnection(token);
    }
    LoadMemberSettings() {
        this.memberSettingService.mySetting().subscribe(mSetting => {
            if (!mSetting)
                return;

            this.dataService.switchMode = mSetting.SwitchMode;
            let element: HTMLElement = document.getElementById('appBody');
            element.className = null;

            //#region  themes
            switch (mSetting.Theme) {
                //#region stiller
                case 'KlasikMavi':
                    element.classList.add('KlasikMavi');
                    break;
                case 'KlasikKirmizi':
                    element.classList.add('KlasikKirmizi');
                    break;
                case 'KlasikSari':
                    element.classList.add('KlasikSari');
                    break;
                case 'KlasikMetalik':
                    element.classList.add('KlasikMetalik');
                    break;
                case 'KlasikGece':
                    element.classList.add('KlasikGece');
                    break;
                case 'KlasikRoyal':
                    element.classList.add('KlasikRoyal');
                    break;
                case 'KlasikLimeade':
                    element.classList.add('KlasikLimeade');
                    break;
                case 'KlasikBeyaz':
                    element.classList.add('KlasikBeyaz');
                    break;
                case 'ArashiyamaBambulari':
                    element.classList.add('ArashiyamaBambulari');
                    break;
                case 'Venedik':
                    element.classList.add('Venedik');
                    break;
                case 'Peribacalari':
                    element.classList.add('Peribacalari');
                    break;
                case 'Orman':
                    element.classList.add('Orman');
                    break;
                case 'Yaprak':
                    element.classList.add('Yaprak');
                    break;
                case 'Kedi':
                    element.classList.add('Kedi');
                    break;
                case 'Deniz':
                    element.classList.add('Deniz');
                    break;
                case 'Deve':
                    element.classList.add('Deve');
                    break;
                case 'Pamukkale':
                    element.classList.add('Pamukkale');
                    break;
                case 'Denizalti':
                    element.classList.add('Denizalti');
                    break;
                case 'Brienz':
                    element.classList.add('Brienz');
                    break;
                case 'Aconcagua':
                    element.classList.add('Aconcagua');
                    break;
                case 'Bulutlar':
                    element.classList.add('Bulutlar');
                    break;
                case 'TropicalGunisigi':
                    element.classList.add('TropicalGunisigi');
                    break;
                case 'DenizAgac':
                    element.classList.add('DenizAgac');
                    break;
                case 'Tarla':
                    element.classList.add('Tarla');
                    break;
                case 'EmpireState':
                    element.classList.add('EmpireState');
                    break;
                //#endregion stiller

            }
            //#endregion themes
            element.classList.add('bg-helper');
        })
    }
    NavigateToHome() {
        this.router.navigate(['/isler'])
    }
    //#endregion Auth Helpers

    //#region DeAuth Helpers

    RemoveMember() {
        localStorage.removeItem("Xyzeki-Member"); // Persistance
    }
    RemoveAccessToken() {
        localStorage.removeItem("Xyzeki-Access-Token"); // Persistance
    }
    RemoveRefreshToken() {
        localStorage.removeItem("Xyzeki-Refresh-Token"); // Persistance
        localStorage.removeItem("Xyzeki-Refresh-Token-Expiry"); // Persistance

    }
    ClearAllRepositories() {
        this.dataService.clearAllRepositoriesEvent.next();
    }
    StopSignalR() {
        this.xyzekiSignalService.destroyHubConnection();
    }
    ClearMemberSettings() {
        this.dataService.switchMode = 0
        let element: HTMLElement = document.getElementById('appBody');
        element.className = null;
    }
    NavigateToLogin() {
        this.router.navigate(['/giris'])
    }
    //#endregion

}

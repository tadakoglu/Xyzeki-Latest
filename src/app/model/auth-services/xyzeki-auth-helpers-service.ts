import { ChangeDetectorRef, Injectable, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
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

        this.StartTokenChangeListener();
        this.StartTabEventListener();
    }

    private readonly XYZEKI_MEMBER = '+12x';
    private readonly XYZEKI_ACCESS_TOKEN = '-f1';
    private readonly XYZEKI_REFRESH_TOKEN = '-f44';
    private readonly XYZEKI_REFRESH_TOKEN_EXPIRY = 'ff'
    private readonly XYZEKI_AUTH_EVENT = '-a'
    private readonly XYZEKI_DEAUTH_EVENT = '-b'


    public subs: Subscription[] = []

    LoggedIn = false

    Auth(tmm: TokenMemberModel) {
        this.LoggedIn = true;
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
        this.FireTabEvent(this.XYZEKI_AUTH_EVENT);

    }

    DeAuth(triggerTabEvent = true) {
        this.LoggedIn = false
        this.RemoveMember();
        this.RemoveAccessToken();
        this.RemoveRefreshToken();
        this.ClearMemberSettings();
        this.ClearAllRepositories();
        this.StopSignalR();

        if (triggerTabEvent) {
            this.FireTabEvent(this.XYZEKI_DEAUTH_EVENT);
        }
        this.NavigateToLogin();

    }

    AuthAutoIfPossible() {
        if (!this.xyzekiAuthService.IsAccessTokenExpired || !this.xyzekiAuthService.IsRefreshTokenExpired) {
            this.LoggedIn = true;
            this.LoadMemberSettings();
            this.LoadAllRepositories();
            this.StartSignalR(this.xyzekiAuthService.AccessToken);
        }
    }

    LoadCredidentalsToMemory() {
        this.xyzekiAuthService.SetMember = this.xyzekiAuthService.MemberLC
        this.xyzekiAuthService.SetAccessToken = this.xyzekiAuthService.AccessTokenLC
        this.xyzekiAuthService.SetRefreshToken = this.xyzekiAuthService.RefreshTokenLC
        this.xyzekiAuthService.SetRefreshTokenExpiryTime = this.xyzekiAuthService.RefreshTokenExpiryTimeLC
    }
    //#region Browser Helpers

    FireTabEvent(type) { // XYZEKI_AUTH_EVENT | XYZEKI_DEAUTH_EVENT
        //localStorage.setItem(type, this.tabId)
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

    public tabId: string = cryptoHelper.RandomGuid();

    StartTokenChangeListener() {
        // this will be triggered by savetoken etc methods.
        this.subs.push(fromEvent(window, 'storage').pipe(
            filter((event: any) => event.key == this.XYZEKI_REFRESH_TOKEN), // we use refresh because it's latest, if we load with access_token, then refresh token change wont be updated in this tab:)
        ).subscribe((event) => {
            this.LoadCredidentalsToMemory();// refresh "tokens in memory" (load from LC to memory again) when change happens from another tab
        }))

    }
    StartTabEventListener() {
        this.subs.push(fromEvent(window, 'storage').pipe(
            filter((event: any) => event.key == this.XYZEKI_AUTH_EVENT),
        ).subscribe((event) => {
            console.log('yeni değer' + event.newValue)
            console.log('tabi d', this.tabId)

            if (!this.LoggedIn) {
                this.AuthAutoIfPossible();
                this.NavigateToHome();
            }


        }))

        this.subs.push(fromEvent(window, 'storage').pipe(
            filter((event: any) => event.key == this.XYZEKI_DEAUTH_EVENT),
        ).subscribe((event) => {

            if (this.LoggedIn) {
                this.DeAuth(false);
            }



        }))

    }
    //#endregion Browser Helpers

    //#region  Auth Helpers

    SaveMember(member: Member) {
        //localStorage.setItem(this.XYZEKI_MEMBER, JSON.stringify(member)); // Persistance
        localStorage.setItem(this.XYZEKI_MEMBER, cryptoHelper.encrypt(JSON.stringify(member))); // Persistance
        this.xyzekiAuthService.SetMember = member;
    }
    SaveAccessToken(access: string) {
        //localStorage.setItem(this.XYZEKI_ACCESS_TOKEN, access); // Persistance
        localStorage.setItem(this.XYZEKI_ACCESS_TOKEN, cryptoHelper.encrypt(access)); // Persistance
        this.xyzekiAuthService.SetAccessToken = access;
    }
    SaveRefreshToken(refresh: string, refreshExpiryTime) {
        // localStorage.setItem(this.XYZEKI_REFRESH_TOKEN, refresh); // Persistance
        // localStorage.setItem(this.XYZEKI_REFRESH_TOKEN_EXPIRY, refreshExpiryTime); // Persistance

        localStorage.setItem(this.XYZEKI_REFRESH_TOKEN, cryptoHelper.encrypt(refresh)); // Persistance
        localStorage.setItem(this.XYZEKI_REFRESH_TOKEN_EXPIRY, cryptoHelper.encrypt(refreshExpiryTime)); // Persistance

        this.xyzekiAuthService.SetRefreshToken = refresh;
        this.xyzekiAuthService.SetRefreshTokenExpiryTime = refreshExpiryTime;
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
        localStorage.removeItem(this.XYZEKI_MEMBER); // Persistance
        this.xyzekiAuthService.SetMember = undefined;
    }
    RemoveAccessToken() {
        localStorage.removeItem(this.XYZEKI_ACCESS_TOKEN); // Persistance
        this.xyzekiAuthService.SetAccessToken = undefined;
    }
    RemoveRefreshToken() {
        localStorage.removeItem(this.XYZEKI_REFRESH_TOKEN); // Persistance
        localStorage.removeItem(this.XYZEKI_REFRESH_TOKEN_EXPIRY); // Persistance
        this.xyzekiAuthService.SetRefreshToken = undefined;
        this.xyzekiAuthService.SetRefreshTokenExpiryTime = undefined;

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

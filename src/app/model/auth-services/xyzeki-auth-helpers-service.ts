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
import { Tuple } from '../tuple.model';
import { XyzekiAuthService } from './xyzeki-auth-service';

const jwtHelper = new JwtHelperService();
const cryptoHelper = new CryptoHelpers();

@Injectable()
export class XyzekiAuthHelpersService {
    constructor(public authService: AuthService, public xyzekiAuthService: XyzekiAuthService, private dataService: DataService,
        private memberSettingService: MemberSettingService, private xyzekiSignalService: XyzekiSignalrService, private router: Router) {

        this.SetupOtherBrowserWindowsOrTabsEventListener();
    }

    storageLoginEventSubscription: Subscription
    storageLogoutEventSubscription: Subscription
    SetupOtherBrowserWindowsOrTabsEventListener() {
        this.storageLoginEventSubscription = fromEvent(window, 'storage').pipe(
            filter((event: any) => event.key == 'Xyzeki_Auth_Event'),
        ).subscribe(() => {
            if (!this.xyzekiAuthService.DefaultToken) {
                this.AuthMinimal();
                this.NavigateToHome();

            }
        })

        this.storageLogoutEventSubscription = fromEvent(window, 'storage').pipe(
            filter((event: any) => event.key == 'Xyzeki_DeAuth_Event'),
        ).subscribe(() => {
            console.log('deauth ateşlendi')
            this.DeAuth(false);
        })

    }

    LoadAllRepositories() {
        this.dataService.loadAllRepositoriesEvent.next();
    }
    ClearAllRepositories() {
        this.dataService.clearAllRepositoriesEvent.next();
    }

    SaveMember(member: Member) {
        this.xyzekiAuthService.SetMember(member);
    }
    SaveToken(token: string) {
        this.xyzekiAuthService.SetToken(token);
    }
    RemoveMember() {
        this.xyzekiAuthService.removeMember();
    }
    RemoveToken() {
        this.xyzekiAuthService.removeToken();
    }
    Auth(tokenAndMember: ReturnModel<Tuple<string, Member>>) {

        let member = tokenAndMember.Model.Item2;
        let token = tokenAndMember.Model.Item1;
        this.SaveMember(member); // only once
        this.SaveToken(token); // only once

        this.LoadMemberSettings(); // every time
        this.LoadAllRepositories(); // every time
        this.StartSignalR(token); // every time


        this.StartRefreshTokenTimer();// only once

        // First auth event trigger for other tabs/pages       
        this.SetUpRandomAuthEventForLocalStorage('Xyzeki_Auth_Event');



    }




    AuthMinimal() {
        this.LoadMemberSettings();
        this.LoadAllRepositories();
        this.StartSignalR(this.xyzekiAuthService.Token);




        this.StartRefreshTokenTimer();
    }



    DeAuth(val = true) {
        this.RemoveMember();
        this.RemoveToken();
        this.ClearMemberSettings();
        this.ClearAllRepositories();
        this.StopSignalR();

        this.StopRefreshTokenTimer();

        if (val) {

            this.SetUpRandomAuthEventForLocalStorage('Xyzeki_DeAuth_Event');

        }




        this.NavigateToLogin();

    }

    AuthAutoIfPossible() {
        if (this.xyzekiAuthService.LoggedIn) {
            this.AuthMinimal()

        }
    }



    private refreshTokenTimeout;
    private StartRefreshTokenTimer() {

        // parse json object from base64 encoded jwt token
        const jwtPayloadJSON = JSON.parse(atob(this.xyzekiAuthService.Token.split('.')[1])); // decode payload of JWT from base64 and parse to jwt json object structure
        console.log('token' + jwtPayloadJSON.exp)
        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtPayloadJSON.exp * 1000); // exp means expiration property in jwt json
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        console.log('timeout' + timeout)
        
        this.refreshTokenTimeout = setTimeout(() => this.authService.refreshToken().subscribe((newToken) => {
            this.SaveToken(newToken);
            this.StartRefreshTokenTimer();
            console.log('timeout' + timeout)

        }), timeout);
    }
    private StopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }


    StartSignalR(token) {
        this.xyzekiSignalService.createHubConnection(token);
    }
    StopSignalR() {
        this.xyzekiSignalService.destroyHubConnection();
    }


    ClearMemberSettings() {
        this.dataService.switchMode = 0
        let element: HTMLElement = document.getElementById('appBody');
        element.className = null;
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

    NavigateToLogin() {
        this.router.navigate(['/giris'])
    }
    NavigateToHome() {
        this.router.navigate(['/isler'])
    }


    SetUpRandomAuthEventForLocalStorage(type: 'Xyzeki_Auth_Event' | 'Xyzeki_DeAuth_Event') {
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
    RandomNumber(base = 10): number {
        return Math.floor(Math.random() * base)
    }

    TimerCanStart(): boolean { // only allow tab or page that is 1th one in authids array.
        let authIdsArr = localStorage.getItem('Xyzeki_Auth_Counter')


        if (isNullOrUndefined(authIdsArr)) {
            return false;
        }
        let authIds = JSON.parse(authIdsArr)
        if (authIds.length == 1) {
            return true;
        }

        return false;


    }
    SaveAuthId() { // diğer tablar storage even üzerinden ateşlendiğinde iki saveauthid lock sorunu yaşıyor ikiside birbirinin üzerine yazıyor. get ile çektikleri yerler farklı.
        let authIdsArr = localStorage.getItem('Xyzeki_Auth_Counter')
        if (isNullOrUndefined(authIdsArr)) {
            let authIds = [];

            let randomId: number = this.RandomNumber();
            authIds.push(randomId);
            localStorage.setItem('Xyzeki_Auth_Counter', JSON.stringify(authIds))
            this.xyzekiAuthService.SetAuthId = randomId
        }
        else {
            let authIds = JSON.parse(authIdsArr)

            let randomId: number = this.RandomNumber();
            while (authIds.findIndex(id => id == randomId) != -1) {
                randomId = this.RandomNumber();
            }
            authIds.push(randomId);
            localStorage.setItem('Xyzeki_Auth_Counter', JSON.stringify(authIds)) // session store clean itself after tab/browser close
            this.xyzekiAuthService.SetAuthId = randomId


        }

    }
    ClearAuthIdAll() {
        localStorage.removeItem('Xyzeki_Auth_Counter')
    }
    ClearAuthId() {

        let authIdsArr = localStorage.getItem('Xyzeki_Auth_Counter')
        if (!isNullOrUndefined(authIdsArr)) {
            let authIds = JSON.parse(authIdsArr)
            let index = authIds.findIndex(id => id == this.xyzekiAuthService.AuthId)
            if (index != -1) {
                authIds.splice(index, 1)
                localStorage.setItem('Xyzeki_Auth_Counter', JSON.stringify(authIds))
                this.xyzekiAuthService.SetAuthId = undefined

            }

        }
    }



}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png


//local storage fonksiyonları
// get Member(): Member {
//     let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
//     return member;
// }
// get Token(): string {
//     let token = localStorage.getItem("Xyzeki_JWTToken");
//     return token;
// }
// SaveMember(member: Member) {
//     localStorage.setItem("Xyzeki_Member", JSON.stringify(member)); // Persistance
// }
// SaveToken(token: string) {
//     localStorage.setItem("Xyzeki_JWTToken", token); // Persistance
// }

// RemoveMember() {
//     localStorage.removeItem("Xyzeki_Member")
// }
// RemoveToken() {
//     localStorage.removeItem("Xyzeki_JWTToken")
// }
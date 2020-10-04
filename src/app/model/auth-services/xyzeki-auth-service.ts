import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { take } from 'rxjs/operators';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { Member } from '../member.model';
import { ReturnModel } from '../return.model';
import { AuthService } from '../services/auth.service';
import { MemberSettingService } from '../services/member-setting.service';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { Tuple } from '../tuple.model';

const jwtHelper = new JwtHelperService();

@Injectable()
export class XyzekiAuthService {
    constructor(public authService: AuthService, private dataService: DataService,
        private memberSettingService: MemberSettingService, private xyzekiSignalService: XyzekiSignalrService) { }

    //Get user information
    get Member(): Member {
        let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        return member;
    }
    get Token(): string {
        let token = localStorage.getItem("Xyzeki_JWTToken");
        return token;
    }
    SaveMember(member: Member) {
        localStorage.setItem("Xyzeki_Member", JSON.stringify(member)); // Persistance
    }
    SaveToken(token: string) {
        localStorage.setItem("Xyzeki_JWTToken", token); // Persistance
    }

    RemoveMember() {
        localStorage.removeItem("Xyzeki_Member")
    }
    RemoveToken() {
        localStorage.removeItem("Xyzeki_JWTToken")
    }


    async GetMemberFromSession() {
        let member: object = await this.authService.GetSessionObject("Xyzeki_Member").pipe(take(1)).toPromise()
        return <Member>member;
    }
    async GetTokenFromSession() {
        let token: string = await this.authService.GetSessionString("Xyzeki_JWTToken").pipe(take(1)).toPromise()
        console.log('No issues, I will wait until promise is resolved..');
        return token;
    }
    //Save user information
    async SaveMemberToSession(member: Member) {
        await this.authService.SetSessionObject("Xyzeki_Member", member).pipe(take(1)).toPromise()
    }
    async SaveTokenToSession(token: string) {
        await this.authService.SetSessionString("Xyzeki_JWTToken", token).pipe(take(1)).toPromise()

    }
    

    //Get more user information
    get IsTokenExpired(): boolean {
        return jwtHelper.isTokenExpired(this.Token)
    }
    get Username(): string {
        let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        return member.Username;
    }
    get LoggedIn(): boolean {
        if (this.Token && !this.IsTokenExpired) {
            return true;
        }
        else {
            return false;
        }
    }

    LoadAllRepositories() {
        this.dataService.loadAllRepositoriesEvent.next();
    }
    ClearAllRepositories() {
        this.dataService.clearAllRepositoriesEvent.next();
    }
    Auth(tokenAndMember: ReturnModel<Tuple<string, Member>>) {
        let member = tokenAndMember.Model.Item2;
        let token = tokenAndMember.Model.Item1;
        this.SaveMember(member);
        this.SaveToken(token);
        this.LoadMemberSettings();
        this.LoadAllRepositories();
        this.StartSignalR(token);
        this.StartRefreshTokenTimer();

    }

    DeAuth() {
        this.RemoveMember();
        this.RemoveToken();
        this.ClearMemberSettings();
        this.ClearAllRepositories();
        this.StopSignalR();
        this.StopRefreshTokenTimer();

    }

    AuthAutoIfPossible() {
        if (this.Member && this.Token && !this.IsTokenExpired) {
            let memberTokenData = new Tuple<string, Member>()
            memberTokenData.Item1 = this.Token;
            memberTokenData.Item2 = this.Member;

            let authModel = new ReturnModel<any>(ErrorCodes.OK, memberTokenData)
            this.Auth(authModel)

        }
    }


    private refreshTokenTimeout;
    private StartRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtPayloadJSON = JSON.parse(atob(this.Token.split('.')[1])); // decode payload of JWT from base64 and parse to jwt json object structure
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

            }
            //#endregion themes
            element.classList.add('bg-helper');
        })
    }
}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

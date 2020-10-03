import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { Member } from '../member.model';
import { ReturnModel } from '../return.model';
import { Tuple } from '../tuple.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { AuthService } from '../services/auth.service';
import { LoginModel } from '../login.model';
import { DataService } from '../services/shared/data.service';

const jwtHelper = new JwtHelperService();

@Injectable()
export class XyzekiAuthData {
    constructor() { }

    get Member(): Member {
        let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        return member;
    }
    get Username(): string {
        let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        return member.Username;
    }
    get Token(): string {
        let token = localStorage.getItem("Xyzeki_JWTToken");
        return token;
    }

}

@Injectable()
export class XyzekiAuthService {
    constructor(public authService: AuthService, private dataService: DataService) { }

    //Get user information
    get Member(): Member {
        let member: Member = JSON.parse(localStorage.getItem("Xyzeki_Member")) as Member
        return member;
    }
    get Token(): string {
        let token = localStorage.getItem("Xyzeki_JWTToken");
        return token;
    }

    //Save user information
    SaveMember(member) {
        localStorage.setItem("Xyzeki_Member", JSON.stringify(member)); // Persistance
    }
    SaveToken(token) {
        localStorage.setItem("Xyzeki_JWTToken", token); // Persistance
    }

    RemoveMember() {
        localStorage.removeItem("Xyzeki_Member")
    }
    RemoveToken() {
        localStorage.removeItem("Xyzeki_JWTToken")
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

    LoadAllRepositories(){
        this.dataService.loadAllRepositoriesEvent.next();
    }
    ClearAllRepositories(){
        this.dataService.clearAllRepositoriesEvent.next();
    }
    Auth(tokenAndMember: ReturnModel<Tuple<string, Member>>) {
        let member = tokenAndMember.Model.Item2;
        let token = tokenAndMember.Model.Item1;
        this.SaveMember(member);
        this.SaveToken(token);

        this.StartRefreshTokenTimer();
        this.LoadAllRepositories();
    }

    LogOut() {
        this.RemoveMember();
        this.RemoveToken();
        this.StopRefreshTokenTimer();
        this.ClearAllRepositories();
    }

    AuthAutoIfPossible() {
        // if (this.Member && this.Token && !this.IsTokenExpired) {
        //     let memberTokenData = new Tuple<string, Member>()
        //     memberTokenData.Item1 = this.Token;
        //     memberTokenData.Item2 = this.Member;

        //     let authModel = new ReturnModel<any>(ErrorCodes.OK, memberTokenData)
        //     this.Auth(authModel)

        // }
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
}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { Member } from './member.model';
import { ReturnModel } from './return.model';
import { Tuple } from './tuple.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { XyzekiSignalrService } from './signalr-services/xyzeki-signalr.service';

const jwtHelper = new JwtHelperService();

@Injectable()
export class XyzekiAuthData{
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
    constructor() { }
    
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
    set SaveMember(member) {
        localStorage.setItem("Xyzeki_Member", JSON.stringify(member)); // Persistance
    }
    set SaveToken(token) {
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


    Auth(tokenAndMember: ReturnModel<Tuple<string, Member>>) {
        let member = tokenAndMember.Model.Item2;
        let token = tokenAndMember.Model.Item1;
        this.SaveMember(member);
        this.SaveToken(token);
       
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

    LogOut() {
        this.RemoveMember();
        this.RemoveToken();
    }

}




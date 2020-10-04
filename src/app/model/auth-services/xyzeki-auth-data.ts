import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Member } from '../member.model';

const jwtHelper = new JwtHelperService();

@Injectable()
export class XyzekiAuthData {
    constructor(private router: Router) { }


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
    //Get more user information
    get IsTokenExpired(): boolean {
        return jwtHelper.isTokenExpired(this.Token)
    }
    get LoggedIn(): boolean {
        if (this.Token && !this.IsTokenExpired) {
            return true;
        }
        else {
            return false;
        }
    }

}

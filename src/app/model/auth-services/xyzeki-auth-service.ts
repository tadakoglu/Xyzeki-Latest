import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Member } from '../member.model';
import { AuthService } from '../services/auth.service';


const jwtHelper = new JwtHelperService();

@Injectable()
export class XyzekiAuthService {
    constructor() { }

    member: Member
    token: string
    get Member(): Member {
        return this.member;
    }
    set SetMember(val) {
        this.member = val;
    }
    get Token(): string {
        return this.token;
    }
    set SetToken(val) {
        this.token = val
    }
    get IsTokenExpired(): boolean {
        return jwtHelper.isTokenExpired(this.token)
    }
    get Username(): string {
        return this.member ? this.member.Username : undefined
    }
    get LoggedIn(): boolean {
        return (this.token && !jwtHelper.isTokenExpired(this.token)) ? true : false
    }


}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

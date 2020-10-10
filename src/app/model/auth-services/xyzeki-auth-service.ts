import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CryptoHelpers } from 'src/infrastructure/cryptoHelpers';
import { Member } from '../member.model';


const jwtHelper = new JwtHelperService();
const cryptoHelper = new CryptoHelpers();

@Injectable()
export class XyzekiAuthService {
    constructor() { }

    member: Member
    token: string
    get Member(): Member {
        return this.member;
    }
    get Token(): string {
        return this.token;
    }

    SetMember(val) {
        this.member = val
        localStorage.setItem("Xyzeki_Member", cryptoHelper.encrypt(JSON.stringify(val))); // Persistance
    }
    SetToken(val) {
        this.token = val
        localStorage.setItem("Xyzeki_JWTToken", cryptoHelper.encrypt(val)); // Persistance

    }

    removeMember() {
        this.member = undefined;
        localStorage.removeItem("Xyzeki_Member"); // Persistance
    }
    removeToken() {
        this.token = undefined;
        localStorage.removeItem("Xyzeki_JWTToken"); // Persistance

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

    get ValidTokenFoundInLocalStorage(): boolean { // This is a fallback function for guards
        try {
            let member = localStorage.getItem("Xyzeki_Member")
            let token = localStorage.getItem("Xyzeki_JWTToken")
            member = cryptoHelper.decrypt(member)
            token = cryptoHelper.decrypt(token)
            return token && !jwtHelper.isTokenExpired(token)

        } catch (error) {
            return false;
        }


    }

}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

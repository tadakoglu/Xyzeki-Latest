import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CryptoHelpers } from 'src/infrastructure/cryptoHelpers';
import { isNullOrUndefined } from 'util';
import { Member } from '../member.model';


const jwtHelper = new JwtHelperService();
const cryptoHelper = new CryptoHelpers();

@Injectable()
export class XyzekiAuthService {
    constructor() { }




    get Member(): Member {
        let memberA = localStorage.getItem("Xyzeki_Member")
        if (isNullOrUndefined(memberA)) {
            return undefined;
        }
        let memberAA = cryptoHelper.decrypt(memberA)
        let memberAAA = JSON.parse(memberAA);
        return memberAAA as Member
    }
    get Token(): string {
        let tokenA = localStorage.getItem("Xyzeki_JWTToken")
        if (isNullOrUndefined(tokenA)) {
            return undefined
        }
        let tokenAA = cryptoHelper.decrypt(tokenA)
        return tokenAA;
    }

    get IsTokenExpired(): boolean {
        if (!isNullOrUndefined(this.Token)) {
            return jwtHelper.isTokenExpired(this.Token)
        }
        else {
            return false;
        }
    }
    get Username(): string {
        let memberA = this.Member;
        if(!isNullOrUndefined(memberA)){
            return memberA.Username
        }
        else{
            return undefined
        }
    }
    get LoggedIn(): boolean {
        return (this.Token && !jwtHelper.isTokenExpired(this.Token)) ? true : false
    }


    SetMember(val) {
        localStorage.setItem("Xyzeki_Member", cryptoHelper.encrypt(JSON.stringify(val))); // Persistance
    }
    SetToken(val) {
        localStorage.setItem("Xyzeki_JWTToken", cryptoHelper.encrypt(val)); // Persistance

    }

    removeMember() {
        localStorage.removeItem("Xyzeki_Member"); // Persistance
    }
    removeToken() {
        localStorage.removeItem("Xyzeki_JWTToken"); // Persistance

    }



}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

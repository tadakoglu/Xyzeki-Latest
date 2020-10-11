import { Injectable, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CryptoHelpers } from 'src/infrastructure/cryptoHelpers';
import { isNullOrUndefined } from 'util';
import { Member } from '../member.model';


const jwtHelper = new JwtHelperService();
const cryptoHelper = new CryptoHelpers();

@Injectable()
export class XyzekiAuthService {
    constructor() { }

    authId=undefined

    get AuthId(){
        return this.authId;
    }
    set SetAuthId(id){
        this.authId = id;
    }
    RemoveAuth(){
        this.authId= undefined;
    }

    @Input()
    memberCache
    get Member(): Member {
        if (this.memberCache) {
            return this.memberCache
        }
        let memberA = localStorage.getItem("Xyzeki_Member")
        if (isNullOrUndefined(memberA)) {
            return undefined;
        }
        let memberAA = cryptoHelper.decrypt(memberA)
        let memberAAA = JSON.parse(memberAA);
        this.memberCache = memberAAA;

        return memberAAA as Member
    }
    @Input()
    tokenCache
    get Token(): string {
        if (this.tokenCache) {
            return this.tokenCache
        }
        let tokenA = localStorage.getItem("Xyzeki_JWTToken")
        if (isNullOrUndefined(tokenA)) {
            return undefined
        }
        let tokenAA = cryptoHelper.decrypt(tokenA)
        this.tokenCache = tokenAA;
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
        if (!isNullOrUndefined(memberA)) {
            return memberA.Username
        }
        else {
            return undefined
        }
    }
    get LoggedIn(): boolean {
        return (this.Token && !jwtHelper.isTokenExpired(this.Token)) ? true : false
    }

    set SetMemberCache(val) {
        this.memberCache = val;
    }
    set SetTokenCache(val) {
        this.tokenCache = val;
    }

    SetMember(val) {
        this.SetMemberCache = val
        localStorage.setItem("Xyzeki_Member", cryptoHelper.encrypt(JSON.stringify(val))); // Persistance
    }
    SetToken(val) {
        this.SetTokenCache = val // reset cache
        localStorage.setItem("Xyzeki_JWTToken", cryptoHelper.encrypt(val)); // Persistance

    }

    removeMember() {
        this.memberCache=undefined
        localStorage.removeItem("Xyzeki_Member"); // Persistance
    }
    removeToken() {
        this.tokenCache=undefined
        localStorage.removeItem("Xyzeki_JWTToken"); // Persistance

    }



}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

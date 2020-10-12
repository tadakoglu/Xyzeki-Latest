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
        let memberA = localStorage.getItem("fjljf9o5p8f200")
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
        let tokenA = localStorage.getItem("laj9p3jjapn4lgp+")
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

    get DefaultToken():boolean{
        return (this.defaultTokenCache && !jwtHelper.isTokenExpired(this.defaultTokenCache)) ? true: false
    }
    defaultTokenCache:string
    set SetDefaultTokenCache(val){
        this.defaultTokenCache = val
    }
    SetMember(val) {
        this.SetMemberCache = val
        localStorage.setItem("fjljf9o5p8f200", cryptoHelper.encrypt(JSON.stringify(val))); // Persistance
    }
    SetToken(val) {
        this.SetDefaultTokenCache = val;
        this.SetTokenCache = val // reset cache
        localStorage.setItem("laj9p3jjapn4lgp+", cryptoHelper.encrypt(val)); // Persistance
    }

    removeMember() {
        this.memberCache=undefined
        localStorage.removeItem("fjljf9o5p8f200"); // Persistance
    }
    removeToken() {
        this.SetDefaultTokenCache=undefined;
        this.tokenCache=undefined
        localStorage.removeItem("laj9p3jjapn4lgp+"); // Persistance

    }

    
}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

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

    get Member(): Member {
        let member = localStorage.getItem("Xyzeki-Member")
        if (isNullOrUndefined(member)) {
            return undefined;
        }
        return JSON.parse(member) as Member
    }
    get AccessToken(): string {
        let accessToken = localStorage.getItem("Xyzeki-Access-Token")
        if (isNullOrUndefined(accessToken)) {
            return undefined
        }
        return accessToken;
    }
    get RefreshToken(): string {
        let refreshToken = localStorage.getItem("Xyzeki-Refresh-Token")
        if (isNullOrUndefined(refreshToken)) {
            return undefined
        }
        return refreshToken;
    }
    get RefreshTokenExpiryTime(): string {
        let expiryTime = localStorage.getItem("Xyzeki-Refresh-Token-Expiry"); // Persistance
        if (isNullOrUndefined(expiryTime)) {
            return undefined
        }
        return expiryTime;
    }
    get LoggedIn(): boolean {
        return this.AccessToken ? true : false
    }

    get IsAccessTokenExpired(): boolean {
        return (this.AccessToken && !jwtHelper.isTokenExpired(this.AccessToken)) ? false : true
    }
    get IsRefreshTokenExpired(): boolean {
        let today = new Date(); // this is local dependant.
        let refreshToken = new Date(this.RefreshTokenExpiryTime);

        if (refreshToken.getTime() - today.getTime() > 0) {
            return false;
        }
        else {
            return true;
        }

    }


    //#region Other Helpers
    get Username(): string {
        let member = this.Member;
        if (!isNullOrUndefined(member)) {
            return member.Username
        }
        else {
            return undefined
        }
    }
    //#endregion Other Helpers



}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

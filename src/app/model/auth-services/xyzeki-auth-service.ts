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

    private readonly XYZEKI_MEMBER = '+10x0x00000011';
    private readonly XYZEKI_ACCESS_TOKEN = '-11x0x11001011';
    private readonly XYZEKI_REFRESH_TOKEN = '-00X10X0000011';
    private readonly XYZEKI_REFRESH_TOKEN_EXPIRY = '-01X1100X11101100'
    private readonly XYZEKI_AUTH_EVENT = '-000001x0101010'
    private readonly XYZEKI_DEAUTH_EVENT = '-0110001x0101010'
    
    get MemberLC(): Member {
        let member = localStorage.getItem(this.XYZEKI_MEMBER)
        if (isNullOrUndefined(member)) {
            return undefined;
        }
        let memberDecrypted = cryptoHelper.decrypt(member)
        return JSON.parse(memberDecrypted) as Member
    }
    get AccessTokenLC(): string {
        let accessToken = localStorage.getItem(this.XYZEKI_ACCESS_TOKEN)
        if (isNullOrUndefined(accessToken)) {
            return undefined
        }
        let accessTokenDecrypted = cryptoHelper.decrypt(accessToken)
        return accessTokenDecrypted;
    }
    get RefreshTokenLC(): string {
        let refreshToken = localStorage.getItem(this.XYZEKI_REFRESH_TOKEN)
        if (isNullOrUndefined(refreshToken)) {
            return undefined
        }
        let refreshTokenDecrypted = cryptoHelper.decrypt(refreshToken)
        return refreshTokenDecrypted;
    }
    get RefreshTokenExpiryTimeLC(): string {
        let expiryTime = localStorage.getItem(this.XYZEKI_REFRESH_TOKEN_EXPIRY); // Persistance
        if (isNullOrUndefined(expiryTime)) {
            return undefined
        }
        let expiryTimeDecrypted = cryptoHelper.decrypt(expiryTime)
        return expiryTimeDecrypted;
    }


    get IsAccessTokenExpiredLC(): boolean {
        try {
            return (this.AccessTokenLC && !jwtHelper.isTokenExpired(this.AccessTokenLC)) ? false : true
        } catch (error) {
            return false;
        }

    }
    get IsRefreshTokenExpiredLC(): boolean {
        try {
            let today = new Date(); // this is local dependant.
            let refreshToken = new Date(this.RefreshTokenExpiryTimeLC);

            if (refreshToken.getTime() - today.getTime() > 0) {
                return false;
            }
            else {
                return true;
            }
        }
        catch (error) {
            return false;
        }


    }


    //#region Other Helpers
    get UsernameLC(): string {
        let member = this.MemberLC;
        if (!isNullOrUndefined(member)) {
            return member.Username
        }
        else {
            return undefined
        }
    }
    //#endregion Other Helpers


    //#region  Memory Versions
    memberMemory
    accessTokenMemory
    refreshTokenMemory
    refreshTokenExpiryTimeMemory

    get Member() {
        return this.memberMemory;
    }
    get AccessToken() {
        return this.accessTokenMemory;
    }
    get RefreshToken() {
        return this.refreshTokenMemory;
    }
    get RefreshTokenExpiryTime() {
        return this.refreshTokenExpiryTimeMemory;
    }
    get IsAccessTokenExpired() {
        try {
            return (this.AccessToken && !jwtHelper.isTokenExpired(this.AccessToken)) ? false : true
        } catch (error) {
            return true;
        }
    }
    get IsRefreshTokenExpired(): boolean {
        try {
            let today = new Date(); // this is local dependant.
            let refreshToken = new Date(this.RefreshTokenExpiryTime);

            if (refreshToken.getTime() - today.getTime() > 0) {
                return false;
            }
            else {
                return true;
            }
        }
        catch (error) {
            return true;
        }


    }
    get Username() {
        let member = this.Member;
        if (!isNullOrUndefined(member)) {
            return member.Username
        }
        else {
            return undefined
        }
    }


    set SetMember(val) {
        this.memberMemory = val
    }
    set SetAccessToken(val) {
        this.accessTokenMemory = val
    }
    set SetRefreshToken(val) {
        this.refreshTokenMemory = val
    }
    set SetRefreshTokenExpiryTime(val) {
        this.refreshTokenExpiryTimeMemory = val
    }
    //#endregion Memory Versions

    
}




// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png

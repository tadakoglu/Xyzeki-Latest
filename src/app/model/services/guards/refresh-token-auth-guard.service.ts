// import { Injectable } from '@angular/core';
// import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';


// @Injectable({
//   providedIn: 'root'
// })
// export class RefreshTokenAuthGuardService implements CanActivate{

//   async canActivate() {
//     const token = localStorage.getItem("jwt");
//     if (token && !this.jwtHelper.isTokenExpired(token)) {
//       console.log(this.jwtHelper.decodeToken(token));
//       return true;
//     }
//     const isRefreshSuccess = await this.tryRefreshingTokens(token);
//     if (!isRefreshSuccess) {
//       this.router.navigate(["login"]);
//     }
//     return isRefreshSuccess;
//   }
//   private async tryRefreshingTokens(token: string): Promise<boolean> {
//     // Try refreshing tokens using refresh token
//     const refreshToken: string = localStorage.getItem("refreshToken");
//     const credentials = JSON.stringify({ accessToken: token, refreshToken: refreshToken });
//     let isRefreshSuccess: boolean;
//     try {
//       const response = await this.http.post("http://localhost:5000/api/token/refresh", credentials, {
//         headers: new HttpHeaders({
//           "Content-Type": "application/json"
//         }),
//         observe: 'response'
//       }).toPromise();
//       // If token refresh is successful, set new tokens in local storage.
//       const newToken = (<any>response).body.accessToken;
//       const newRefreshToken = (<any>response).body.refreshToken;
//       localStorage.setItem("jwt", newToken);
//       localStorage.setItem("refreshToken", newRefreshToken);
//       isRefreshSuccess = true;
//     }
//     catch (ex) {
//       isRefreshSuccess = false;
//     }
//     return isRefreshSuccess;
//   }
// }



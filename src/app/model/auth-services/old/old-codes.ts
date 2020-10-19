

// JWT STRUCTURE
// https://1.bp.blogspot.com/-qOrJbjgTlgo/XSdD6JV_eMI/AAAAAAAACn8/D8C2yxUgTyEM-l7uKz25kViwWkAbXaejwCLcBGAs/s1600/ozkary-jwt-decoding.png


//local storage fonksiyonları
// get Member(): Member {
//     let member: Member = JSON.parse(localStorage.getItem("fjljf9o5p8f200")) as Member
//     return member;
// }
// get Token(): string {
//     let token = localStorage.getItem("laj9p3jjapn4lgp+");
//     return token;
// }
// SaveMember(member: Member) {
//     localStorage.setItem("fjljf9o5p8f200", JSON.stringify(member)); // Persistance
// }
// SaveToken(token: string) {
//     localStorage.setItem("laj9p3jjapn4lgp+", token); // Persistance
// }

// RemoveMember() {
//     localStorage.removeItem("fjljf9o5p8f200")
// }
// RemoveToken() {
//     localStorage.removeItem("laj9p3jjapn4lgp+")
// }



    // private refreshTokenTimeout;
    // private StartRefreshTokenTimer() {

    //     // parse json object from base64 encoded jwt token
    //     const jwtPayloadJSON = JSON.parse(atob(this.xyzekiAuthService.Token.split('.')[1])); // decode payload of JWT from base64 and parse to jwt json object structure
    //     console.log('token' + jwtPayloadJSON.exp)
    //     // set a timeout to refresh the token a minute before it expires
    //     const expires = new Date(jwtPayloadJSON.exp * 1000); // exp means expiration property in jwt json
    //     const timeout = expires.getTime() - Date.now() - (60 * 1000);
    //     console.log('timeout' + timeout)

    //     this.refreshTokenTimeout = setTimeout(() => this.authService.refreshToken().subscribe((newToken) => {
    //         this.SaveToken(newToken);
    //         this.StartRefreshTokenTimer();
    //         console.log('timeout' + timeout)

    //     }), timeout);
    // }
    // private StopRefreshTokenTimer() {
    //     clearTimeout(this.refreshTokenTimeout);
    // }
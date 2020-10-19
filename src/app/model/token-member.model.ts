import { Member } from './member.model';


export class TokenMemberModel {
    constructor(
        public AccessToken?: string,
        public RefreshToken?: string,
        public RefreshTokenExpiryTime?: string,
        public Member?: Member
    ) { }

}


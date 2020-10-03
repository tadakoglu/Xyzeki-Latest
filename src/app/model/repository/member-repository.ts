import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMemberRepository } from '../abstract/i-member-repository';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { Member } from '../member.model';
import { RegisterModel } from '../register.model';
import { ReturnModel } from '../return.model';
import { MembersService } from '../services/members.service';

@Injectable()
export class MemberRepository implements IMemberRepository { 
    
    constructor(private service: MembersService, public xyzekiAuthService : XyzekiAuthService ) { }

    getMember(username: string): Observable<Member> {
        return this.service.getMember(username);
    }
    updateMember(member: RegisterModel) : Observable<ReturnModel<object>> {
        return this.service.updateMember(member)
    }
}
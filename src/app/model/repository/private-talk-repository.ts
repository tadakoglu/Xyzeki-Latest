import { EventEmitter, Injectable } from '@angular/core';
import { concatMap } from 'rxjs/operators';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { IPrivateTalkRepository } from '../abstract/i-private-talk-repository';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { MessageCountModel } from '../message-count.model';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { PrivateTalk } from '../private-talk.model';
import { PrivateTalkReceiversService } from '../services/private-talk-receivers.service';
import { PrivateTalkTeamReceiversService } from '../services/private-talk-team-receivers.service';
import { PrivateTalksService } from '../services/private-talks.service';
import { DataService } from '../services/shared/data.service';
import { TimeService } from '../services/time.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { MemberLicenseRepository } from './member-license-repository';
import { PrivateTalkReceiverRepository } from './private-talk-receiver-repository';

@Injectable()
export class PrivateTalkRepository implements IPrivateTalkRepository {

    constructor(private psz: PageSizes, private receiverRepo: PrivateTalkReceiverRepository, private dataService: DataService, private service: PrivateTalksService, public signalService: XyzekiSignalrService, public signalMessageService: XyzekiSignalrService, private serviceReceivers: PrivateTalkReceiversService, private serviceTeamReceivers: PrivateTalkTeamReceiversService, public xyzekiAuthService: XyzekiAuthService,
        private memberLicenseRepo: MemberLicenseRepository, private timeService: TimeService) {

        this.signalService.newPrivateTalkJoinedAvailable.subscribe(pTalk => {
            this.savePrivateTalkReceivedViaSignalR(pTalk);
        })
        this.signalService.deletedPrivateTalkJoinedAvailable.subscribe(pTalkDeleted => {
            this.deletePrivateTalkReceivedViaSignalR(pTalkDeleted);
        })

        this.signalMessageService.newPrivateTalkMessageAvailable.subscribe(message => { // that is for unread message counter
            if (message[1]) { // isTypingSignal
                return;
            }


            let ptMessages: MessageCountModel = this.myPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == message[0].PrivateTalkId);
            if (ptMessages) {
                ptMessages.OrderingCriterion = message[0].DateTimeSent;

                if (message[0].PrivateTalkId == dataService.openPrivateTalkId)
                    return;

                if (ptMessages.MessagesCount == 0)
                    this.increaseUnreadMyPTCount();

                ptMessages.MessagesCount++;


            }

            let ptMessages2: MessageCountModel = this.receivedPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == message[0].PrivateTalkId);
            if (ptMessages2) {
                ptMessages2.OrderingCriterion = message[0].DateTimeSent;

                if (message[0].PrivateTalkId == dataService.openPrivateTalkId)
                    return;

                if (ptMessages2.MessagesCount == 0)
                    this.increaseUnreadReceivedPTCount();

                ptMessages2.MessagesCount++;
            }

            if (ptMessages == undefined && ptMessages2 == undefined) {
                this.service.getNewUnreadPrivateTalk(message[0].PrivateTalkId).subscribe(PTInsideOut => {      //[Type(MyOrReceived), PrivateTalk, MessageCountModel, Receivers, TeamReceivers]               
                    if (PTInsideOut) { // That returns null when not found any such available operation to do.
                        if (PTInsideOut.My) {
                            this.increaseUnreadMyPTCount();
                            this.myPrivateTalks.unshift(PTInsideOut.PrivateTalk)
                            this.myPTMessagesCount.unshift(PTInsideOut.MessageCountModel)
                            this.receiverRepo.getPrivateTalkReceivers().unshift(...PTInsideOut.Receivers);
                            this.receiverRepo.getPrivateTalkTeamReceivers().unshift(...PTInsideOut.TeamReceivers);
                        }
                        else {
                            this.increaseUnreadReceivedPTCount();
                            this.privateTalksReceived.unshift(PTInsideOut.PrivateTalk)
                            this.receivedPTMessagesCount.unshift(...PTInsideOut.TeamReceivers)
                        }
                    }
                })
            }




        });

        this.dataService.loadAllRepositoriesEvent.subscribe(() => {  this.loadAll(); });
        this.dataService.clearAllRepositoriesEvent.subscribe(() => { this.clearPrivateTalks(); this.receiverRepo.clearPrivateTalkReceivers(); })
        this.loadRepository();
    }
    loadRepository() {
        this.loadAll();
        // this.loadPTCount();
    }
    clearPrivateTalks() {
        this.myPrivateTalks = []
        this.privateTalksReceived = []
        this.myPTMessagesCount = [];
        this.receivedPTMessagesCount = [];
        this.unreadMyPrivateTalksCount = 0
        this.unreadReceivedPrivateTalksCount = 0

        this.searchValue = undefined;
    }
    // loadPTCount() { // ###reload this when team component destroyed...
    //     this.service.unreadMyPtCount().subscribe(countMy => {
    //         this.unreadMyPrivateTalksCount = countMy
    //     }
    //     );
    //     this.service.unreadReceivedPtCount().subscribe(countReceived => {
    //         this.unreadReceivedPrivateTalksCount = countReceived
    //     }
    //     );
    // }
    public searchValue: string

    loadAll(searchValue?: string) { // ###reload this when team component destroyed...
        // this.service.myPrivateTalks(searchValue).subscribe(privateTalks => {
        //     this.myPrivateTalks = privateTalks;

        // });

        // this.service.privateTalksReceived(searchValue).subscribe(bTalksReceived => {

        //     this.privateTalksReceived = bTalksReceived;
        // })

        // this.receiverRepo.loadAll(searchValue);

        //comments count
        // this.service.myPrivateTalkMessagesCount(searchValue).subscribe(ptMessagesCount => {

        //     this.myPTMessagesCount = ptMessagesCount;
        // })
        // this.service.receivedPrivateTalkMessagesCount(searchValue).subscribe(ptMessagesCount => {

        //     this.receivedPTMessagesCount = ptMessagesCount;
        // })


        // end of comments count

        this.service.myPrivateTalksNew(searchValue).subscribe(container => {
            this.myPrivateTalks = container.pTalks;
            this.myPTMessagesCount = container.messageCounts;
            this.receiverRepo.loadReceivers(container.ptrs, container.pttrs);
            this.unreadMyPrivateTalksCount = container.totalUnReadCount
        })

        this.service.privateTalksReceivedNew(searchValue).subscribe(container => {
            this.privateTalksReceived = container.pTalks;
            this.receivedPTMessagesCount = container.messageCounts;
            this.unreadReceivedPrivateTalksCount = container.totalUnReadCount
        })
    }

    public privateTalkToOpen = new EventEmitter<PrivateTalk>();
    //public pTalkFirst: Subject<PrivateTalk> = new Subject<PrivateTalk>()

    private myPrivateTalks: PrivateTalk[] = []
    private privateTalksReceived: PrivateTalk[] = []


    private myPTMessagesCount: MessageCountModel[] = [];
    private receivedPTMessagesCount: MessageCountModel[] = [];

    getMyPTMessagesCount(): MessageCountModel[] {
        return this.myPTMessagesCount;
    }
    getReceivedPTMessagesCount(): MessageCountModel[] {
        return this.receivedPTMessagesCount;
    }

    private unreadMyPrivateTalksCount: number = 0
    private unreadReceivedPrivateTalksCount: number = 0

    decreaseUnreadMyPTCount() {
        let newValue = this.unreadMyPrivateTalksCount - 1;

        if (newValue >= 0) { // can't be negative
            this.unreadMyPrivateTalksCount = newValue;
        }
    }
    increaseUnreadMyPTCount() {
        this.unreadMyPrivateTalksCount++;
    }

    decreaseUnreadReceivedPTCount() {
        let newValue = this.unreadReceivedPrivateTalksCount - 1;

        if (newValue >= 0) { // can't be negative
            this.unreadReceivedPrivateTalksCount = newValue;
        }
    }
    increaseUnreadReceivedPTCount() {
        this.unreadReceivedPrivateTalksCount++;
    }

    getUnreadMyPTCount(): number {
        return this.unreadMyPrivateTalksCount;
    }
    getUnreadReceivedPTCount(): number {
        return this.unreadReceivedPrivateTalksCount;
    }
    getUnreadTotalPTCount(): number {
        return this.unreadMyPrivateTalksCount + this.unreadReceivedPrivateTalksCount;
    }

    noOfMessagesUnread(privateTalkId, my = true): number {
        let ptMessages: MessageCountModel
        if (my) {
            ptMessages = this.myPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == privateTalkId);
        }
        else {
            ptMessages = this.receivedPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == privateTalkId);
        }

        if (ptMessages && ptMessages.MessagesCount > 0)
            return 1;
        else
            return 0;
    }



    getMyPrivateTalks(): PrivateTalk[] {
        return this.myPrivateTalks.sort((pt1, pt2) => new Date(pt2.DateTimeCreated).getTime() - new Date(pt1.DateTimeCreated).getTime());
    }
    getPrivateTalksReceived(): PrivateTalk[] {
        return this.privateTalksReceived.sort((pt1, pt2) => new Date(pt2.DateTimeCreated).getTime() - new Date(pt1.DateTimeCreated).getTime());
    }

    populateAllReceivers(receiversModel: string[], teamReceiversModel: number[], privateTalkId): [PrivateTalkReceiver[], PrivateTalkTeamReceiver[]] {
        //Create actual receiver objects
        let receivers: PrivateTalkReceiver[] = []
        let teamReceivers: PrivateTalkTeamReceiver[] = []

        //Filter zero and null values in receiver models
        receiversModel = receiversModel.filter(val => val != null).filter((val, index, self) => self.indexOf(val) === index);
        teamReceiversModel = teamReceiversModel.filter(val => val != 0).filter((val, index, self) => self.indexOf(val) === index);

        receiversModel.forEach((recVal, index, arr) => { receivers.push(new PrivateTalkReceiver(privateTalkId, recVal)) });
        teamReceiversModel.forEach((teamRecVal, index, arr) => { teamReceivers.push(new PrivateTalkTeamReceiver(privateTalkId, teamRecVal)) });

        //Return actual models
        return [receivers, teamReceivers]
    }

    savePrivateTalk(privateTalk: PrivateTalk, receiversModel: string[], teamReceiversModel: number[]) {
        privateTalk.Owner = this.memberLicenseRepo.getMemberLicense().Username;
        if (privateTalk.PrivateTalkId == 0 || privateTalk.PrivateTalkId == null) {
            this.timeService.getNow().pipe(concatMap((now) => {
                privateTalk.DateTimeCreated = now;
                return this.service.savePrivateTalk(privateTalk)
            })).subscribe((privateTalkId) => {
                privateTalk.PrivateTalkId = privateTalkId;

                let receivers: PrivateTalkReceiver[];
                let teamReceivers: PrivateTalkTeamReceiver[];
                [receivers, teamReceivers] = this.populateAllReceivers(receiversModel, teamReceiversModel, privateTalkId);
                this.receiverRepo.savePrivateTalkReceivers(receivers, teamReceivers, 'new', privateTalk);

                this.myPrivateTalks.unshift(privateTalk);

                this.myPTMessagesCount.push(new MessageCountModel(0, privateTalkId, privateTalk.DateTimeCreated))


                this.privateTalkToOpen.next(privateTalk);
                // this.signalService.notifyNewPrivateTalk(privateTalk, receivers, teamReceivers);
            });

        }
        else {
            this.service.updatePrivateTalk(privateTalk).subscribe(() => {
                let receivers: PrivateTalkReceiver[];
                let teamReceivers: PrivateTalkTeamReceiver[];
                [receivers, teamReceivers] = this.populateAllReceivers(receiversModel, teamReceiversModel, privateTalk.PrivateTalkId);

                let index = this.myPrivateTalks.findIndex(val => val.PrivateTalkId == privateTalk.PrivateTalkId);
                if (-1 != index)
                    this.myPrivateTalks.splice(index, 1, privateTalk);


                this.receiverRepo.savePrivateTalkReceivers(receivers, teamReceivers, 'update', privateTalk);

                // Signalling support is in savePrivateTalkReceivers.
                this.privateTalkToOpen.next(privateTalk);

            })

        }
        return 0;
    }

    savePrivateTalkReceivedViaSignalR(privateTalk: PrivateTalk) {

        let index: number = this.privateTalksReceived.findIndex(value => value.PrivateTalkId == privateTalk.PrivateTalkId)

        if (-1 == index) {
            this.privateTalksReceived.unshift(privateTalk);
        }
        else {
            this.privateTalksReceived.splice(index, 1, privateTalk);
        }


        let indexCount: number = this.receivedPTMessagesCount.findIndex(value => value.PrivateTalkId == privateTalk.PrivateTalkId)
        if (-1 == indexCount) //if not exists.
            this.receivedPTMessagesCount.push(new MessageCountModel(0, privateTalk.PrivateTalkId, privateTalk.DateTimeCreated))



    }

    deletePrivateTalk(privateTalkId: number) {
        let privateTalk: PrivateTalk = this.myPrivateTalks.find(value => value.PrivateTalkId == privateTalkId)
        let receivers: PrivateTalkReceiver[] = this.receiverRepo.getPrivateTalkReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId)
        let teamReceivers: PrivateTalkTeamReceiver[] = this.receiverRepo.getPrivateTalkTeamReceivers().filter(ptr => ptr.PrivateTalkId == privateTalkId)

        this.signalService.notifyDeletedPrivateTalkJoined(privateTalk, receivers, teamReceivers);

        this.service.deletePrivateTalk(privateTalkId).subscribe(privateTalk => {
            let index: number = this.myPrivateTalks.findIndex(value => value.PrivateTalkId == privateTalk.PrivateTalkId)
            this.myPrivateTalks.splice(index, 1);
        })
    }

    deletePrivateTalkReceivedViaSignalR(privateTalk: PrivateTalk) {
        let index: number = this.privateTalksReceived.findIndex(value => value.PrivateTalkId == privateTalk.PrivateTalkId)
        if (-1 != index) //if exists.
            this.privateTalksReceived.splice(index, 1);
    }

    getPrivateTalk(privateTalkId) {
        return this.service.findPrivateTalk(privateTalkId);
    }



    resetUnreadCounter(privateTalkId: number) { // check private talk as READ.
        let ptMessages: MessageCountModel = this.myPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == privateTalkId);
        if (ptMessages) {

            if (ptMessages.MessagesCount > 0) // if that private talk have messages unread decrease unread pt count.
                this.decreaseUnreadMyPTCount();

            ptMessages.MessagesCount = 0;
        }

        else {
            let ptMessages: MessageCountModel = this.receivedPTMessagesCount.find(messageCountModel => messageCountModel.PrivateTalkId == privateTalkId);
            if (ptMessages) {

                if (ptMessages.MessagesCount > 0) // if that private talk have messages unread decrease unread pt count.
                    this.decreaseUnreadReceivedPTCount();

                ptMessages.MessagesCount = 0;
            }

        }

    }

}

// gmail benzeri bir iş konuşması sistemi : my private talk kısmı gönderilen kutusu olarak düşünülecek.

// giden kutusu: "mailin gönderilme tarihine(kısaca mailin oluşturulma tarihine)" göre sıralama yapıyor.
// *burada gelen veya gönderilen mesajlar sıralamayı değiştirmiyor(gmailde). 

// gelen kutusu: "maildeki en son gelen mesajın gönderilme(geliş) tarihine" göre sırama yapıyor. gelen mesaj yoksa
// mailin geliş tarihi kullanılıyor.. mesajın okunmuş olup olmaması ve gelen maildeki gönderilen mesajlar sıralamaya etki etmiyor.
// (mesaj=gelen mesaj kastedilir.)

// 12.45 mesaj yok (mailin geliş tarihi alındı mesela 12.45) 
// 12.30 mesaj gelmiş(mesaj geliş tarihi alındı)
// 12.00 mesaj yok(mailin geliş tarihini al mesela 12.00)
// 11.00 mesaj gelmiş(mesaj geliş tarihi alındı)

// yani eğer gelen mailde bir gelen mesaj var ise bu tarihi sıralama ölçütünde kullan.
// eğer gelen mailde bir gelen mesaj yok ise bu durumda mailin geliş tarihini sıralam ölçütü olarak kullan bu kadar basit.
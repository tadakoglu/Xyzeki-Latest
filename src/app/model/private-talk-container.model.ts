import { MessageCountModel } from './message-count.model'
import { PrivateTalkReceiver } from './private-talk-receiver.model'
import { PrivateTalkTeamReceiver } from './private-talk-team-receiver.model'
import { PrivateTalk } from './private-talk.model'

export class PrivateTalkContainerModel {
    pTalks: PrivateTalk[] = []
    messageCounts: MessageCountModel[]= []
    ptrs: PrivateTalkReceiver[]= []
    pttrs: PrivateTalkTeamReceiver[]= []
    totalUnReadCount:number

}
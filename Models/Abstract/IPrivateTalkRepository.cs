using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IPrivateTalkRepository
    {
        IQueryable<PrivateTalk> PrivateTalks { get; } //PrivateTalks query api

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects

        PrivateTalkContainerModel MyPrivateTalksNew(string sender, string searchValue);
        PrivateTalkContainerModel PrivateTalksReceivedNew(string sender, string searchValue);
        PrivateTalk[] MyPrivateTalks(string sender, string searchValue); // PrivateTalks owned
        PrivateTalk[] PrivateTalksReceived(string receiver, string searchValue); // PrivateTalks I Have Joined in

        bool isMyPrivateTalkGuard(long privateTalkId, string thisMember);
        bool isPrivateTalkJoinedGuard(long privateTalkId, string thisMember);
        MessageCountModel[] GetMyPrivateTalkMessagesCount(string sender, string searchValue);
        MessageCountModel[] GetReceivedPrivateTalkMessagesCount(string receiver, string searchValue);

        int GetUnreadMyPrivateTalksCount(string thisMember);

        int GetUnreadReceivedPrivateTalksCount(string thisMember);

        PrivateTalkInsideOut GetNewUnreadPrivateTalk(int privateTalkId, string thisMember);

        ReturnModel NewPrivateTalkLastSeen(PrivateTalkLastSeen privateTalkLastSeen);

        PrivateTalk GetPrivateTalk(long PrivateTalkId);


        ReturnModel NewPrivateTalk(PrivateTalk PrivateTalk); // Return -1 if error has occured, otherwise PrivateTalkId, Returns created PrivateTalk from database(It includes PrivateTalkId, autoset by identity)
        ReturnModel UpdatePrivateTalk(PrivateTalk PrivateTalk);
        PrivateTalk DeletePrivateTalk(long PrivateTalkId); //Return null if error has occurred, otherwise PrivateTalk(deleted)


    }
}

using System;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace XYZToDo.Models.Repository
{
    public class PrivateTalkRepository : IPrivateTalkRepository
    {
        XYZToDoSQLDbContext context;
        // XYZToDoSQLDbContext context2;
        public PrivateTalkRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
            //this.context2 = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext();
        }

        public IQueryable<PrivateTalk> PrivateTalks => context.PrivateTalk;
        public IQueryable<PrivateTalkLastSeen> PrivateTalkLastSeen => context.PrivateTalkLastSeen;
        public IQueryable<PrivateTalkReceiver> PrivateTalkReceivers => context.PrivateTalkReceiver;
        public IQueryable<PrivateTalkTeamReceiver> PrivateTalkTeamReceivers => context.PrivateTalkTeamReceiver;
        public IQueryable<PrivateTalkMessage> PrivateTalkMessages => context.PrivateTalkMessage;

        public PrivateTalk[] MyPrivateTalks(string sender, string searchValue) // Returns null or objects,  giden kutusu
        {
            PrivateTalk[] pTalks = PrivateTalks.Where(bt => bt.Sender == sender)
            .OrderByDescending(pt => pt.DateTimeCreated).Where(bt => string.IsNullOrEmpty(searchValue) ||
            (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue))).ToArray();
            return pTalks;
        }

        public PrivateTalkContainerModel MyPrivateTalksNew(string sender, string searchValue) // Returns null or objects,  giden kutusu
        {
            PrivateTalkContainerModel container = new PrivateTalkContainerModel();


            ///1
            IQueryable<PrivateTalk> pTalks = PrivateTalks.Where(bt => bt.Sender == sender)
                        .OrderByDescending(pt => pt.DateTimeCreated).Where(bt => string.IsNullOrEmpty(searchValue) ||
                        (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue)));


            container.pTalks = pTalks.ToArray();

            /// 2

            long[] privateTalks = pTalks.Select(pt => pt.PrivateTalkId).ToArray();

            if (privateTalks != null)
            {
                IList<MessageCountModel> messagesCount = new List<MessageCountModel>();
                foreach (long privateTalkId in privateTalks)
                {

                    DateTimeOffset lastSeen = (this.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == sender).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
                    int messageCount = this.PrivateTalkMessages.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != sender && ptm.DateTimeSent > lastSeen).
                    Select(qt => qt.MessageId).Count(); //messages belongs to others.


                    // DateTimeOffset orderingCriterion = PTOrderingCriterion(privateTalkId, sender, context2);

                    messagesCount.Add(new MessageCountModel { PrivateTalkId = privateTalkId, MessagesCount = messageCount, OrderingCriterion = DateTimeOffset.MinValue });
                }

                container.messageCounts = messagesCount.ToArray();
                container.totalUnReadCount = container.messageCounts.Where(mc => mc.MessagesCount > 0).ToArray().Length;
            }
            else
            {
                container.messageCounts = null;
                container.totalUnReadCount = 0;
            }

            ///3

            PrivateTalkReceiver[] ptrs = pTalks.SelectMany(pt => pt.PrivateTalkReceiver).ToArray();
            container.ptrs = ptrs;

            ///4


            PrivateTalkTeamReceiver[] pttrs = pTalks.SelectMany(pt => pt.PrivateTalkTeamReceiver).ToArray();
            container.pttrs = pttrs;





            //final
            return container;
        }

        public PrivateTalkContainerModel PrivateTalksReceivedNew(string receiver, string searchValue)
        {
            PrivateTalkContainerModel container = new PrivateTalkContainerModel();

            //1
            PrivateTalk[] ptrs = PrivateTalkReceivers.Where(ptr => ptr.Receiver == receiver).
             Select(ptr => ptr.PrivateTalk).ToArray();

            PrivateTalk[] ptrs2 = context.TeamMember.Where(tm => tm.Username == receiver && tm.Status == true).
            SelectMany(tm => tm.Team.PrivateTalkTeamReceiver).
            Select(rec => rec.PrivateTalk).Where(pt => pt.Sender != receiver).ToArray(); //İçinde bulunduğum takımların, takım alıcıları. 2 takımında bulunuyorum, private talk id 2, 3 takımında bulunuyoorum private talk 5, buradan private talkları getirelim.

            PrivateTalk[] result = ptrs.Concat(ptrs2)?.GroupBy(pt => pt.PrivateTalkId).Select(x => x.First())
                .OrderByDescending(pt => pt.DateTimeCreated)

                .Where(bt => string.IsNullOrEmpty(searchValue) || bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue))
               .ToArray();


            container.pTalks = result;

            //2

            long[] privateTalks = result?.Select(pt => pt.PrivateTalkId)?.ToArray();
            if (privateTalks != null)
            {
                IList<MessageCountModel> messagesCount = new List<MessageCountModel>();
                foreach (long privateTalkId in privateTalks)
                {

                    DateTimeOffset lastSeen = (this.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == receiver).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
                    int messageCount = this.PrivateTalkMessages.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != receiver && ptm.DateTimeSent > lastSeen).
                    Select(qt => qt.MessageId).Count(); //messages belongs to others.


                    messagesCount.Add(new MessageCountModel { PrivateTalkId = privateTalkId, MessagesCount = messageCount, OrderingCriterion = DateTimeOffset.MinValue });
                }
                container.messageCounts = messagesCount.ToArray();

                container.totalUnReadCount = container.messageCounts.Where(mc => mc.MessagesCount > 0).ToArray().Length;
            }
            else
            {

                container.messageCounts = null;
                container.totalUnReadCount = 0;
            }




            //final
            return container;
        }


        public bool isMyPrivateTalkGuard(long privateTalkId, string thisMember)
        {
            PrivateTalk privateTalk = PrivateTalks.Where(p => p.PrivateTalkId == privateTalkId).FirstOrDefault();
            if (privateTalk == null)
                return false;
            if (privateTalk.Sender == thisMember)
                return true;
            else
                return false;
        }




        public PrivateTalk[] PrivateTalksReceived(string receiver, string searchValue) // gelen kutusu
        {
            PrivateTalk[] ptrs = PrivateTalkReceivers.Where(ptr => ptr.Receiver == receiver).
            Select(ptr => ptr.PrivateTalk).ToArray();
            PrivateTalk[] ptrs2 = context.TeamMember.
            Where(tm => tm.Username == receiver && tm.Status == true).
            SelectMany(tm => tm.Team.PrivateTalkTeamReceiver).
            Select(rec => rec.PrivateTalk).Where(pt => pt.Sender != receiver).ToArray(); //İçinde bulunduğum takımların, takım alıcıları. 2 takımında bulunuyorum, private talk id 2, 3 takımında bulunuyoorum private talk 5, buradan private talkları getirelim.

            PrivateTalk[] result = ptrs.Concat(ptrs2)?.GroupBy(pt => pt.PrivateTalkId).Select(x => x.First())
                .OrderByDescending(pt => pt.DateTimeCreated)

                .Where(bt => string.IsNullOrEmpty(searchValue) || bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue))
               .ToArray();
            return result;
        }


        public bool isPrivateTalkJoinedGuard(long privateTalkId, string thisMember)
        {
            PrivateTalk pTalk = PrivateTalkReceivers.Where(ptr => ptr.Receiver == thisMember).Select(ptr => ptr.PrivateTalk).Where(pt => pt.PrivateTalkId == privateTalkId).FirstOrDefault();
            if (pTalk != null)
                return true;

            PrivateTalk pTalk2 = context.TeamMember.Where(tm => tm.Username == thisMember && tm.Status == true).
            SelectMany(tm => tm.Team.PrivateTalkTeamReceiver).Select(rec => rec.PrivateTalk).Where(pt => pt.Sender != thisMember).Where(pt => pt.PrivateTalkId == privateTalkId).FirstOrDefault();

            if (pTalk2 != null)
                return true;

            return false;
        }
        public MessageCountModel[] GetMyPrivateTalkMessagesCount(string sender, string searchValue)
        {
            long[] privateTalks = PrivateTalks.Where(bt => bt.Sender == sender)
                 .OrderByDescending(pt => pt.DateTimeCreated).
                Where(bt => string.IsNullOrEmpty(searchValue) || (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue)))

                .Select(pt => pt.PrivateTalkId).ToArray();


            if (privateTalks != null)
            {
                IList<MessageCountModel> messagesCount = new List<MessageCountModel>();
                foreach (long privateTalkId in privateTalks)
                {

                    DateTimeOffset lastSeen = (this.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == sender).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
                    int messageCount = this.PrivateTalkMessages.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != sender && ptm.DateTimeSent > lastSeen).
                    Select(qt => qt.MessageId).Count(); //messages belongs to others.


                    // DateTimeOffset orderingCriterion = PTOrderingCriterion(privateTalkId, sender, context2);

                    messagesCount.Add(new MessageCountModel { PrivateTalkId = privateTalkId, MessagesCount = messageCount, OrderingCriterion = DateTimeOffset.MinValue });
                }
                return messagesCount.ToArray();
            }
            else
            {
                return null;
            }

        }

        public MessageCountModel[] GetReceivedPrivateTalkMessagesCount(string receiver, string searchValue)
        {

            PrivateTalk[] ptrs = PrivateTalkReceivers.Where(ptr => ptr.Receiver == receiver).Select(ptr => ptr.PrivateTalk).ToArray();

            PrivateTalk[] ptrs2 = context.TeamMember.Where(tm => tm.Username == receiver && tm.Status == true).SelectMany(tm => tm.Team.PrivateTalkTeamReceiver).Select(rec => rec.PrivateTalk).Where(pt => pt.Sender != receiver).ToArray(); //İçinde bulunduğum takımların, takım alıcıları. 2 takımında bulunuyorum, private talk id 2, 3 takımında bulunuyoorum private talk 5, buradan private talkları getirelim.

            long[] privateTalks = privateTalks = ptrs.Concat(ptrs2)?.GroupBy(pt => pt.PrivateTalkId)?.Select(x => x.First())?
               .OrderByDescending(pt => pt.DateTimeCreated)?
               .Where(bt => string.IsNullOrEmpty(searchValue) || (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue)))?
               .Select(pt => pt.PrivateTalkId)?.ToArray();

            if (privateTalks != null)
            {
                IList<MessageCountModel> messagesCount = new List<MessageCountModel>();
                foreach (long privateTalkId in privateTalks)
                {

                    DateTimeOffset lastSeen = (this.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == receiver).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
                    int messageCount = this.PrivateTalkMessages.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != receiver && ptm.DateTimeSent > lastSeen).
                    Select(qt => qt.MessageId).Count(); //messages belongs to others.


                    messagesCount.Add(new MessageCountModel { PrivateTalkId = privateTalkId, MessagesCount = messageCount, OrderingCriterion = DateTimeOffset.MinValue });
                }
                return messagesCount.ToArray();

            }
            else
            {
                return null;
            }

        }

        public ReturnModel NewPrivateTalkLastSeen(PrivateTalkLastSeen privateTalkLastSeen)
        {
            try
            {
                PrivateTalkLastSeen PTLastSeen = PrivateTalkLastSeen.Where(ptls => ptls.PrivateTalkId == privateTalkLastSeen.PrivateTalkId && ptls.Visitor == privateTalkLastSeen.Visitor).FirstOrDefault();
                if (PTLastSeen != null)
                {
                    PTLastSeen.LastSeen = privateTalkLastSeen.LastSeen;
                    context.Entry(PTLastSeen).State = EntityState.Modified;
                    context.SaveChanges();

                }
                else
                {   //Runs only once.
                    context.PrivateTalkLastSeen.Add(privateTalkLastSeen);
                    context.SaveChanges();
                }

            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }


        public PrivateTalk GetPrivateTalk(long privateTalkId) // Returns null or object,
        {
            return context.PrivateTalk.Where(bt => bt.PrivateTalkId == privateTalkId).FirstOrDefault();
        }


        public ReturnModel NewPrivateTalk(PrivateTalk privateTalk) // Return -1 for any errors otherwise PrivateTalkId
        {
            try
            {

                context.PrivateTalk.Add(privateTalk);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = privateTalk.PrivateTalkId }; // Provides PrivateTalkId(identity autoset from db) 
        }
        public ReturnModel UpdatePrivateTalk(PrivateTalk privateTalk)
        {
            if (privateTalk.PrivateTalkId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(privateTalk).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }

        public PrivateTalk DeletePrivateTalk(long privateTalkId) // Return null for any errors otherwise PrivateTalk(deleted)
        {
            PrivateTalk privateTalk = context.PrivateTalk.Where(bt => bt.PrivateTalkId == privateTalkId).FirstOrDefault();
            if (privateTalk != null)
            {
                context.Remove(privateTalk);
                context.SaveChanges();
            }
            return privateTalk;

        }

        int NoOfMessagesUnreadHelper(long privateTalkId, string thisMember, XYZToDoSQLDbContext context)
        {
            DateTimeOffset lastSeen = (context.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == thisMember).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
            int messageCount = context.PrivateTalkMessage.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != thisMember && ptm.DateTimeSent > lastSeen).
            Select(qt => qt.MessageId).Count(); //messages belongs to others.
            if (messageCount > 0)
                return 1;
            else
                return 0;
        }
        public int GetUnreadMyPrivateTalksCount(string thisMember)
        {
            var context2 = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext();
            int unreadPTCount = PrivateTalks.Where(bt => bt.Sender == thisMember).Where(pt => this.NoOfMessagesUnreadHelper(pt.PrivateTalkId, thisMember, context2) == 1).Count();// my private talks that have unread messages inside.
            context2.Dispose();
            return unreadPTCount;
        }

        public int GetUnreadReceivedPrivateTalksCount(string thisMember)
        {
            var context2 = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext();

            PrivateTalk[] ptrs = PrivateTalkReceivers.Where(ptr => ptr.Receiver == thisMember).Select(ptr => ptr.PrivateTalk).ToArray();

            PrivateTalk[] ptrs2 = context.TeamMember.Where(tm => tm.Username == thisMember && tm.Status == true).SelectMany(tm => tm.Team.PrivateTalkTeamReceiver).Select(rec => rec.PrivateTalk).Where(pt => pt.Sender != thisMember).ToArray(); //İçinde bulunduğum takımların, takım alıcıları. 2 takımında bulunuyorum, private talk id 2, 3 takımında bulunuyoorum private talk 5, buradan private talkları getirelim.

            int unreadPTCount = ptrs.Concat(ptrs2)?.GroupBy(pt => pt.PrivateTalkId).Select(x => x.First()).Where(pt => this.NoOfMessagesUnreadHelper(pt.PrivateTalkId, thisMember, context2) == 1)?.Count() ?? 0;

            context2.Dispose();
            return unreadPTCount;
        }

        // !! IMPORTANT NOTE: PrivateTalk, PrivateTalkReceiver, PrivateTalkTeamReceiver models should have [JsonIgnore] for that method to work properly.
        public PrivateTalkInsideOut GetNewUnreadPrivateTalk(int privateTalkId, string thisMember)
        {
            //[Type(MyOrReceived), PrivateTalk, MessageCountModel, Receivers, TeamReceivers]

            DateTimeOffset lastSeen = (context.PrivateTalkLastSeen.Where(pt => pt.PrivateTalkId == privateTalkId && pt.Visitor == thisMember).FirstOrDefault()?.LastSeen) ?? new DateTimeOffset(DateTime.MinValue, TimeSpan.Zero);
            int messageCount = context.PrivateTalkMessage.Where(ptm => ptm.PrivateTalkId == privateTalkId && ptm.Sender != thisMember && ptm.DateTimeSent > lastSeen).Count(); //messages belongs to others.

            if (messageCount > 0)
            {
                PrivateTalk pTalk = this.PrivateTalks.Where(pt => pt.PrivateTalkId == privateTalkId).FirstOrDefault();
                pTalk = new PrivateTalk { PrivateTalkId = pTalk.PrivateTalkId, Owner = pTalk.Owner, Sender = pTalk.Sender, Thread = pTalk.Thread, DateTimeCreated = pTalk.DateTimeCreated };

                bool my = pTalk.Sender == thisMember;
                MessageCountModel mcm = new MessageCountModel { PrivateTalkId = privateTalkId, MessagesCount = messageCount, OrderingCriterion = DateTimeOffset.MinValue };

                PrivateTalkReceiver[] ptr = PrivateTalkReceivers.Where(pt => pt.PrivateTalkId == privateTalkId)?.ToArray();
                PrivateTalkTeamReceiver[] pttr = PrivateTalkTeamReceivers.Where(pt => pt.PrivateTalkId == privateTalkId)?.ToArray();

                return new PrivateTalkInsideOut { My = my, PrivateTalk = pTalk, MessageCountModel = mcm, Receivers = ptr, TeamReceivers = pttr };
            }
            return null;


        }


    }
}

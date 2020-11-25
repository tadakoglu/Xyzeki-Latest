using System;
using System.Collections.Generic;
using System.Linq;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class PrivateTalkReceiverRepository : IPrivateTalkReceiverRepository
    {
        //Note: For unique, GroupBy(ptr => ptr.PrivateTalkId).Select(group => group.First())
        XYZToDoSQLDbContext context;
        public PrivateTalkReceiverRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<PrivateTalkReceiver> PrivateTalkReceivers => context.PrivateTalkReceiver;
        public IQueryable<PrivateTalk> PrivateTalks => context.PrivateTalk;
    

        public PrivateTalkReceiver[] GetMyPrivateTalkReceivers(string sender,string searchValue) // Returns null or objects,  giden kutusu
        {


            PrivateTalkReceiver[] ptr = PrivateTalks.Where(bt => bt.Sender == sender)
                  .OrderByDescending(pt => pt.DateTimeCreated).
                 Where(bt => string.IsNullOrEmpty(searchValue) || (bt.Thread.Contains(searchValue) || bt.Sender.Contains(searchValue)))
                 
                 .SelectMany(pt => pt.PrivateTalkReceiver).ToArray();


            return ptr;
        }


        public PrivateTalkReceiver[] GetPrivateTalkReceivers(long privateTalkId)  // Returns null or objects
        {
            return PrivateTalkReceivers.Where(pt => pt.PrivateTalkId == privateTalkId)?.ToArray();
        }
        public PrivateTalkReceiver GetPrivateTalkReceiver(long privateTalkReceiverId)
        {
            return PrivateTalkReceivers.Where(ptr => ptr.PrivateTalkReceiverId == privateTalkReceiverId).FirstOrDefault();
        }

        public ReturnModel AddPrivateTalkReceiver(PrivateTalkReceiver privateTalkReceiver) // Return -1 for any errors otherwise 0
        {
            try
            {
                context.PrivateTalkReceiver.Add(privateTalkReceiver);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = privateTalkReceiver.PrivateTalkReceiverId };  // Return TaskId(autoset from identity)
        }

        public ReturnModel AddPrivateTalkReceivers(PrivateTalkReceiver[] privateTalkReceivers) // Return -1 for any errors otherwise 0
        {
            try
            {
                context.PrivateTalkReceiver.AddRange(privateTalkReceivers);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }

        public PrivateTalkReceiver DeletePrivateTalkReceiver(long privateTalkReceiverId) // Return -1  for any errors otherwise 0
        {
            PrivateTalkReceiver ptReceiver = context.PrivateTalkReceiver.Where(ptm => ptm.PrivateTalkReceiverId == privateTalkReceiverId).FirstOrDefault();
            if (ptReceiver != null)
            {
                context.PrivateTalkReceiver.Remove(ptReceiver);
                context.SaveChanges();
            }
            return ptReceiver;

        }
        public PrivateTalkReceiver[] DeletePrivateTalkReceivers(long privateTalkId)
        {
            PrivateTalkReceiver[] ptReceivers = context.PrivateTalkReceiver.Where(ptm => ptm.PrivateTalkId == privateTalkId).ToArray();
            if (ptReceivers != null)
            {
                context.PrivateTalkReceiver.RemoveRange(ptReceivers);
                context.SaveChanges();
            }
            return ptReceivers;

        }

        public override bool Equals(object obj)
        {
            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public override string ToString()
        {
            return base.ToString();
        }

        public PrivateTalkTeamReceiver[] GetReceivedPrivateTalkReceivers(string receiver, int pageNo)
        {
            throw new NotImplementedException();
        }
    }
}

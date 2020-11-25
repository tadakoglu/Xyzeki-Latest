using System;

namespace XYZToDo.Models.ViewModels
{
    public class PrivateTalkContainerModel
    {
        public PrivateTalk[] pTalks { get; set; }
        public MessageCountModel[] messageCounts { get; set; }
        public PrivateTalkReceiver[] ptrs { get; set; }
        public PrivateTalkTeamReceiver[] pttrs { get; set; }
        public int totalUnReadCount { get; set; }
    }
}

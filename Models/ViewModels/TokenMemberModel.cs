using System;

namespace XYZToDo.Models.ViewModels
{
    public class TokenMemberModel
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }

        public DateTimeOffset? RefreshTokenExpiryTime { get; set; }


        public Member Member { get; set; }

    }

}

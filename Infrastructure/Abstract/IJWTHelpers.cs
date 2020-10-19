using System;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens; //Includes TokenValidationParameters

namespace XYZToDo.Infrastructure.Abstract
{
    public interface IJWTHelpers
    {
        string GenerateJWT(string username);   //This is for Web API
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);

        TokenValidationParameters TokenValidationParameters { get; }  //This is for ASP.NET Core JWT Middleware in Startup.cs

        TokenValidationParameters TokenValidationParametersForExpiredToken { get; }

    }
}

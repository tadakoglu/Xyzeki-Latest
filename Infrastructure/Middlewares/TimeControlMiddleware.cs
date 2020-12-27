using System;
using System.IO;
using XYZToDo.Infrastructure.Abstract;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace XYZToDo.Infrastructure
{
  public class TimeControlMiddleware
  {
    private readonly RequestDelegate _next; // A function that can process and HTTP request

    public TimeControlMiddleware(RequestDelegate next)
    {
      _next = next;
    }

    public async Task Invoke(HttpContext httpContext) // Injected from ASP.NET Core
    {
      var request = httpContext.Request;

      if (request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase)
      && !request.Path.StartsWithSegments("/api/hubs", StringComparison.OrdinalIgnoreCase)) // only valid in normal requests
      {

        // string browserTimeISO = request.Query["Xyzeki_Browser_Time"]; // parameter
        string browserTimeISO = request.Headers["Xyzeki_Browser_Time"]; // parameter

        DateTimeOffset browserTime = DateTimeOffset.Parse(browserTimeISO);
        DateTimeOffset serverTime = DateTimeOffset.Now;

        TimeSpan diff = (browserTime - serverTime).Duration(); // Duration converts to absolute
        if (diff.TotalMinutes > 3) //If difference is more than 3 minutes, throw error.
        {
          httpContext.Response.StatusCode = 406; // 406 Not Acceptable
          await httpContext.Response.WriteAsync("Server and browser time difference is too much");
          return;
        }
      }


      await _next(httpContext);

      // if (context.Response.StatusCode == 404)
      //     {
      //         context.Request.Path = "/Home";
      //         await next();
      //     }
    }
  }
}
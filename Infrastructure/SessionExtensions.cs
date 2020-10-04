using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

public static class SessionExtensions // this is to add(object name)
{

    public static void SetJson(this ISession session, string key, object value)
    {
        session.SetString(key, JsonConvert.SerializeObject(value));
    }

    public static T GetJson<T>(this ISession session, string key)
    {
        var sessionData = session.GetString(key);
        return sessionData == null
            ? default(T) : JsonConvert.DeserializeObject<T>(sessionData);
    }

}


//   public IActionResult Index()
//         {
//             HttpContext.Session.SetString(“Key”, “This is a test message.”);
//             return View();
//         }
// public IActionResult About()
//         {
//             string message = null;
//             if (HttpContext.Session != null)
//             {
//                 message = HttpContext.Session.GetString(“Key”);
//                 if(string.IsNullOrEmpty(message))
//                     message =“Session timed out.”;
//             }
//             ViewData[“Message”] = message;
//             return View();
//         }
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using XYZToDo.Models;
using Newtonsoft.Json;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Mail;
using System.Text;
using System.Net.Http;

namespace XYZToDo.Controllers
{
    #region My-Notes-On-Model-Binding
    // Use [FromBody] to model bind from requests with JSON body({ 'Username': 'test' }) with header "Content-Type: application/json") 
    // Use [FromQuery] to model bind from query variables as in "api/members/login?username=ddfd&password=dfdfd"
    // Use [FromRoute] to model bind from request URL as in "/members/get/2", and use attributes like HttpGet("{TeamId"}) or post...Using nothing before API arguments will bind from routes automatically too.
    // Use [FromHeader] to model bind from request header variables like "Authenciation" : "Bearer XXX";
    // Use "nothing" to model bind from requests with "x-www-form-urlencoded" encoded body and requests with query parameters.        
    // Without any of this attributes(using "nothing"), you can ONLY  model bind from "x-www-form-urlencoded" encoded body(with header "Content-Type: application/x-www-form-urlencoded") and from query parameters.
    // You can't accept requests "x-www-form-urlencoded" encoded body WITH [FromBody] in ASP.NET Core.
    // You can't accept requests with JSON body(with header "Content-Type: application/json") WITHOUT [FromBody]
    // HTTP Status Codes : https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html
    // Status Code: 415; Unsupported Media Type is a ASP.NET Core Web API error that means there was a problem in arguments or in model binding.
    // You might want to use JsonResult type to return JSON.
    // Get requests don't have a "body" to send to the server, only post have.
    // Written by T.Adakoğlu
    #endregion

    #region My-Notes-On-Async-Await
    // Async does one thing and only one thing not related to only speed.
    // If a task is being awaited, and that task does not involve CPU-bound work, and as a result, the thread becomes idle, then, that thread potentially could be released to return to the pool to do other work.
    // That's it. Async in a nutshell. 
    // Use Async, await when needed, it means "scalability on server-side" and a "responsive UI on client-side"
    /* Example: Task<int> longRunningTask = LongRunningOperationAsync();
       independent work which doesn't need the result of LongRunningOperationAsync can be done here
       and now we call await on the task int result = await longRunningTask; */
    // In addition, do not call .Result in API Controllers. It will lock your UI. Instead, use await. Ref: https://montemagno.com/c-sharp-developers-stop-calling-dot-result/
    #endregion
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private static readonly HttpClient client = new HttpClient();
        IAuthRepository AuthRepository;
        IJWTHelpers JWTHelpers;
        ICryptoHelpers cryptoHelpers;

        public AuthController(IAuthRepository AuthRepository, IJWTHelpers JWTHelpers, ICryptoHelpers cryptoHelpers)
        {
            this.AuthRepository = AuthRepository;
            this.JWTHelpers = JWTHelpers;
            this.cryptoHelpers = cryptoHelpers;
        }

        [HttpPost("Authenticate")]
        public IActionResult Authenticate([FromBody] LoginModel loginModel, [FromQuery] string recaptchaToken) //Accepts JSON body, not x-www-form-urlencoded!
        {

            // float score = await this.GetReCaptchaUserResponseScoreAsync(recaptchaToken);
            // if (score < 0.5)
            //     return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.

            // try
            // {
            //     //loginModel.Password = this.cryptoHelpers.DecryptWithAES(loginModel.Password);

            // }
            // catch (System.Exception)
            // {
            //     return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);
            // }

            TokenMemberModel tokenMemberModel = AuthRepository.Login(loginModel);

            if (tokenMemberModel != null)
            {
                //no need this values in client side
                tokenMemberModel.Member.CryptoPassword = null;
                tokenMemberModel.Member.CryptoSalt = null;

                return Ok(tokenMemberModel);//200 OK, Send JWT with member profile to our member.           
            }
            return Unauthorized(); //401 Unauthorized      
        }

        [HttpPost]
        [Route("Refresh")]
        public IActionResult Refresh(TokenMemberModel tokenMemberModel)
        {
            if (tokenMemberModel is null)
            {
                return BadRequest("Invalid client request");
            }
            ReturnModel r = this.AuthRepository.Refresh(tokenMemberModel);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                TokenMemberModel tmm = r.Model as TokenMemberModel;
                return Ok(tmm);
            }
            else
            {
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);
            }

        }


        [HttpPost, Authorize]
        [Route("Revoke")]
        public IActionResult Revoke()
        {
            ReturnModel r = this.AuthRepository.LogOut(User.Identity.Name);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return Ok();
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return NotFound();
            }
            else
            {
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);
            }


        }


        [HttpGet("GetUnixTimestamp")]
        public IActionResult GetUnixTimestamp() // api/Auth/GetUnixTimestamp
        {
            long unixTimestamp = DateTimeOffset.Now.ToUnixTimeSeconds();
            return Ok(unixTimestamp);
            // DateTimeOffset dto = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp); //reserve if needed
        }

        [HttpGet("GetNow")]
        public IActionResult GetNow() // api/Auth/GetNow
        {
            return Ok(DateTimeOffset.Now.ToString("O"));
        }
        private const string GoogleReCaptcha_SecretKey = "6Ldd0cgUAAAAANh3Q2V230iRB-fkx51C2ETfc72u";
        private async Task<float> GetReCaptchaUserResponseScoreAsync(string recaptchaToken)
        {
            var values = new Dictionary<string, string>
            {
            { "secret", GoogleReCaptcha_SecretKey }, //Google ReCaptcha Secret Key
            { "response", recaptchaToken } // Google ReCaptcha User Token
            };

            var content = new FormUrlEncodedContent(values);

            var response = await client.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);

            var responseString = await response.Content.ReadAsStringAsync();

            try
            {
                ReCaptchaUserResponse userResponse = JsonConvert.DeserializeObject<ReCaptchaUserResponse>(responseString);
                if (userResponse.success)
                    return userResponse.score;
                else
                    return 0;

            }
            catch (System.Exception)
            {
                return 0;
            }

        }


        [HttpPost("SetSessionString")]
        public IActionResult SetSessionString(string key, [FromBody] string value)
        {
            HttpContext.Session.SetString(key, value);
            return Ok();
        }
        [HttpPost("SetSessionObject")]
        public IActionResult SetSessionObject(string key, [FromBody] object value)
        {
            HttpContext.Session.SetJson(key, value);
            return Ok();
        }
        [HttpGet("GetSessionString")]
        public IActionResult GetSessionString(string key)
        {

            if (HttpContext.Session != null)
            {
                string value = HttpContext.Session.GetString(key);
                if (string.IsNullOrEmpty(value))
                {
                    return NotFound(); // session exists but key is not found.
                }
                else
                {
                    return Ok(value); // Success
                }
            }
            else
            {
                return BadRequest(); // session does not exist anymore.
            }

        }
        [HttpGet("GetSessionObject")]
        public IActionResult GetSessionObject(string key)
        {

            if (HttpContext.Session != null)
            {
                object value = HttpContext.Session.GetJson<object>(key);
                if (value == null)
                {
                    return NotFound(); // session exists but key is not found.
                }
                else
                {
                    return Ok(value); // Success
                }
            }
            else
            {
                return BadRequest(); // session does not exist anymore.
            }

        }


        [HttpDelete("DeleteSessionObject")]
        public IActionResult DeleteSessionObject(string key)
        {

            if (HttpContext.Session != null)
            {
                try
                {
                    HttpContext.Session.Remove(key);

                }
                catch { };
                return Ok();
            }
            else
            {
                return BadRequest(); // session does not exist anymore.
            }

        }


        [HttpPost("Register")]
        public IActionResult Register([FromBody] RegisterModel registerModel, [FromQuery] string recaptchaToken)//Accepts JSON body, not x-www-form-urlencoded!
        {
            // float score = this.GetReCaptchaUserResponseScoreAsync(recaptchaToken).Result;
            // if (score < 0.5)
            //     return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.
            try
            {
                //registerModel.Password = this.cryptoHelpers.DecryptWithAES(registerModel.Password);
            }
            catch (System.Exception)
            {
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.
            }
            //registerModel.Avatar = "byte64 string for related image test from Register API method of Members Controller";

            ReturnModel returnModel = AuthRepository.Register(registerModel); // Never use ".Result" on Task<>, it will block your UI. Instead use await.

            if (returnModel.ErrorCode == ErrorCodes.MemberAlreadyExistsError) //User exists
            {
                //return new StatusCodeResult(StatusCodes.Status422UnprocessableEntity); // 422 Unprocessable Entity; 409 Conflict is a little dangerous because it can expose emails in the system.
                //Google, Facebook, Amazon return OK here with some information.
                return Ok("#-1:ME"); // 200 OK but with error code #-1:ME = Member Already Exists.
            }
            else if (returnModel.ErrorCode == ErrorCodes.OK)
            {
                return Ok(returnModel.ReturnedId); // 200 OK
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.

        }


        [HttpGet("ForgotPassword/{email}")]
        public async Task<IActionResult> ForgotPassword(string email, [FromQuery] string recaptchaToken) // ok(200) or 503, 404
        {
            //string recaptchaToken = "test";
            // float score = await this.GetReCaptchaUserResponseScoreAsync(recaptchaToken);
            // if (score < 0.5)
            //      return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.

            ReturnModel returnModel = await this.AuthRepository.RequestForgotPasswordEmail(email);

            if (returnModel.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return NotFound(); // no such user
            }
            else if (returnModel.ErrorCode == ErrorCodes.OK)
            {
                return Ok(); // mail sent...
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.
        }

        [HttpGet("IsSecurityCodeFoundAndValid/{securityCodeStr}")]
        public IActionResult IsSecurityCodeFoundAndValid(string securityCodeStr) // ok(200) or 503, 404
        {
            Guid securityCode;

            if (!Guid.TryParse(securityCodeStr, out securityCode))
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);

            bool isValid = this.AuthRepository.IsSecurityCodeFoundAndValid(securityCode);

            if (isValid)
            {
                return Ok(); //valid.
            }
            else
            {
                return NotFound();
            }

        }

        [HttpPost("SetUpNewPassword")]
        public IActionResult SetUpNewPassword([FromBody] SecurityCodeModel securityCodeModel, [FromQuery] string recaptchaToken)
        {
            //string recaptchaToken = "test";
            // float score = this.GetReCaptchaUserResponseScoreAsync(recaptchaToken).Result;
            // if (score < 0.5)
            //    return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable DB Error.

            try
            {
                //securityCodeModel.NewPassword = this.cryptoHelpers.DecryptWithAES(securityCodeModel.NewPassword);
            }
            catch (System.Exception)
            {
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);
            }


            Guid securityCode;

            if (!Guid.TryParse(securityCodeModel.SecurityCode, out securityCode))
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);

            string newPassword = securityCodeModel.NewPassword;

            ReturnModel returnModel = this.AuthRepository.SetUpNewPassword(securityCode, newPassword);

            if (returnModel.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return NotFound();
            }
            else if (returnModel.ErrorCode == ErrorCodes.OK)
            {
                return Ok();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);
        }
    }
}

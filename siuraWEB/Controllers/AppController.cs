using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using siuraWEB.Models;
using Newtonsoft.Json;

namespace siuraWEB.Controllers
{
    // ----------------------- [ CONTROLADOR PARA LA APP ] -----------------------
    public class AppController : ApiController
    {
        // -------------- [ VARIABLES GLOBALES ] -------------
        readonly MApp MiApp = new MApp();
        // --------------- [ CLASES PUBLICAS ] ---------------
        // LOGIN APP
        public class Login
        {
            public string TokenSeguridad { get; set; }
            public string Usuario { get; set; }
            public string Password { get; set; }
            public string CentroClave { get; set; }
        }

        // ********************* /////////////////// *********************
        // ------------------ [ FUNCIONES PRINCIPALS ] ------------------

        // FUNCION DE INICIO DE SESION [ APP LOGIN ]
        public IHttpActionResult IniciarSesion(Login LoginData)
        {
            try
            {
                if (MISC.VerifSecAPI(LoginData.TokenSeguridad))
                {
                    MApp.LoginApp loginData = new MApp.LoginApp()
                    {
                        Usuario = LoginData.Usuario,
                        Password = LoginData.Password,
                        CentroClave = LoginData.CentroClave,
                    };
                    string loginAccion = MiApp.IniciarSesionApp(loginData);
                    return Ok(loginAccion);
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception e)
            {
                return Content(HttpStatusCode.BadRequest, " - Ocurrió un problema al consumir el recurso. Detalle: - " + e.ToString());
            }
        }
    }
}

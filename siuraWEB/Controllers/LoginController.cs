using siuraWEB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using siuraWEB.Models;

namespace siuraWEB.Controllers
{
    public class LoginController : Controller
    {
        // -------------------------------------------------------------
        // VARIABLES GLOBALES
        // VARIABLE GLOBAL PARA USO DEL MODEL LLAMADO MLogin
        internal MLogin MiLogin = new MLogin();

        // CLASE DE LOGIN
        public class LoginResultado
        {
            public bool Respuesta { get; set; }
        }
        // -------------------------------------------------------------

        // ACTION RESULT PRINCIPAL
        public ActionResult Index()
        {
            return View();
        }

        // FUNCION QUE INICIA LA SESIÓN
        public string IniciarSesion(MLogin.LoginInfo LoginData)
        {
            string respuesta = MiLogin.LoginFuncion(LoginData);
            if (JsonConvert.DeserializeObject<MLogin.LoginRespuesta>(respuesta).Respuesta)
            {
                Session["IdSession"] = MISC.CrearIdSession();
                Session["IdUsuario"] = LoginData.Usuario;
                Session["Token"] = JsonConvert.DeserializeObject<MLogin.LoginRespuesta>(respuesta).Token;
                Session["TokenCentro"] = JsonConvert.DeserializeObject<MLogin.LoginRespuesta>(respuesta).TokenCentro;
            }
            return respuesta;
        }

        // ACCION QUE CIERRA LA SESIÓN
        public string CerrarSesion()
        {
            try
            {
                Session["IdSession"] = null;
                return "true";
            }
            catch (Exception err)
            {
                return err.ToString();
            }
        }
    }
}
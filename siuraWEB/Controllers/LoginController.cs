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
            MLogin.LoginRespuesta RespuestaJSON = JsonConvert.DeserializeObject<MLogin.LoginRespuesta>(respuesta);
            if (RespuestaJSON.Respuesta)
            {
                Session["IdSession"] = MISC.CrearIdSession();
                Session["IdUsuario"] = LoginData.Usuario;
                Session["Token"] = RespuestaJSON.Token;
                Session["TokenCentro"] = RespuestaJSON.TokenCentro;
                Session["ClaveCentro"] = LoginData.ClaveCentro;
                Session["Id"] = RespuestaJSON.IdUsuario;
                Session["Administrador"] = RespuestaJSON.Administrador;
                Session["AlAnon"] = RespuestaJSON.AlAnon;
                Session["CoordDeportiva"] = RespuestaJSON.CoordDeportiva;
                Session["CoordMedica"] = RespuestaJSON.CoordMedica;
                Session["CoordPsicologica"] = RespuestaJSON.CoordPsicologica;
                Session["CoordEspiritual"] = RespuestaJSON.CoordEspiritual;
                Session["Cord12Pasos"] = RespuestaJSON.Cord12Pasos;
                Session["Documentacion"] = RespuestaJSON.Documentacion;

                Session["NotifCentroID"] = RespuestaJSON.NotifCentroID;
                Session["NotifUsuarioID"] = RespuestaJSON.NotifUsuarioID;
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
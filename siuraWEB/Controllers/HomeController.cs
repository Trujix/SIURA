using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;

namespace siuraWEB.Controllers
{
    public class HomeController : Controller
    {
        // VARIABLE QUE LLAMA EL MODEL DE HOME
        internal MHome MiHome = new MHome();
        // VISTA DE INICIO DE SESIÓN
        public ActionResult Index()
        {
            if (VerificarLogin())
            {
                return RedirectToAction("Principal");
            }
            else
            {
                return View();
            }
        }

        // VISTA DE LA PAGINA PRINCIPAL
        public ActionResult Principal()
        {
            if (VerificarLogin())
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        // VISTA DE LA BARRA DE MENU
        public ActionResult BarraMenu()
        {
            return View();
        }

        // VISTA QUE DEVUELVE LA VISTA DE "NO PERMISO"
        public ActionResult SinPermiso()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LOS PARAMETROS DEL USUARIO
        public string UsuarioParametros()
        {
            return MiHome.ParametrosUsuario((string)Session["Token"]);
        }

        // FUNCION QUE DEVUELVE LOS PARAMETROS DE NOTIFICACION DEL CENTRO Y DEL USUARIO
        public string NotifsIDS()
        {
            Dictionary<string, object> NotifsData = new Dictionary<string, object>()
            {
                { "NotifCentroID", Session["NotifCentroID"] },
                { "NotifUsuarioID", Session["NotifUsuarioID"] },
            };
            return JsonConvert.SerializeObject(NotifsData);
        }

        // FUNCION QUE VERIFICA SI EL USUARIO HA INICIADO SESIÓN
        internal bool VerificarLogin()
        {
            if (Session["IdSession"] != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        // VISTA DE PRUEBA QUE MUESTRA UN FORMULARIO
        public ActionResult Formulario()
        {
            if (VerificarLogin())
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index");
            }
        }
    }
}
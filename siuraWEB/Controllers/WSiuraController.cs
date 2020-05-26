using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;

namespace siuraWEB.Controllers
{
    public class WSiuraController : Controller
    {
        // CLASES Y VARIABLES PUBLICAS
        // VARIABLE DE USO GENERAL PARA INVOCAR EL MODAL DEL WIZARD - SIURA
        MWSiura MiWSiura = new MWSiura();

        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult Index()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA GLOBAL Y ESTRUCTURAL DEL WIZARD SIURA
        public ActionResult WizardPagina()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA LISTA DE LOS TEST ASOCIADOS A UNA CLAVE DE TEST  EN WIZARD SIURA
        public string ListaWizardTests(string ClaveTest)
        {
            return MiWSiura.ListaWizardTests(ClaveTest, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE VERIFICA EL ESTATUS DEL TOKEN PARA ACCEDER AL WIZARD SIURA
        public string VerificarTokenAcceso(string TokenAcceso)
        {
            MWSiura.WizardAcceso WizardInfo = MiWSiura.VerificarTokenAcceso(TokenAcceso, (string)Session["Token"], (string)Session["TokenCentro"]);
            WizardInfo.CoordMedica = (bool)Session["CoordMedica"];
            WizardInfo.CoordPsicologica = (bool)Session["CoordPsicologica"];
            WizardInfo.Coord12Pasos = (bool)Session["Cord12Pasos"];
            return JsonConvert.SerializeObject(WizardInfo);
        }

        // FUNCION QUE GENERA EL TOKEN DE ACCESO AL WIZARD SIURA
        public string CrearWizardAcceso()
        {
            MWSiura.WizardAcceso WizardInfo = MiWSiura.CrearWizardAcceso((string)Session["TokenCentro"]);
            WizardInfo.Url = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/WSiura/Index?";
            return JsonConvert.SerializeObject(WizardInfo);
        }
    }
}
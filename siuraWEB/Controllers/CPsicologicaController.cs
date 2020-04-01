using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace siuraWEB.Controllers
{
    public class CPsicologicaController : Controller
    {
        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult MenuPsicologo()
        {
            if ((bool)Session["CoordPsicologica"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }
    }
}
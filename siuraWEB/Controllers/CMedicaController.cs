using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace siuraWEB.Controllers
{
    public class CMedicaController : Controller
    {
        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult MenuMedico()
        {
            if ((bool)Session["CoordMedica"])
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
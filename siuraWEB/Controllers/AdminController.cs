using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace siuraWEB.Controllers
{
    public class AdminController : ApiController
    {
        // -------- CLASES PUBLICAS --------
        // CLASE DE PRUEBA
        public class Data
        {
            public string Nombre { get; set; }
        }

        // -------------- [ FUNCIONES GENERALES ] --------------
        // FUNCION DE PRUEBA
        [HttpPost]
        public IHttpActionResult Prueba(Data data)
        {
            try
            {
                return Ok(data.Nombre);
            }
            catch
            {
                return Content(HttpStatusCode.BadRequest, " - Ocurrió un problema al consumir entrada de servicio.");
            }
        }
    }
}

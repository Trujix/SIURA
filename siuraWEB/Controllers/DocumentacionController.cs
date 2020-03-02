using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;

namespace siuraWEB.Controllers
{
    public class DocumentacionController : Controller
    {
        // ----------- CLASES Y VARIABLES PUBLICAS -----------
        MDocumentacion MiDocumentacion = new MDocumentacion();
        // FUNCION QUE DEVUELVE LA VISTA DE [ INGRESO - PRINCIPAL ]
        public ActionResult Ingreso()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DE ADMINISTRACION [ MENU PRINCIPAL ]
        public ActionResult Administracion()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL FORMULARIO DE [ NUEVO PACIENTE ]
        public ActionResult NuevoPaciente()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DE PAGOS DEL PACIENTE [ ADMINISTRACION ]
        public ActionResult PacientesPagos()
        {
            return View();
        }

        // ------------ FUNCIONES ------------

        // ::::::::::::::::::::::::::: [ PACIENTES ] :::::::::::::::::::::::::::
        // FUNCION QUE GUARDA UN PACIENTE [ REGISTRO PREVIO ]
        public string GuardarPaciente(MDocumentacion.PacienteData PacienteInfo, MDocumentacion.PacienteFinazasData PacienteFinanzas)
        {
            return MiDocumentacion.GuardarPacienteRegistro(PacienteInfo, PacienteFinanzas, (string)Session["Token"]);
        }


        // ::::::::::::::::::::::::::: [ ADMINISTRACION ] :::::::::::::::::::::::::::

        // FUNCION QUE TRAE LA LISTA DE PACIENTES  CON PAGOS PENDITES
        public string ListaPacientesPagosPend()
        {
            return MiDocumentacion.ListaPacientesPagosPendientes((string)Session["Token"]);
        }
    }
}
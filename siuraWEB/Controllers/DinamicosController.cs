using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;

namespace siuraWEB.Controllers
{
    public class DinamicosController : Controller
    {
        // ----------- CLASES Y VARIABLES GLOBALES -------------
        MDinamicos MiDinamico = new MDinamicos();

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE CONSULTAS DE PACIENTES [ DINAMICOS ]
        public ActionResult Pacientes()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA CONSULTA DE UN PACIENTE [ DINAMICOS ]
        public string ConsultaPaciente(string PacienteConsulta, int Estatus)
        {
            return MiDinamico.ConsultaDinamicaPacientes(PacienteConsulta, Estatus, (string)Session["Token"]);
        }
    }
}
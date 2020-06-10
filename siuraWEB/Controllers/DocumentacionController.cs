using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;

namespace siuraWEB.Controllers
{
    public class DocumentacionController : Controller
    {
        // ----------- CLASES Y VARIABLES PUBLICAS -----------
        MDocumentacion MiDocumentacion = new MDocumentacion();
        // FUNCION QUE DEVUELVE LA VISTA DE [ INGRESO - PRINCIPAL ]
        public ActionResult Ingreso()
        {
            if ((bool)Session["Documentacion"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }

        // FUNCION QUE DEVUELVE LA VISTA DE ADMINISTRACION [ MENU PRINCIPAL ]
        public ActionResult Administracion()
        {
            if ((bool)Session["Documentacion"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }

        // FUNCION QUE DEVUELVE LA VISTA DE INVENTARIO [ INVENTARIO ]
        public ActionResult Inventario()
        {
            if ((bool)Session["Documentacion"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }

        // FUNCION QUE DEVUELVE LA VISTA DE HORARIOS [ HORARIOS ]
        public ActionResult Horario()
        {
            if ((bool)Session["Documentacion"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL FORMULARIO DE [ NUEVO PACIENTE ]
        public ActionResult NuevoPaciente()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DE PACIENTES PRE REGISTROS [ PRE REGISTROS ]
        public ActionResult PreRegistros()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DE PAGOS DEL PACIENTE [ ADMINISTRACION ]
        public ActionResult PacientesPagos()
        {
            return View();
        }

        // ------------ FUNCIONES ------------
        // -----------------------------------------------------
        // FUNCION QUE ACTUALIZA EL  ESTATUS DE UN PACIENTE (POSIBLEMENTE MULTIUSOS)
        public string ActEstatusPaciente(int IDPaciente, int Estatus)
        {
            return MiDocumentacion.ActEstatusPaciente(IDPaciente, Estatus, (string)Session["TokenCentro"]);
        }
        // -----------------------------------------------------

        // ::::::::::::::::::::::::::: [ PRE REGISTROS ] :::::::::::::::::::::::::::
        public string ListaPreRegistros()
        {
            return MiDocumentacion.ListaPreRegistros((string)Session["TokenCentro"]);
        }

        // ::::::::::::::::::::::::::: [ PRE-REGISTROS ] :::::::::::::::::::::::::::
        // FUNCION QUE GUARDA UN PACIENTE [ REGISTRO PREVIO ]
        public string GuardarPaciente(MDocumentacion.PacienteData PacienteInfo, MDocumentacion.PacienteIngreso PacienteIngreso, MDocumentacion.PacienteFinazasData PacienteFinanzas, MDocumentacion.PacienteCargosAdicionales[] PacienteCargos)
        {
            string Contrato = MiDocumentacion.GuardarPacienteRegistro(PacienteInfo, PacienteIngreso, PacienteFinanzas, PacienteCargos, (string)Session["Token"], (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Contrato.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Contrato.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }

        // FUNCION QUE REIMPRIME UN CONTRATO DE UN PACIENTE - PREREGISTRO [ REGISTRO PREVIO ]
        public string ReimprimirContrato(int IDPaciente)
        {
            string Contrato = MiDocumentacion.ReimprimirContrato(IDPaciente, (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Contrato.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Contrato.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }

        // ::::::::::::::::::::::::::: [ INGRESO PACIENTES ] :::::::::::::::::::::::::::
        // FUNCION QUE ACTUALIZA LOS PARAMETROS DE PARAMETROS DE INGRESO DEL PACIENTE AL CENTRO
        public string ActIngresoPaciente(MDocumentacion.PacienteIngreso PacienteIngreso)
        {
            return MiDocumentacion.ActIngresoPaciente(PacienteIngreso, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // ::::::::::::::::::::::::::: [ ADMINISTRACION ] :::::::::::::::::::::::::::
        // FUNCION QUE TRAE LA LISTA DE PACIENTES  CON PAGOS PENDITES
        public string ListaPacientesPagosPend(string Consulta)
        {
            return MiDocumentacion.ListaPacientesPagosPendientes(Consulta, (string)Session["TokenCentro"]);
        }

        // ::::::::::::::::::::::::::: [ HORARIOS ] :::::::::::::::::::::::::::
        // FUNCION QUE DEVUELVE LA LISTA DE HORARIOS [ HORARIOS ]
        public string ObtenerListaHorarios()
        {
            return MiDocumentacion.ObtenerListaHorarios((string)Session["TokenCentro"]);
        }

        // FUNCION QUE GUARDA LOS DATOS DEL HORARIO [ HORARIOS ]
        public string GuardarHorario(MDocumentacion.Horarios HorarioInfo, MDocumentacion.HorariosConfig[] HorarioConfig)
        {
            return MiDocumentacion.GuardarHorario(HorarioInfo, HorarioConfig, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTIVA (Y DESACTIVA) HORARIOS [ HORARIOS ]
        public string ActivarHorario(int IDHorario)
        {
            return MiDocumentacion.ActivarHorario(IDHorario, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE BORRA UN HORARIO [ HORARIOS ]
        public string BorrarHorario(int IDHorario)
        {
            return MiDocumentacion.BorrarHorario(IDHorario, (string)Session["TokenCentro"]);
        }

        // ------------------ [ FUNCIONES COMPLEMENTARIOS ] ------------------
        // FUNCION QUE DEVUELVE LOS PARAMETROS DEL CENTRO PARA COMPLEMENTAR UN DOCUMENTO
        public string DocCentroInfo()
        {
            try
            {
                Dictionary<string, object> CentroInfo = MiDocumentacion.DocCentroInfo((string)Session["TokenCentro"]);
                List<object> Respuesta = new List<object>() {
                    CentroInfo
                };
                if (JsonConvert.SerializeObject(CentroInfo).IndexOf("«~LOGOPERS~»") >= 0)
                {
                    Respuesta.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
                }
                else
                {
                    Respuesta.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
                }
                return JsonConvert.SerializeObject(Respuesta);
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }
    }
}
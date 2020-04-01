using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;

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

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE CONSULTAS DEPACIENTES [ DINAMICOS ]
        public ActionResult Pagos()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA CONSULTA DE UN PACIENTE [ DINAMICOS ]
        public string ConsultaPaciente(string PacienteConsulta, int Estatus)
        {
            return MiDinamico.ConsultaDinamicaPacientes(PacienteConsulta, Estatus, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA LISTA DE LOS PAGOS DEL PACIENTE
        public string ListaPagosPaciente(int IdFinanzas)
        {
            try
            {
                string[] PagoPacienteInfo = MiDinamico.ListaPagosPaciente(IdFinanzas, (string)Session["TokenCentro"]).Split('⌂');
                string BecaComprobante = "SINIMG";
                if (System.IO.File.Exists(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/" + PagoPacienteInfo[1] + "_becadoc.jpg")))
                {
                    BecaComprobante = PagoPacienteInfo[1] + "_becadoc.jpg";
                }
                else
                {
                    if (System.IO.File.Exists(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/" + PagoPacienteInfo[1] + "_becadoc.jpeg")))
                    {
                        BecaComprobante = PagoPacienteInfo[1] + "_becadoc.jpeg";
                    }
                    else
                    {
                        if (System.IO.File.Exists(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/" + PagoPacienteInfo[1] + "_becadoc.png")))
                        {
                            BecaComprobante = PagoPacienteInfo[1] + "_becadoc.png";
                        }
                        else
                        {
                            if (System.IO.File.Exists(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/" + PagoPacienteInfo[1] + "_becadoc.pdf")))
                            {
                                BecaComprobante = PagoPacienteInfo[1] + "_becadoc.pdf";
                            }
                        }
                    }
                }
                string PacientePagoReturn = PagoPacienteInfo[0].Replace("«~BECAçCOMPROBANTE~»", BecaComprobante).Replace("«~URLçUSUARIO~»", System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/");
                return PacientePagoReturn;
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE GENERA UN PAGO DE UN PACIENTE
        public string GenerarPagoPaciente(MDinamicos.PacientePagos PacientePago)
        {
            string Respuesta = MiDinamico.GenerarPagoPaciente(PacientePago, (string)Session["Token"], (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Respuesta.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Respuesta.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }

        // FUNCION QUE REIMPRIME UN RECIBO DE PAGO
        public string ReimprimirRecibo(int IDPago)
        {
            string Recibo = MiDinamico.ReimprimirRecibo(IDPago, (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Recibo.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Recibo.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }

        // FUNCION QUE GENERA UN NUEVO CARGO ADICIONAL
        public string NuevoCargoAdicional(MDinamicos.CargoAdicional CargoAdicional)
        {
            return MiDinamico.NuevoCargoAdicional(CargoAdicional, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE GENERA UN PAGO DE UN CARGO ADICIONAL
        public string GenerarPagoCargo(MDinamicos.PagoCargoAdicional CargoPago)
        {
            string Respuesta = MiDinamico.GenerarPagoCargo(CargoPago, (string)Session["Token"], (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Respuesta.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Respuesta.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }

        // FUNCION QUE REIMPRIME UN RECIBO DE PAGO DE  UN CARGO ADICIONAL
        public string ReimprimirPagoCargo(int IDCargo)
        {
            string Respuesta = MiDinamico.ReimprimirPagoCargo(IDCargo, (string)Session["Token"], (string)Session["TokenCentro"]);
            List<object> RespuestaLista = new List<object>();
            if (Respuesta.IndexOf("«~LOGOPERS~»") >= 0)
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")));
            }
            else
            {
                RespuestaLista.Add(System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json")));
            }
            RespuestaLista.Add(Respuesta.Replace("«~LOGOPERS~»", "").Replace("«~LOGOALANON~»", ""));
            return JsonConvert.SerializeObject(RespuestaLista);
        }
    }
}
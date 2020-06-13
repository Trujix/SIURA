using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using OfficeOpenXml.Drawing;
using System.Drawing;

namespace siuraWEB.Controllers
{
    public class DinamicosController : Controller
    {
        // ----------- CLASES Y VARIABLES GLOBALES -------------
        MDinamicos MiDinamico = new MDinamicos();
        // CLASE USADA PARA ALTA DE ARCHIVO EN NUEVO INGRESO
        public class ArchivoInfo
        {
            public string Nombre { get; set; }
            public string Extension { get; set; }
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE CONSULTAS DE PACIENTES [ DINAMICOS ]
        public ActionResult Pacientes()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE CONSULTA DE PAGOS [ DINAMICOS ]
        public ActionResult Pagos()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE FORMULARIOS DE INVENTARIO [ DINAMICOS ]
        public ActionResult Inventario()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA VISTA DEL MODAL DE FORMULARIOS DE NUEVO INGRESOS [ DINAMICOS ]
        public ActionResult NuevoIngreso()
        {
            return View();
        }

        // ------------------------- [ FUNCIONES ] -------------------------
        // FUNCION QUE DEVUELVE LA CONSULTA DE UN PACIENTE
        public string ConsultaPaciente(string PacienteConsulta, int Estatus)
        {
            return MiDinamico.ConsultaDinamicaPacientes(PacienteConsulta, Estatus, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA CONSULTA DE UN PACIENTE POR NIVEL
        public string ConsultaPacienteNivel(string PacienteConsulta, int Estatus)
        {
            return MiDinamico.ConsultaDinamicaPacientesNiveles(Estatus, (string)Session["TokenCentro"]);
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

        // FUNCION QUE REIMPRIME UN RECIBO DE PAGO DE UN CARGO ADICIONAL
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

        // FUNCION QUE DEVUELVE LA LISTA DE CATALOGO DE INVENTARIO
        public string ConsultaInventario(string TipoInventario)
        {
            return MiDinamico.ConsultaInventario(TipoInventario, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DA DE ALTA UN ELEMENTO EN EL INVENTARIO
        public string GuardarInventarioArticulo(MDinamicos.InventarioArticulo InventarioData)
        {
            return MiDinamico.GuardarInventarioArticulo(InventarioData, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LOS DATOS DE UN ARTICULO DEL INVENTARIO
        public string ConsultarArticuloInventario(int IdInventarioArticulo)
        {
            return MiDinamico.ConsultarArticuloInventario(IdInventarioArticulo, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA LAS EXISTENCIAS DE UN ELEMENTO DEL INVENTARIO
        public string ActInventarioExistencias(MDinamicos.InventarioArticulo InventarioData)
        {
            return MiDinamico.ActInventarioExistencias(InventarioData, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // ** FUNCION QUE DEVUELVE LA INFO PARA IMPRIMIR UN REPORTE **
        public string InventarioImpresion(MDinamicos.InventarioImpresionData InventarioImpresionData)
        {
            MDinamicos.InventarioImpresionInfo ImpresionInfo = MiDinamico.InventarioImpresion(InventarioImpresionData, (string)Session["Token"], (string)Session["TokenCentro"]);
            if (InventarioImpresionData.Formato == "pdf")
            {
                string Logo = (ImpresionInfo.Logo == "LOGOPERS") ? System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json")) : System.IO.File.ReadAllText(Server.MapPath("~/Media/logoalanon.json"));
                ImpresionInfo.Logo = Logo;
                return JsonConvert.SerializeObject(ImpresionInfo);
            }
            else if(InventarioImpresionData.Formato == "excel")
            {
                return InventarioImpresionExcel(ImpresionInfo, InventarioImpresionData.Gestion);
            }
            else
            {
                Dictionary<string, object> Err = new Dictionary<string, object>() {
                    { "Correcto", false },
                    { "Error", "errFormato" }
                };
                return JsonConvert.SerializeObject(Err);
            }
        }

        // FUNCION QUE DEVUELVE LA LISTA DE PACIENTES DE NUEVO INGRESO
        public string ListaPacientesNuevoIngreso()
        {
            return MiDinamico.ListaPacientesNuevoIngreso((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA INFO DE UN PACIENTE DE NUEVO INGRESO
        public string ObtenerPacienteNuevoIngresoInfo(int IDPaciente)
        {
            return MiDinamico.ObtenerPacienteNuevoIngresoInfo(IDPaciente, (string)Session["TokenCentro"], System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/");
        }

        // FUNCION QUE GUARDA LA INFO DEL PACIENTE  DE NUEVO INGRESO
        public string GuardarPacienteNuevoIngreso(MDinamicos.PacienteNuevoIngreso PacienteNuevoIngreso)
        {
            return MiDinamico.GuardarPacienteNuevoIngreso(PacienteNuevoIngreso, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE REESTABLECE  O ELIMINA EL REGISTRO DEL PACIENTE NUEVO INGRESO
        public string BorrarPacienteNuevoIngreso(int IDIngreso)
        {
            return MiDinamico.BorrarPacienteNuevoIngreso(IDIngreso, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE VERIFICA LAS COORDINACIONES (MEDICA Y PSICOLOGICA) PARA LA CONSEJERIA EN PACIENTE NUEVO INGRESO
        public string VerificarNuevoIngresoCoords(int IDPaciente)
        {
            return MiDinamico.VerificarNuevoIngresoCoords(IDPaciente, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA LA INFORMACION DEL PACIENTE Y APRUEBA AL NUEVO INGRESO
        public string AprobarNuevoIngreso(int IDPaciente, string Coordinacion)
        {
            return MiDinamico.AprobarNuevoIngreso(IDPaciente, Coordinacion, (string)Session["TokenCentro"]);
        }

        // ------------------------ [ FUNCION MULTIUSOS GENERICA ] ------------------------
        // FUNCION INDEPENDIENTE QUE GUARDA UN ARCHIVO
        public string GuardarArchivoDinamicos(string Info)
        {
            try
            {
                ArchivoInfo archivoInfo = JsonConvert.DeserializeObject<ArchivoInfo>(Info);
                string rutaCentro = "/Docs/" + (string)Session["TokenCentro"] + "/";
                Directory.CreateDirectory(Server.MapPath("~" + rutaCentro));
                HttpPostedFileBase archivo = Request.Files["Archivo"];
                int archivoTam = archivo.ContentLength;
                string archivoNom = archivo.FileName;
                string archivoTipo = archivo.ContentType;
                Stream archivoContenido = archivo.InputStream;
                archivo.SaveAs(Server.MapPath("~" + rutaCentro) + archivoInfo.Nombre + "." + archivoInfo.Extension);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // --------------------------------------------------------------------------------------------
        // :::::::::::::::::::::::: [ GENERACION DE DOCUMENTOS FORMATO EXCEL ] ::::::::::::::::::::::::
        public string InventarioImpresionExcel(MDinamicos.InventarioImpresionInfo InventarioImpresionInfo, string Gestion)
        {
            try
            {
                ExcelPackage ExcelInventario = new ExcelPackage();
                List<MDinamicos.InventarioImpresionAux> InventarioData = InventarioImpresionInfo.InventarioData;
                string celda = "A1:G1", NombreDocumento = MISC.InventarioNombreGestion(Gestion)[0] + "_Doc_" + InventarioImpresionInfo.Usuario + ".xlsx";
                string[] tablaCeldas = MISC.CeldasReporteInventario(Gestion);
                foreach (MDinamicos.InventarioImpresionAux Inventario in InventarioData)
                {
                    ExcelInventario.Workbook.Worksheets.Add(Inventario.Area);
                    ExcelWorksheet Hoja = ExcelInventario.Workbook.Worksheets[Inventario.Area];

                    Hoja.Cells[celda].Merge = true;
                    Hoja.Cells[celda].Value = InventarioImpresionInfo.NombreCentro;
                    Hoja.Cells[celda].Style.Font.Size = 16;
                    Hoja.Cells[celda].Style.Font.Bold = true;
                    Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    celda = "A2:G2";
                    Hoja.Cells[celda].Merge = true;
                    Hoja.Cells[celda].Value = InventarioImpresionInfo.Direccion + " " + InventarioImpresionInfo.Colonia + " C.P. " + InventarioImpresionInfo.CodigoPostal + " Tel: (" + InventarioImpresionInfo.Telefono + ")";
                    Hoja.Cells[celda].Style.Font.Size = 14;
                    Hoja.Cells[celda].Style.Font.Bold = true;
                    Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    celda = "A3:G3";
                    Hoja.Cells[celda].Merge = true;
                    Hoja.Cells[celda].Value = InventarioImpresionInfo.Estado + ", " + InventarioImpresionInfo.Municipio;
                    Hoja.Cells[celda].Style.Font.Size = 14;
                    Hoja.Cells[celda].Style.Font.Bold = true;
                    Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    celda = "A4:G4";
                    Hoja.Cells[celda].Merge = true;
                    Hoja.Cells[celda].Value = MISC.InventarioNombreGestion(Gestion)[1];
                    Hoja.Cells[celda].Style.Font.Size = 14;
                    Hoja.Cells[celda].Style.Font.Bold = true;
                    Hoja.Cells[celda].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    Hoja.Cells[celda].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#AED6F1"));
                    Hoja.Cells[celda].Style.Font.Color.SetColor(Color.Black);
                    Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    foreach (string tablaCelda in tablaCeldas)
                    {
                        celda = tablaCelda.Split('ø')[1] + "5";
                        Hoja.Cells[celda].Value = tablaCelda.Split('ø')[0];
                        Hoja.Cells[celda].Style.Font.Size = 12;
                        Hoja.Cells[celda].Style.Font.Bold = true;
                        Hoja.Cells[celda].Style.Fill.PatternType = ExcelFillStyle.Solid;
                        Hoja.Cells[celda].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#D5D8DC"));
                        Hoja.Cells[celda].Style.Font.Color.SetColor(Color.Black);
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    }

                    Hoja.View.FreezePanes(6, 1);

                    int numCelda = 6, CantElemsG = 0;
                    foreach(MDinamicos.InventarioArticulo Data in Inventario.InventarioData)
                    {
                        celda = "A" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2" || Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Codigo;
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "B" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2" || Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Nombre;
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "C" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2" || Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Presentacion;
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "D" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2")
                        {
                            Hoja.Cells[celda].Value = "$ " + Data.PrecioCompra.ToString("N2");
                        }
                        else if(Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Area;
                            Hoja.Cells[celda].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            Hoja.Cells[celda].Style.Font.Color.SetColor(Color.Black);
                            if(Data.Area == "Salida")
                            {
                                Hoja.Cells[celda].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#F5B7B1"));
                            }
                            else
                            {
                                Hoja.Cells[celda].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#ABEBC6"));
                            }
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "E" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2")
                        {
                            Hoja.Cells[celda].Value = "$ " + Data.PrecioVenta.ToString("N2");
                        }
                        else if (Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Existencias.ToString("N4");
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "F" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2")
                        {
                            Hoja.Cells[celda].Value = "$ " + Data.Existencias.ToString("N4");
                            if(Data.Existencias < Data.Stock)
                            {
                                Hoja.Cells[celda].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                Hoja.Cells[celda].Style.Font.Color.SetColor(Color.Black);
                                Hoja.Cells[celda].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#F5B7B1"));
                            }
                        }
                        else if (Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.Usuario;
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        celda = "G" + numCelda.ToString();
                        if (Gestion == "G1" || Gestion == "G2")
                        {
                            Hoja.Cells[celda].Value = "$ " + Data.Stock.ToString("N4");
                        }
                        else if (Gestion == "E1" || Gestion == "E2" || Gestion == "E3")
                        {
                            Hoja.Cells[celda].Value = Data.FechaTxt;
                        }
                        Hoja.Cells[celda].Style.Font.Size = 11;
                        Hoja.Cells[celda].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        Hoja.Cells[celda].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        Hoja.Cells[celda].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        numCelda++;
                        CantElemsG++;
                    }
                    Hoja.Cells[Hoja.Dimension.Address].AutoFitColumns();
                }

                Directory.CreateDirectory(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/"));
                ExcelInventario.SaveAs(new FileInfo(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/") + NombreDocumento));
                Dictionary<string, object> Respuesta = new Dictionary<string, object>() {
                    { "Correcto", true },
                    { "UrlDoc", System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/" + NombreDocumento },
                };
                return JsonConvert.SerializeObject(Respuesta);
            }
            catch (Exception e)
            {
                Dictionary<string, object> Err = new Dictionary<string, object>() {
                    { "Correcto", false },
                    { "Error", e.ToString() }
                };
                return JsonConvert.SerializeObject(Err);
            }
        }
    }
}
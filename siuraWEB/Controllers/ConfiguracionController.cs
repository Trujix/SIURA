using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using siuraWEB.Models;
using System.Net.Mail;
using System.Net;

namespace siuraWEB.Controllers
{
    public class ConfiguracionController : Controller
    {
        // --------- VARIABLE GENERAL QUE LLAMA AL MODEL CONFIGURACION ---------
        MConfiguracion MiConfiguracion = new MConfiguracion();
        // -------- CLASES PUBLICAS --------
        public class ArchivoInfo
        {
            public string Nombre { get; set; }
            public string NombreArchivo { get; set; }
            public string Extension { get; set; }
        }

        // -------------- FUNCIONES PRINCIPALES --------------
        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult MenuConfiguracion()
        {
            return View();
        }

        // :::::::::::::: MENU MICENTRO ::::::::::::::
        // ENTRADA PRINCIPAL DE VISTA [ MICENTRO ]
        public ActionResult MiCentro()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA INFO DEL CENTRO DE REHABILITACION
        public string MiCentroInfo()
        {
            return MiConfiguracion.MiCentroInfo((string)Session["TokenCentro"]);
        }

        // FUNCION QUE GUARDA LOS VALORES DE [ MI CENTRO ]
        public string GuardarMiCentro(MConfiguracion.MiCentro CentroData)
        {
            return MiConfiguracion.GuardarMiCentro(CentroData, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE GUARDA UN LOGO PERSONALIZADO [ MI CENTRO ]
        public string GuardarLogo(string LogoB64)
        {
            try
            {
                string ActLogo = MiConfiguracion.ActLogoCentro(true, (string)Session["TokenCentro"]);
                if (ActLogo == "true")
                {
                    string rutaCentro = "/Docs/" + (string)Session["TokenCentro"] + "/";
                    Directory.CreateDirectory(Server.MapPath("~" + rutaCentro));
                    Dictionary<string, object> LogoJson = new Dictionary<string, object>() {
                        { "LogoCentro", LogoB64 }
                    };
                    System.IO.File.WriteAllText(Server.MapPath("~" + rutaCentro + "logocentro.json"), JsonConvert.SerializeObject(LogoJson));

                    return "true";
                }
                else
                {
                    return ActLogo;
                }
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE DEVUELVE EL LOGO PERSONALIZADO [ MI CENTRO ]
        public string AbrirLogoPers()
        {
            try
            {
                return System.IO.File.ReadAllText(Server.MapPath("~/Docs/" + (string)Session["TokenCentro"] + "/logocentro.json"));
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE BORRA UN LOGOTIPO PERSONALIZADO [ MI CENTRO ]
        public string BorrarLogo()
        {
            try
            {
                string ActLogo = MiConfiguracion.ActLogoCentro(false, (string)Session["TokenCentro"]);
                if (ActLogo == "true")
                {
                    string rutaCentro = "/Docs/" + (string)Session["TokenCentro"] + "/";
                    if (System.IO.File.Exists(Server.MapPath("~" + rutaCentro + "logocentro.json")))
                    {
                        System.IO.File.Delete(Server.MapPath("~" + rutaCentro + "logocentro.json"));
                    }
                    return "true";
                }
                else
                {
                    return ActLogo;
                }
            }
            catch(Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE ACTUALIZA EL ESTATUS DEL LOGO ALANON [ MI CENTRO ]
        public string ActLogoALAnon(bool Estatus)
        {
            return MiConfiguracion.ActLogoALAnon(Estatus, (string)Session["TokenCentro"]);
        }

        // :::::::::::::: MENU DOCUMENTOS ::::::::::::::
        // ENTRADA PRINCIPAL DE VISTA [ DOCUMENTOS ]
        public ActionResult Documentos()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA LISTA DE DOCUMENTOS
        public string ListaDocs()
        {
            MConfiguracion.DocsLista docs = MiConfiguracion.ConfigListaDocs((string)Session["TokenCentro"]);
            docs.UrlFolderCliente = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
            return JsonConvert.SerializeObject(docs);
        }

        // FUNCION QUE ALMACENA UN DOCUMENTO
        public string AltaDocInformativo(string Info)
        {
            try
            {
                ArchivoInfo archivoInfo = JsonConvert.DeserializeObject<ArchivoInfo>(Info);
                MConfiguracion.DocInformativo DocData = new MConfiguracion.DocInformativo()
                {
                    TokenCentro = (string)Session["TokenCentro"],
                    Nombre = archivoInfo.Nombre,
                    Archivo = archivoInfo.NombreArchivo,
                    Extension = archivoInfo.Extension,
                    TokenUsuario = (string)Session["Token"]
                };
                string Alta = MiConfiguracion.AltaDocInformativo(DocData);
                if(Alta == "true")
                {
                    return GuardarArchivo(archivoInfo.NombreArchivo, archivoInfo.Extension, Request.Files["Archivo"]);
                }
                else
                {
                    return Alta;
                }
            }
            catch(Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE ENVIA CORREO ELECTRONICO CON LOS [ DOCUMENTOS INFORMATIVOS ]
        public string EnviarCorreoDocsInf(string Correo)
        {
            try
            {
                string UrlUsuarioDocs = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
                string correoHTML = "<!DOCTYPE html><html><body><p>Documentos Informativos</p>ê~DOCUMENTOS~ê</body></html>";
                List<Dictionary<string, object>> docs = MiConfiguracion.ConfigListaDocs((string)Session["TokenCentro"]).DocsInformativos;
                string linksDocs = "";
                foreach (Dictionary<string, object> doc in docs)
                {
                    string archivo = "", nombre = "", extension = "";
                    foreach(KeyValuePair<string, object> docK in doc)
                    {
                        if(docK.Key == "Nombre")
                        {
                            nombre = (string)docK.Value;
                        }
                        else if(docK.Key == "Extension")
                        {
                            extension = (string)docK.Value;
                        }
                        else if (docK.Key == "Archivo")
                        {
                            archivo = (string)docK.Value;
                        }
                    }
                    linksDocs += "<a href='" + UrlUsuarioDocs + archivo + "." + extension + "' target='_blank'>" + nombre + "</a><br><a href='" + UrlUsuarioDocs + archivo + "." + extension + "' target='_blank'>" + UrlUsuarioDocs + archivo + "." + extension + "</a><br><br>";
                }
                correoHTML = correoHTML.Replace("ê~DOCUMENTOS~ê", linksDocs);

                var smtpUsuario = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential("siura.adm.gestionmail@gmail.com", "siura2020"),
                    EnableSsl = true
                };
                MailMessage msg = new MailMessage();
                MailAddress mailKiosko = new MailAddress("siura.adm.gestionmail@gmail.com");
                MailAddress mailCategorie = new MailAddress(Correo);
                msg.From = mailKiosko;
                msg.To.Add(mailCategorie);
                msg.Subject = "Documentacion Informativa";
                msg.Body = correoHTML;
                msg.IsBodyHtml = true;
                smtpUsuario.Send(msg);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION INDEPENDIENTE QUE GUARDA UN ARCHIVO
        public string GuardarArchivo(string Nombre, string Extension, HttpPostedFileBase Archivo)
        {
            try
            {
                string rutaCentro = "/Docs/" + (string)Session["TokenCentro"] + "/";
                Directory.CreateDirectory(Server.MapPath("~" + rutaCentro));
                HttpPostedFileBase archivo = Archivo;
                int archivoTam = archivo.ContentLength;
                string archivoNom = archivo.FileName;
                string archivoTipo = archivo.ContentType;
                Stream archivoContenido = archivo.InputStream;
                archivo.SaveAs(Server.MapPath("~" + rutaCentro) + Nombre + "." + Extension);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }
    }
}
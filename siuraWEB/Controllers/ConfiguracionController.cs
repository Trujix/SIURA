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

        // :::::::::::::: MENU DOCUMENTOS ::::::::::::::
        // ENTRADA PRINCIPAL DE VISTA [ DOCUMENTOS ]
        public ActionResult Documentos()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA LISTA DE DOCUMENTOS
        public string ListaDocs()
        {
            MConfiguracion.DocsLista docs = MiConfiguracion.ConfigListaDocs((string)Session["Token"]);
            docs.UrlFolderCliente = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/";
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
                    TokenUsuario = (string)Session["Token"],
                    Nombre = archivoInfo.Nombre,
                    Archivo = archivoInfo.NombreArchivo,
                    Extension = archivoInfo.Extension,
                    AdmUsuario = (string)Session["IdUsuario"]
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
                string UrlUsuarioDocs = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/";
                string correoHTML = "<!DOCTYPE html><html><body><p>Documentos Informativos</p>ê~DOCUMENTOS~ê</body></html>";
                List<Dictionary<string, object>> docs = MiConfiguracion.ConfigListaDocs((string)Session["Token"]).DocsInformativos;
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
                string rutaGrafico = "/Docs/";
                HttpPostedFileBase archivo = Archivo;
                int archivoTam = archivo.ContentLength;
                string archivoNom = archivo.FileName;
                string archivoTipo = archivo.ContentType;
                Stream archivoContenido = archivo.InputStream;
                archivo.SaveAs(Server.MapPath("~" + rutaGrafico) + Nombre + "." + Extension);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }
    }
}
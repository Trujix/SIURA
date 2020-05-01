using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using siuraWEB.Models;
using Newtonsoft.Json;

namespace siuraWEB.Controllers
{
    public class CDeportivaController : Controller
    {
        // --------- VARIABLE GENERAL QUE LLAMA AL MODEL COORD. DEPORTIVA ---------
        MCDeportiva MiCDeportiva = new MCDeportiva();
        // -------- CLASES PUBLICAS --------
        public class ArchivoInfoCD
        {
            public string Nombre { get; set; }
            public string NombreArchivo { get; set; }
            public string Extension { get; set; }
        }

        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult MenuDeportivo()
        {
            if ((bool)Session["CoordDeportiva"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("SinPermiso", "Home");
            }
        }

        // ::::::::::::::::::::::: [ INVENTARIO ] :::::::::::::::::::::::
        // FUNCION QUE ENVIA LA VISTA DEL INVENTARIO
        public ActionResult Inventario()
        {
            return View();
        }

        // ::::::::::::::::::::::: [ ARCHIVERO ] :::::::::::::::::::::::
        // FUNCION QUE ENVIA LA VISTA DEL ARCHIVERO
        public ActionResult Archivero()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA LISTA DE DOCUMENTOS
        public string ListaDocsCDeportiva()
        {
            MCDeportiva.DocsListaCD docs = MiCDeportiva.CDeportivaListaDocs((string)Session["TokenCentro"]);
            docs.UrlFolderCliente = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
            return JsonConvert.SerializeObject(docs);
        }

        // FUNCION QUE ALMACENA UN DOCUMENTO
        public string AltaDocCDeportiva(string Info)
        {
            try
            {
                ArchivoInfoCD archivoInfo = JsonConvert.DeserializeObject<ArchivoInfoCD>(Info);
                MCDeportiva.DocCDeportiva DocData = new MCDeportiva.DocCDeportiva()
                {
                    TokenCentro = (string)Session["TokenCentro"],
                    Nombre = archivoInfo.Nombre,
                    Archivo = archivoInfo.NombreArchivo,
                    Extension = archivoInfo.Extension,
                    TokenUsuario = (string)Session["Token"]
                };
                string Alta = MiCDeportiva.AltaDocCDeportiva(DocData);
                if (Alta == "true")
                {
                    return GuardarArchivoCD(archivoInfo.NombreArchivo, archivoInfo.Extension, Request.Files["Archivo"]);
                }
                else
                {
                    return Alta;
                }
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // -----------------------------------------------------------------------------------
        // FUNCION INDEPENDIENTE QUE GUARDA UN ARCHIVO
        public string GuardarArchivoCD(string Nombre, string Extension, HttpPostedFileBase Archivo)
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
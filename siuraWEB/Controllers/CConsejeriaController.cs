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
    public class CConsejeriaController : Controller
    {
        // --------- VARIABLE GENERAL QUE LLAMA AL MODEL COORD. CONSEJERIA ---------
        MCConsejeria MiCConsejeria = new MCConsejeria();
        // -------- CLASES PUBLICAS --------
        public class ArchivoInfoCC
        {
            public string Nombre { get; set; }
            public string NombreArchivo { get; set; }
            public string Extension { get; set; }
        }

        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL
        public ActionResult MenuConsejeria()
        {
            if ((bool)Session["Cord12Pasos"])
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
        public string ListaDocsCConsejeria()
        {
            MCConsejeria.DocsListaCC docs = MiCConsejeria.CConsejeriaListaDocs((string)Session["TokenCentro"]);
            docs.UrlFolderCliente = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
            return JsonConvert.SerializeObject(docs);
        }

        // FUNCION QUE ALMACENA UN DOCUMENTO
        public string AltaDocCConsejeria(string Info)
        {
            try
            {
                ArchivoInfoCC archivoInfo = JsonConvert.DeserializeObject<ArchivoInfoCC>(Info);
                MCConsejeria.DocCConsejeria DocData = new MCConsejeria.DocCConsejeria()
                {
                    TokenCentro = (string)Session["TokenCentro"],
                    Nombre = archivoInfo.Nombre,
                    Archivo = archivoInfo.NombreArchivo,
                    Extension = archivoInfo.Extension,
                    TokenUsuario = (string)Session["Token"]
                };
                string Alta = MiCConsejeria.AltaDocCConsejeria(DocData);
                if (Alta == "true")
                {
                    return GuardarArchivoCM(archivoInfo.NombreArchivo, archivoInfo.Extension, Request.Files["Archivo"]);
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
        public string GuardarArchivoCM(string Nombre, string Extension, HttpPostedFileBase Archivo)
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

        // ::::::::::::::::::::::: [ NUEVOS INGRESOS C.C. ] :::::::::::::::::::::::
        public ActionResult NuevosIngresos()
        {
            return View();
        }
    }
}
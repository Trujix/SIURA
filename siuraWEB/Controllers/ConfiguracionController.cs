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
        // FUNCION QUE DEVUELVE LA VISTA PRINCIPAL (EXCLUSIVA DEL ADMINISTRADOR)
        public ActionResult MenuConfiguracion()
        {
            if ((bool)Session["Administrador"])
            {
                return View();
            }
            else
            {
                return RedirectToAction("MenuConfiguracionUsu");
            }
        }

        // FUNCION QUE DEVUELVE LA VISTA DE LA CONFIGURACION PARA UN USUARIO
        public ActionResult MenuConfiguracionUsu()
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

        // FUNCION QUE GUARDA EL COMPROBANTE DEL BECARIO
        public string AltaBecaComprobante(string Info)
        {
            try
            {
                ArchivoInfo archivoInfo = JsonConvert.DeserializeObject<ArchivoInfo>(Info);
                return GuardarArchivo(archivoInfo.Nombre, archivoInfo.Extension, Request.Files["Archivo"]);
            }
            catch(Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE ENVIA CORREO ELECTRONICO CON LOS [ DOCUMENTOS INFORMATIVOS ]
        public string EnviarCorreoDocsInf(string Correo, string[] Docs)
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
                    if (Docs.Contains(nombre))
                    {
                        linksDocs += "<a href='" + UrlUsuarioDocs + archivo + "." + extension + "' target='_blank'>" + nombre + "</a><br><a href='" + UrlUsuarioDocs + archivo + "." + extension + "' target='_blank'>" + UrlUsuarioDocs + archivo + "." + extension + "</a><br><br>";
                    }
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

        // :::::::::::::: MENU CATALOGOS ::::::::::::::
        // ENTRADA PRINCIPAL DE VISTA [ CATALOGOS ]
        public ActionResult Catalogos()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA LISTA DE MODELOS DE TRATAMIENTO [ CATALOGOS ]
        public string ListaModelosTratamiento()
        {
            return MiConfiguracion.ListaModelosTratamiento((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DA DE ALTA UN NUEVO MODELO DE TRATAMIENTO [ CATALOGOS ]
        public string GuardarModeloTratamiento(string NombreModelo)
        {
            return MiConfiguracion.GuardarModeloTratamiento(NombreModelo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA UN MODELO DE TRATAMIENTO [ CATALOGOS ]
        public string ActModeloTratamiento(MConfiguracion.ModelosTratamiento ModeloTratamientoInfo)
        {
            return MiConfiguracion.ActModeloTratamiento(ModeloTratamientoInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA LISTA DE LOS FASES DE TRATAMIENTOS [ CATALOGOS ]
        public string ListaFasesTratamientos()
        {
            return MiConfiguracion.ListaFasesTratamiento((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LISTA DE FASES DE TRATAMIENTOS POR ID DE MODELO (INCLUIDO LOS NO ANEXADOS A MODELO) [ CATALOGOS ]
        public string ListaFasesTratIdModelo(int IdModelo)
        {
            return MiConfiguracion.ListaFasesTratIdModelo(IdModelo, (string)Session["TokenCentro"]);
        }

        // FUNCION QUE GUARDA LOS VALORES DE LOS FASES DE TRATAMIENTO [ CATALOGOS ]
        public string GuardarFasesTratamiento(MConfiguracion.Fases FasesInfo, MConfiguracion.FasesNombres[] FasesNombres, MConfiguracion.FasesTipos[] FasesTipo)
        {
            return MiConfiguracion.GuardarFasesTratamiento(FasesInfo, FasesNombres, FasesTipo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ELIMINA UN ESQUEMA DE FASES DE TRATAMIENTO [ CATALOGOS ]
        public string ActDesFasesTratamiento(int IdFase, int Estatus)
        {
            return MiConfiguracion.ActDesFasesTratamiento(IdFase, Estatus, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA LISTA DE ESTADOS DE ALERTA [ CATALOGOS ]
        public string ListaEstadosAlerta()
        {
            return MiConfiguracion.ListaEstadosAlerta((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DA DE ALTA UN NUEVO ESTADO DE ALERTA [ CATALOGOS ]
        public string GuardarEstadoAlerta(string NombreEstadoAlerta)
        {
            return MiConfiguracion.GuardarEstadoAlerta(NombreEstadoAlerta, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA UN ESTADO DE ALERTA [ CATALOGOS ]
        public string ActEstadoAlerta(MConfiguracion.EstadoAlerta EstadoAlertaInfo)
        {
            return MiConfiguracion.ActEstadoAlerta(EstadoAlertaInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA LISTA DE NIVELES DE INTOXICACION [ CATALOGOS ]
        public string ListaNivelIntoxicacion()
        {
            return MiConfiguracion.ListaNivelIntoxicacion((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DA DE ALTA UN NUEVO NIVEL DE INTOXICACIÓN [ CATALOGOS ]
        public string GuardarNivelIntoxicacion(string NombreNivelIntoxicacion)
        {
            return MiConfiguracion.GuardarNivelIntoxicacion(NombreNivelIntoxicacion, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA UN NIVEL DE INTOXICACION [ CATALOGOS ]
        public string ActNivelIntoxicacion(MConfiguracion.NivelIntoxicacion NivelIntoxicacionInfo)
        {
            return MiConfiguracion.ActNivelIntoxicacion(NivelIntoxicacionInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE DEVUELVE LA LISTA DE ESTADOS DE ANIMO [ CATALOGOS ]
        public string ListaEstadosAnimo()
        {
            return MiConfiguracion.ListaEstadosAnimo((string)Session["TokenCentro"]);
        }

        // FUNCION QUE DA DE ALTA UN NUEVO ESTADO DE ANIMO [ CATALOGOS ]
        public string GuardarEstadoAnimo(string NombreEstadoAnimo)
        {
            return MiConfiguracion.GuardarEstadoAnimo(NombreEstadoAnimo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ACTUALIZA UN ESTADO DE ANIMO [ CATALOGOS ]
        public string ActEstadoAnimo(MConfiguracion.EstadoAnimo EstadoAnimoInfo)
        {
            return MiConfiguracion.ActEstadoAnimo(EstadoAnimoInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // :::::::::::::: MENU USUARIOS ::::::::::::::
        // FUNCION QUE DEVUELVE LA VISTA GENERAL DE USUARIOS [ USUARIOS ]
        public ActionResult Usuarios()
        {
            return View();
        }

        // FUNCION QUE DEVUELVE LA  LISTA DE USUARIOS REGISTRADOS [ USUARIOS ]
        public string CargarUsuarios()
        {
            return MiConfiguracion.CargarUsuarios((string)Session["TokenCentro"]);
        }

        // FUNCION QUE GUARDA EL NUEVO USUARIO [ USUARIOS ]
        public string GuardarUsuario(MConfiguracion.Usuarios UsuarioInfo)
        {
            UsuarioInfo.Pass = MISC.CrearCadAleatoria(3, 4);
            string UsuarioAccion = MiConfiguracion.GuardarUsuario(UsuarioInfo, (string)Session["Token"], (string)Session["TokenCentro"], (string)Session["ClaveCentro"]);
            if(UsuarioInfo.IdUsuario == 0 && UsuarioAccion == "true")
            {
                EnviarCorreoUsuarioPass(UsuarioInfo.Correo, UsuarioInfo.Pass, UsuarioInfo.Usuario, UsuarioInfo.Nombre + " " + UsuarioInfo.Apellido);
            }
            return UsuarioAccion;
        }

        // FUNCION QUE GENERA UNA NUEVA PASS Y ENVIA CORREO AL USUARIO [ USUARIOS ]
        public string NuevaPassUsuario(MConfiguracion.Usuarios UsuarioInfo)
        {
            UsuarioInfo.Pass = MISC.CrearCadAleatoria(3, 4);
            string UsuarioAccion = MiConfiguracion.NuevaPassUsuario(UsuarioInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
            if (UsuarioAccion == "true")
            {
                EnviarCorreoUsuarioNuevaPass(UsuarioInfo.Correo, UsuarioInfo.Pass, UsuarioInfo.Nombre + " " + UsuarioInfo.Apellido);
            }
            return UsuarioAccion;
        }

        // FUNCION QUE ACTIVA O DESACTIVA UN USUARIO [ USUARIOS ]
        public string ActivarDesactivarUsuario(MConfiguracion.Usuarios UsuarioInfo)
        {
            return MiConfiguracion.ActivarDesactivarUsuario(UsuarioInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE ENVIA CORREO ELECTRONICO CON LOS [ USUARIOS ]
        public string EnviarCorreoUsuarioPass(string Correo, string Pass, string Usuario, string NombreUsuario)
        {
            try
            {
                string UrlUsuarioDocs = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
                string correoHTML = "<p>Estimado <b>" + NombreUsuario + "</b></p><br /><p>Le damos la bienvenida al sistema <b>SIUR-A</b> anunciándole que su registro, realizado por el administrador, se ha realizado correctamente. A continuación le damos a conocer los valores de acceso para que inicie sesión en el sistema:</p><br><p><b>Usuario: </b>" + Usuario + "</p><p><b>Contraseña: </b>" + Pass + "</p><p><b>Clave Centro: </b>" + (string)Session["ClaveCentro"] + "</p>";

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
                msg.Subject = "Info. Inicio de Sesión";
                msg.Body = MISC.MailHTML().Replace("×ØCUERPOMAILØ×", correoHTML);
                msg.IsBodyHtml = true;
                smtpUsuario.Send(msg);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }

        // FUNCION QUE ENVIA CORREO ELECTRONICO CON NUEVA CONTRASEÑA DE USUARIO [ USUARIOS ]
        public string EnviarCorreoUsuarioNuevaPass(string Correo, string Pass, string NombreUsuario)
        {
            try
            {
                string UrlUsuarioDocs = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.AbsolutePath, "") + "/Docs/" + (string)Session["TokenCentro"] + "/";
                string correoHTML = "<p>Estimado <b>" + NombreUsuario + "</b></p><br /><p>Hemos recibido una solicitud de reestablecimiento de su contraseña de acceso al sistema SIURA por parte de su usuario <b>administrador</b>. Su nueva clave de acceso es:</p><p><b>Nueva Contraseña: </b>" + Pass + "</p><br /><p>Una vez iniciado sesión le recomendamos ampliamente personalizarla desde el menú <b>Configuración.</b></p>";

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
                msg.Subject = "Nueva Contraseña";
                msg.Body = MISC.MailHTML().Replace("×ØCUERPOMAILØ×", correoHTML);
                msg.IsBodyHtml = true;
                smtpUsuario.Send(msg);
                return "true";
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }


        // :::::::::::::: MENU USUARIO INDIVIDUAL (INCLUYENDO EL USUARIO ADMIN) ::::::::::::::
        // FUNCION QUE DEVUELVE LA INFO DEL USUARIO LOGEADO [ MENU USUARIO INDIVIDUAL ]
        public string InfoUsuarioIndividual()
        {
            return MiConfiguracion.InfoUsuarioIndividual((string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE MODIFICA LA INFO GENERAL DEL USUARIO [ MENU USUARIO INDIVIDUAL ]
        public string ActUsuarioInfo(MConfiguracion.Usuarios UsuarioInfo)
        {
            return MiConfiguracion.ActUsuarioInfo(UsuarioInfo, (string)Session["Token"], (string)Session["TokenCentro"]);
        }

        // FUNCION QUE MODIFICA LA CONTRASEÑA DEL USUARIO [ MENU USUARIO INDIVIDUAL ]
        public string ActUsuarioPass(MConfiguracion.UsuarioPass UsuarioPass)
        {
            return MiConfiguracion.ActUsuarioPass(UsuarioPass, (string)Session["Token"], (string)Session["TokenCentro"]);
        }
    }
}
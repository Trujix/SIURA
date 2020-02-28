using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.SqlClient;
using System.Data;
using Newtonsoft.Json;

namespace siuraWEB.Models
{
    public class MConfiguracion : Controller
    {

        // ::::::::::::::::::::::::: [ CONFIGUACRION - DOCUMENTOS ] :::::::::::::::::::::::::
        // --------- CLASES PUBLICAS ---------
        public class DocsLista
        {
            public List<Dictionary<string, object>> DocsInformativos { get; set; }
            public string UrlFolderCliente { get; set; }
            public string Error { get; set; }
        }
        public class DocInformativo
        {
            public string TokenUsuario { get; set; }
            public string Nombre { get; set; }
            public string Extension { get; set; }
            public string Archivo { get; set; }
            public string AdmUsuario { get; set; }
        }

        // ----------- FUNCIONES GENERALES -----------
        // FUNCION QUE DEVUELVE LA LISTA DE DOCUMENTOS
        public DocsLista ConfigListaDocs(string tokenusuario)
        {
            try
            {
                SQL.comandoSQLTrans("ListaDocs");

                List<Dictionary<string, object>> DocsInformativos = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuariodocumentos WHERE idusuario = (SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) AND tipo = 'informativo' AND estatus > 0", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> docInformativo = new Dictionary<string, object>()
                        {
                            { "Nombre", lector["nombre"].ToString() },
                            { "Extension", lector["extension"].ToString() },
                            { "Archivo", lector["archivo"].ToString() }
                        };
                        DocsInformativos.Add(docInformativo);
                    }
                }

                DocsLista Docs = new DocsLista()
                {
                    DocsInformativos = DocsInformativos
                };

                SQL.transaccionSQL.Commit();
                return Docs;
            }
            catch (Exception e)
            {
                SQL.transaccionSQL.Rollback();
                DocsLista err = new DocsLista()
                {
                    Error = e.ToString()
                };
                return err;
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }
        
        // FUNCION QUE ALMACENA UN DOCUMENTO INFORMATIVO
        public string AltaDocInformativo(DocInformativo docinformativo)
        {
            try
            {
                SQL.comandoSQLTrans("DocInformativo");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.usuariodocumentos (idusuario, nombre, extension, archivo, tipo, fechahora, admusuario) VALUES ((SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam), @NombreParam, @ExtensionParam, @ArchivoParam, @TipoParam, @FechaParam, @AdmParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaDocInformativo =
                {
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = docinformativo.TokenUsuario },
                    new SqlParameter("@NombreParam", SqlDbType.VarChar) { Value = docinformativo.Nombre },
                    new SqlParameter("@ExtensionParam", SqlDbType.VarChar) { Value = docinformativo.Extension },
                    new SqlParameter("@ArchivoParam", SqlDbType.VarChar) { Value = docinformativo.Archivo },
                    new SqlParameter("@TipoParam", SqlDbType.VarChar) { Value = "informativo" },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@AdmParam", SqlDbType.VarChar) { Value = docinformativo.AdmUsuario }
                };
                SQL.commandoSQL.Parameters.AddRange(altaDocInformativo);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.transaccionSQL.Commit();
                return "true";
            }
            catch (Exception e)
            {
                SQL.transaccionSQL.Rollback();
                return e.ToString();
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }
    }
}
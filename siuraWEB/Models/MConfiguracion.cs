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
            public string TokenCentro { get; set; }
            public string Nombre { get; set; }
            public string Extension { get; set; }
            public string Archivo { get; set; }
            public string TokenUsuario { get; set; }
        }

        public class MiCentro
        {
            public string NombreCentro { get; set; }
            public string Direccion { get; set; }
            public string ClaveInstitucion { get; set; }
            public int CP { get; set; }
            public double Telefono { get; set; }
            public string Colonia { get; set; }
            public string Localidad { get; set; }
            public string EstadoIndx { get; set; }
            public string MunicipioIndx { get; set; }
            public string Estado { get; set; }
            public string Municipio { get; set; }
            public string Director { get; set; }
        }

        // ----------- FUNCIONES GENERALES -----------
        // FUNCION QUE DEVUELVE LA INFO DEL CENTRO [ MI CENTRO ]
        public string MiCentroInfo(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("MiCentroInfo");
                Dictionary<string, object> MiCentroData = new Dictionary<string, object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        MiCentroData = new Dictionary<string, object>()
                        {
                            { "Nombre", lector["nombrecentro"].ToString() },
                            { "Clave", lector["clavecentro"].ToString() },
                            { "Direccion", lector["direccion"].ToString() },
                            { "CP", lector["cp"].ToString() },
                            { "Telefono", double.Parse(lector["telefono"].ToString()) },
                            { "Localidad", lector["localidad"].ToString() },
                            { "Colonia", lector["colonia"].ToString() },
                            { "EstadoIndx", lector["estadoindx"].ToString() },
                            { "MunicipioIndx", lector["municipioindx"].ToString() },
                            { "Estado", lector["estado"].ToString() },
                            { "Municipio", lector["municipio"].ToString() },
                            { "LogoAlAnon", bool.Parse(lector["alanonlogo"].ToString()) },
                            { "LogoPers", bool.Parse(lector["logopersonalizado"].ToString()) },
                            { "NombreDirector", lector["nombredirector"].ToString() },
                        };
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(MiCentroData);
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

        // FUNCION QUE GUARDA LOS  VALORES DE [ MI CENTRO ]
        public string GuardarMiCentro(MiCentro centrodata, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("AltaMiCentro");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarioscentro SET nombrecentro = @NombreCentroParam, clavecentro = @ClaveCentroParam, direccion = @DireccionParam, cp = @CPParam, telefono = @TelefonoParam, colonia = @ColoniaParam, localidad = @LocalidadParam, estadoindx = @EstadoINDXParam, municipioindx = @MunicipioINDXParam, estado = @EstadoParam, municipio = @MunicipioParam, nombredirector = @DirectorParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaMiCentro =
                {
                    new SqlParameter("@NombreCentroParam", SqlDbType.VarChar) { Value = centrodata.NombreCentro },
                    new SqlParameter("@ClaveCentroParam", SqlDbType.VarChar) { Value = centrodata.ClaveInstitucion },
                    new SqlParameter("@DireccionParam", SqlDbType.VarChar) { Value = centrodata.Direccion },
                    new SqlParameter("@CPParam", SqlDbType.Int) { Value = centrodata.CP },
                    new SqlParameter("@TelefonoParam", SqlDbType.Float) { Value = centrodata.Telefono },
                    new SqlParameter("@ColoniaParam", SqlDbType.VarChar) { Value = centrodata.Colonia },
                    new SqlParameter("@LocalidadParam", SqlDbType.VarChar) { Value = centrodata.Localidad },
                    new SqlParameter("@EstadoINDXParam", SqlDbType.VarChar) { Value = centrodata.EstadoIndx },
                    new SqlParameter("@MunicipioINDXParam", SqlDbType.VarChar) { Value = centrodata.MunicipioIndx },
                    new SqlParameter("@EstadoParam", SqlDbType.VarChar) { Value = centrodata.Estado },
                    new SqlParameter("@MunicipioParam", SqlDbType.VarChar) { Value = centrodata.Municipio },
                    new SqlParameter("@DirectorParam", SqlDbType.VarChar) { Value = centrodata.Director },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro }
                };
                SQL.commandoSQL.Parameters.AddRange(altaMiCentro);
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

        // FUNCION QUE ACTUALIZA EL ESTATUS DEL LOGO AL-ANON [ MI CENTRO ]
        public string ActLogoALAnon(bool estatuslogo, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActLogoALAnon");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarioscentro SET alanonlogo = @EstatusLogoDATA WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@EstatusLogoDATA", SqlDbType.Bit) { Value = estatuslogo });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
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

        // FUNCION QUE ACTUALIZA EL ESTATUS DEL LOGO PERSONALIZADO [ MI CENTRO ]
        public string ActLogoCentro(bool estatuslogo, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActLogoCentro");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarioscentro SET logopersonalizado = @EstatusLogoDATA WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@EstatusLogoDATA", SqlDbType.Bit) { Value = estatuslogo });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.ExecuteNonQuery();

                if (!estatuslogo)
                {
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarioscentro SET alanonlogo = @EstatusLogoDATA WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@EstatusLogoDATA", SqlDbType.Bit) { Value = true });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.ExecuteNonQuery();
                }

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

        // FUNCION QUE DEVUELVE LA LISTA DE DOCUMENTOS [ DOCUMENTOS ]
        public DocsLista ConfigListaDocs(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ListaDocs");

                List<Dictionary<string, object>> DocsInformativos = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuariodocumentos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND tipo = 'informativo' AND estatus > 0", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
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

        // FUNCION QUE ALMACENA UN DOCUMENTO INFORMATIVO [ DOCUMENTOS ]
        public string AltaDocInformativo(DocInformativo docinformativo)
        {
            try
            {
                SQL.comandoSQLTrans("DocInformativo");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.usuariodocumentos (idcentro, nombre, extension, archivo, tipo, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @NombreParam, @ExtensionParam, @ArchivoParam, @TipoParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaDocInformativo =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = docinformativo.TokenCentro },
                    new SqlParameter("@NombreParam", SqlDbType.VarChar) { Value = docinformativo.Nombre },
                    new SqlParameter("@ExtensionParam", SqlDbType.VarChar) { Value = docinformativo.Extension },
                    new SqlParameter("@ArchivoParam", SqlDbType.VarChar) { Value = docinformativo.Archivo },
                    new SqlParameter("@TipoParam", SqlDbType.VarChar) { Value = "informativo" },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = docinformativo.TokenUsuario }
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
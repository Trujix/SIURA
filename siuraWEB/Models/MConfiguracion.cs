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
        public class ModelosTratamiento
        {
            public int IdModeloTratamiento { get; set; }
            public string NombreModelo { get; set; }
            public int Estatus { get; set; }
        }
        public class Fases
        {
            public int IdFase { get; set; }
            public int CantidadFases { get; set; }
            public int IdModelo { get; set; }
        }
        public class FasesNombres
        {
            public string NombreFase { get; set; }
        }
        public class FasesTipos
        {
            public string NombreTipo { get; set; }
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

        // FUNCION QUE DEVUELVE  LA LISTA DE MODELOS DE TRATAMIENTO [ CATALOGOS ]
        public string ListaModelosTratamiento(string tokencentro){
            try
            {
                SQL.comandoSQLTrans("ModelosTratamiento");
                Dictionary<string, object> ModelosTratamientos = new Dictionary<string, object>();
                List<object> ModeloTratamientoACT = new List<object>(), ModeloTratamientoDESC = new List<object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.modelostratamientos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        if(int.Parse(lector["estatus"].ToString()) > 0)
                        {
                            ModeloTratamientoACT.Add(new Dictionary<string, object>()
                            {
                                { "IdTratamiento", int.Parse(lector["id"].ToString()) },
                                { "NombreTratamiento", lector["nombretratamiento"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                        else
                        {
                            ModeloTratamientoDESC.Add(new Dictionary<string, object>()
                            {
                                { "NombreTratamiento", lector["nombretratamiento"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                    }
                }
                ModelosTratamientos = new Dictionary<string, object>() {
                    { "Activos", ModeloTratamientoACT },
                    { "Inactivo", ModeloTratamientoDESC }
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ModelosTratamientos);
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

        // FUNCION QUE ALMACENA UN NUEVO MODELO DE TRATAMIENTO [ CATALOGOS ]
        public string GuardarModeloTratamiento(string nombremodelo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ModeloTratamiento");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.modelostratamientos (idcentro, nombretratamiento, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @NombreModeloParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaModeloTratamiento =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@NombreModeloParam", SqlDbType.VarChar) { Value = nombremodelo },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(altaModeloTratamiento);
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

        // FUNCION QUE ACTUALIZA UN MODELO DE TRATAMIENTO [ CATALOGOS ]
        public string ActModeloTratamiento(ModelosTratamiento modelotratamientoinfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActModeloTratamiento");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.modelostratamientos SET nombretratamiento = @NombreModeloParam, estatus = @EstatusParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE id = @IdModeloTratamientoParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaModeloTratamiento =
                {
                    new SqlParameter("@NombreModeloParam", SqlDbType.VarChar) { Value = modelotratamientoinfo.NombreModelo },
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = modelotratamientoinfo.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@IdModeloTratamientoParam", SqlDbType.Int) { Value = modelotratamientoinfo.IdModeloTratamiento },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(altaModeloTratamiento);
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

        // FUNCION QUE DEVUELVE LA LISTA DE FASESDE TRATAMIENTOS [ CATALOGOS ]
        public string ListaFasesTratamiento(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ListaFasesTratamiento");

                List<Dictionary<string, object>> FasesTratamiento = new List<Dictionary<string, object>>();
                List<Fases> FasesLista = new List<Fases>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasestratamientos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND estatus > 0", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Fases Fase = new Fases();
                        Fase.IdFase = int.Parse(lector["id"].ToString());
                        Fase.CantidadFases = int.Parse(lector["cantidadfases"].ToString());
                        Fase.IdModelo = int.Parse(lector["idmodelo"].ToString());
                        FasesLista.Add(Fase);
                    }
                }

                foreach(Fases fase in FasesLista)
                {
                    string ModeloNombre = "";
                    if(fase.IdModelo > 0)
                    {
                        SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.modelostratamientos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = (SELECT idmodelo FROM dbo.fasestratamientos WHERE id = @IDFaseDATA AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA))", SQL.conSQL, SQL.transaccionSQL);
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseDATA", SqlDbType.Int) { Value = fase.IdFase });
                        using (var lector = SQL.commandoSQL.ExecuteReader())
                        {
                            while (lector.Read())
                            {
                                ModeloNombre = lector["nombretratamiento"].ToString();
                            }
                        }
                    }

                    string FasesNombres = "";
                    List<string> FasesNombresLista = new List<string>();
                    SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasesnombres WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idfases = @IDFaseDATA", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseDATA", SqlDbType.Int) { Value = fase.IdFase });
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            if(FasesNombres!= "")
                            {
                                FasesNombres += ", ";
                            }
                            FasesNombres += lector["nombrefase"].ToString();
                            FasesNombresLista.Add(lector["nombrefase"].ToString());
                        }
                    }

                    string FasesTipo = "";
                    List<string> FasesTipoLista = new List<string>();
                    SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasestipos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idfases = @IDFaseDATA", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseDATA", SqlDbType.Int) { Value = fase.IdFase });
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            if (FasesTipo != "")
                            {
                                FasesTipo += ", ";
                            }
                            FasesTipo += lector["nombretipo"].ToString();
                            FasesTipoLista.Add(lector["nombretipo"].ToString());
                        }
                    }

                    FasesTratamiento.Add(new Dictionary<string, object>()
                    {
                        { "IdFase", fase.IdFase },
                        { "CantidadFases", fase.CantidadFases },
                        { "IdModelo", fase.IdModelo },
                        { "FasesNombres", FasesNombresLista },
                        { "FasesNombresTxt", fase.CantidadFases.ToString() + " (" + FasesNombres + ")" + ((ModeloNombre != "") ? " - [" + ModeloNombre + "]" : "") },
                        { "FasesTipos", FasesTipoLista },
                        { "FasesTiposTxt", FasesTipo }
                    });
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(FasesTratamiento);
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

        // FUNCION QUE DEVUELVE LISTA DE FASES DE TRATAMIENTOS POR ID DE MODELO (INCLUIDO LOS NO ANEXADOS A MODELO) [ CATALOGOS ]
        public string ListaFasesTratIdModelo(int idmodelo, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ListaFasesTratIdModelo");

                List<Fases> FasesModelo = new List<Fases>();
                int fm = 0, fsm = 0;
                List<Fases> FasesSinModelo = new List<Fases>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasestratamientos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND estatus > 0 AND (idmodelo = @IDModeloParam OR idmodelo = 0)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDModeloParam", SqlDbType.VarChar) { Value = idmodelo });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Fases Fase = new Fases();
                        Fase.IdFase = int.Parse(lector["id"].ToString());
                        Fase.CantidadFases = int.Parse(lector["cantidadfases"].ToString());
                        if(int.Parse(lector["idmodelo"].ToString()) == idmodelo)
                        {
                            FasesModelo.Add(Fase);
                            fm++;
                        }
                        else
                        {
                            FasesSinModelo.Add(Fase);
                            fsm++;
                        }
                    }
                }

                Dictionary<string, object> FasesJSON = new Dictionary<string, object>();
                List<Dictionary<string, object>> FasesLista = new List<Dictionary<string, object>>();
                if (fm > 0)
                {
                    foreach(Fases fase in FasesModelo)
                    {
                        string FasesNombres = "";
                        SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasesnombres WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idfases = @IDFaseDATA", SQL.conSQL, SQL.transaccionSQL);
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseDATA", SqlDbType.Int) { Value = fase.IdFase });
                        using (var lector = SQL.commandoSQL.ExecuteReader())
                        {
                            while (lector.Read())
                            {
                                if (FasesNombres != "")
                                {
                                    FasesNombres += ", ";
                                }
                                FasesNombres += lector["nombrefase"].ToString();
                            }
                        }
                        FasesLista.Add(new Dictionary<string, object>()
                        {
                            { "IdFase", fase.IdFase },
                            { "CantidadFases", fase.CantidadFases },
                            { "FasesNombres", "(" + FasesNombres + ")" },
                            { "FasesNombresTxt", fase.CantidadFases.ToString() + " (" + FasesNombres + ")" }
                        });
                    }
                }
                FasesJSON.Add("Relacionado", FasesLista);

                FasesLista = new List<Dictionary<string, object>>();
                if (fsm > 0)
                {
                    foreach (Fases fase in FasesSinModelo)
                    {
                        string FasesNombres = "";
                        SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.fasesnombres WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idfases = @IDFaseDATA", SQL.conSQL, SQL.transaccionSQL);
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseDATA", SqlDbType.Int) { Value = fase.IdFase });
                        using (var lector = SQL.commandoSQL.ExecuteReader())
                        {
                            while (lector.Read())
                            {
                                if (FasesNombres != "")
                                {
                                    FasesNombres += ", ";
                                }
                                FasesNombres += lector["nombrefase"].ToString();
                            }
                        }
                        FasesLista.Add(new Dictionary<string, object>()
                        {
                            { "IdFase", fase.IdFase },
                            { "CantidadFases", fase.CantidadFases },
                            { "FasesNombres", "(" + FasesNombres + ")" },
                            { "FasesNombresTxt", fase.CantidadFases.ToString() + " (" + FasesNombres + ")" }
                        });
                    }   
                }
                FasesJSON.Add("NoRelacionado", FasesLista);

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(FasesJSON);
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

        // FUNCION QUE GUARDA LAS FASES DE TRATAMIENTOS [ CATALOGOS ]
        public string GuardarFasesTratamiento(Fases fasesinfo, FasesNombres[] fasesnombres, FasesTipos[] fasestipos, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("FaseTratamiento");
                if(fasesinfo.IdFase > 0)
                {

                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.fasestratamientos SET idmodelo = @IDModeloParam, cantidadfases = @CantFasesParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam) AND id = @IDFaseParam", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] altaFaseNombre =
                    {
                        new SqlParameter("@CantFasesParam", SqlDbType.Int) { Value = fasesinfo.CantidadFases },
                        new SqlParameter("@IDModeloParam", SqlDbType.Int) { Value = fasesinfo.IdModelo },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                        new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = fasesinfo.IdFase },
                    };
                    SQL.commandoSQL.Parameters.AddRange(altaFaseNombre);
                    SQL.commandoSQL.ExecuteNonQuery();

                    SQL.commandoSQL = new SqlCommand("DELETE FROM dbo.fasesnombres WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam) AND idfases = @IDFaseParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = fasesinfo.IdFase });
                    SQL.commandoSQL.ExecuteNonQuery();

                    SQL.commandoSQL = new SqlCommand("DELETE FROM dbo.fasestipos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam) AND idfases = @IDFaseParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = fasesinfo.IdFase });
                    SQL.commandoSQL.ExecuteNonQuery();
                }
                else
                {
                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.fasestratamientos (idcentro, idmodelo, cantidadfases, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IDModeloParam, @CantFasesParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] altaFaseTratamiento =
                    {
                        new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@IDModeloParam", SqlDbType.Int) { Value = fasesinfo.IdModelo },
                        new SqlParameter("@CantFasesParam", SqlDbType.Int) { Value = fasesinfo.CantidadFases },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(altaFaseTratamiento);
                    SQL.commandoSQL.ExecuteNonQuery();
                }

                int IdFase = 0;
                SQL.commandoSQL = new SqlCommand("SELECT MAX(id) AS Maximo FROM dbo.fasestratamientos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IdFase = int.Parse(lector["Maximo"].ToString());
                    }
                }

                foreach (FasesNombres fasenombre in fasesnombres)
                {
                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.fasesnombres (idcentro, idfases, nombrefase, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IDFaseParam, @NombreFaseParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] altaFaseNombre =
                    {
                        new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = IdFase },
                        new SqlParameter("@NombreFaseParam", SqlDbType.VarChar) { Value = fasenombre.NombreFase },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(altaFaseNombre);
                    SQL.commandoSQL.ExecuteNonQuery();
                }

                if (fasestipos != null)
                {
                    foreach (FasesTipos fasetipo in fasestipos)
                    {
                        SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.fasestipos (idcentro, idfases, nombretipo, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IDFaseParam, @NombreTipoParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                        SqlParameter[] altaFaseTipo =
                        {
                            new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                            new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = IdFase },
                            new SqlParameter("@NombreTipoParam", SqlDbType.VarChar) { Value = fasetipo.NombreTipo },
                            new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                            new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                        };
                        SQL.commandoSQL.Parameters.AddRange(altaFaseTipo);
                        SQL.commandoSQL.ExecuteNonQuery();
                    }
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

        // FUNCION QUE ELIMINA  UN ESQUEMA DE FASES DE TRATAMIENTOS [ CATALOGOS ]
        public string ActDesFasesTratamiento(int idfase, int estatus, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActDesFaseTratamiento");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.fasestratamientos SET estatus = @EstatusParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDFaseParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actDesFase =
                {
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@IDFaseParam", SqlDbType.Int) { Value = idfase },
                };
                SQL.commandoSQL.Parameters.AddRange(actDesFase);
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
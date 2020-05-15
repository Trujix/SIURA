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
        // CLASES DE USUARIOS
        public class Usuarios
        {
            public int IdUsuario { get; set; }
            public string Usuario { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Correo { get; set; }
            public string Pass { get; set; }
            public int Activo { get; set; }
            public bool Administrador { get; set; }
            public int Estatus { get; set; }
            public PerfilesUsuario Perfiles { get; set; }
        }
        public class PerfilesUsuario
        {
            public int IdUsuario { get; set; }
            public bool AlAnon { get; set; }
            public bool CoordDeportiva { get; set; }
            public bool CoordMedica { get; set; }
            public bool CoordPsicologica { get; set; }
            public bool CoordEspiritual { get; set; }
            public bool Cord12Pasos { get; set; }
            public bool Documentacion { get; set; }
        }
        public class UsuarioPass
        {
            public string NuevaPass { get; set; }
            public string AntiguaPass { get; set; }
        }
        // CLASES DE DOCUMENTOS (ARCHIVERO)
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
        // CLASES DE CATALOGOS
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
        public class EstadoAlerta
        {
            public int IdEstadoAlerta { get; set; }
            public string NombreEstadoAlerta { get; set; }
            public int Estatus { get; set; }
        }
        public class NivelIntoxicacion
        {
            public int IdNivelesIntoxicacion { get; set; }
            public string NombreNivelIntoxicacion { get; set; }
            public int Estatus { get; set; }
        }
        public class EstadoAnimo
        {
            public int IdEstadoAnimo { get; set; }
            public string NombreEstadoAnimo { get; set; }
            public int Estatus { get; set; }
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
                        Fases Fase = new Fases() {
                            IdFase = int.Parse(lector["id"].ToString()),
                            CantidadFases = int.Parse(lector["cantidadfases"].ToString()),
                            IdModelo = int.Parse(lector["idmodelo"].ToString()),
                        };
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
                        Fases Fase = new Fases() {
                            IdFase = int.Parse(lector["id"].ToString()),
                            CantidadFases = int.Parse(lector["cantidadfases"].ToString()),
                        };
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

        // FUNCION QUE DEVUELVE LA LISTA DE ESTADOS DE ALERTA [ CATALOGOS ]
        public string ListaEstadosAlerta(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("EstadosAlerta");
                Dictionary<string, object> EstadosAlerta = new Dictionary<string, object>();
                List<object> EstadosAlertaACT = new List<object>(), EstadosAlertaDESC = new List<object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.estadoalerta WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        if (int.Parse(lector["estatus"].ToString()) > 0)
                        {
                            EstadosAlertaACT.Add(new Dictionary<string, object>()
                            {
                                { "IdEstadoAlerta", int.Parse(lector["id"].ToString()) },
                                { "NombreEstadoAlerta", lector["nombreestadoalerta"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                        else
                        {
                            EstadosAlertaDESC.Add(new Dictionary<string, object>()
                            {
                                { "NombreEstadoAlerta", lector["nombreestadoalerta"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                    }
                }
                EstadosAlerta = new Dictionary<string, object>() {
                    { "Activos", EstadosAlertaACT },
                    { "Inactivo", EstadosAlertaDESC }
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(EstadosAlerta);
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

        // FUNCION QUE ALMACENA UN NUEVO ESTADO DE ALERTA [ CATALOGOS ]
        public string GuardarEstadoAlerta(string nombreestadoalerta, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("EstadoAlerta");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.estadoalerta (idcentro, nombreestadoalerta, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @NombreEstadoAlertaParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaEstadoAlerta =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@NombreEstadoAlertaParam", SqlDbType.VarChar) { Value = nombreestadoalerta },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(altaEstadoAlerta);
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

        // FUNCION QUE ACTUALIZA UN ESTADO DE ALERTA [ CATALOGOS ]
        public string ActEstadoAlerta(EstadoAlerta estadoalertainfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActEstadoAlerta");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.estadoalerta SET nombreestadoalerta = @NombreEstadoAlertaParam, estatus = @EstatusParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE id = @IdEstadoAlertaParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actEstadoAlerta =
                {
                    new SqlParameter("@NombreEstadoAlertaParam", SqlDbType.VarChar) { Value = estadoalertainfo.NombreEstadoAlerta },
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = estadoalertainfo.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@IdEstadoAlertaParam", SqlDbType.Int) { Value = estadoalertainfo.IdEstadoAlerta },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(actEstadoAlerta);
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

        // FUNCION QUE DEVUELVE LA LISTA DE NIVELES DE INTOXICACION [ CATALOGOS ]
        public string ListaNivelIntoxicacion(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("NivelesIntoxicacion");
                Dictionary<string, object> NivelesIntoxicacion = new Dictionary<string, object>();
                List<object> NivelesIntoxicacionACT = new List<object>(), NivelesIntoxicacionDESC = new List<object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.nivelintoxicacion WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        if (int.Parse(lector["estatus"].ToString()) > 0)
                        {
                            NivelesIntoxicacionACT.Add(new Dictionary<string, object>()
                            {
                                { "IdNivelesIntoxicacion", int.Parse(lector["id"].ToString()) },
                                { "NombreNivelIntoxicacion", lector["nombrenivelintoxicacion"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                        else
                        {
                            NivelesIntoxicacionDESC.Add(new Dictionary<string, object>()
                            {
                                { "NombreNivelIntoxicacion", lector["nombrenivelintoxicacion"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                    }
                }
                NivelesIntoxicacion = new Dictionary<string, object>() {
                    { "Activos", NivelesIntoxicacionACT },
                    { "Inactivo", NivelesIntoxicacionDESC }
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(NivelesIntoxicacion);
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

        // FUNCION QUE ALMACENA UN NUEVO NIVEL DE INTOXICACION [ CATALOGOS ]
        public string GuardarNivelIntoxicacion(string nombrenivelintoxicacion, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("NivelIntoxicacion");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.nivelintoxicacion (idcentro, nombrenivelintoxicacion, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @NombreNivelIntoxicacionParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaNivelIntoxicacion =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@NombreNivelIntoxicacionParam", SqlDbType.VarChar) { Value = nombrenivelintoxicacion },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(altaNivelIntoxicacion);
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

        // FUNCION QUE ACTUALIZA UN NIVEL DE INTOXICACION [ CATALOGOS ]
        public string ActNivelIntoxicacion(NivelIntoxicacion estadonivelintoxicacion, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActNivelIntoxicacion");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.nivelintoxicacion SET nombrenivelintoxicacion = @NombreNivelIntoxicacionParam, estatus = @EstatusParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE id = @IdNivelIntoxicacionParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actNivelIntoxicacion =
                {
                    new SqlParameter("@NombreNivelIntoxicacionParam", SqlDbType.VarChar) { Value = estadonivelintoxicacion.NombreNivelIntoxicacion },
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = estadonivelintoxicacion.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@IdNivelIntoxicacionParam", SqlDbType.Int) { Value = estadonivelintoxicacion.IdNivelesIntoxicacion },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(actNivelIntoxicacion);
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

        // FUNCION QUE DEVUELVE LA LISTA DE ESTADOS DE ANIMO [ CATALOGOS ]
        public string ListaEstadosAnimo(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("EstadosAnimo");
                Dictionary<string, object> EstadosAnimo = new Dictionary<string, object>();
                List<object> EstadosAnimoACT = new List<object>(), EstadosAnimoDESC = new List<object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.estadoanimo WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        if (int.Parse(lector["estatus"].ToString()) > 0)
                        {
                            EstadosAnimoACT.Add(new Dictionary<string, object>()
                            {
                                { "IdEstadoAnimo", int.Parse(lector["id"].ToString()) },
                                { "NombreEstadoAnimo", lector["nombreestadoanimo"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                        else
                        {
                            EstadosAnimoDESC.Add(new Dictionary<string, object>()
                            {
                                { "NombreEstadoAnimo", lector["nombreestadoanimo"].ToString() },
                                { "Estatus", int.Parse(lector["estatus"].ToString()) },
                            });
                        }
                    }
                }
                EstadosAnimo = new Dictionary<string, object>() {
                    { "Activos", EstadosAnimoACT },
                    { "Inactivo", EstadosAnimoDESC }
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(EstadosAnimo);
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

        // FUNCION QUE ALMACENA UN NUEVO ESTADO DE ANIMO [ CATALOGOS ]
        public string GuardarEstadoAnimo(string nombreestadoanimo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("EstadoAnimo");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.estadoanimo (idcentro, nombreestadoanimo, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @NombreEstadoAnimoParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaEstadoAnimo =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@NombreEstadoAnimoParam", SqlDbType.VarChar) { Value = nombreestadoanimo },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(altaEstadoAnimo);
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

        // FUNCION QUE ACTUALIZA UN ESTADO DE ANIMO [ CATALOGOS ]
        public string ActEstadoAnimo(EstadoAnimo estadoanimoinfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActEstadoAnimo");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.estadoanimo SET nombreestadoanimo = @NombreEstadoAnimoParam, estatus = @EstatusParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam) WHERE id = @IdEstadoAnimoParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actEstadoAnimo =
                {
                    new SqlParameter("@NombreEstadoAnimoParam", SqlDbType.VarChar) { Value = estadoanimoinfo.NombreEstadoAnimo },
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = estadoanimoinfo.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@IdEstadoAnimoParam", SqlDbType.Int) { Value = estadoanimoinfo.IdEstadoAnimo },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(actEstadoAnimo);
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

        // FUNCION QUE DEVUELVE LA LISTA DE USUARIOS REGISTRADOS [ USUARIOS ]
        public string CargarUsuarios(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ListaUsuarios");
                List<Usuarios> ListaUsuarioAux = new List<Usuarios>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokencentro = @TokenCentroDATA AND administrador <> 'True' AND estatus > 0", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        ListaUsuarioAux.Add(new Usuarios()
                        {
                            IdUsuario = int.Parse(lector["id"].ToString()),
                            Usuario = lector["usuario"].ToString(),
                            Nombre = lector["nombre"].ToString(),
                            Apellido = lector["apellido"].ToString(),
                            Correo = lector["correo"].ToString(),
                            Administrador = bool.Parse(lector["administrador"].ToString()),
                            Activo = int.Parse(lector["activo"].ToString()),
                        });
                    }
                }

                List<Usuarios> ListaUsuarios = new List<Usuarios>();
                foreach(Usuarios usuario in ListaUsuarioAux)
                {
                    PerfilesUsuario ListaPerfiles = new PerfilesUsuario();
                    SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuariosperfiles WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idusuario = @IDUsuarioDATA", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDUsuarioDATA", SqlDbType.Int) { Value = usuario.IdUsuario });
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            ListaPerfiles = new PerfilesUsuario()
                            {
                                IdUsuario = usuario.IdUsuario,
                                AlAnon = bool.Parse(lector["alanon"].ToString()),
                                CoordDeportiva = bool.Parse(lector["coorddeportiva"].ToString()),
                                CoordMedica = bool.Parse(lector["coordmedica"].ToString()),
                                CoordPsicologica = bool.Parse(lector["coordpsicologica"].ToString()),
                                CoordEspiritual = bool.Parse(lector["coordespiritual"].ToString()),
                                Cord12Pasos = bool.Parse(lector["coorddocepasos"].ToString()),
                                Documentacion = bool.Parse(lector["documentacion"].ToString()),
                            };
                        }
                        ListaUsuarios.Add(new Usuarios()
                        {
                            IdUsuario = usuario.IdUsuario,
                            Usuario = usuario.Usuario,
                            Nombre = usuario.Nombre,
                            Apellido = usuario.Apellido,
                            Correo = usuario.Correo,
                            Administrador = usuario.Administrador,
                            Activo = usuario.Activo,
                            Perfiles = ListaPerfiles
                        });
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaUsuarios);
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

        // FUNCION QUE GUARDA UN USUARIO [ USUARIOS ]
        public string GuardarUsuario(Usuarios usuarioinfo, string tokenusuario, string tokencentro, string clavecentro)
        {
            try
            {
                SQL.comandoSQLTrans("GuardarUsuario");
                if(usuarioinfo.IdUsuario > 0)
                {
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarios SET nombre = @NombreParam, apellido = @ApellidoParam, correo = @CorreoParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE tokencentro = @TokenCentroDATA AND id = @IDUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] actUsuario =
                    {
                        new SqlParameter("@NombreParam", SqlDbType.VarChar) { Value = usuarioinfo.Nombre },
                        new SqlParameter("@ApellidoParam", SqlDbType.VarChar) { Value = usuarioinfo.Apellido },
                        new SqlParameter("@CorreoParam", SqlDbType.VarChar) { Value = usuarioinfo.Correo },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = usuarioinfo.IdUsuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(actUsuario);
                    SQL.commandoSQL.ExecuteNonQuery();

                    PerfilesUsuario perfilUsuario = usuarioinfo.Perfiles;
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuariosperfiles SET alanon = @AlAnonParam, coorddeportiva = @CDeportivaParam, coordmedica = @CMedicaParam, coordpsicologica = @CPsicologicaParam, coordespiritual = @CEspiritualParam, coorddocepasos = @CDocePasosParam, documentacion = @CDocumentacionParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idusuario = @IDUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] actUsuarioPerfiles =
                    {
                        new SqlParameter("@AlAnonParam", SqlDbType.Bit) { Value = perfilUsuario.AlAnon },
                        new SqlParameter("@CDeportivaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordDeportiva },
                        new SqlParameter("@CMedicaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordMedica },
                        new SqlParameter("@CPsicologicaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordPsicologica },
                        new SqlParameter("@CEspiritualParam", SqlDbType.Bit) { Value = perfilUsuario.CoordEspiritual },
                        new SqlParameter("@CDocePasosParam", SqlDbType.Bit) { Value = perfilUsuario.Cord12Pasos },
                        new SqlParameter("@CDocumentacionParam", SqlDbType.Bit) { Value = perfilUsuario.Documentacion },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = usuarioinfo.IdUsuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(actUsuarioPerfiles);
                    SQL.commandoSQL.ExecuteNonQuery();
                }
                else
                {
                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.usuarios (usuario, tokenusuario, tokencentro, nombre, apellido, correo, pass, idnotificacion, fechahora, admusuario) VALUES (@UsuarioParam, @TokenUsuarioParam, @TokenCentroDATA, @NombreParam, @ApellidoParam, @CorreoParam, @PassParam, @NotifIdParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] nuevoUsuario =
                    {
                        new SqlParameter("@UsuarioParam", SqlDbType.VarChar) { Value = usuarioinfo.Usuario },
                        new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = MISC.CrearMD5(MISC.CrearCadAleatoria(2, 8)) },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@NombreParam", SqlDbType.VarChar) { Value = usuarioinfo.Nombre },
                        new SqlParameter("@ApellidoParam", SqlDbType.VarChar) { Value = usuarioinfo.Apellido },
                        new SqlParameter("@CorreoParam", SqlDbType.VarChar) { Value = usuarioinfo.Correo },
                        new SqlParameter("@PassParam", SqlDbType.VarChar) { Value = MISC.CrearMD5(usuarioinfo.Pass) },
                        new SqlParameter("@NotifIdParam", SqlDbType.VarChar) { Value = MISC.CrearMD5(clavecentro + usuarioinfo.Usuario) },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(nuevoUsuario);
                    SQL.commandoSQL.ExecuteNonQuery();

                    int IDUsuario = 0;
                    SQL.commandoSQL = new SqlCommand("SELECT MAX(id) AS Maximo FROM dbo.usuarios WHERE tokencentro = @TokenCentroParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro });
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            IDUsuario = int.Parse(lector["Maximo"].ToString());
                        }
                    }

                    PerfilesUsuario perfilUsuario = usuarioinfo.Perfiles;
                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.usuariosperfiles (idusuario, idcentro, alanon, coorddeportiva, coordmedica, coordpsicologica, coordespiritual, coorddocepasos, documentacion, fechahora, admusuario) VALUES (@IDUsuarioParam, (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @AlAnonParam, @CDeportivaParam, @CMedicaParam, @CPsicologicaParam, @CEspiritualParam, @CDocePasosParam, @CDocumentacionParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] nuevoUsuarioPerfiles =
                    {
                        new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = IDUsuario },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                        new SqlParameter("@AlAnonParam", SqlDbType.Bit) { Value = perfilUsuario.AlAnon },
                        new SqlParameter("@CDeportivaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordDeportiva },
                        new SqlParameter("@CMedicaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordMedica },
                        new SqlParameter("@CPsicologicaParam", SqlDbType.Bit) { Value = perfilUsuario.CoordPsicologica },
                        new SqlParameter("@CEspiritualParam", SqlDbType.Bit) { Value = perfilUsuario.CoordEspiritual },
                        new SqlParameter("@CDocePasosParam", SqlDbType.Bit) { Value = perfilUsuario.Cord12Pasos },
                        new SqlParameter("@CDocumentacionParam", SqlDbType.Bit) { Value = perfilUsuario.Documentacion },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(nuevoUsuarioPerfiles);
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

        // FUNCION QUE ACTUALIZA LA  CONTRASEÑA DEL USUARIO [ USUARIOS ]
        public string NuevaPassUsuario(Usuarios usuarioinfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("NuevaPassUsuario");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarios SET pass = @PassParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE tokencentro = @TokenCentroDATA AND id = @IDUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actPassUsuario =
                {
                    new SqlParameter("@PassParam", SqlDbType.VarChar) { Value = MISC.CrearMD5(usuarioinfo.Pass) },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = usuarioinfo.IdUsuario },
                };
                SQL.commandoSQL.Parameters.AddRange(actPassUsuario);
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

        // FUNCION QUE ACTIVA / DESACTIVA UN USUARIO [ USUARIOS ]
        public string ActivarDesactivarUsuario(Usuarios usuarioinfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActDesUsuario");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarios SET activo = @ActivoParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE tokencentro = @TokenCentroDATA AND id = @IDUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actDesUsuario =
                {
                    new SqlParameter("@ActivoParam", SqlDbType.Int) { Value = usuarioinfo.Activo },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = usuarioinfo.IdUsuario },
                };
                SQL.commandoSQL.Parameters.AddRange(actDesUsuario);
                SQL.commandoSQL.ExecuteNonQuery();

                string NotifUsuarioID = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokencentro = @TokenCentroDATA AND id = @IDUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDUsuarioParam", SqlDbType.Int) { Value = usuarioinfo.IdUsuario });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        NotifUsuarioID = lector["idnotificacion"].ToString();
                    }
                }

                SQL.transaccionSQL.Commit();
                Dictionary<string, object> Respuesta = new Dictionary<string, object>()
                {
                    { "Respuesta", true },
                    { "NotifUsuarioId", NotifUsuarioID },
                };
                return JsonConvert.SerializeObject(Respuesta);
            }
            catch (Exception e)
            {
                SQL.transaccionSQL.Rollback();
                Dictionary<string, object> err = new Dictionary<string, object>()
                {
                    { "Respuesta", false },
                    { "ErrorMsg", e.ToString() },
                };
                return JsonConvert.SerializeObject(err);
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE DEVUELVE LA INFO DEL USUARIO INDIVIDUAL LOGGEADO [ MENU USUARIO INDIVIDUAL ]
        public string InfoUsuarioIndividual(string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActualizarUsuario");
                Dictionary<string, object> UsuarioInfo = new Dictionary<string, object>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioParam AND tokencentro = @TokenCentroParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] UsuarioConsulta =
                {
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) {Value = tokenusuario },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) {Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(UsuarioConsulta);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        UsuarioInfo = new Dictionary<string, object>()
                        {
                            { "IdUsuario", int.Parse(lector["id"].ToString()) },
                            { "Nombre", lector["nombre"].ToString() },
                            { "Apellido", lector["apellido"].ToString() },
                            { "Correo", lector["correo"].ToString() },
                        };
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(UsuarioInfo);
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

        // FUNCION QUE MODIFICA LA INFO GENERAL DEL USUARIO [ MENU USUARIO INDIVIDUAL ]
        public string ActUsuarioInfo(Usuarios usuarioinfo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActualizarUsuario");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarios SET nombre = @NombreParam, apellido = @ApellidoParam, correo = @CorreoParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE tokencentro = @TokenCentroDATA AND tokenusuario = @TokenUsuarioDATA", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actUsuario =
                {
                    new SqlParameter("@NombreParam", SqlDbType.VarChar) { Value = usuarioinfo.Nombre },
                    new SqlParameter("@ApellidoParam", SqlDbType.VarChar) { Value = usuarioinfo.Apellido },
                    new SqlParameter("@CorreoParam", SqlDbType.VarChar) { Value = usuarioinfo.Correo },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(actUsuario);
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

        // FUNCION QUE MODIFICA CONTRASEÑA DEL USUARIO [ MENU USUARIO INDIVIDUAL ]
        public string ActUsuarioPass(UsuarioPass usuariopass, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActualizarUsuarioPass");
                string respuesta = "true";
                int UsuarioVerif = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE pass = @PassParam AND tokenusuario = @TokenUsuarioParam AND tokencentro = @TokenCentroParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] UsuarioVerifPass =
                {
                    new SqlParameter("@PassParam", SqlDbType.VarChar) {Value = MISC.CrearMD5(usuariopass.AntiguaPass) },
                    new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) {Value = tokenusuario },
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) {Value = tokencentro },
                };
                SQL.commandoSQL.Parameters.AddRange(UsuarioVerifPass);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        UsuarioVerif++;
                    }
                }

                if(UsuarioVerif > 0)
                {
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.usuarios SET pass = @PassParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA) WHERE tokencentro = @TokenCentroDATA AND tokenusuario = @TokenUsuarioDATA", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] actPassUsuario =
                    {
                        new SqlParameter("@PassParam", SqlDbType.VarChar) { Value = MISC.CrearMD5(usuariopass.NuevaPass) },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime) { Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
                    };
                    SQL.commandoSQL.Parameters.AddRange(actPassUsuario);
                    SQL.commandoSQL.ExecuteNonQuery();
                }
                else
                {
                    respuesta = "errorPass";
                }

                SQL.transaccionSQL.Commit();
                return respuesta;
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
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
    public class MDocumentacion : Controller
    {
        // ----------- CLASES Y VARIABLES PUBLICAS -----------
        // CLASE DE REGISTRO DE PACIENTE
        public class PacienteData
        {
            public string Nombre { get; set; }
            public string PacienteApellidoP { get; set; }
            public string PacienteApellidoM { get; set; }
            public string PacienteFechaNac { get; set; }
            public int Edad { get; set; }
            public string SexoSigno { get; set; }
            public string Sexo { get; set; }
            public string CURP { get; set; }
            public string PacienteAlias { get; set; }
            public string ParienteNombre { get; set; }
            public string ParienteApellidoP { get; set; }
            public string ParienteApellidoM { get; set; }
            public string ParentescoIndx { get; set; }
            public string Parentesco { get; set; }
            public double TelefonoCasa { get; set; }
            public double TelefonoPariente { get; set; }
            public double TelefonoUsuario { get; set; }
            public int Estatus { get; set; }
        }
        // CLASE DE REGISTRO DE INGRESO DEL PACIENTE
        public class PacienteIngreso
        {
            public string TipoIngreso { get; set; }
            public int TiempoEstancia { get; set; }
            public string TipoEstancia { get; set; }
            public string TipoEstanciaIndx { get; set; }
            public string TestigoNombre { get; set; }
            public string TipoTratamiento { get; set; }
            public string TipoTratamientoIndx { get; set; }
            public string FasesCantTratamiento { get; set; }
            public string FasesCantTratamientoIndx { get; set; }
            public string FasesTratamiento { get; set; }
            public string FasesTratamientoIndx { get; set; }
        }
        // CLASE DE REGISTRO DE FINANZAS DEL PACIENTE
        public class PacienteFinazasData
        {
            public double MontoPagar { get; set; }
            public string TipoMoneda { get; set; }
        }

        // ----------- FUNCIONES GENERALES -----------
        // FUNCION QUE DEVUELVE LA  LISTA DE PACIENTES EN PRE REGISTRO [ PRE-REGISTROS ]
        public string ListaPreRegistros(string tokencentro)
        {
            try
            {
                List<Dictionary<string, object>> ListaPreRegistro = new List<Dictionary<string, object>>();
                SQL.comandoSQLTrans("PacientesPagosPend");
                SQL.commandoSQL = new SqlCommand("SELECT PR.*, PP.id AS idFinanzas, PP.montototal FROM dbo.pacienteregistro PR JOIN dbo.pacienteregistrofinanzas PP ON PP.idpaciente = PR.id WHERE PR.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND PR.estatus = 1", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Preregistro = new Dictionary<string, object>()
                        {
                            { "IdFinanzas", int.Parse(lector["idFinanzas"].ToString()) },
                            { "IdPaciente", int.Parse(lector["id"].ToString()) },
                            { "Nombre", lector["nombre"].ToString() },
                            { "ApellidoP", lector["apellidopaterno"].ToString() },
                            { "ApellidoM", lector["apellidomaterno"].ToString() },
                            { "NombreCompleto", lector["nombre"].ToString().ToUpper() + " " + lector["apellidopaterno"].ToString().ToUpper()+ " " + lector["apellidomaterno"].ToString().ToUpper() },
                            { "FechaRegistro", lector["fechahora"].ToString() },
                            { "Monto", double.Parse(lector["montototal"].ToString()) }
                        };
                        ListaPreRegistro.Add(Preregistro);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaPreRegistro);
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

        // ---------------------------------------------------
        // FUNCION QUE CAMBIA EL ESTATUS DE UN PACIENTE (POSIBLEMENTE SEA MULTIUSOS)
        public string ActEstatusPaciente(int idpaciente, int estatus, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ActEstatusPaciente");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteregistro SET estatus = @EstatusDATA WHERE id = @IDPacienteDATA AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteDATA", SqlDbType.Int) { Value = idpaciente });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@EstatusDATA", SqlDbType.Int) { Value = estatus });
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
        //----------------------------------------------------

        // FUNCION QUE GUARDA EL REGISTRO DEL PACIENTE [ PREVIO ] ( :: PACIENTES ::)
        public string GuardarPacienteRegistro(PacienteData pacienteinfo, PacienteIngreso pacienteingreso, PacienteFinazasData pacientefinanzas, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("RegistrarPaciente");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistro (idcentro, idpaciente, nombre, apellidopaterno, apellidomaterno, fechanacimiento, edad, sexo, sexosigno, curp, alias, parientenombre, parienteapellidop, parienteapellidom, parentesco, parentescoindx, telefonocasa, telefonopariente, telefonousuario, estatus, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IDPacienteParam, @PacNombreParam, @PacApellidoPParam, @PacApellidoMParam, @FechaNacParam, @EdadParam, @SexoParam, @SexoSignoParam, @CURPParam, @AliasParam, @ParNombreParam, @ParApellidoPParam, @ParApellidoMParam, @ParentescoParam, @ParentescoIndxParam, @TelefonoCasaParam, @TelefonoParienteParam, @TelefonoUsuParam, @EstatusParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] registroPaciente =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IDPacienteParam", SqlDbType.VarChar){Value = "IP-" + MISC.CrearCadAleatoria(2, 8).ToUpper() },
                    new SqlParameter("@PacNombreParam", SqlDbType.VarChar){Value = pacienteinfo.Nombre },
                    new SqlParameter("@PacApellidoPParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteApellidoP },
                    new SqlParameter("@PacApellidoMParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteApellidoM },
                    new SqlParameter("@FechaNacParam", SqlDbType.DateTime){Value = pacienteinfo.PacienteFechaNac },
                    new SqlParameter("@EdadParam", SqlDbType.Float){Value = pacienteinfo.Edad },
                    new SqlParameter("@SexoParam", SqlDbType.VarChar){Value = pacienteinfo.Sexo },
                    new SqlParameter("@SexoSignoParam", SqlDbType.VarChar){Value = pacienteinfo.SexoSigno },
                    new SqlParameter("@CURPParam", SqlDbType.VarChar){Value = pacienteinfo.CURP },
                    new SqlParameter("@AliasParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteAlias },
                    new SqlParameter("@ParNombreParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteNombre },
                    new SqlParameter("@ParApellidoPParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteApellidoP },
                    new SqlParameter("@ParApellidoMParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteApellidoM },
                    new SqlParameter("@ParentescoParam", SqlDbType.VarChar){Value = pacienteinfo.Parentesco },
                    new SqlParameter("@ParentescoIndxParam", SqlDbType.VarChar){Value = pacienteinfo.ParentescoIndx },
                    new SqlParameter("@TelefonoCasaParam", SqlDbType.Float){Value = pacienteinfo.TelefonoCasa },
                    new SqlParameter("@TelefonoParienteParam", SqlDbType.Float){Value = pacienteinfo.TelefonoPariente },
                    new SqlParameter("@TelefonoUsuParam", SqlDbType.Float){Value = pacienteinfo.TelefonoUsuario },
                    new SqlParameter("@EstatusParam", SqlDbType.Int){Value = pacienteinfo.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(registroPaciente);
                SQL.commandoSQL.ExecuteNonQuery();

                string SiglaLegal = "", NombreCentro = "", ClaveCentro = "", DireccionCentro = "", CPCentro = "", ColoniaCentro = "", EstadoCentro = "", MunicipioCentro = "", Director = "", LogoCad = "";
                double TelefonoCentro = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE id = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        SiglaLegal = lector["siglalegal"].ToString();
                        NombreCentro = lector["nombrecentro"].ToString();
                        ClaveCentro = lector["clavecentro"].ToString();
                        DireccionCentro = lector["direccion"].ToString();
                        CPCentro = lector["cp"].ToString();
                        ColoniaCentro = lector["colonia"].ToString();
                        EstadoCentro = lector["estado"].ToString();
                        MunicipioCentro = lector["municipio"].ToString();
                        Director = lector["nombredirector"].ToString();
                        TelefonoCentro = double.Parse(lector["telefono"].ToString());

                        if (bool.Parse(lector["logopersonalizado"].ToString()))
                        {
                            LogoCad = "«~LOGOPERS~»";
                        }
                        if (bool.Parse(lector["alanonlogo"].ToString()))
                        {
                            LogoCad = "«~LOGOALANON~»";
                        }
                    }
                }

                int IdPaciente = 0;
                SQL.commandoSQL = new SqlCommand("SELECT MAX(id) AS PacienteNuevo FROM dbo.pacienteregistro", SQL.conSQL, SQL.transaccionSQL);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IdPaciente = int.Parse(lector["PacienteNuevo"].ToString());
                    }
                }

                string folioContrato = ((pacienteingreso.TipoIngreso == "I") ? "CI" : "CV") + "-" + SiglaLegal + MISC.CrearCadAleatoria(2, 8);
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteingreso (idcentro, idpaciente, tipoingreso, foliocontrato, tiempoestancia, tipoestancia, tipoestanciaindx, nombretestigo, tipotratamiento, tipotratamientoindx, fasescantratamiento, fasescantratamientoindx, fasestratamiento, fasestratamientoindx, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IdPacienteParam, @TipoIngresoParam, @FolioContratoParam, @TiempoEstanciaParam, @TipoEstanciaParam, @TipoEstanciaIndxParam, @TestigoNombreParam, @TipoTratamientoParam, @TipoTratamientoIndxParam, @FasesCanTratamientoParam, @FasesCanTratamientoIndxParam, @FasesTratamientoParam, @FasesTratamientoIndxParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] registroPacienteIngreso =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdPacienteParam", SqlDbType.Int){Value = IdPaciente },
                    new SqlParameter("@TipoIngresoParam", SqlDbType.VarChar){Value = pacienteingreso.TipoIngreso },
                    new SqlParameter("@FolioContratoParam", SqlDbType.VarChar){Value = folioContrato },
                    new SqlParameter("@TiempoEstanciaParam", SqlDbType.Int){Value = pacienteingreso.TiempoEstancia },
                    new SqlParameter("@TipoEstanciaParam", SqlDbType.VarChar){Value = pacienteingreso.TipoEstancia },
                    new SqlParameter("@TipoEstanciaIndxParam", SqlDbType.VarChar){Value = pacienteingreso.TipoEstanciaIndx },
                    new SqlParameter("@TestigoNombreParam", SqlDbType.VarChar){Value = pacienteingreso.TestigoNombre },
                    new SqlParameter("@TipoTratamientoParam", SqlDbType.VarChar){Value = pacienteingreso.TipoTratamiento },
                    new SqlParameter("@TipoTratamientoIndxParam", SqlDbType.VarChar){Value = pacienteingreso.TipoTratamientoIndx },
                    new SqlParameter("@FasesCanTratamientoParam", SqlDbType.VarChar){Value = pacienteingreso.FasesCantTratamiento },
                    new SqlParameter("@FasesCanTratamientoIndxParam", SqlDbType.VarChar){Value = pacienteingreso.FasesCantTratamientoIndx },
                    new SqlParameter("@FasesTratamientoParam", SqlDbType.VarChar){Value = pacienteingreso.FasesTratamiento },
                    new SqlParameter("@FasesTratamientoIndxParam", SqlDbType.VarChar){Value = pacienteingreso.FasesTratamientoIndx },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(registroPacienteIngreso);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistrofinanzas (idcentro, idpaciente, montototal, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @IdPacienteParam, @MontoTotalParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] registroPacienteFinanzas =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdPacienteParam", SqlDbType.Int){Value = IdPaciente },
                    new SqlParameter("@MontoTotalParam", SqlDbType.Float){Value = pacientefinanzas.MontoPagar },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario }
                };
                SQL.commandoSQL.Parameters.AddRange(registroPacienteFinanzas);
                SQL.commandoSQL.ExecuteNonQuery();

                Dictionary<string, object> Contrato = new Dictionary<string, object>() {
                    { "TipoContrato", pacienteingreso.TipoIngreso },
                    { "FolioContrato", folioContrato },
                    { "NombrePaciente", pacienteinfo.Nombre.ToUpper() + " " + pacienteinfo.PacienteApellidoP.ToUpper() + " " + pacienteinfo.PacienteApellidoM.ToUpper() },
                    { "NombreCentro", NombreCentro.ToUpper() },
                    { "ClaveCentro", ClaveCentro.ToUpper() },
                    { "FechaIngreso",  MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                    { "SexoPaciente", pacienteinfo.Sexo.ToUpper() },
                    { "EdadPaciente", pacienteinfo.Edad.ToString() },
                    { "DomicilioDoc", DireccionCentro + " Colonia: " + ColoniaCentro + " - C.P. " + CPCentro + ", " + MunicipioCentro + ", " + EstadoCentro },
                    { "Estancia", pacienteingreso.TiempoEstancia.ToString() + " " + pacienteingreso.TipoEstancia },
                    { "MontoPago", pacientefinanzas.MontoPagar },
                    { "TipoMoneda", pacientefinanzas.TipoMoneda },
                    { "FechaFirma",  MISC.FechaHoy().ToString("dddd, dd MMMM yyyy") },
                    { "Estado", EstadoCentro },
                    { "Municipio", MunicipioCentro },
                    { "NombreDirector", Director.ToUpper() },
                    { "Testigo", pacienteingreso.TestigoNombre.ToUpper() },
                    { "FamiliarNombre", pacienteinfo.ParienteNombre.ToUpper() + " " + pacienteinfo.ParienteApellidoP.ToUpper() + " " + pacienteinfo.ParienteApellidoM.ToUpper() },
                    { "Parentesco", pacienteinfo.Parentesco },
                    { "TipoTratamiento", pacienteingreso.TipoTratamiento },
                    { "NumeroExpediente", MISC.CadExpediente(IdPaciente) },
                    { "FasesCantTratamiento", pacienteingreso.FasesCantTratamiento },
                    { "FasesTratamiento", pacienteingreso.FasesTratamiento },
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(Contrato) + LogoCad;
            }
            catch(Exception e)
            {
                SQL.transaccionSQL.Rollback();
                return e.ToString();
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE REIMPRIME UN CONTRATO - PREREGISTRO [ PACIENTES ]
        public string ReimprimirContrato(int idpaciente, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ReimprimirContrato");
                string SiglaLegal = "", NombreCentro = "", ClaveCentro = "", DireccionCentro = "", CPCentro = "", ColoniaCentro = "", EstadoCentro = "", MunicipioCentro = "", Director = "", LogoCad = "";
                double TelefonoCentro = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE id = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        SiglaLegal = lector["siglalegal"].ToString();
                        NombreCentro = lector["nombrecentro"].ToString();
                        ClaveCentro = lector["clavecentro"].ToString();
                        DireccionCentro = lector["direccion"].ToString();
                        CPCentro = lector["cp"].ToString();
                        ColoniaCentro = lector["colonia"].ToString();
                        EstadoCentro = lector["estado"].ToString();
                        MunicipioCentro = lector["municipio"].ToString();
                        Director = lector["nombredirector"].ToString();
                        TelefonoCentro = double.Parse(lector["telefono"].ToString());

                        if (bool.Parse(lector["logopersonalizado"].ToString()))
                        {
                            LogoCad = "«~LOGOPERS~»";
                        }
                        if (bool.Parse(lector["alanonlogo"].ToString()))
                        {
                            LogoCad = "«~LOGOALANON~»";
                        }
                    }
                }

                string NombrePaciente = "", ApellidoPacienteP = "", ApellidoPacienteM = "", SexoPaciente = "", EdadPaciente = "", ParienteNombre = "", ParienteApP = "", ParienteApM = "", Parentesco = "";
                DateTime FechaIngreso = new DateTime();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDPacienteDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteDATA", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        NombrePaciente = lector["nombre"].ToString();
                        ApellidoPacienteP = lector["apellidopaterno"].ToString();
                        ApellidoPacienteM = lector["apellidomaterno"].ToString();
                        SexoPaciente = lector["sexo"].ToString();
                        FechaIngreso = DateTime.Parse(lector["fechahora"].ToString());
                        EdadPaciente = lector["edad"].ToString();
                        ParienteNombre = lector["parientenombre"].ToString();
                        ParienteApP = lector["parienteapellidop"].ToString();
                        ParienteApM = lector["parienteapellidom"].ToString();
                        Parentesco = lector["parentesco"].ToString();
                    }
                }

                string FolioContrato = "", TipoIngreso = "", TiempoEstancia = "", TipoEstancia = "", TestigoNombre = "", TipoTratamiento = "", FasesCantTratamiento = "", FasesTratamiento = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteingreso WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IDPacienteDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteDATA", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        FolioContrato = lector["foliocontrato"].ToString();
                        TipoIngreso = lector["tipoingreso"].ToString();
                        TiempoEstancia = lector["tiempoestancia"].ToString();
                        TipoEstancia = lector["tipoestancia"].ToString();
                        TestigoNombre = lector["nombretestigo"].ToString();
                        TipoTratamiento = lector["tipotratamiento"].ToString();
                        FasesCantTratamiento = lector["fasescantratamiento"].ToString();
                        FasesTratamiento = lector["fasestratamiento"].ToString();
                    }
                }

                string TipoMoneda = "PESOS MEXICANOS";
                double MontoPagar = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistrofinanzas WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IDPacienteDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteDATA", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        MontoPagar = double.Parse(lector["montototal"].ToString());
                    }
                }

                Dictionary<string, object> Contrato = new Dictionary<string, object>() {
                    { "TipoContrato", TipoIngreso },
                    { "FolioContrato", FolioContrato },
                    { "NombrePaciente", NombrePaciente.ToUpper() + " " + ApellidoPacienteP.ToUpper() + " " + ApellidoPacienteM.ToUpper() },
                    { "NombreCentro", NombreCentro.ToUpper() },
                    { "ClaveCentro", ClaveCentro.ToUpper() },
                    { "FechaIngreso",  FechaIngreso.ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                    { "SexoPaciente", SexoPaciente.ToUpper() },
                    { "EdadPaciente", EdadPaciente.ToString() },
                    { "DomicilioDoc", DireccionCentro + " Colonia: " + ColoniaCentro + " - C.P. " + CPCentro + ", " + MunicipioCentro + ", " + EstadoCentro },
                    { "Estancia", TiempoEstancia + " " + TipoEstancia },
                    { "MontoPago", MontoPagar },
                    { "TipoMoneda", TipoMoneda },
                    { "FechaFirma",  MISC.FechaHoy().ToString("dddd, dd MMMM yyyy") },
                    { "Estado", EstadoCentro },
                    { "Municipio", MunicipioCentro },
                    { "NombreDirector", Director.ToUpper() },
                    { "Testigo",TestigoNombre.ToUpper() },
                    { "FamiliarNombre", ParienteNombre.ToUpper() + " " + ParienteApP.ToUpper() + " " + ParienteApM.ToUpper() },
                    { "Parentesco", Parentesco },
                    { "TipoTratamiento", TipoTratamiento },
                    { "NumeroExpediente", MISC.CadExpediente(idpaciente) },
                    { "FasesCantTratamiento", FasesCantTratamiento },
                    { "FasesTratamiento", FasesTratamiento },
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(Contrato) + LogoCad;
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

        // FUNCION QUE DEVUELVE LA LISTA DE PACIENTES CON PAGOS PENDIENTES ( :: ADMINISTRACION ::)
        public string ListaPacientesPagosPendientes(string consulta, string tokencentro)
        {
            try
            {
                List<Dictionary<string, object>> ListaPacientesPagos = new List<Dictionary<string, object>>();
                SQL.comandoSQLTrans("PacientesPagosPend");
                SQL.commandoSQL = new SqlCommand("SELECT PR.*, PP.id AS idFinanzas, PP.montototal FROM dbo.pacienteregistro PR JOIN dbo.pacienteregistrofinanzas PP ON PP.idpaciente = PR.id WHERE PR.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND PR.estatus > 1 AND (UPPER(PR.idpaciente) + ' ' + UPPER(PR.nombre) + ' ' + UPPER(PR.apellidopaterno) + ' ' + UPPER(PR.apellidomaterno)) LIKE @ConsultaDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@ConsultaDATA", SqlDbType.VarChar) { Value = "%" + consulta + "%" });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Pacientes = new Dictionary<string, object>()
                        {
                            { "ClavePaciente", lector["idpaciente"].ToString() },
                            { "IdFinanzas", int.Parse(lector["idFinanzas"].ToString()) },
                            { "IdPaciente", int.Parse(lector["id"].ToString()) },
                            { "Nombre", lector["nombre"].ToString() },
                            { "ApellidoP", lector["apellidopaterno"].ToString() },
                            { "ApellidoM", lector["apellidomaterno"].ToString() },
                            { "NombreCompleto", lector["nombre"].ToString().ToUpper() + " " + lector["apellidopaterno"].ToString().ToUpper()+ " " + lector["apellidomaterno"].ToString().ToUpper() },
                            { "FechaRegistro", lector["fechahora"].ToString() },
                            { "Monto", double.Parse(lector["montototal"].ToString()) }
                        };
                        ListaPacientesPagos.Add(Pacientes);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaPacientesPagos);
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
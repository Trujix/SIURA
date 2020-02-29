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
            public string CURP { get; set; }
            public string PacienteAlias { get; set; }
            public string ParienteNombre { get; set; }
            public string ParienteApellidoP { get; set; }
            public string ParienteApellidoM { get; set; }
            public double TelefonoCasa { get; set; }
            public double TelefonoPariente { get; set; }
            public double TelefonoUsuario { get; set; }
            public int Estatus { get; set; }
        }
        // CLASE DE REGISTRO DE FINANZAS DEL PACIENTE
        public class PacienteFinazasData
        {
            public double MontoPagar { get; set; }
        }

        // CLASE DE PAGOS PACIENTES
        public class PacientePagos
        {
            public int IdFinanzas { get; set; }
            public double MontoPago { get; set; }
            public string FolRefDesc { get; set; }
        }

        // ----------- FUNCIONES GENERALES -----------

        // FUNCION QUE GUARDA EL REGISTRO DEL PACIENTE [ PREVIO ] ( :: PACIENTES ::)
        public string GuardarPacienteRegistro(PacienteData pacienteinfo, PacienteFinazasData pacientefinanzas, string tokenusuario)
        {
            try
            {
                SQL.comandoSQLTrans("RegistrarPaciente");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistro (idusuario, nombre, apellidopaterno, apellidomaterno, fechanacimiento, edad, curp, alias, parientenombre, parienteapellidop, parienteapellidom, telefonocasa, telefonopariente, telefonousuario, estatus, fechahora, admusuario) VALUES ((SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenParam), @PacNombreParam, @PacApellidoPParam, @PacApellidoMParam, @FechaNacParam, @EdadParam, @CURPParam, @AliasParam, @ParNombreParam, @ParApellidoPParam, @ParApellidoMParam, @TelefonoCasaParam, @TelefonoParienteParam, @TelefonoUsuParam, @EstatusParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] registroPaciente =
                {
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@PacNombreParam", SqlDbType.VarChar){Value = pacienteinfo.Nombre },
                    new SqlParameter("@PacApellidoPParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteApellidoP },
                    new SqlParameter("@PacApellidoMParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteApellidoM },
                    new SqlParameter("@FechaNacParam", SqlDbType.DateTime){Value = pacienteinfo.PacienteFechaNac },
                    new SqlParameter("@EdadParam", SqlDbType.Float){Value = pacienteinfo.Edad },
                    new SqlParameter("@CURPParam", SqlDbType.VarChar){Value = pacienteinfo.CURP },
                    new SqlParameter("@AliasParam", SqlDbType.VarChar){Value = pacienteinfo.PacienteAlias },
                    new SqlParameter("@ParNombreParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteNombre },
                    new SqlParameter("@ParApellidoPParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteApellidoP },
                    new SqlParameter("@ParApellidoMParam", SqlDbType.VarChar){Value = pacienteinfo.ParienteApellidoM },
                    new SqlParameter("@TelefonoCasaParam", SqlDbType.Float){Value = pacienteinfo.TelefonoCasa },
                    new SqlParameter("@TelefonoParienteParam", SqlDbType.Float){Value = pacienteinfo.TelefonoPariente },
                    new SqlParameter("@TelefonoUsuParam", SqlDbType.Float){Value = pacienteinfo.TelefonoUsuario },
                    new SqlParameter("@EstatusParam", SqlDbType.Int){Value = pacienteinfo.Estatus },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() }
                };
                SQL.commandoSQL.Parameters.AddRange(registroPaciente);
                SQL.commandoSQL.ExecuteNonQuery();

                if(pacienteinfo.Estatus > 0)
                {
                    int IdPaciente = 0;
                    SQL.commandoSQL = new SqlCommand("SELECT MAX(id) AS PacienteNuevo FROM dbo.pacienteregistro", SQL.conSQL, SQL.transaccionSQL);
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            IdPaciente = int.Parse(lector["PacienteNuevo"].ToString());
                        }
                    }

                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistrofinanzas (idusuario, idpaciente, montototal, fechahora, admusuario) VALUES ((SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenParam), @IdPacienteParam, @MontoTotalParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] registroPacienteFinanzas =
                    {
                        new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                        new SqlParameter("@IdPacienteParam", SqlDbType.Int){Value = IdPaciente },
                        new SqlParameter("@MontoTotalParam", SqlDbType.Int){Value = pacientefinanzas.MontoPagar },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() }
                    };
                    SQL.commandoSQL.Parameters.AddRange(registroPacienteFinanzas);
                    SQL.commandoSQL.ExecuteNonQuery();
                }

                SQL.transaccionSQL.Commit();
                return "true";
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

        // FUNCION QUE DEVUELVE LA LISTA DE PACIENTES CON PAGOS PENDIENTES ( :: ADMINISTRACION ::)
        public string ListaPacientesPagosPendientes(string tokenusuario)
        {
            try
            {
                List<Dictionary<string, object>> ListaPacientesPagos = new List<Dictionary<string, object>>();
                SQL.comandoSQLTrans("PacientesPagosPend");
                SQL.commandoSQL = new SqlCommand("SELECT PR.*, PP.id AS idFinanzas, PP.montototal FROM dbo.pacienteregistro PR JOIN dbo.pacienteregistrofinanzas PP ON PP.idpaciente = PR.id WHERE PR.idusuario = (SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenDATA) AND PR.estatus = 1", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenDATA", SqlDbType.VarChar) { Value = tokenusuario });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Paciente = new Dictionary<string, object>()
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
                        ListaPacientesPagos.Add(Paciente);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaPacientesPagos);
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

        // FUNCION QUE DEVUELVE LA LISTA DE PAGOS DEL PACIENTE
        public string ListaPagosPaciente(int idfinanzas, string tokenusuario)
        {
            try
            {
                SQL.comandoSQLTrans("PacientePagosLista");
                List<Dictionary<string, object>> ListaPagos = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistropagos WHERE idfinanzas = @IdFinanzasParam AND idusuario = (SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenDATA)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pagosPacienteFinanzas =
                {
                    new SqlParameter("@TokenDATA", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = idfinanzas }
                };
                SQL.commandoSQL.Parameters.AddRange(pagosPacienteFinanzas);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Pago = new Dictionary<string, object>()
                        {
                            { "IdPago", int.Parse(lector["id"].ToString()) },
                            { "FechaRegistro", lector["fechahora"].ToString() },
                            { "Pago", double.Parse(lector["montopago"].ToString()) }
                        };
                        ListaPagos.Add(Pago);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaPagos);
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

        // FUNCION QUE REALIZA EL PAGO DE UN PACIENTE
        public string GenerarPagoPaciente(PacientePagos pacientepago, string tokenusuario)
        {
            try
            {
                SQL.comandoSQLTrans("PagoPaciente");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistropagos (idusuario, idfinanzas, montopago, folrefdesc, fechahora, admusuario) VALUES ((SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenDATA), @IdFinanzasParam, @MontoPagoParam, @FolRefDescParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenDATA))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pagoPaciente =
                {
                    new SqlParameter("@TokenDATA", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = pacientepago.IdFinanzas },
                    new SqlParameter("@MontoPagoParam", SqlDbType.Float){Value = pacientepago.MontoPago },
                    new SqlParameter("@FolRefDescParam", SqlDbType.VarChar){Value = pacientepago.FolRefDesc },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() }
                };
                SQL.commandoSQL.Parameters.AddRange(pagoPaciente);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteregistro SET estatus = 2 WHERE id = (SELECT idpaciente FROM dbo.pacienteregistrofinanzas WHERE id = @IdFinanzasParam)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IdFinanzasParam", SqlDbType.Int) { Value = pacientepago.IdFinanzas });
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
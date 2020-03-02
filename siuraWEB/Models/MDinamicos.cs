using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Data;

namespace siuraWEB.Models
{
    public class MDinamicos : Controller
    {
        // ------ CLASES PUBLICAS ------------
        // CLASE DE PAGOS PACIENTES
        public class PacientePagos
        {
            public int IdFinanzas { get; set; }
            public double MontoPago { get; set; }
            public string FolRefDesc { get; set; }
        }

        // ---------- FUNCIONES --------------

        // FUNCION QUE DEVUELVE EL RESULTADO DE LA CONSULTA DE PACIENTES
        public string ConsultaDinamicaPacientes(string consultapaciente, int estatus, string tokenusuario)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteConsulta");

                List<Dictionary<string, object>> PacientesLista = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM pacienteregistro WHERE (UPPER(nombre) + ' ' + UPPER(apellidopaterno) + ' ' + UPPER(apellidomaterno)) LIKE @PacienteParam AND idusuario = (SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenDATA) AND estatus > @EstatusParam ORDER BY nombre ASC", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteConsulta =
                {
                    new SqlParameter("@PacienteParam", SqlDbType.VarChar) { Value = "%" + consultapaciente + "%" },
                    new SqlParameter("@TokenDATA", SqlDbType.VarChar) { Value = tokenusuario },
                    new SqlParameter("@EstatusParam", SqlDbType.Int) { Value = estatus }
                };
                SQL.commandoSQL.Parameters.AddRange(pacienteConsulta);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> paciente = new Dictionary<string, object>()
                        {
                            { "IdUsuario", int.Parse(lector["id"].ToString()) },
                            { "Nombre", lector["nombre"].ToString() },
                            { "ApellidoP", lector["apellidopaterno"].ToString() },
                            { "ApellidoM", lector["apellidomaterno"].ToString() },
                            { "NombreCompleto", lector["nombre"].ToString().ToUpper() + " " + lector["apellidopaterno"].ToString().ToUpper() + " " + lector["apellidomaterno"].ToString().ToUpper() }
                        };
                        PacientesLista.Add(paciente);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(PacientesLista);
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
                            { "Folio", lector["folio"].ToString() },
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
                string folioPago = "CP-" + MISC.CrearCadAleatoria(2, 12).ToUpper();
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistropagos (idusuario, idfinanzas, folio, montopago, folrefdesc, fechahora, admusuario) VALUES ((SELECT id FROM dbo.usuarios WHERE tokenusuario = @TokenDATA), @IdFinanzasParam, @FolioParam, @MontoPagoParam, @FolRefDescParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenDATA))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pagoPaciente =
                {
                    new SqlParameter("@TokenDATA", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = pacientepago.IdFinanzas },
                    new SqlParameter("@FolioParam", SqlDbType.VarChar){Value = folioPago },
                    new SqlParameter("@MontoPagoParam", SqlDbType.Float){Value = pacientepago.MontoPago },
                    new SqlParameter("@FolRefDescParam", SqlDbType.VarChar){Value = pacientepago.FolRefDesc },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() }
                };
                SQL.commandoSQL.Parameters.AddRange(pagoPaciente);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteregistro SET estatus = 2 WHERE id = (SELECT idpaciente FROM dbo.pacienteregistrofinanzas WHERE id = @IdFinanzasParam)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IdFinanzasParam", SqlDbType.Int) { Value = pacientepago.IdFinanzas });
                SQL.commandoSQL.ExecuteNonQuery();

                Dictionary<string, object> respuesta = new Dictionary<string, object>() {
                    { "FolioPago", folioPago },
                    { "MontoPago", pacientepago.MontoPago },
                    { "NombreCentro", "CENTRO REHABILITACION S.A. DE C.V." },
                    { "FechaEmision", MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                    { "Telefono", "3121234567" },
                    { "DireccionCentro", "Calle #210 Colonia 123456" },
                    { "CedulaPaciente", "IP-ABC12345" }
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(respuesta);
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
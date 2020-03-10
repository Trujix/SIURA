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
            public string TipoPago { get; set; }
            public string FolRefDesc { get; set; }
        }

        // ---------- FUNCIONES --------------

        // FUNCION QUE DEVUELVE EL RESULTADO DE LA CONSULTA DE PACIENTES
        public string ConsultaDinamicaPacientes(string consultapaciente, int estatus, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteConsulta");

                List<Dictionary<string, object>> PacientesLista = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM pacienteregistro WHERE (UPPER(nombre) + ' ' + UPPER(apellidopaterno) + ' ' + UPPER(apellidomaterno)) LIKE @PacienteParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND estatus > @EstatusParam ORDER BY nombre ASC", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteConsulta =
                {
                    new SqlParameter("@PacienteParam", SqlDbType.VarChar) { Value = "%" + consultapaciente + "%" },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro },
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
                            { "Estatus", int.Parse(lector["estatus"].ToString()) },
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
        public string ListaPagosPaciente(int idfinanzas, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacientePagosLista");
                List<Dictionary<string, object>> ListaPagos = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistropagos WHERE idfinanzas = @IdFinanzasParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pagosPacienteFinanzas =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
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
                            { "Pago", double.Parse(lector["montopago"].ToString()) },
                            { "TipoPago", lector["tipopago"].ToString() },
                            { "Referencia", lector["folrefdesc"].ToString() }
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
        public string GenerarPagoPaciente(PacientePagos pacientepago, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PagoPaciente");
                string folioPago = "CP-" + MISC.CrearCadAleatoria(2, 12).ToUpper();
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteregistropagos (idcentro, idfinanzas, folio, montopago, tipopago, folrefdesc, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @IdFinanzasParam, @FolioParam, @MontoPagoParam, @TipoPagoParam, @FolRefDescParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenDATA))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pagoPaciente =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = pacientepago.IdFinanzas },
                    new SqlParameter("@FolioParam", SqlDbType.VarChar){Value = folioPago },
                    new SqlParameter("@MontoPagoParam", SqlDbType.Float){Value = pacientepago.MontoPago },
                    new SqlParameter("@TipoPagoParam", SqlDbType.VarChar){Value = pacientepago.TipoPago },
                    new SqlParameter("@FolRefDescParam", SqlDbType.VarChar){Value = pacientepago.FolRefDesc },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenDATA", SqlDbType.VarChar){Value = tokenusuario },
                };
                SQL.commandoSQL.Parameters.AddRange(pagoPaciente);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteregistro SET estatus = 2 WHERE id = (SELECT idpaciente FROM dbo.pacienteregistrofinanzas WHERE id = @IdFinanzasParam)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IdFinanzasParam", SqlDbType.Int) { Value = pacientepago.IdFinanzas });
                SQL.commandoSQL.ExecuteNonQuery();

                string ClavePaciente = "";
                SQL.commandoSQL = new SqlCommand("SELECT P.idpaciente FROM dbo.pacienteregistrofinanzas PF JOIN dbo.pacienteregistro P ON P.id = PF.idpaciente WHERE PF.id = @IDFinanzasParam AND PF.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFinanzasParam", SqlDbType.Int) { Value = pacientepago.IdFinanzas });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        ClavePaciente = lector["idpaciente"].ToString();
                    }
                }

                Dictionary<string, object> respuesta = new Dictionary<string, object>();
                string LogoCad = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        respuesta = new Dictionary<string, object>() {
                            { "FolioPago", folioPago },
                            { "MontoPago", pacientepago.MontoPago },
                            { "NombreCentro", lector["nombrecentro"].ToString() },
                            { "Clave", lector["clavecentro"].ToString() },
                            { "FechaEmision", MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                            { "Telefono", double.Parse(lector["telefono"].ToString()) },
                            { "Estado", lector["estado"].ToString() },
                            { "Municipio", lector["municipio"].ToString() },
                            { "DireccionCentro", lector["direccion"].ToString() },
                            { "CedulaPaciente", ClavePaciente }
                        };
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

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(respuesta) + LogoCad;
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

        // FUNCION QUE REIMPRIME EL RECIBO DE PAGO DE UN PACIENTE
        public string ReimprimirRecibo(int idpago, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ReimprimirPago");
                string folioPago = "", clavePaciente = "", tipoPago = "";
                double montoPago = 0;
                SQL.commandoSQL = new SqlCommand("SELECT PP.*, P.idpaciente AS ClavePaciente FROM dbo.pacienteregistropagos PP JOIN dbo.pacienteregistrofinanzas PF ON PF.id = PP.idfinanzas JOIN dbo.pacienteregistro P ON P.id = PF.idpaciente WHERE PP.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND PP.id = @IDPagoParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPagoParam", SqlDbType.Int) { Value = idpago });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        folioPago = lector["folio"].ToString();
                        clavePaciente = lector["ClavePaciente"].ToString();
                        montoPago = double.Parse(lector["montopago"].ToString());
                        tipoPago = lector["tipopago"].ToString();
                    }
                }

                Dictionary<string, object> recibo = new Dictionary<string, object>();
                string LogoCad = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        recibo = new Dictionary<string, object>() {
                            { "FolioPago", folioPago },
                            { "MontoPago", montoPago },
                            { "TipoPago", tipoPago },
                            { "NombreCentro", lector["nombrecentro"].ToString() },
                            { "Clave", lector["clavecentro"].ToString() },
                            { "FechaEmision", MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                            { "Telefono", double.Parse(lector["telefono"].ToString()) },
                            { "Estado", lector["estado"].ToString() },
                            { "Municipio", lector["municipio"].ToString() },
                            { "DireccionCentro", lector["direccion"].ToString() },
                            { "CedulaPaciente", clavePaciente }
                        };
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

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(recibo) + LogoCad;
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
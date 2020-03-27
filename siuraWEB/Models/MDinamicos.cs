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
        // CLASE DE CARGOS ADICIONALES
        public class CargoAdicional
        {
            public int IdFinanzas { get; set; }
            public double Importe { get; set; }
            public string Descripcion { get; set; }
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
                            { "IdPaciente", int.Parse(lector["id"].ToString()) },
                            { "Nombre", lector["nombre"].ToString() },
                            { "ClavePaciente", lector["idpaciente"].ToString() },
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
                bool Becario = false;
                string BecaValor = "", BecaTipo = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistrofinanzas WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IdFinanzasParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteFinanzasConsulta =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = idfinanzas }
                };
                SQL.commandoSQL.Parameters.AddRange(pacienteFinanzasConsulta);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Becario = bool.Parse(lector["becario"].ToString());
                        BecaValor = lector["becavalor"].ToString();
                        BecaTipo = lector["becatipo"].ToString();
                    }
                }

                string IDClavePaciente = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteregistro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = (SELECT idpaciente FROM dbo.pacienteregistrofinanzas WHERE id = @IdFinanzasParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteInfoConsulta =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = idfinanzas }
                };
                SQL.commandoSQL.Parameters.AddRange(pacienteInfoConsulta);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IDClavePaciente = lector["idpaciente"].ToString();
                    }
                }

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

                List<Dictionary<string, object>> ListaCargos = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacientecargosadicionales WHERE idfinanzas = @IdFinanzasParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] cargosPacienteFinanzas =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = idfinanzas }
                };
                SQL.commandoSQL.Parameters.AddRange(cargosPacienteFinanzas);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Cargo = new Dictionary<string, object>()
                        {
                            { "Folio", lector["folio"].ToString() },
                            { "IdCargo", int.Parse(lector["id"].ToString()) },
                            { "FechaRegistro", lector["fechahora"].ToString() },
                            { "Descripcion", lector["descripcion"].ToString() },
                            { "Importe", double.Parse(lector["importe"].ToString()) },
                            { "CargoInicial", bool.Parse(lector["cargoinicial"].ToString()) },
                            { "Pagado", bool.Parse(lector["pagado"].ToString()) }
                        };
                        ListaCargos.Add(Cargo);
                    }
                }

                Dictionary<string, object> ListaFinanzasPaciente = new Dictionary<string, object>()
                {
                    { "Pagos", ListaPagos },
                    { "Cargos", ListaCargos },
                    { "Becario", Becario },
                    { "BecaValor", BecaValor },
                    { "BecaTipo", BecaTipo },
                    { "BecaComprobante", "«~BECAçCOMPROBANTE~»" },
                    { "UrlFolderUsuario", "«~URLçUSUARIO~»" },
                    { "ClavePaciente", IDClavePaciente },
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaFinanzasPaciente) + "⌂" + IDClavePaciente;
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

        // FUNCION QUE GENERA UN NUEVO CARGO ADICIONAL
        public string NuevoCargoAdicional(CargoAdicional cargoadicional, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("NuevoCargoAdicional");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacientecargosadicionales (idcentro, idfinanzas, folio, descripcion, importe, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @IdFinanzasParam, @FolioParam, @DescripcionParam, @ImporteParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] cargoAdicional =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IdFinanzasParam", SqlDbType.Int){Value = cargoadicional.IdFinanzas },
                    new SqlParameter("@FolioParam", SqlDbType.VarChar){Value = "CA-" + MISC.CrearCadAleatoria(2, 8).ToUpper() },
                    new SqlParameter("@DescripcionParam", SqlDbType.VarChar){Value = cargoadicional.Descripcion },
                    new SqlParameter("@ImporteParam", SqlDbType.Float){Value = cargoadicional.Importe },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                };
                SQL.commandoSQL.Parameters.AddRange(cargoAdicional);
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
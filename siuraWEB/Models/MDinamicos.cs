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
        // CLASE DE PAGOS DE CARGO ADICIONAL
        public class PagoCargoAdicional
        {
            public int IdCargo { get; set; }
            public string TipoPago { get; set; }
            public string DescFolRefPago { get; set; }
        }
        // CLASE DE ARTICULO DE INVENTARIO
        public class InventarioArticulo
        {
            public int IdArticuloInventario { get; set; }
            public string Codigo { get; set; }
            public string Nombre { get; set; }
            public string Presentacion { get; set; }
            public double PrecioCompra { get; set; }
            public double PrecioVenta { get; set; }
            public double Existencias { get; set; }
            public double Stock { get; set; }
            public string Area { get; set; }
            public bool CodigoAuto { get; set; }
            public string Usuario { get; set; }
            public string FechaTxt { get; set; }
            public string FechaBusquedaIni { get; set; }
            public string FechaBusquedaFin { get; set; }
        }
        // CLASE PARA LA IMPRESION DE INVENTARIO (CLIENTE)
        public class InventarioImpresionData
        {
            public string Area { get; set; }
            public string Gestion { get; set; }
            public string Formato { get; set; }
            public string FechaInicio { get; set; }
            public string FechaFin { get; set; }
        }
        // CLASE PARA LA IMPRESION DE INVENTARIO (SERVIDOR)
        public class InventarioImpresionInfo
        {
            public bool Correcto { get; set; }
            public string NombreCentro { get; set; }
            public string Direccion { get; set; }
            public string Telefono { get; set; }
            public string CodigoPostal { get; set; }
            public string Colonia { get; set; }
            public string Estado { get; set; }
            public string Municipio { get; set; }
            public string UsuarioNombre { get; set; }
            public string Usuario { get; set; }
            public string Logo { get; set; }
            public List<InventarioImpresionAux> InventarioData { get; set; }
            public string Error { get; set; }
        }
        // CLASE AUXILIAR DE IMPRESION DE INVENTARIO
        public class InventarioImpresionAux
        {
            public string Area { get; set; }
            public List<InventarioArticulo> InventarioData { get; set; }
        }
        // CLASE DE INFO PACIENTE - NUEVOS INGRESOS
        public class PacienteNuevoIngreso
        {
            public int Id { get; set; }
            public int IdPaciente { get; set; }
            public string Clave { get; set; }
            public string Archivo { get; set; }
            public string TestJson { get; set; }
            public string Diagnostico { get; set; }
        }

        public class PacienteEvaluacionCoords
        {
            public int Id { get; set; }
            public int IdPaciente { get; set; }
            public bool Diagnostico { get; set; }
            public bool CoordMedica { get; set; }
            public bool CoordPsicologica { get; set; }
            public string Err { get; set; }
        }

        // -------------- [ VARIABLES GLOBALES ] --------------
        // ARRAY QUE CONTIENE LAS AREAS DEL INVENTARIO
        public string[] MDinamicosAreasInventario = { "CD", "CM", "CP", "INSUMOS" };

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

        // FUNCION QUE DEVUELVE EL RESULTADO DE LA CONSULTA DE PACIENTES POR NIVEL
        public string ConsultaDinamicaPacientesNiveles(int estatus, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteConsulta");

                List<Dictionary<string, object>> PacientesLista = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM pacienteregistro WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND estatus = @EstatusParam ORDER BY nombre ASC", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteConsulta =
                {
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

        // FUNCION QUE DEVUELVE LA LISTA DE PAGOS DEL PACIENTE
        public string ListaPagosPaciente(int idfinanzas, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacientePagosLista");
                bool Becario = false , Parcialidad = false;
                string BecaValor = "", BecaTipo = "", TipoPagos = "";
                int CantPagos = 0;
                double MontoPagoParcial = 0;
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
                        Parcialidad = bool.Parse(lector["parcialidad"].ToString());
                        CantPagos = int.Parse(lector["cantidadpagos"].ToString());
                        MontoPagoParcial = double.Parse(lector["montopagoparcial"].ToString());
                        TipoPagos = lector["tipopago"].ToString();
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
                    { "Parcialidad", Parcialidad },
                    { "CantPagos", CantPagos },
                    { "MontoPagoParcial", MontoPagoParcial },
                    { "TipoPagos", TipoPagos },
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

        // FUNCION QUE GENERA UN PAGO A UN CARGO ADICIONAL
        public string GenerarPagoCargo(PagoCargoAdicional pagocargo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PagoCargo");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacientecargosadicionales SET pagado = 'True', tipopago = @TipoCargoParam, folrefdesc = @FolRefDescParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDCargoParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] cargoAdicionalPagar =
                {
                    new SqlParameter("@TipoCargoParam", SqlDbType.VarChar){Value = pagocargo.TipoPago },
                    new SqlParameter("@FolRefDescParam", SqlDbType.VarChar){Value = pagocargo.DescFolRefPago },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IDCargoParam", SqlDbType.Int){Value = pagocargo.IdCargo },
                };
                SQL.commandoSQL.Parameters.AddRange(cargoAdicionalPagar);
                SQL.commandoSQL.ExecuteNonQuery();

                int IdFinanzas = 0; double MontoCargo = 0; string FolioCargo = "", ConceptoPago = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacientecargosadicionales WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDCargoParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDCargoParam", SqlDbType.Int) { Value = pagocargo.IdCargo });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IdFinanzas = int.Parse(lector["idfinanzas"].ToString());
                        MontoCargo = double.Parse(lector["importe"].ToString());
                        FolioCargo = lector["folio"].ToString();
                        ConceptoPago = lector["descripcion"].ToString();
                    }
                }

                string ClavePaciente = "";
                SQL.commandoSQL = new SqlCommand("SELECT P.idpaciente FROM dbo.pacienteregistrofinanzas PF JOIN dbo.pacienteregistro P ON P.id = PF.idpaciente WHERE PF.id = @IDFinanzasParam AND PF.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFinanzasParam", SqlDbType.Int) { Value = IdFinanzas });
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
                            { "FolioPago", FolioCargo },
                            { "MontoPago", MontoCargo },
                            { "NombreCentro", lector["nombrecentro"].ToString() },
                            { "Clave", lector["clavecentro"].ToString() },
                            { "FechaEmision", MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                            { "Telefono", double.Parse(lector["telefono"].ToString()) },
                            { "Estado", lector["estado"].ToString() },
                            { "Municipio", lector["municipio"].ToString() },
                            { "DireccionCentro", lector["direccion"].ToString() },
                            { "CedulaPaciente", ClavePaciente },
                            { "ConceptoPago", "\n\n" + ConceptoPago + "\n\n\n\n" },
                            { "TipoPago", pagocargo.TipoPago },
                            { "ReferenciaPago", pagocargo.DescFolRefPago },
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

        // FUNCION QUE  REIMPRIME  UN RECIBO DE PAGO DE CARGO ADICIONAL
        public string ReimprimirPagoCargo(int idcargo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ImprimirPagoCargo");
                int IdFinanzas = 0; double MontoCargo = 0; string FolioCargo = "", ConceptoPago = "", TipoPago = "", DescFolRefPago = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacientecargosadicionales WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDCargoParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDCargoParam", SqlDbType.Int) { Value = idcargo });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IdFinanzas = int.Parse(lector["idfinanzas"].ToString());
                        MontoCargo = double.Parse(lector["importe"].ToString());
                        FolioCargo = lector["folio"].ToString();
                        ConceptoPago = lector["descripcion"].ToString();
                        TipoPago = lector["tipopago"].ToString();
                        DescFolRefPago = lector["folrefdesc"].ToString();
                    }
                }

                string ClavePaciente = "";
                SQL.commandoSQL = new SqlCommand("SELECT P.idpaciente FROM dbo.pacienteregistrofinanzas PF JOIN dbo.pacienteregistro P ON P.id = PF.idpaciente WHERE PF.id = @IDFinanzasParam AND PF.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDFinanzasParam", SqlDbType.Int) { Value = IdFinanzas });
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
                            { "FolioPago", FolioCargo },
                            { "MontoPago", MontoCargo },
                            { "NombreCentro", lector["nombrecentro"].ToString() },
                            { "Clave", lector["clavecentro"].ToString() },
                            { "FechaEmision", MISC.FechaHoy().ToString("dddd, dd MMMM yyyy HH:mm:ss") },
                            { "Telefono", double.Parse(lector["telefono"].ToString()) },
                            { "Estado", lector["estado"].ToString() },
                            { "Municipio", lector["municipio"].ToString() },
                            { "DireccionCentro", lector["direccion"].ToString() },
                            { "CedulaPaciente", ClavePaciente },
                            { "ConceptoPago", "\n\n" + ConceptoPago + "\n\n\n\n" },
                            { "TipoPago", TipoPago },
                            { "ReferenciaPago", DescFolRefPago },
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

        // FUNCION QUE DEVUELVE EL CATALOGO DE INVENTARIOS
        public string ConsultaInventario(string tipoinventario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteConsulta");
                List<List<object>> TablaInventario = new List<List<object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.inventarios WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)" + ((tipoinventario != "*") ? " AND area = @AreaParam" : ""), SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                if(tipoinventario != "*")
                {
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@AreaParam", SqlDbType.VarChar) { Value = tipoinventario });
                }
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        string existencias = "<span id='tdinvexistencia_" + lector["id"].ToString() + "'>" + float.Parse(lector["existencias"].ToString()).ToString("N4") + "</span>";
                        if(float.Parse(lector["existencias"].ToString()) < float.Parse(lector["stock"].ToString()))
                        {
                            existencias = "<span id='tdinvexistencia_" + lector["id"].ToString() + "' class='badge badge-pill badge-danger'>" + float.Parse(lector["existencias"].ToString()).ToString("N4") + "</span>";
                        }
                        List<object> Inventario = new List<object>()
                        {
                            "<span id='tdinvcodigo_" + lector["id"].ToString() + "'>" + lector["codigo"].ToString() + "</span>",
                            "<span id='tdinvnombre_" + lector["id"].ToString() + "'>" + lector["nombre"].ToString() + "</span>",
                            "<span id='tdinvnombre_" + lector["id"].ToString() + "'>" + lector["presentacion"].ToString() + "</span>",
                            "$ " + float.Parse(lector["preciocompra"].ToString()).ToString("N2"),
                            "$ " + float.Parse(lector["precioventa"].ToString()).ToString("N2"),
                            existencias,
                        };
                        if (tipoinventario == "*")
                        {
                            Inventario.Add(MISC.CodigoInventarioTxt(lector["area"].ToString()));
                        }
                        Inventario.Add("<button class='btn badge badge-pill badge-warning' title='Editar Elemento' onclick='editarArticuloInventario(" + lector["id"].ToString() + ");'><i class='fa fa-edit'></i>&nbsp;Editar</button>&nbsp;<button class='btn badge badge-pill badge-success inventarioexistencias' accion='A' idelemento='" + lector["id"].ToString() + "' title='Entrada Existencias'><i class='fa fa-plus'></i></button>&nbsp;<button class='btn badge badge-pill badge-secondary inventarioexistencias' accion='Q' idelemento='" + lector["id"].ToString() + "' title='Salida Existencias'><i class='fa fa-minus'></i></button>");
                        TablaInventario.Add(Inventario);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(TablaInventario);
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

        // FUNCION QUE GUARDA / EDITA UN ARTICULO DEL INVENTARIO
        public string GuardarInventarioArticulo(InventarioArticulo inventarioarticulo, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("GuardarInventario");
                if(inventarioarticulo.IdArticuloInventario > 0)
                {
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.inventarios SET codigo = @CodigoParam, nombre = @NombreParam, presentacion = @PresentacionParam, preciocompra = @PrecioCompraParam, precioventa = @PrecioVentaParam, existencias = @ExistenciasParam, stock = @StockParam, codigoauto = @CodigoAutoParam, area = @AreaParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDInventarioArticuloParam", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] actualizarInventarioArticulo =
                    {
                        new SqlParameter("@CodigoParam", SqlDbType.VarChar){Value = inventarioarticulo.Codigo },
                        new SqlParameter("@NombreParam", SqlDbType.VarChar){Value = inventarioarticulo.Nombre },
                        new SqlParameter("@PresentacionParam", SqlDbType.VarChar){Value = inventarioarticulo.Presentacion },
                        new SqlParameter("@PrecioCompraParam", SqlDbType.Float){Value = inventarioarticulo.PrecioCompra },
                        new SqlParameter("@PrecioVentaParam", SqlDbType.Float){Value = inventarioarticulo.PrecioVenta },
                        new SqlParameter("@ExistenciasParam", SqlDbType.Float){Value = inventarioarticulo.Existencias },
                        new SqlParameter("@StockParam", SqlDbType.Float){Value = inventarioarticulo.Stock },
                        new SqlParameter("@CodigoAutoParam", SqlDbType.Bit){Value = inventarioarticulo.CodigoAuto },
                        new SqlParameter("@AreaParam", SqlDbType.VarChar){Value = inventarioarticulo.Area },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                        new SqlParameter("@IDInventarioArticuloParam", SqlDbType.Int){Value = inventarioarticulo.IdArticuloInventario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(actualizarInventarioArticulo);
                    SQL.commandoSQL.ExecuteNonQuery();
                }
                else
                {
                    SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.inventarios (idcentro, codigo, nombre, presentacion, preciocompra, precioventa, existencias, stock, codigoauto, area, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @CodigoParam, @NombreParam, @PresentacionParam, @PrecioCompraParam, @PrecioVentaParam, @ExistenciasParam, @StockParam, @CodigoAutoParam, @AreaParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                    SqlParameter[] guardarInventarioArticulo =
                    {
                        new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                        new SqlParameter("@CodigoParam", SqlDbType.VarChar){Value = inventarioarticulo.Codigo },
                        new SqlParameter("@NombreParam", SqlDbType.VarChar){Value = inventarioarticulo.Nombre },
                        new SqlParameter("@PresentacionParam", SqlDbType.VarChar){Value = inventarioarticulo.Presentacion },
                        new SqlParameter("@PrecioCompraParam", SqlDbType.Float){Value = inventarioarticulo.PrecioCompra },
                        new SqlParameter("@PrecioVentaParam", SqlDbType.Float){Value = inventarioarticulo.PrecioVenta },
                        new SqlParameter("@ExistenciasParam", SqlDbType.Float){Value = inventarioarticulo.Existencias },
                        new SqlParameter("@StockParam", SqlDbType.Float){Value = inventarioarticulo.Stock },
                        new SqlParameter("@CodigoAutoParam", SqlDbType.Bit){Value = inventarioarticulo.CodigoAuto },
                        new SqlParameter("@AreaParam", SqlDbType.VarChar){Value = inventarioarticulo.Area },
                        new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                        new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                    };
                    SQL.commandoSQL.Parameters.AddRange(guardarInventarioArticulo);
                    SQL.commandoSQL.ExecuteNonQuery();

                    if (inventarioarticulo.CodigoAuto)
                    {
                        int NumCodigoNuevo = 0;
                        SQL.commandoSQL = new SqlCommand("SELECT COUNT(*) AS Contar FROM dbo.inventarios WHERE area = @AreaParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND codigoauto = 'True'", SQL.conSQL, SQL.transaccionSQL);
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@AreaParam", SqlDbType.VarChar) { Value = inventarioarticulo.Area });
                        SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                        using (var lector = SQL.commandoSQL.ExecuteReader())
                        {
                            while (lector.Read())
                            {
                                NumCodigoNuevo = int.Parse(lector["Contar"].ToString());
                            }
                        }

                        SQL.commandoSQL = new SqlCommand("UPDATE dbo.inventarios SET codigo = @CodigoParam WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = (SELECT MAX(id) FROM dbo.inventarios WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA))", SQL.conSQL, SQL.transaccionSQL);
                        SqlParameter[] actualizarInventarioArticuloCod =
                        {
                            new SqlParameter("@CodigoParam", SqlDbType.VarChar){Value = MISC.CodigoInventario(inventarioarticulo.Area, NumCodigoNuevo) },
                            new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                        };
                        SQL.commandoSQL.Parameters.AddRange(actualizarInventarioArticuloCod);
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

        // FUNCION QUE DEVUELVE LOS DATOS DE UN ARTICULO DEL INVENTARIO
        public string ConsultarArticuloInventario(int idinventario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("InventarioConsultaArt");
                InventarioArticulo InventarioArticuloData = new InventarioArticulo();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.inventarios WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IdArticuloInventarioDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IdArticuloInventarioDATA", SqlDbType.VarChar) { Value = idinventario });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        InventarioArticuloData = new InventarioArticulo()
                        {
                            IdArticuloInventario = int.Parse(lector["id"].ToString()),
                            Codigo = lector["codigo"].ToString(),
                            Nombre = lector["nombre"].ToString(),
                            Presentacion = lector["presentacion"].ToString(),
                            PrecioCompra = double.Parse(lector["preciocompra"].ToString()),
                            PrecioVenta = double.Parse(lector["precioventa"].ToString()),
                            Existencias = double.Parse(lector["existencias"].ToString()),
                            Stock = double.Parse(lector["stock"].ToString()),
                            Area = lector["area"].ToString(),
                            CodigoAuto = bool.Parse(lector["codigoauto"].ToString()),
                        };
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(InventarioArticuloData);
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

        // FUNCION QUE ACTUALIZA LAS EXISTENCIAS DE UN ELEMENTO DEL INVENTARIO
        public string ActInventarioExistencias(InventarioArticulo inventariodata, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("InventarioExistencia");
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.inventarios SET existencias = @ExistenciasParam, fechahora = @FechaParam, admusuario = (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam) WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDInventarioArticuloParam", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] actualizarInventarioArticulo =
                {
                    new SqlParameter("@ExistenciasParam", SqlDbType.Float){Value = inventariodata.Existencias },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IDInventarioArticuloParam", SqlDbType.Int){Value = inventariodata.IdArticuloInventario },
                };
                SQL.commandoSQL.Parameters.AddRange(actualizarInventarioArticulo);
                SQL.commandoSQL.ExecuteNonQuery();

                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.inventariomovimientos (idcentro, idinventario, accion, cantidad, descripcion, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @IDInventarioArticuloParam, @AccionParam, @CantidadParam, @DescripcionParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] guardarInventarioArticulo =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IDInventarioArticuloParam", SqlDbType.Int){Value = inventariodata.IdArticuloInventario },
                    new SqlParameter("@AccionParam", SqlDbType.VarChar){Value = inventariodata.Area },
                    new SqlParameter("@CantidadParam", SqlDbType.Float){Value = inventariodata.PrecioCompra },
                    new SqlParameter("@DescripcionParam", SqlDbType.VarChar){Value = inventariodata.Nombre },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                };
                SQL.commandoSQL.Parameters.AddRange(guardarInventarioArticulo);
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

        // ** FUNCION QUE DEVUELVE LA INFO PARA IMPRIMIR UN REPORTE **
        public InventarioImpresionInfo InventarioImpresion(InventarioImpresionData inventarioimpresiondata, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("ImpresionInventarioData");
                InventarioImpresionInfo ImpresionData = new InventarioImpresionInfo()
                {
                    Correcto = true,
                };

                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarioscentro WHERE id = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        //SiglaLegal = lector["siglalegal"].ToString();
                        ImpresionData.NombreCentro = lector["nombrecentro"].ToString();
                        //ClaveCentro = lector["clavecentro"].ToString();
                        ImpresionData.Direccion = lector["direccion"].ToString();
                        ImpresionData.CodigoPostal = lector["cp"].ToString();
                        ImpresionData.Colonia = lector["colonia"].ToString();
                        ImpresionData.Estado = lector["estado"].ToString();
                        ImpresionData.Municipio = lector["municipio"].ToString();
                        //Director = lector["nombredirector"].ToString();
                        ImpresionData.Telefono = lector["telefono"].ToString();

                        if (bool.Parse(lector["logopersonalizado"].ToString()))
                        {
                            ImpresionData.Logo = "LOGOPERS";
                        }
                        if (bool.Parse(lector["alanonlogo"].ToString()))
                        {
                            ImpresionData.Logo = "LOGOALANON";
                        }
                    }
                }

                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokencentro = @TokenCentroDATA AND tokenusuario = @TokenUsuarioDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = tokenusuario });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        ImpresionData.UsuarioNombre = lector["nombre"].ToString() + " " + lector["apellido"].ToString();
                        ImpresionData.Usuario = lector["usuario"].ToString();
                    }
                }

                List<InventarioImpresionAux> InventarioAux = new List<InventarioImpresionAux>();
                if (inventarioimpresiondata.Gestion == "G1" || inventarioimpresiondata.Gestion == "G2")
                {
                    string QueryAux = "";
                    if(inventarioimpresiondata.Gestion == "G2")
                    {
                        QueryAux = " AND existencias < stock";
                    }
                    foreach(string AreaEl in MDinamicosAreasInventario)
                    {
                        if(inventarioimpresiondata.Area == "*" || inventarioimpresiondata.Area == AreaEl)
                        {
                            InventarioImpresionAux inventarioAuxInt = new InventarioImpresionAux()
                            {
                                Area = MISC.CodigoInventarioTxt(AreaEl)
                            };
                            List<InventarioArticulo> InventarioData = new List<InventarioArticulo>();
                            SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.inventarios WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND area = @AreaParam" + QueryAux, SQL.conSQL, SQL.transaccionSQL);
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@AreaParam", SqlDbType.VarChar) { Value = AreaEl });
                            using (var lector = SQL.commandoSQL.ExecuteReader())
                            {
                                while (lector.Read())
                                {
                                    InventarioData.Add(new InventarioArticulo()
                                    {
                                        Codigo = lector["codigo"].ToString(),
                                        Nombre = lector["nombre"].ToString(),
                                        Presentacion = lector["presentacion"].ToString(),
                                        PrecioCompra = double.Parse(lector["preciocompra"].ToString()),
                                        PrecioVenta = double.Parse(lector["precioventa"].ToString()),
                                        Existencias = double.Parse(lector["existencias"].ToString()),
                                        Stock = double.Parse(lector["stock"].ToString())
                                    });
                                }
                            }
                            inventarioAuxInt.InventarioData = InventarioData;
                            InventarioAux.Add(inventarioAuxInt);
                        }
                    }
                }
                else if (inventarioimpresiondata.Gestion == "E1" || inventarioimpresiondata.Gestion == "E2" || inventarioimpresiondata.Gestion == "E3")
                {
                    string[] fechaIni = inventarioimpresiondata.FechaInicio.Split('-');
                    string[] fechaFin = inventarioimpresiondata.FechaFin.Split('-');
                    string QueryAux = "";
                    if(inventarioimpresiondata.Gestion == "E2")
                    {
                        QueryAux = " AND accion = 'A'";
                    }
                    else if(inventarioimpresiondata.Gestion == "E3")
                    {
                        QueryAux = " AND accion = 'Q'";
                    }
                    foreach (string AreaEl in MDinamicosAreasInventario)
                    {
                        if (inventarioimpresiondata.Area == "*" || inventarioimpresiondata.Area == AreaEl)
                        {
                            InventarioImpresionAux inventarioAuxInt = new InventarioImpresionAux()
                            {
                                Area = MISC.CodigoInventarioTxt(AreaEl)
                            };
                            List<InventarioArticulo> InventarioData = new List<InventarioArticulo>();
                            SQL.commandoSQL = new SqlCommand("SELECT IM.*, I.codigo, I.nombre, I.presentacion, (U.nombre + ' ' + U.apellido) AS usuario FROM dbo.inventariomovimientos IM JOIN dbo.inventarios I ON I.id = IM.idinventario AND I.area = @AreaParam JOIN dbo.usuarios U ON U.usuario = IM.admusuario WHERE IM.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND IM.fechahora BETWEEN @FechaIniParam AND @FechaFinParam" + QueryAux + " ORDER BY IM.idinventario, IM.fechahora", SQL.conSQL, SQL.transaccionSQL);
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@AreaParam", SqlDbType.VarChar) { Value = AreaEl });
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@FechaIniParam", SqlDbType.DateTime) { Value = new DateTime(int.Parse(fechaIni[0]), int.Parse(fechaIni[1]), int.Parse(fechaIni[2])).AddDays(-1) });
                            SQL.commandoSQL.Parameters.Add(new SqlParameter("@FechaFinParam", SqlDbType.DateTime) { Value = new DateTime(int.Parse(fechaFin[0]), int.Parse(fechaFin[1]), int.Parse(fechaFin[2])).AddDays(1) });
                            using (var lector = SQL.commandoSQL.ExecuteReader())
                            {
                                while (lector.Read())
                                {
                                    InventarioData.Add(new InventarioArticulo()
                                    {
                                        Codigo = lector["codigo"].ToString(),
                                        Nombre = lector["nombre"].ToString(),
                                        Presentacion = lector["presentacion"].ToString(),
                                        FechaTxt = DateTime.Parse(lector["fechahora"].ToString()).ToString("dddd, dd MMMM yyyy HH:mm:ss"),
                                        Usuario = lector["usuario"].ToString(),
                                        Area = (lector["accion"].ToString() == "Q") ? "Salida" : "Entrada",
                                        Existencias = double.Parse(lector["cantidad"].ToString()),
                                        FechaBusquedaIni = new DateTime(int.Parse(fechaIni[0]), int.Parse(fechaIni[1]), int.Parse(fechaIni[2])).ToString("dd MMMM yyyy"),
                                        FechaBusquedaFin = new DateTime(int.Parse(fechaFin[0]), int.Parse(fechaFin[1]), int.Parse(fechaFin[2])).ToString("dd MMMM yyyy"),
                                    });
                                }
                            }
                            inventarioAuxInt.InventarioData = InventarioData;
                            InventarioAux.Add(inventarioAuxInt);
                        }
                    }
                }
                ImpresionData.InventarioData = InventarioAux;

                SQL.transaccionSQL.Commit();
                return ImpresionData;
            }
            catch (Exception e)
            {
                InventarioImpresionInfo Err = new InventarioImpresionInfo()
                {
                    Correcto = false,
                    Error = e.ToString()
                };
                SQL.transaccionSQL.Rollback();
                return Err;
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE DEVUELVE LA LISTA DE PACIENTES DE NUEVO INGRESO [ NUEVO INGRESO ]
        public string ListaPacientesNuevoIngreso(string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteConsultaNI");

                List<Dictionary<string, object>> PacientesLista = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT PR.*, PIN.estadoalerta, PIN.nivelintoxicacion, PIN.estadoanimo FROM dbo.pacienteregistro PR JOIN dbo.pacienteingreso PIN ON PIN.idpaciente = PR.id AND PIN.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) WHERE PR.idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND PR.estatus = 3 ORDER BY PR.nombre ASC", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
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
                            { "NombreCompleto", lector["nombre"].ToString().ToUpper() + " " + lector["apellidopaterno"].ToString().ToUpper() + " " + lector["apellidomaterno"].ToString().ToUpper() },
                            { "EstadoAlerta", lector["estadoalerta"].ToString() },
                            { "NivelIntoxicacion", lector["nivelintoxicacion"].ToString() },
                            { "EstadoAnimo", lector["estadoanimo"].ToString() },
                        };
                        PacientesLista.Add(paciente);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(PacientesLista);
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

        // FUNCION QUE DEVUELVE LA INFO DE UN PACIENTE DE NUEVO INGRESO [ NUEVO INGRESO ]
        public string ObtenerPacienteNuevoIngresoInfo(int idpaciente, string tokencentro, string url)
        {
            try
            {
                SQL.comandoSQLTrans("PacienteNIInfo");

                List<Dictionary<string, object>> PacienteInfo = new List<Dictionary<string, object>>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteevaluacion WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IDPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteParam", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> paciente = new Dictionary<string, object>()
                        {
                            { "Id", int.Parse(lector["id"].ToString()) },
                            { "IdPaciente", int.Parse(lector["idpaciente"].ToString()) },
                            { "Clave", lector["testclave"].ToString() },
                            { "TestArchivo", (lector["testarchivo"].ToString() == "SD") ? "SD" : url + lector["testarchivo"].ToString() },
                            { "TestJson", lector["testjson"].ToString() },
                            { "Diagnostico", lector["diagnostico"].ToString() },
                        };
                        PacienteInfo.Add(paciente);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(PacienteInfo);
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

        // FUNCION QUE GUARDA LA INFO DEL PACIENTE  DE NUEVO INGRESO
        public string GuardarPacienteNuevoIngreso(PacienteNuevoIngreso pacientenuevoingreso, string tokenusuario, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("GuardarPacienteNI");
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.pacienteevaluacion (idcentro, idpaciente, testclave, testarchivo, testjson, diagnostico, fechahora, admusuario) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA), @IDPacienteParam, @ClaveParam, @ArchivoParam, @TestJsonParam, @DiagnosticoParam, @FechaParam, (SELECT usuario FROM dbo.usuarios WHERE tokenusuario = @TokenParam))", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] pacienteNuevoIngresoData =
                {
                    new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar){Value = tokencentro },
                    new SqlParameter("@IDPacienteParam", SqlDbType.Int){Value = pacientenuevoingreso.IdPaciente },
                    new SqlParameter("@ClaveParam", SqlDbType.VarChar){Value = pacientenuevoingreso.Clave },
                    new SqlParameter("@ArchivoParam", SqlDbType.VarChar){Value = pacientenuevoingreso.Archivo },
                    new SqlParameter("@TestJsonParam", SqlDbType.VarChar){Value = pacientenuevoingreso.TestJson },
                    new SqlParameter("@DiagnosticoParam", SqlDbType.VarChar){Value = pacientenuevoingreso.Diagnostico },
                    new SqlParameter("@FechaParam", SqlDbType.DateTime){Value = MISC.FechaHoy() },
                    new SqlParameter("@TokenParam", SqlDbType.VarChar){Value = tokenusuario },
                };
                SQL.commandoSQL.Parameters.AddRange(pacienteNuevoIngresoData);
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

        // FUNCION QUE REESTABLECE  O ELIMINA EL REGISTRO DEL PACIENTE [ NUEVO INGRESO ]
        public string BorrarPacienteNuevoIngreso(int idingreso, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("BorrarPacienteNI");
                SQL.commandoSQL = new SqlCommand("DELETE FROM dbo.pacienteevaluacion WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDIngresoPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDIngresoPacienteParam", SqlDbType.Int) { Value = idingreso });
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

        // FUNCION QUE VERIFICA LAS COORDINACIONES (MEDICA Y PSICOLOGICA) PARA LA CONSEJERIA EN PACIENTE [ NUEVO INGRESO ]
        public string VerificarNuevoIngresoCoords(int idpaciente, string tokencentro)
        {
            PacienteEvaluacionCoords CoordsInfo = new PacienteEvaluacionCoords() {
                Diagnostico = false,
                Err = "NA",
            };
            try
            {
                SQL.comandoSQLTrans("VerifIngresoCoords");
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteevalucacioncoords WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IdPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IdPacienteParam", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        CoordsInfo.CoordMedica = bool.Parse(lector["cmedica"].ToString());
                        CoordsInfo.CoordPsicologica = bool.Parse(lector["cpsicologica"].ToString());
                        if (bool.Parse(lector["cmedica"].ToString()) && bool.Parse(lector["cpsicologica"].ToString()))
                        {
                            CoordsInfo.Diagnostico = true;
                        }
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(CoordsInfo);
            }
            catch (Exception e)
            {
                CoordsInfo.Err = e.ToString();
                SQL.transaccionSQL.Rollback();
                return e.ToString();
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE ACTUALIZA LA INFORMACION DEL PACIENTE Y APRUEBA AL NUEVO INGRESO
        public string AprobarNuevoIngreso(int idpaciente, string coordinacion, string tokencentro)
        {
            try
            {
                SQL.comandoSQLTrans("AprobarNuevoIngreso");
                string CoordQuery = "";
                if (coordinacion == "CM")
                {
                    CoordQuery = "cmedica = @CoordBoolParam";
                }
                else if (coordinacion == "CP")
                {
                    CoordQuery = "cpsicologica = @CoordBoolParam";
                }
                else if (coordinacion == "CC")
                {
                    CoordQuery = "cconsejeria = @CoordBoolParam";
                }
                SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteevalucacioncoords SET " + CoordQuery + " WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IDPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@CoordBoolParam", SqlDbType.Bit) { Value = true });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteParam", SqlDbType.Int) { Value = idpaciente });
                SQL.commandoSQL.ExecuteNonQuery();

                bool PacienteHecho = false;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.pacienteevalucacioncoords WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND idpaciente = @IDPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteParam", SqlDbType.Int) { Value = idpaciente });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        if (bool.Parse(lector["cmedica"].ToString()) && bool.Parse(lector["cpsicologica"].ToString()) && bool.Parse(lector["cconsejeria"].ToString()))
                        {
                            PacienteHecho = true;
                        }
                    }
                }

                if (PacienteHecho)
                {
                    SQL.commandoSQL = new SqlCommand("UPDATE dbo.pacienteregistro SET estatus = 4 WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDPacienteParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDPacienteParam", SqlDbType.Int) { Value = idpaciente });
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
    }
}
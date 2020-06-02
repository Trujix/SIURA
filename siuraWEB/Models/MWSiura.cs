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
    public class MWSiura : Controller
    {
        // CLASES Y VARIABLES PUBLICAS
        public class WizardSiura
        {
            public int IdWizard { get; set; }
            public string NombreTest { get; set; }
            public string ClaveTest { get; set; }
            public string TestEstructura { get; set; }
            public bool Activo { get; set; }
        }

        public class WizardAcceso
        {
            public bool Exito { get; set; }
            public bool Verificado { get; set; }
            public string Url { get; set; }
            public string Token { get; set; }
            public string Error { get; set; }
            public bool CoordMedica { get; set; }
            public bool CoordPsicologica { get; set; }
            public bool Coord12Pasos { get; set; }
            public string NombreUsuario { get; set; }
        }

        // ----------------- FUNCIONES GENERALES WIZARDS - SIURA -----------------

        // FUNCION QUE DEVUELVE LA LISTA DE LOS TEST ASOCIADOS A UNA CLAVE DE TEST  EN WIZARD SIURA
        public string ListaWizardTests(string clavetest, string tokencentro)
        {
            Dictionary<string, object> ListaWizard = new Dictionary<string, object>();
            try
            {
                SQL.comandoSQLTrans("ListaWizardTests");
                List<WizardSiura> WizardsTests = new List<WizardSiura>();
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.wizartests WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND clavetest = @ClaveTestParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@ClaveTestParam", SqlDbType.VarChar) { Value = clavetest });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        WizardsTests.Add(new WizardSiura()
                        {
                            IdWizard = int.Parse(lector["id"].ToString()),
                            NombreTest = lector["nombretest"].ToString(),
                            ClaveTest = lector["clavetest"].ToString(),
                            TestEstructura = lector["testestructura"].ToString(),
                            Activo = bool.Parse(lector["activo"].ToString()),
                        });
                    }
                }
                ListaWizard = new Dictionary<string, object>()
                {
                    { "Correcto", true },
                    { "Wizards", WizardsTests },
                };

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(ListaWizard);
            }
            catch (Exception e)
            {
                ListaWizard = new Dictionary<string, object>()
                {
                    { "Correcto", false },
                    { "Error", e.ToString() },
                };
                return JsonConvert.SerializeObject(ListaWizard);
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE VERIFICA EL ESTATUS DEL TOKEN DE ACCESO AL WIZARD SIURA
        public WizardAcceso VerificarTokenAcceso(string tokenacceso, string tokenusuario, string tokencentro)
        {
            WizardAcceso WizardInfo = new WizardAcceso()
            {
                Exito = true,
            };
            try
            {
                SQL.comandoSQLTrans("VerificarTokenAcceso");

                int Verif = 0, IdToken = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.wizardaccesos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND token = @TokenAccesoParam", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenAccesoParam", SqlDbType.VarChar) { Value = tokenacceso });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        IdToken = int.Parse(lector["id"].ToString());
                        Verif++;
                    }
                }

                if(Verif > 0)
                {
                    WizardInfo.Verificado = true;

                    SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokencentro = @TokenCentroDATA AND tokenusuario = @TokenUsuarioParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenUsuarioParam", SqlDbType.VarChar) { Value = tokenusuario });
                    using (var lector = SQL.commandoSQL.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            WizardInfo.NombreUsuario = lector["nombre"].ToString() + " " + lector["apellido"].ToString();
                        }
                    }

                    SQL.commandoSQL = new SqlCommand("DELETE FROM dbo.wizardaccesos WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA) AND id = @IDTokenParam", SQL.conSQL, SQL.transaccionSQL);
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = tokencentro });
                    SQL.commandoSQL.Parameters.Add(new SqlParameter("@IDTokenParam", SqlDbType.Int) { Value = IdToken });
                    SQL.commandoSQL.ExecuteNonQuery();
                }
                else
                {
                    WizardInfo.Verificado = false;
                    WizardInfo.Error = "errToken";
                }

                SQL.transaccionSQL.Commit();
                return WizardInfo;
            }
            catch (Exception e)
            {
                SQL.transaccionSQL.Rollback();
                WizardInfo.Exito = false;
                WizardInfo.Error = e.ToString();
                return WizardInfo;
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }

        // FUNCION QUE GENERA EL TOKEN DE ACCESO AL WIZARD SIURA
        public WizardAcceso CrearWizardAcceso(string tokencentro)
        {
            WizardAcceso WizardData = new WizardAcceso()
            {
                Exito = true,
            };
            try
            {
                SQL.comandoSQLTrans("CrearWizardAcceso");
                string TokenAcceso = MISC.CrearIdSession();
                SQL.commandoSQL = new SqlCommand("INSERT INTO dbo.wizardaccesos (idcentro, token) VALUES ((SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroParam), @TokenAccesoParam)", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] altaWizardTokenAcceso =
                {
                    new SqlParameter("@TokenCentroParam", SqlDbType.VarChar) { Value = tokencentro },
                    new SqlParameter("@TokenAccesoParam", SqlDbType.VarChar) { Value = TokenAcceso },
                };
                SQL.commandoSQL.Parameters.AddRange(altaWizardTokenAcceso);
                SQL.commandoSQL.ExecuteNonQuery();
                WizardData.Token = TokenAcceso;

                SQL.transaccionSQL.Commit();
                return WizardData;
            }
            catch (Exception e)
            {
                SQL.transaccionSQL.Rollback();
                WizardData.Exito = false;
                WizardData.Error = e.ToString();
                return WizardData;
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }
    }
}
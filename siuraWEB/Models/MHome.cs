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
    public class MHome : Controller
    {
        // FUNCION QUE DEVUELVE LOS PARAMETROS DEL USUARIO LOGGEADO
        public string ParametrosUsuario(string token)
        {
            try
            {
                SQL.comandoSQLTrans("Parametros");

                string TokenCentro = "";
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE tokenusuario = @TokenUsuarioDATA", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenUsuarioDATA", SqlDbType.VarChar) { Value = token });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        TokenCentro = lector["tokencentro"].ToString();
                    }
                }
                List<object> Parametros = new List<object>();
                Random aleatorio = new Random();
                string cadHTML = MISC.GenerarCadAleatoria(10, aleatorio);
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuariomenuprincipal WHERE idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                SQL.commandoSQL.Parameters.Add(new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) { Value = TokenCentro });
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        Dictionary<string, object> Parametro = new Dictionary<string, object>() {
                            { "Nombre", lector["nombre"].ToString() },
                            { "Visible", bool.Parse(lector["visible"].ToString()) },
                            { "IdHTML", cadHTML.ToLower() }
                        };
                        Parametros.Add(Parametro);
                        cadHTML = MISC.GenerarCadAleatoria(10, aleatorio);
                    }
                }

                SQL.transaccionSQL.Commit();
                return JsonConvert.SerializeObject(Parametros);
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
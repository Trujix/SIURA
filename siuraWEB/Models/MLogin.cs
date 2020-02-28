using siuraWEB;
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
    public class MLogin : Controller
    {
        // ----------- CLASES Y VARIABLES PUBLICAS -----------
        // CLASE DE LOGIN
        public class LoginInfo {
            public string Usuario { get; set; }
            public string Pass { get; set; }
        }
        // CLASE DE RESPUESTA DE LOGIN
        public class LoginRespuesta
        {
            public bool Respuesta { get; set; }
            public string Token { get; set; }
            //public List<object> Parametros { get; set; }
        }

        // ---------- FUNCIONES GENERALES ----------
        // FUNCION DE LOGIN
        public string LoginFuncion(LoginInfo logininfo)
        {
            try
            {
                SQL.comandoSQLTrans("Login");
                LoginRespuesta respuesta = new LoginRespuesta() {
                    Respuesta = false
                };
                int IdUsuario = 0;
                SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuarios WHERE usuario = @UsuarioDATA AND pass = @PassDATA", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] UsuarioLoginPars =
                {
                    new SqlParameter("@UsuarioDATA", SqlDbType.VarChar) {Value = logininfo.Usuario },
                    new SqlParameter("@PassDATA", SqlDbType.VarChar) {Value = MISC.CrearMD5(logininfo.Pass) },
                };
                SQL.commandoSQL.Parameters.AddRange(UsuarioLoginPars);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        respuesta.Respuesta = true;
                        respuesta.Token = lector["tokenusuario"].ToString();
                        IdUsuario = int.Parse(lector["id"].ToString());
                    }
                }

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
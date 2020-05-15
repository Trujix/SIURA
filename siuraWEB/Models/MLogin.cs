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
            public  string ClaveCentro { get; set; }
        }
        // CLASE DE RESPUESTA DE LOGIN
        public class LoginRespuesta
        {
            public int IdUsuario { get; set; }
            public bool Respuesta { get; set; }
            public string Token { get; set; }
            public string TokenCentro { get; set; }
            public string NotifCentroID { get; set; }
            public string NotifUsuarioID { get; set; }
            public bool Administrador { get; set; }
            public bool AlAnon { get; set; }
            public bool CoordDeportiva { get; set; }
            public bool CoordMedica { get; set; }
            public bool CoordPsicologica { get; set; }
            public bool CoordEspiritual { get; set; }
            public bool Cord12Pasos { get; set; }
            public bool Documentacion { get; set; }
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
                SQL.commandoSQL = new SqlCommand("SELECT U.*, C.tokencentro, C.idnotificacion AS CentroNotifId FROM dbo.usuarios U JOIN dbo.centros C ON C.clave = @ClaveCentroDATA AND C.tokencentro = U.tokencentro WHERE U.usuario = @UsuarioDATA AND U.pass = @PassDATA AND U.activo > 0", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] UsuarioLoginPars =
                {
                    new SqlParameter("@UsuarioDATA", SqlDbType.VarChar) {Value = logininfo.Usuario },
                    new SqlParameter("@PassDATA", SqlDbType.VarChar) {Value = MISC.CrearMD5(logininfo.Pass) },
                    new SqlParameter("@ClaveCentroDATA", SqlDbType.VarChar) {Value = logininfo.ClaveCentro },
                };
                SQL.commandoSQL.Parameters.AddRange(UsuarioLoginPars);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        respuesta.Respuesta = true;
                        respuesta.Token = lector["tokenusuario"].ToString();
                        respuesta.TokenCentro = lector["tokencentro"].ToString();
                        respuesta.Administrador = bool.Parse(lector["administrador"].ToString());
                        IdUsuario = int.Parse(lector["id"].ToString());
                        respuesta.IdUsuario = int.Parse(lector["id"].ToString());

                        respuesta.NotifCentroID = lector["CentroNotifId"].ToString();
                        respuesta.NotifUsuarioID = lector["idnotificacion"].ToString();
                    }
                }

                if (IdUsuario > 0)
                {
                    if (respuesta.Administrador)
                    {
                        respuesta.AlAnon = true;
                        respuesta.CoordDeportiva = true;
                        respuesta.CoordMedica = true;
                        respuesta.CoordPsicologica = true;
                        respuesta.CoordEspiritual = true;
                        respuesta.Cord12Pasos = true;
                        respuesta.Documentacion = true;
                    }
                    else
                    {
                        SQL.commandoSQL = new SqlCommand("SELECT * FROM dbo.usuariosperfiles WHERE idusuario = @IDUsuarioParam AND idcentro = (SELECT id FROM dbo.centros WHERE tokencentro = @TokenCentroDATA)", SQL.conSQL, SQL.transaccionSQL);
                        SqlParameter[] UsuarioLoginPerfilPars =
                        {
                            new SqlParameter("@IDUsuarioParam", SqlDbType.Int) {Value = IdUsuario },
                            new SqlParameter("@TokenCentroDATA", SqlDbType.VarChar) {Value = respuesta.TokenCentro },
                        };
                        SQL.commandoSQL.Parameters.AddRange(UsuarioLoginPerfilPars);
                        using (var lector = SQL.commandoSQL.ExecuteReader())
                        {
                            while (lector.Read())
                            {
                                respuesta.AlAnon = bool.Parse(lector["alanon"].ToString());
                                respuesta.CoordDeportiva = bool.Parse(lector["coorddeportiva"].ToString());
                                respuesta.CoordMedica = bool.Parse(lector["coordmedica"].ToString());
                                respuesta.CoordPsicologica = bool.Parse(lector["coordpsicologica"].ToString());
                                respuesta.CoordEspiritual = bool.Parse(lector["coordespiritual"].ToString());
                                respuesta.Cord12Pasos = bool.Parse(lector["coorddocepasos"].ToString());
                                respuesta.Documentacion = bool.Parse(lector["documentacion"].ToString());
                            }
                        }
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
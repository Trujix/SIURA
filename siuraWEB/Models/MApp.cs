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
    public class MApp : Controller
    {
        // ------------ [ CLASES PUBLICAS ] ------------
        // CLASE PUBLICA PARA INICIAR SESION DE LA APP
        public class LoginApp
        {
            public string Usuario { get; set; }
            public string Password { get; set; }
            public string CentroClave { get; set; }
        }
        // CLASE PUBLICA DE LA RESPUESTA DE LOGIN DE LA APP
        public class LoginAppRespuesta
        {
            public int IdUsuario { get; set; }
            public bool Respuesta { get; set; }
            public string RespuestaText { get; set; }
            public string TokenUsuario { get; set; }
            public string TokenCentro { get; set; }
            public string UsuarioNombre { get; set; }
            public bool Administrador { get; set; }
            public bool AlAnon { get; set; }
            public bool CoordDeportiva { get; set; }
            public bool CoordMedica { get; set; }
            public bool CoordPsicologica { get; set; }
            public bool CoordEspiritual { get; set; }
            public bool Cord12Pasos { get; set; }
            public bool Documentacion { get; set; }
        }

        // ------------------- [ FUNCIONES GENERALES ] -------------------
        // FUNCION QUE PERMITE LOGIN A LA APP
        public string IniciarSesionApp(LoginApp Login)
        {
            LoginAppRespuesta respuesta = new LoginAppRespuesta()
            {
                IdUsuario = 0,
                Respuesta = false,
                RespuestaText = "errLogin",
            };
            try
            {
                SQL.comandoSQLTrans("Login");
                SQL.commandoSQL = new SqlCommand("SELECT U.*, C.tokencentro, C.idnotificacion AS CentroNotifId FROM dbo.usuarios U JOIN dbo.centros C ON C.clave = @ClaveCentroDATA AND C.tokencentro = U.tokencentro WHERE U.usuario = @UsuarioDATA AND U.pass = @PassDATA AND U.activo > 0", SQL.conSQL, SQL.transaccionSQL);
                SqlParameter[] AppUsuarioLoginPars =
                {
                    new SqlParameter("@UsuarioDATA", SqlDbType.VarChar) {Value = Login.Usuario },
                    new SqlParameter("@PassDATA", SqlDbType.VarChar) {Value = MISC.CrearMD5(Login.Password) },
                    new SqlParameter("@ClaveCentroDATA", SqlDbType.VarChar) {Value = Login.CentroClave },
                };
                SQL.commandoSQL.Parameters.AddRange(AppUsuarioLoginPars);
                using (var lector = SQL.commandoSQL.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        respuesta.IdUsuario = int.Parse(lector["id"].ToString());
                        respuesta.Respuesta = true;
                        respuesta.TokenUsuario = lector["tokenusuario"].ToString();
                        respuesta.TokenCentro = lector["tokencentro"].ToString();
                        respuesta.UsuarioNombre = lector["nombre"].ToString() + " " + lector["apellido"].ToString();
                        respuesta.Administrador = bool.Parse(lector["administrador"].ToString());
                        respuesta.RespuestaText = "LoginCorrecto";
                    }
                }

                if (respuesta.IdUsuario > 0)
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
                            new SqlParameter("@IDUsuarioParam", SqlDbType.Int) {Value = respuesta.IdUsuario },
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
                respuesta.RespuestaText = e.ToString();
                return JsonConvert.SerializeObject(respuesta);
            }
            finally
            {
                SQL.conSQL.Close();
            }
        }
    }
}
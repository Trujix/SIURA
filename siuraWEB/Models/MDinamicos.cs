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
    }
}
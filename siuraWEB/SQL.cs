using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;

namespace siuraWEB
{
    public class SQL
    {
        // ************ [ VARIABLES, FUNCIONES Y PARAMETROS DE SQL ] ******************
        // VARIABLE Y UTILES SQL PARA SU USO, CONSULTA Y ACCESO A DB
        public static SqlConnection conSQL = new SqlConnection();
        SqlDataAdapter adaptadorSQL = new SqlDataAdapter();
        DataTable dtablaSQL = new DataTable();
        public static SqlCommand commandoSQL;
        // VARIABLE DE TRANSACCION (USADO PARA REALIZAR COMMITS Y ROLLBACKS - QUERY'S FALLIDAS)
        public static SqlTransaction transaccionSQL;

        // FUNCION GLOBAL DE CONECCION
        public static bool coneccionSQL()
        {
            try
            {
                conSQL.ConnectionString = ConfigurationManager.ConnectionStrings["sqlConeccion"].ConnectionString;
                return true;
            }
            catch
            {
                return false;
            }
        }
        // FUNCION QUE LLENA UN COMANDO SQL PARA PARSEAR EL RESULTADO SQL Y LLENA LAS CLASES (OBJETOS)
        public static SqlCommand comandoSQL(string query)
        {
            coneccionSQL();
            conSQL.Open();
            var comando = new SqlCommand(query, conSQL);
            return comando;
        }
        // FUNCION QUE GENERA EL CONSTRUCTOR DE LA TRANSACCION (ABRE LA CONEXIÓN E INICIA EL COMANDO)
        public static bool comandoSQLTrans(string nomtrans)
        {
            coneccionSQL();
            conSQL.Open();
            transaccionSQL = conSQL.BeginTransaction(nomtrans);
            return true;
        }
        // ********************************************************************************
    }
}
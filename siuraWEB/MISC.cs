using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace siuraWEB
{
    public class MISC
    {
        // :::::::::: *************** FUNCIONES EXTRAS  *************** ::::::::::
        // FUNCION QUE CREA UNA CADENA MD5
        public static string CrearMD5(string cadena)
        {
            StringBuilder constructor = new StringBuilder();
            using (MD5 md5Hash = MD5.Create())
            {
                byte[] dato = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(cadena));
                for (int i = 0; i < dato.Length; i++)
                {
                    constructor.Append(dato[i].ToString("x2"));
                }
            }
            return constructor.ToString();
        }

        // FUNCION QUE CREA UNA CADENA DE CARACTERES LARGA PARA EL USO DE REALIZAR TOKENS
        public static string CrearIdSession()
        {
            string IdSession = ""; Int64 cadFecha = 0; string cadFechaTXT = ""; Random num = new Random();
            var f = new DateTime(1970, 1, 1);
            TimeSpan t = (DateTime.Now.ToUniversalTime() - f);
            cadFecha = (Int64)(t.TotalMilliseconds + 0.5);
            cadFechaTXT = cadFecha.ToString();
            foreach (char c in cadFechaTXT)
            {
                int l = num.Next(0, 26);
                char let = (char)('a' + l);
                IdSession += c + "" + let;
            }
            return IdSession;
        }

        // FUNCION QUE CREA UNA CADENA ALEATORIA 
        // [ TIPO::: 1 - 3 NUMEROS , 2 - ALFANUMERICA (CUALQUIER TAMAÑO) , 3 - SOLO NUMEROS (CUALQUIER TAMAÑO) , 4 - SOLO LETRAS (CUALQUIER TAMAÑO) ]
        public static string CrearCadAleatoria(int tipo, int longitud)
        {
            Random aleatorio = new Random();
            string cadenaRetorno = "";
            if (tipo == 1)
            {
                int NumAl = aleatorio.Next(100, 999);
                cadenaRetorno = NumAl.ToString();
            }
            else if (tipo == 2)
            {
                const string caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                cadenaRetorno = new string(Enumerable.Range(1, longitud).Select(_ => caracteres[aleatorio.Next(caracteres.Length)]).ToArray());
            }
            else if (tipo == 3)
            {
                const string caracteres = "0123456789";
                cadenaRetorno = new string(Enumerable.Repeat(caracteres, longitud).Select(s => s[aleatorio.Next(s.Length)]).ToArray());
            }
            else if (tipo == 4)
            {
                const string caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                cadenaRetorno = new string(Enumerable.Repeat(caracteres, longitud).Select(s => s[aleatorio.Next(s.Length)]).ToArray());
            }
            return cadenaRetorno;
        }

        // FUNCION QUE GENERAUNA CADENA ALEATORIA (EXPERIEMNTAL)
        public static string GenerarCadAleatoria(int length, Random random)
        {
            string characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            StringBuilder result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(characters[random.Next(characters.Length)]);
            }
            return result.ToString();
        }

        // FUNCION QUE DEVUELVE UNA CAD TIPO "000" PARA EXPENDIENTES
        public static string CadExpediente(int num)
        {
            if(num < 10)
            {
                return "00" + num.ToString();
            }
            else if(num < 100)
            {
                return "0" + num.ToString();
            }
            else
            {
                return num.ToString();
            }
        }

        // FUNCION QUE DEVUELVE LA FECHA DE HOY
        public static DateTime FechaHoy()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)"));
        }

        // FUNCION QUE DEVUELVE DE MANERA GLOBAL LA ESTRUCTURA DEL  HTML CORREO
        public static string MailHTML()
        {
            return "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8' /></head><body style='font-family: -apple-system,BlinkMacSystemFont,Roboto,Arial,sans-serif;'><center><div align='left' style='width: 600px; position: relative;display: -webkit-box;display: -ms-flexbox;display: flex;-webkit-box-orient: vertical;-webkit-box-direction: normal;-ms-flex-direction: column;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0,0,0,.125);border-radius: .25rem;'><div style='-webkit-box-flex: 1;-ms-flex: 1 1 auto;flex: 1 1 auto;padding: 1.25rem;'><img src='https://drive.google.com/uc?export=view&id=1JcTqF6LPm_9TY-rCZcbS3-i2WFkHINmd' style='height: 50px;' /><br /><hr />×ØCUERPOMAILØ×<br /><h6>Correo generado automáticamente desde el sistema SIURA &copy;" + DateTime.Now.ToString("yyyy") + ". No es necesario contestar a este correo, ya que no recibirá respuesta. Si desea información, consulte con el usuario administrador de su centro.</h6></div></div></center></body></html>";
        }
    }
}
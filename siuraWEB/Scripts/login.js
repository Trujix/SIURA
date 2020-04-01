// ********************************************************
// ARCHIVO JAVASCRIPT LGIN.JS

// --------------------------------------------------------
// VARIABLES GLOBALES

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT QUE EJECUTA EL INICIO DE SESIÓN
$(document).on('click', '#btnLogin', function (e) {
    if (ValidarFormLogin()) {
        var LoginData = {
            Usuario: $('#usuarioLogin').val(),
            Pass: $('#passLogin').val(),
            ClaveCentro: $('#centroClaveLogin').val()
        };
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Login/IniciarSesion",
            data: { LoginData: LoginData },
            dataType: "JSON",
            beforeSend: function () {
                LoadingOn("Validando Usuario");
            },
            success: function (data) {
                if (data.Respuesta) {
                    location.reload();
                } else {
                    MsgAlerta("Error!", "Los <b>Datos de inicio de sesión</b> son incorrectos", 4000, "error");
                    $('#usuarioLogin').focus();
                    LoadingOff();
                }
            },
            error: function (error) {
                ErrorLog(error.responseText, "Iniciar Sesión");
            }
        });
    }
});

// DOCUMENT QUE CONTROLA LA TECLA ENTER EN LOS CAMPOS USUARIO Y CONTRASEÑA
$(document).on('keyup', '#usuarioLogin, #passLogin, #centroClaveLogin', function (e) {
    if (e.keyCode === 13) {
        $('#btnLogin').click();
    }
});

// DOCUMENT QUE SE ENCARGA DE CERRAR LA SESIÓN
$(document).on('click', '.cerrarSesion', function () {
    MsgPregunta("Atención!", "¿Desea cerrar la sesión?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Login/CerrarSesion",
                beforeSend: function () {
                    LoadingOn("Cerrando Sesión");
                },
                success: function (data) {
                    if (CrearBoolValor(data)) {
                        location.reload();
                    } else {
                        ErrorLog(data, "Cerrar Sesión");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Cerrar Sesión");
                }
            });
        }
    });
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION AUXILIAR QUE VALIDA EL FORMULARIO DE INIICIO DE SESIÓN
function ValidarFormLogin() {
    if ($('#usuarioLogin').val() === "") {
        $('#usuarioLogin').focus();
        MsgAlerta("Atención!", "Coloque el <b>Usuario</b>", 2000, "default");
        return false;
    } else if ($('#passLogin').val() === "") {
        $('#passLogin').focus();
        MsgAlerta("Atención!", "Coloque la <b>Contraseña</b>", 2000, "default");
        return false;
    } else if ($('#centroClaveLogin').val() === "") {
        $('#centroClaveLogin').focus();
        MsgAlerta("Atención!", "Coloque la <b>Clave del Centro</b>", 2000, "default");
        return false;
    } else {
        return true;
    }
}
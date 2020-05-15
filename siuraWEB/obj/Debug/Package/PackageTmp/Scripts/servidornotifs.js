// ***********************************************************************************
// ------------------- [ MODULO ESPECIALIZADO PARA SERVIDOR PUSH ] -------------------

// ------------------- VARIABLES -------------------
var notifServerGLOBAL;
var notifIDCentroGLOBAL = "";
var notifIDUsuarioGLOBAL = "";
var notifEnviarDataJSON = {};
var notifJsonPushParamsJSON = {};

/*
 * 
 ////////// ESTRUCTURA DEL JSON PARA NOTIFICACIONES ///////////

 notifEnviarDataJSON = {
    Tipo: "U-G",
    NotifCentroId: "",
    NotifUsuIds: [],
    AccionPush: "funcJS",
    Parametros: {},
};

 */

// ------------------- FUNCIONES -------------------

// FUNCION QUE INICIA LOS PARAMETROS PARA EL PUSH SERVER Y DISTRIBUYE LAS FUNCIONES
$(function () {
    $.getScript("../signalr/hubs", function () {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Home/NotifsIDS",
            dataType: 'JSON',
            success: function (data) {
                notifIDCentroGLOBAL = data.NotifCentroID;
                notifIDUsuarioGLOBAL = data.NotifUsuarioID;
                notifServerGLOBAL = $.connection.siuraHub;
                notifServerGLOBAL.client.pushAccion = function (info) {
                    try {
                        var pushDataJSON = JSON.parse(info);

                        console.log(pushDataJSON);
                        console.log(notifIDCentroGLOBAL);
                        console.log(notifIDUsuarioGLOBAL);

                        if (pushDataJSON.NotifCentroId !== undefined) {
                            if ((pushDataJSON.Tipo === "G" && pushDataJSON.NotifCentroId === notifIDCentroGLOBAL) || (pushDataJSON.Tipo === "U" && pushDataJSON.NotifUsuIds.indexOf(notifIDUsuarioGLOBAL) >= 0)) {
                                try {
                                    notifJsonPushParamsJSON = pushDataJSON.Parametros;
                                    window[pushDataJSON.AccionPush]();
                                } catch (e) {
                                    ErrorLog(e, "Ejecutar Accion Push");
                                }
                            }
                        } else {
                            ErrorLog(info, "Error JSON Estruct. Push");
                        }
                    } catch (e) {
                        ErrorLog("Error al generar acción push: PaginaError: " + e + " - ServidorError" + info, "Generar Accion Push");
                    }
                };
                $.connection.hub.start().done(function () { });
            },
            error: function (error) {
                ErrorLog(error, "Abrir Menu Config Docs");
            }
        });
    });
});

// FUNCION QUE SE LLAMA PARA ENVIAR UNA NUEVA NOTIFICACION [ EL JSON DATA DEBE ESTAR ESTRUCTURADO ]
function pushServidorWEB() {
    notifServerGLOBAL.server.pushServidor(JSON.stringify(notifEnviarDataJSON));
}

// ************ [ FUNCIONES DE PARAMETROS ] ************

// FUNCION QUE EJECUTA EL CIERRE DE SESION AUTOMATICO AL DESACTIVAR UN USUARIO
function CerrarSesionUsuario() {
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
// ********************************************************
// ARCHIVO JAVASCRIPT ADMINISTRACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL ABRIR LA OPCION DE ADMINISTRACION
$(document).on('click', 'a[name="opcAdm"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        pagospacientes: "PacientesPagos"
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuAdministracion').html(data);
            LoadingOff();
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Config Docs");
        }
    });
});

// DOCUMENT - TRAE LA LISTA DE PACIENTES CON PAGOS PENDIENTES
$(document).on('click', '#btnMostrarPacientesPagosPend', function () {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ListaPacientesPagosPend",
        dataType: "JSON",
        beforeSend: function () {
            $('#adminTablaPacientesPagos').html('');
            LoadingOn("Cargando lista...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    console.log(data);
                    var tabla = "";
                    $(data).each(function (key, value) {
                        tabla += "<tr id='trpago_" + value.IdPaciente + "'><td>" + value.NombreCompleto + "</td><td>" + value.FechaRegistro + "</td><td>$ " + parseFloat(value.Monto).toFixed(2) + "</td><td style='text-align: center;'><button onclick='ejecutarPagoPendientePaciente(" + value.IdPaciente + ")' class='btn badge badge-pill badge-success'><i class='fa fa-dollar-sign'></i></button></td></tr>";
                    });
                    $('#adminTablaPacientesPagos').html(tabla);
                    LoadingOff();
                } else {
                    LoadingOff();
                    MsgAlerta("Info!", "No tiene pacientes con pagos pendientes", 3000, "info");
                }
            } else {
                ErrorLog(data.responseText, "Pacientes Pagos Pendientes");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Abrir Menu Config Docs");
        }
    });
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION  QUE EJECUTA EL PAGO DEL PACIENTE (ACCION PROVISIONAL DE PRUEBA, PARA HABILITARLO)
function ejecutarPagoPendientePaciente(idPaciente) {
    MsgPregunta("Atención!", "¿Desea genera pago de paciente?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Documentacion/PagarPendientePaciente",
                data: { IdPaciente: idPaciente },
                beforeSend: function () {
                    LoadingOn("Guardando cambios...");
                },
                success: function (data) {
                    if (data === "true") {
                        LoadingOff();
                        MsgAlerta("Ok!", "Pago realizado <b>correctamente</b>", 3000, "success");
                        $('#trpago_' + idPaciente).remove();
                    } else {
                        ErrorLog(data, "Pagar Paciente Pendiente");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Pagar Paciente Pendiente");
                }
            });
        }
    });
}
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
            finanzasPacientesJSON = {};
            idPacienteFinanzasGLOBAL = 0;
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "";
                    $(data).each(function (key, value) {
                        tabla += "<tr id='trpago_" + value.IdFinanzas + "'><td>" + value.NombreCompleto + "</td><td>" + value.FechaRegistro + "</td><td>$ " + parseFloat(value.Monto).toFixed(2) + "</td><td style='text-align: center;'><button onclick='ejecutarPagoPendientePaciente(" + value.IdFinanzas + ")' class='btn badge badge-pill badge-success'><i class='fa fa-dollar-sign'></i>&nbsp;Gestionar</button></td></tr>";
                        finanzasPacientesJSON["Finanza_" + value.IdFinanzas] = {
                            NombreCompleto: value.NombreCompleto,
                            Monto: value.Monto
                        };
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

// DOCUMENT - BOTON TIPO SELECT QUE CONTROLA LA SELECCIONDE DE UN TIPO DE  PAGO
$(document).on('change', '#modalPacienteTipoPago', function () {
    $('#modalDivReferenciaPago').hide();
    if (parseInt($(this).val()) !== 1 && parseInt($(this).val()) > 0) {
        $('#modalDivReferenciaPago').show();
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION  QUE EJECUTA EL PAGO DEL PACIENTE (ACCION PROVISIONAL DE PRUEBA, PARA HABILITARLO)
function ejecutarPagoPendientePaciente(idFinanzas) {
    idPacienteFinanzasGLOBAL = idFinanzas;
    consultarPagos();
}
// ********************************************************
// ARCHIVO JAVASCRIPT ADMINISTRACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var finanzasPacientesJSON = {};
var idPacienteFinanzasGLOBAL = 0;

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
                    console.log(data);
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

// DOCUMENT - BOTON QUE GENERA EL PAGO DE UN PACIENTE
$(document).on('click', '#modalBtnGenerarPago', function () {
    if (validarFormPagoPaciente()) {
        MsgPregunta("Generar Pago", "¿Desea continuar?", function (si) {
            if (si) {
                var pacientePago = {
                    IdFinanzas: idPacienteFinanzasGLOBAL,
                    MontoPago: parseFloat($('#modalPacienteRegistroPago').val()),
                    FolRefDesc: (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1) ? $('#modalTxtReferenciaPago').val() : "--"
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Documentacion/GenerarPagoPaciente",
                    data: { PacientePago: pacientePago },
                    beforeSend: function () {
                        LoadingOn("Generando Pago...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalPacientesPagos').modal('hide');
                            LoadingOff();
                        } else {
                            ErrorLog(data, "Pago de Paciente");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Pago de Paciente");
                    }
                });
            }
        });
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION  QUE EJECUTA EL PAGO DEL PACIENTE (ACCION PROVISIONAL DE PRUEBA, PARA HABILITARLO)
function ejecutarPagoPendientePaciente(idFinanzas) {
    idPacienteFinanzasGLOBAL = idFinanzas;
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ListaPagosPaciente",
        dataType: 'JSON',
        data: { IdFinanzas: idPacienteFinanzasGLOBAL },
        beforeSend: function () {
            LoadingOn("Obteniendo datos...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                var montoActual = parseFloat(finanzasPacientesJSON["Finanza_" + idFinanzas].Monto);
                $(data).each(function (key, value) {
                    montoActual = montoActual - parseFloat(value.Pago);
                });
                $('#modalPacienteNombre').html(finanzasPacientesJSON["Finanza_" + idFinanzas].NombreCompleto);
                $('#modalPacienteMontoInicial').html(finanzasPacientesJSON["Finanza_" + idFinanzas].Monto.toFixed(2));
                $('#modalPacienteMontoActual').html(montoActual.toFixed(2));
                $('#modalPacientesPagos').modal('show');
                $('#modalPacienteTipoPago').val("-1").change();
                LoadingOff();
            } else {
                ErrorLog(data.responseText, "Lista Pagos Paciente");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Lista Pagos Paciente");
        }
    });
}

// FUNCION QUE VALIDA EL FORMULAIRO DE PAGOS
function validarFormPagoPaciente() {
    var correcto = true, msg = "";
    if ($('#modalPacienteRegistroPago').val() === "") {
        $('#modalPacienteRegistroPago').focus();
        msg = "Coloque <b>Monto a pagar</b>";
        correcto = false;
    } else if (isNaN($('#modalPacienteRegistroPago').val())) {
        $('#modalPacienteRegistroPago').focus();
        msg = "Cantidad inválida";
        correcto = false;
    } else if (parseFloat($('#modalPacienteRegistroPago').val()) <= 0) {
        $('#modalPacienteRegistroPago').focus();
        msg = "El <b>Monto a pagar</b> es incorrecto";
        correcto = false;
    } else if ($('#modalPacienteTipoPago').val() === "-1") {
        msg = "Seleccione <b>Tipo de pago</b>";
        correcto = false;
    } else if (parseFloat($('#modalPacienteRegistroPago').val()) > parseFloat($('#modalPacienteMontoActual').text())) {
        $('#modalPacienteRegistroPago').focus();
        msg = "El <b>Monto a pagar</b> es superior al <b>Monto Actual</b>";
        correcto = false;
    } else if (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1 && $('#modalTxtReferenciaPago').val() === "") {
        $('#modalTxtReferenciaPago').focus();
        msg = "Coloque <b>Referencia, Folio o Descripción</b>";
        correcto = false;
    }

    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}
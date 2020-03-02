// ********************************************************
// ARCHIVO JAVASCRIPT DINAMICOS.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var estatusPacienteConsulta = 0;
var finanzasPacientesJSON = {};
var idPacienteFinanzasGLOBAL = 0;

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - QUE CONTROLA LAS TECLAS PRESIONADAS AL ESCRIBIR EN LA CONSULTA DE PACIENTES
$(document).on('keyup', '#modalTxtPacienteBusqueda', function (e) {
    if (e.keyCode === 13 && $(this).val().length > 5) {
        llenarTablaConsultaPacientes();
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
                    url: "/Dinamicos/GenerarPagoPaciente",
                    data: { PacientePago: pacientePago },
                    beforeSend: function () {
                        LoadingOn("Generando Pago...");
                    },
                    success: function (data) {
                        try {
                            var dataPago = JSON.parse(data);
                            dataPago["NombrePaciente"] = $('#modalPacienteNombre').text();
                            dataPago["TipoPago"] = $('#modalPacienteTipoPago option:selected').text();
                            dataPago["ReferenciaPago"] = (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1) ? $('#modalTxtReferenciaPago').val() : "--";
                            imprimirReciboPago(dataPago);
                            $('#modalPacientesPagos').modal('hide');
                            LoadingOff();
                        } catch (err) {
                            ErrorLog(err.toString(), "Pago de Paciente");
                        }
                        /*if (data === "true") {
                            $('#modalPacientesPagos').modal('hide');
                            LoadingOff();
                        } else {
                            ErrorLog(data, "Pago de Paciente");
                        }*/
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

// FUNCION QUE EJECUTA EL LLAMADO DEL MODAL DE CONSULTA DE PACIENTES
function consultarPacientes() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/Pacientes",
        beforeSend: function () {
            LoadingOn("Cargando catálogo...");
        },
        success: function (data) {
            $('body').append(data);
            $('#modalPacienteBusqueda').modal('show');

            $('#modalPacienteBusqueda').on('shown.bs.modal', function (e) {
                LoadingOff();
                $('#modalTxtPacienteBusqueda').focus();
            });

            $('#modalPacienteBusqueda').on('hidden.bs.modal', function (e) {
                $('#modalPacienteBusqueda').remove();
            });
        },
        error: function (error) {
            ErrorLog(error, "Cargar Catalogo Pacientes");
        }
    });
}

// FUNCION QUE EJECUTA EL LLAMADO DEL MODAL DE CONSULTA DE PAGOS
function consultarPagos() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/Pagos",
        beforeSend: function () {
            LoadingOn("Cargando catálogo...");
        },
        success: function (data) {
            $('body').append(data);
            $('#modalPacientesPagos').modal('show');
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/ListaPagosPaciente",
                dataType: 'JSON',
                data: { IdFinanzas: idPacienteFinanzasGLOBAL },
                beforeSend: function () {
                    LoadingOn("Obteniendo lista pagos...");
                },
                success: function (data) {
                    if (Array.isArray(data)) {
                        console.log(data);
                        var montoActual = parseFloat(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].Monto);
                        var tablaPagos = "";
                        $(data).each(function (key, value) {
                            montoActual = montoActual - parseFloat(value.Pago);
                            tablaPagos += "<tr><td>" + value.Folio + "</td><td>$ " + value.Pago.toFixed(2) + "</td><td>" + value.FechaRegistro + "</td></tr>";
                        });
                        $('#modalPacienteNombre').html(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].NombreCompleto);
                        $('#modalPacienteMontoInicial').html(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].Monto.toFixed(2));
                        $('#modalPacienteMontoActual').html(montoActual.toFixed(2));
                        $('#modalPacientesPagos').modal('show');
                        $('#modalPacienteTipoPago').val("-1").change();
                        $('#modalTablaPacientesPagos').html(tablaPagos);
                        LoadingOff();
                    } else {
                        ErrorLog(data.responseText, "Lista Pagos Paciente");
                    }
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Lista Pagos Paciente");
                }
            });
            $('#modalPacientesPagos').on('shown.bs.modal', function (e) {

            });

            $('#modalPacientesPagos').on('hidden.bs.modal', function (e) {
                $('#modalPacientesPagos').remove();
            });
        },
        error: function (error) {
            ErrorLog(error, "Cargar Catalogo Pacientes");
        }
    });
}


// FUNCION QUE LLENA LA TABLA EN EL MODAL DE CONSULTA DE PACIENTES
function llenarTablaConsultaPacientes() {
    $('#modalTxtPacienteBusqueda').blur();
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ConsultaPaciente",
        data: { PacienteConsulta: $('#modalTxtPacienteBusqueda').val().toUpperCase(), Estatus: estatusPacienteConsulta },
        dataType: "JSON",
        beforeSend: function () {
            LoadingOn("Cargando pacientes...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "<div class='col-sm-12'><div class='table scrollestilo' style='max-height: 40vh; overflow: scroll;'><table class='table table-sm table-bordered'><thead><tr class='table-active'><th>Nombre Paciente</th><th>Opciones</th></tr></thead><tbody>óê%TABLA%óê</tbody></table></div></div>";
                    var pacientes = "";
                    $(data).each(function (key, value) {
                        pacientes += "<tr><td>" + value.NombreCompleto + "</td><td></td></tr>";
                    });
                    LoadingOff();
                    $('#modalTxtPacienteBusqueda').focus();
                    $('#modalTablaConsultaPacientes').html(tabla.replace("óê%TABLA%óê", pacientes));
                } else {
                    LoadingOff();
                    $('#modalTxtPacienteBusqueda').focus();
                    $('#modalTablaConsultaPacientes').html("<div class='col-sm-12' style='text-align: center;'><h2 style='color: #85929E;'><i class='fa fa-exclamation-circle'></i> No se encontraron pacientes.</h2></div>");
                }
            } else {
                ErrorLog(data.responseText, "Generar Consulta Pacientes");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Generar Consulta Pacientes");
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
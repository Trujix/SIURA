// ********************************************************
// ARCHIVO JAVASCRIPT ADMINISTRACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var PreRegistrosJSON = {};
var PreRegistroIDPaciente = 0;

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL ABRIR LA OPCION DE ADMINISTRACION
$(document).on('click', 'a[name="opcAdm"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        preregistros: "PreRegistros",
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

// DOCUMENT - TRAE LA LISTA DE PRE REGISTROS DE PACIENTES PENDIENTES
$(document).on('click', '#btnMostrarPreRegistros', function () {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ListaPreRegistros",
        dataType: "JSON",
        beforeSend: function () {
            $('#adminTablaPreRegistros').html('');
            LoadingOn("Cargando lista...");
            //finanzasPacientesJSON = {};
            PreRegistrosJSON = {};
            idPacienteFinanzasGLOBAL = 0;
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "";
                    $(data).each(function (key, value) {
                        tabla += "<tr id='trprepaciente_" + value.IdPaciente + "'><td>" + value.NombreCompleto + "</td><td>" + value.FechaRegistro + "</td><td style='text-align: center;'><button onclick='abrirAceptarContrato(" + value.IdPaciente + ")' class='btn badge badge-pill badge-warning'><i class='fa fa-stamp'></i>&nbsp;Aceptar contrato</button></td></tr>";
                        PreRegistrosJSON["PrePaciente_" + value.IdPaciente] = {
                            NombreCompleto: value.NombreCompleto
                        };
                        /*finanzasPacientesJSON["Finanza_" + value.IdFinanzas] = {
                            NombreCompleto: value.NombreCompleto,
                            Monto: value.Monto
                        };*/
                    });
                    $('#adminTablaPreRegistros').html(tabla);
                    LoadingOff();
                } else {
                    LoadingOff();
                    MsgAlerta("Info!", "No tiene pacientes con contratos pendientes", 3000, "info");
                }
            } else {
                ErrorLog(data.responseText, "Pacientes Pre Registros");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Pacientes Pre Registros");
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

// DOCUMENT - BOTON QUE ACEPTA DESDE EL MODAL EL CONTRATO DEL PACIENTE
$(document).on('click', '#btnModalAceptarContrato', function () {
    MsgPregunta("Aceptar Contrato", "¿Desea continuar?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Documentacion/ActEstatusPaciente",
                data: { IDPaciente: PreRegistroIDPaciente, Estatus: 2 },
                beforeSend: function () {
                    LoadingOn("Guardando cambios...");
                },
                success: function (data) {
                    if (data === "true") {
                        $('#trprepaciente_' + PreRegistroIDPaciente).remove();
                        $('#modalAceptarContrato').modal('hide');
                        LoadingOff();
                    } else {
                        ErrorLog(data, "Act Paciente: Contrato");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Act Paciente: Contrato");
                }
            });
        }
    });
});

// DOCUMENT - BOTON QUE CARGA LA LISTA DE PAGOS DE  PACIENTES [ FINANZAS ]
$(document).on('click', '#btnBuscarPacientePagos', function () {
    if ($('#buscarPacientePagos').val().length >= 4) {
        ListaPagosPacientes();
    }
});

// DOCUMENT - INPUT QUE CONTROLA EL TEXBOX Y TRAE LISTA DE PAGOS PACIENTES AL PRESIONAR ENTER [ FINANZAS ]
$(document).on('keyup', '#buscarPacientePagos', function (e) {
    if (e.keyCode === 13 && $(this).val().length >= 4) {
        ListaPagosPacientes();
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE AABRE EL MODAL PARA ACEPTAR CONTRATO DEL PACIENTE
function abrirAceptarContrato(idPaciente) {
    PreRegistroIDPaciente = idPaciente;
    $('#modalNombreAceptarContrato').html(PreRegistrosJSON["PrePaciente_" + idPaciente].NombreCompleto);
    $('#modalAceptarContrato').modal('show');
}

// FUNCION QUE EJECUTA EL PAGO DEL PACIENTE (ACCION PROVISIONAL DE PRUEBA, PARA HABILITARLO)
function ejecutarPagoPendientePaciente(idFinanzas) {
    idPacienteFinanzasGLOBAL = idFinanzas;
    consultarPagos();
}

// FUNCION QUE GENERA LA CONSULTA DE PAGOS DE PACIENTES [ FINANZAS ]
function ListaPagosPacientes() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ListaPacientesPagosPend",
        data: { Consulta: $('#buscarPacientePagos').val().toUpperCase() },
        dataType: "JSON",
        beforeSend: function () {
            $('#adminTablaPacientesPagos').html('');
            LoadingOn("Cargando lista...");
            finanzasPacientesJSON = {};
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "";
                    $(data).each(function (key, value) {
                        tabla += "<tr id='trpagos_" + value.IdFinanzas + "'><td>" + value.ClavePaciente + "</td><td>" + value.NombreCompleto + "</td><td>" + value.FechaRegistro + "</td><td>$ " + value.Monto.toFixed(2) + "</td><td style='text-align: center;'><button onclick='ejecutarPagoPendientePaciente(" + value.IdFinanzas + ")' class='btn badge badge-pill badge-success'><i class='fa fa-dollar-sign'></i>&nbsp;Gestionar</button></td></tr>";
                        finanzasPacientesJSON["Finanza_" + value.IdFinanzas] = {
                            NombreCompleto: value.NombreCompleto,
                            Monto: value.Monto
                        };
                    });
                    $('#adminTablaPacientesPagos').html(tabla);
                    LoadingOff();
                } else {
                    LoadingOff();
                    $('#adminTablaPacientesPagos').html("<tr><td colspan='5' style='text-align: center;'><div class='col-sm-12' style='text-align: center;'><h2 style='color: #85929E;'><i class='fa fa-exclamation-circle'></i> No se encontraron pacientes.</h2></div></td></tr>");
                    $('#buscarPacientePagos').val('').focus();
                }
            } else {
                ErrorLog(data.responseText, "Pacientes Pre Registros");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Pacientes Pre Registros");
        }
    });
}
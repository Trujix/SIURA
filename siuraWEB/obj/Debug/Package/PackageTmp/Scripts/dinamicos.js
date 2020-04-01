// ********************************************************
// ARCHIVO JAVASCRIPT DINAMICOS.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var estatusPacienteConsulta = 0;
var finanzasPacientesJSON = {};
var idPacienteFinanzasGLOBAL = 0;
var PagosListaJSON = {};
var CargosAdicionalesListaJSON = {};
var BecaComprobanteURL = "";
var IDClavePacienteGLOBAL = "";
var IdCargoAdicionalGLOBAL = 0;
var ListaPacientesConsultaJSON = [];

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - QUE CONTROLA LAS TECLAS PRESIONADAS AL ESCRIBIR EN LA CONSULTA DE PACIENTES
$(document).on('keyup', '#modalTxtPacienteBusqueda', function (e) {
    if (e.keyCode === 13 && $(this).val().length >= 4) {
        llenarTablaConsultaPacientes();
    }
});

// DOCUMENT - QUE CONTROLA EL BOTON DE BUSQUEDA DE PACIENTES
$(document).on('click', '#btnModalPacienteBusqueda', function () {
    llenarTablaConsultaPacientes();
});

// DOCUMENT - BOTON QUE GENERA EL PAGO DE UN PACIENTE
$(document).on('click', '#modalBtnGenerarPago', function () {
    if (validarFormPagoPaciente()) {
        MsgPregunta("Generar Pago", "¿Desea continuar?", function (si) {
            if (si) {
                var pacientePago = {
                    IdFinanzas: idPacienteFinanzasGLOBAL,
                    MontoPago: parseFloat($('#modalPacienteRegistroPago').val()),
                    TipoPago: $('#modalPacienteTipoPago option:selected').text(),
                    FolRefDesc: (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1) ? $('#modalTxtReferenciaPago').val() : "--"
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/GenerarPagoPaciente",
                    data: { PacientePago: pacientePago },
                    dataType: 'JSON',
                    beforeSend: function () {
                        LoadingOn("Generando Pago...");
                    },
                    success: function (data) {
                        try {
                            var dataLogo = JSON.parse(data[0]);
                            var dataPago = JSON.parse(data[1]);
                            dataPago["NombrePaciente"] = $('#modalPacienteNombre').text();
                            dataPago["TipoPago"] = $('#modalPacienteTipoPago option:selected').text();
                            dataPago["ReferenciaPago"] = (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1) ? $('#modalTxtReferenciaPago').val() : "--";
                            dataPago["ConceptoPago"] = "\n\nServicios de rehabilitación, atención médica y terapéutica\n\n\n\n";

                            imprimirReciboPago(dataPago, dataLogo.LogoCentro);
                            $('#modalPacientesPagos').modal('hide');
                            LoadingOff();
                        } catch (err) {
                            ErrorLog(err.toString(), "Pago de Paciente");
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

// DOCUMENT - BOTON QUE MANDA LLAMAR EL MODAL PARA GENERA NUEVO CARGO ADICIONAL
$(document).on('click', '#modalBtnNuevoCargoAdicional', function () {
    $('#modalNuevoCargoAdicional').modal('show');
});

// DOCUMENT - BOTON TIPO SELECT QUE CONTROLA LA SELECCIONDE DE UN TIPO DE  PAGO
$(document).on('change', '#modalPacienteTipoPago', function () {
    $('#modalDivReferenciaPago').hide();
    if (parseInt($(this).val()) !== 1 && parseInt($(this).val()) > 0) {
        $('#modalDivReferenciaPago').val("");
        $('#modalDivReferenciaPago').show();
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DEL CARGO ADICIONAL
$(document).on('click', '#modalGuardarCargoAdicional', function () {
    if (validarFormNuevoCargoAdicional()) {
        MsgPregunta("Generar Nuevo Cargo Adicional", "¿Desea continuar?", function (si) {
            if (si) {
                var cargoAdional = {
                    IdFinanzas: idPacienteFinanzasGLOBAL,
                    Importe: parseFloat($('#modalImporteCargoAdicional').val()),
                    Descripcion: $('#modalDescripcionCargoAdicional').val().toUpperCase(),
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/NuevoCargoAdicional",
                    data: { CargoAdicional: cargoAdional },
                    beforeSend: function () {
                        LoadingOn("Guardando Cargo Adicional...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalPacientesPagos').modal('hide');
                            $('#modalNuevoCargoAdicional').modal('hide');
                            LoadingOff();
                            MsgAlerta("Ok!", "<b>Cargo Adicional</b> generado <b>correctamente</b>", 2500, "success");
                        } else {
                            ErrorLog(data, "Nuevo Cargo Adicional");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Nuevo Cargo Adicional");
                    }
                });
            }
        });
    }
});

// DOCUMENT - CONTROLA EL BOTON QUE PERMITE SUBIR UN COMPROBANTE DE BECA AL PACIENTE DESDE EL MODAL PAGOS
$(document).on('click', '.modalsubirbecadoc', function () {
    ArchivoComrpobanteBeca = undefined;
    $('#modalPagosSubirBecaComprobante').click();
});

// DOCUMENT - CONTROLA EL INPUT FILE DEL ARCHIVO PARA SUBIR UN COMPORBANTE DE BECARIO
$(document).on('change', '#modalPagosSubirBecaComprobante', function (e) {
    ArchivoComrpobanteBeca = $(this).prop('files')[0];
    if (ArchivoComrpobanteBeca !== undefined) {
        var nombre = ArchivoComrpobanteBeca.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        if (extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "pdf") {
            comprobanteBecaJSON.Nombre = nombre;
            comprobanteBecaJSON.Extension = extension;
            MsgPregunta("Guardar Comprobante Becario", "¿Desea continuar?", function (si) {
                if (si) {
                    altaBecaDoc(IDClavePacienteGLOBAL, function (doc) {
                        if (doc) {
                            $('#modalPacientesPagos').modal('hide');
                            LoadingOff();
                            MsgAlerta("Ok!", "<b>Comprobante Becario</b> guardado <b>correctamente</b>", 2000, "success");
                        }
                    });
                }
            });
        } else {
            ArchivoComrpobanteBeca = undefined;
            MsgAlerta("Atención!", "Formato de archivo para <b>Comprobante</b> NO <b>válido</b>", 3500, "default");
            $('#pacienteBecarioDoc').val('');
        }
    }
});

// DOCUMENT - BOTON TIPO SELECT QUE CONTROLA LA SELECCIONDE DE UN TIPO DE PAGO (PAGO DE CARGO ADICIONAL)
$(document).on('change', '#modalPagoCargoTipoPago', function () {
    $('#modalFolDescRefPagoCargo').hide();
    if (parseInt($(this).val()) !== 1 && parseInt($(this).val()) > 0) {
        $('#modalFolDescRefPagoCargo').val("");
        $('#modalFolDescRefPagoCargo').show();
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL PAGO DEL CARGO ADICIONAL UNA VEZ CONFIGURADO EL FORM DEL MODAL
$(document).on('click', '#modalGuardarPagoCargoAdicional', function () {
    if (validarFormPagarCargoAdicional()) {
        MsgPregunta("Generar Pago Cargo", "¿Desea continuar?", function (si) {
            if (si) {
                var cargoPago = {
                    IdCargo: IdCargoAdicionalGLOBAL,
                    TipoPago: $('#modalPagoCargoTipoPago option:selected').text().toUpperCase(),
                    DescFolRefPago: (($('#modalFolDescRefPagoCargo').val() !== "") ? $('#modalFolDescRefPagoCargo').val() : "--")
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/GenerarPagoCargo",
                    data: { CargoPago: cargoPago },
                    dataType: 'JSON',
                    beforeSend: function () {
                        LoadingOn("Generando Pago...");
                    },
                    success: function (data) {
                        if (Array.isArray(data)) {
                            try {
                                $('#modalPagoCargoAdicional').modal('hide');
                                LoadingOff();
                                MsgPregunta("Comprobante de Pago", "¿Desea imprimir comprobante?", function (si) {
                                    if (si) {
                                        LoadingOn("Imprimiendo comprobante...");
                                        var dataLogo = JSON.parse(data[0]);
                                        var dataPago = JSON.parse(data[1]);
                                        dataPago["NombrePaciente"] = $('#modalPacienteNombre').text();
                                        dataPago["TipoPago"] = dataPago.TipoPago;
                                        dataPago["ReferenciaPago"] = dataPago.ReferenciaPago;

                                        imprimirReciboPago(dataPago, dataLogo.LogoCentro);
                                        LoadingOff();
                                        $('#modalPacientesPagos').modal('hide');
                                    } else {
                                        $('#modalPacientesPagos').modal('hide');
                                    }
                                });
                            } catch (e) {
                                ErrorLog(e.toString(), "Imprimir Cargo Pago");
                            }
                        } else {
                            ErrorLog(data.responseText, "Pagar Cargo Adicional");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error.responseText, "Pagar Cargo Adicional");
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
                    LoadingOn("Obteniendo info Paciente...");
                    PagosListaJSON = {};
                    CargosAdicionalesListaJSON = {};
                },
                success: function (data) {
                    if (data.Pagos !== undefined) {
                        var montoActual = parseFloat(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].Monto);
                        var tablaPagos = "";
                        $(data.Pagos).each(function (key, value) {
                            montoActual = montoActual - parseFloat(value.Pago);
                            tablaPagos += "<tr><td>" + value.Folio + "</td><td>$ " + value.Pago.toFixed(2) + "</td><td>" + value.FechaRegistro + "</td><td style='text-align: center;'><button onclick='reimprimirPago(" + value.IdPago + ")' title='Reimprimir Recibo' class='btn badge badge-pill badge-secondary'><i class='fa fa-print'></i></button>&nbsp;&nbsp;<button onclick='mostrarInfoPago(" + value.IdPago + ")' title='Info de Pago' class='btn badge badge-pill badge-dark'><i class='fa fa-info-circle'></i></button></td></tr>";
                            PagosListaJSON["Pago_" + value.IdPago] = {
                                TipoPago: value.TipoPago,
                                ReferenciaPago: value.Referencia
                            };
                        });
                        var montoCargos = 0, cargos = "";
                        $(data.Cargos).each(function (key, value) {
                            var opciones = '', clase = '';
                            if (value.Pagado) {
                                opciones = '<span class="badge badge-pill badge-dark" onclick="reimprimirPagoCargoAdicional(' + value.IdCargo + ');" style="cursor: pointer;" title="Imprimir Recibo de Pago"><i class="fa fa-print"></i></span>';
                                clase = ' class="table-success"';
                            } else {
                                opciones = '<span class="badge badge-pill badge-success" onclick="pagarCargoAdicional(' + value.IdCargo + ');" style="cursor: pointer;" title="Pagar Cargo"><i class="fa fa-dollar-sign"></i></span>';
                            }
                            if (value.CargoInicial) {
                                opciones = '<span class="badge badge-pill badge-secondary">--</span>';
                                clase = ' class="table-warning"';
                            }
                            if (!value.CargoInicial && !value.Pagado) {
                                montoCargos += value.Importe;
                            }
                            cargos += "<tr" + clase + "><td>" + value.Folio + "</td><td>" + value.Descripcion + "</td><td>$&nbsp;" + value.Importe.toFixed(2) + "</td><td>" + value.FechaRegistro + "</td><td style='text-align: center;'>" + opciones + "</td></tr>";
                            CargosAdicionalesListaJSON["Cargo_" + value.IdCargo] = {
                                Importe: value.Importe,
                                Descripcion: value.Descripcion
                            };
                        });
                        $('#modalPacienteNombre').html(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].NombreCompleto);
                        $('#modalPacienteMontoInicial').html(finanzasPacientesJSON["Finanza_" + idPacienteFinanzasGLOBAL].Monto.toFixed(2));
                        $('#modalPacienteMontoActual').html(montoActual.toFixed(2));
                        $('#modalPacienteCargoAdicional').html(montoCargos.toFixed(2));
                        $('#modalPacienteTipoPago').val("-1").change();
                        $('#modalTablaPacientesPagos').html(tablaPagos);
                        $('#modalTablaCargosAdicionales').html(cargos);

                        if (data.Becario) {
                            var becaDoc = '<div class="col-sm-12"><button class="btn badge badge-danger modalsubirbecadoc"><i class="fa fa-times"></i>&nbsp;Agregar un comprobante</button><input id="modalPagosSubirBecaComprobante" type="file" style="visibility: hidden; font-size: 0px;"accept=".jpg, .jpeg, .png, .pdf" /></div>';
                            if (data.BecaComprobante !== "SINIMG") {
                                becaDoc = '<div class="col-sm-12"><button class="btn badge badge-success" onclick="mostrarBecaComprobante();"><i class="fa fa-folder-open"></i>&nbsp;Mostrar comprobante</button></div>';
                            }
                            $('#modalDivPacienteBecaInfo').html('<div class="col-sm-12"><span class="badge badge-pill badge-primary">Paciente Becario</span></div><div class="col-sm-12" style="padding-top: 8px;"><h6><b>Apoyo Beca:</b><br>' + ((data.BecaTipo === "%") ? data.BecaValor.toString() + data.BecaTipo.toString() : data.BecaTipo + " " + parseFloat(data.BecaValor).toFixed(2)) + '</h6></div>' + becaDoc);
                            BecaComprobanteURL = data.UrlFolderUsuario.toString() + data.BecaComprobante.toString();
                            IDClavePacienteGLOBAL = data.ClavePaciente;
                        } else {
                            $('#modalDivPacienteBecaInfo').html('<div class="col-sm-12"><span class="badge badge-pill badge-secondary">Paciente No Becario</span></div>');
                        }

                        $('#modalPacientesPagos').modal('show');
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
                $('#modalNuevoCargoAdicional').remove();
                $('#modalPagoCargoAdicional').remove();
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
            ListaPacientesConsultaJSON = [];
            LoadingOn("Cargando pacientes...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "<div class='col-sm-12'><div class='table scrollestilo' style='max-height: 40vh; overflow: scroll;'><table class='table table-sm table-bordered'><thead><tr class='table-active'><th>Nombre Paciente</th><th style='text-align: center;'>Nivel</th><th style='text-align: center;'>Opciones</th></tr></thead><tbody>óê%TABLA%óê</tbody></table></div></div>";
                    var pacientes = "";
                    $(data).each(function (key, value) {
                        var id = cadAleatoria(8), boton = "", nivel = "";
                        if (value.Estatus == 1) {
                            boton = "<button class='btn badge badge-pill badge-warning editarPrePaciente' title='Editar Pre-registro'><i class='fa fa-user-edit'></i></button>&nbsp;<button class='btn badge badge-pill badge-dark reimprimircontrato' idpaciente='" + value.IdPaciente + "' title='Reimprimir Contrato'><i class='fa fa-print'></i></button>";
                            nivel = "<span class='badge badge-dark'>Pre-registro</span>";
                        } else if (value.Estatus == 2) {
                            boton = "<button class='btn badge badge-pill badge-warning configurarPacienteIngreso' idpaciente='" + id + "' title='Configurar Ingreso'><i class='fa fa-user-cog'></i>&nbsp;Configurar Ingreso</button>";
                            nivel = "<span class='badge badge-dark'>Pre-Ingreso</span>";
                        } else if (value.Estatus == 3) {

                        }
                        pacientes += "<tr><td>" + value.NombreCompleto + "</td><td style='text-align: center;'>" + nivel + "</td><td style='text-align: center;'>" + boton + "</td></tr>";
                        ListaPacientesConsultaJSON.push({
                            Id: id,
                            IdPaciente: value.IdPaciente,
                            NombreCompleto: value.NombreCompleto,
                            ClavePaciente: value.ClavePaciente,
                        });
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

// FUNCION QUE VALIDA EL FORMULARIO DE NUEVO CARGO ADICIONAL
function validarFormNuevoCargoAdicional() {
    var correcto = true, msg = "";
    if ($('#modalImporteCargoAdicional').val() === "" || parseFloat($('#modalImporteCargoAdicional').val()) < 1 || isNaN(parseFloat($('#modalImporteCargoAdicional').val()))) {
        correcto = false;
        $('#modalImporteCargoAdicional').focus();
        msg = "El Importe es <b>Incorrecto</b> o <b>Inválido</b>";
    } else if ($('#modalDescripcionCargoAdicional').val() === "") {
        correcto = false;
        $('#modalDescripcionCargoAdicional').focus();
        msg = "Coloque la <b>Descripción</b>";
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE REIMPRIME EL RECIBO DE PAGO DEL PACIENTE
function reimprimirPago(idPago) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ReimprimirRecibo",
        data: { IDPago: idPago },
        dataType: "JSON",
        beforeSend: function () {
            LoadingOn("Cargando Recibo...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                try {
                    var dataLogo = JSON.parse(data[0]);
                    var dataPago = JSON.parse(data[1]);
                    dataPago["NombrePaciente"] = $('#modalPacienteNombre').text();
                    dataPago["TipoPago"] = dataPago.TipoPago;
                    dataPago["ReferenciaPago"] = (parseInt($('#modalPacienteTipoPago').val()) > 0 && parseInt($('#modalPacienteTipoPago').val()) !== 1) ? $('#modalTxtReferenciaPago').val() : "--";
                    dataPago["ConceptoPago"] = "\n\nServicios de rehabilitación, atención médica y terapéutica\n\n\n\n";

                    imprimirReciboPago(dataPago, dataLogo.LogoCentro);
                    LoadingOff();
                } catch (e) {
                    ErrorLog(e.toString(), "Reimprimir Recibo Pago");
                }
            } else {
                ErrorLog(data.responseText, "Reimprimir Recibo Pago");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Reimprimir Recibo Pago");
        }
    });
}

// FUNCION QUE MUESTRA INFO SENCILLA DEL PAGO
function mostrarInfoPago(idPago) {
    MsgAlerta("Info!", "Caracteristicas del pago:\n\n<b>Tipo: </b> " + PagosListaJSON["Pago_" + idPago].TipoPago + "\n\n<b>Referencia: </b> " + PagosListaJSON["Pago_" + idPago].ReferenciaPago, 8000, "info");
}

// FUNCION QUE MUESTRA / ANBRE EL COMPROBANTE DEL BECARIO DESDE EL PANEL DE PAGOS Y FINANZAS DEL PACIENTE
function mostrarBecaComprobante() {
    window.open(BecaComprobanteURL, '_blank');
}

// FUNCION QUE GENERA EL PAGO DE UN CARGO ADICIONAL
function pagarCargoAdicional(idCargo) {
    IdCargoAdicionalGLOBAL = idCargo;
    $('#modalPagoCargoTipoPago').val("1");
    $('#modalFolDescRefPagoCargo').hide();
    $('#modalPagoCargoAdicional').modal('show');
    $('#modalPagoCargoImporte').html("$ " + CargosAdicionalesListaJSON["Cargo_" + idCargo].Importe.toFixed(2));
    $('#modalPagoCargoDescripcion').html(CargosAdicionalesListaJSON["Cargo_" + idCargo].Descripcion);
}

// FUNCION QUE VALIDA EL FORMULARIO DEL PAGO DE CARGO ADICIONAL
function validarFormPagarCargoAdicional() {
    var correcto = true, msg = "";
    if (parseInt($('#modalPagoCargoTipoPago').val()) > 0 && parseInt($('#modalPagoCargoTipoPago').val()) !== 1 && $('#modalFolDescRefPagoCargo').val() === "") {
        $('#modalFolDescRefPagoCargo').focus();
        msg = "Coloque <b>Referencia, Folio o Descripción</b>";
        correcto = false;
    }

    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE REIMPRIME EL RECIBO DE PAGO DEL CARGO ADICIONAL
function reimprimirPagoCargoAdicional(idCargo) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ReimprimirPagoCargo",
        data: { IDCargo: idCargo },
        dataType: 'JSON',
        beforeSend: function () {
            LoadingOn("Generando Recibo...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                try {
                    var dataLogo = JSON.parse(data[0]);
                    var dataPago = JSON.parse(data[1]);
                    dataPago["NombrePaciente"] = $('#modalPacienteNombre').text();
                    dataPago["TipoPago"] = dataPago.TipoPago;
                    dataPago["ReferenciaPago"] = dataPago.ReferenciaPago;

                    imprimirReciboPago(dataPago, dataLogo.LogoCentro);
                    LoadingOff();
                } catch (e) {
                    ErrorLog(e.toString(), "Reimprimir Cargo Pago");
                }
            } else {
                ErrorLog(data.responseText, "Reimprimir Cargo Pago");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Reimprimir Cargo Pago");
        }
    });
}
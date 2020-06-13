// ********************************************************
// ARCHIVO JAVASCRIPT DINAMICOS.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var EstatusPacientesJSON = {
    1: "Pre-Registro",
    2: "Pre-Ingreso",
    3: "En Rev. Coord.",
};
var estatusPacienteConsulta = 0;
var finanzasPacientesJSON = {};
var idPacienteFinanzasGLOBAL = 0;
var PagosListaJSON = {};
var CargosAdicionalesListaJSON = {};
var BecaComprobanteURL = "";
var IDClavePacienteGLOBAL = "";
var IdCargoAdicionalGLOBAL = 0;
var ListaPacientesConsultaJSON = [];
var IdArticuloInventarioGLOBAL = 0;
var CodigoArticuloInventarioAuto = "";
var InventarioArticuloSelecJSON = {};
var InventarioAltaJSON = {};
var tipoInventarioGLOBAL = "";
var tablaDivInventarioGLOBAL = "";
var accionInventarioExitencia = "";
var existenciaArticuloInventario = 0;
var imprimirInventarioTipo = "";
var imprimirInventarioGestion = "";
var InventarioImprimirDataJSON = {};
var InventarioImprimirFormato = 0;
var IdPacienteNIngresoGLOBAL = 0;
var nuevosIngresosListaJSON = [];
var NuevoIngresoCoordGLOBAL = '';
var listaNIngresoParamsDOM = [];
var claveTestGLOBAL = '';
var ArchivoDocNuevoIngreso;
var ArchivoDocNuevoIngresoDATA = {
    Nombre: "",
    Extension: ""
};
var NuevoIgresoAltaJSON = {};
var ValidarAprobacionNIngreso = false;
var PacienteNIngresoDataJSON = [];
var divsCoordsJSON = {
    CM: 'divMenuCMedica',
    CP: 'divMenuCPsicologica',
    CC: 'divMenuCConsejeria',
};

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

// DOCUMENT - BOTON QUE CONTROLA LA BUSQUEDA DE PACIENTES POR NIVEL
$(document).on('click', '#btnModalTxtPacienteBusquedaNivel', function () {
    llenarTablaConsultaPacientesNivel();
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

// DOCUMENT - CONTROLA EL CHECK QUE PERMITE ELEGIR SI SE COLOCA UN CODIGO AL ARTICULO O SE GENERA AUTOMATICO
$(document).on('change', '#modalInventarioCodigoAut', function () {
    $('#modalInventarioCodigo').val(CodigoArticuloInventarioAuto);
    if ($(this).is(":checked")) {
        $('#modalInventarioCodigo').attr("disabled", true);
        $('#modalInventarioNombre').focus();
    } else {
        $('#modalInventarioCodigo').removeAttr("disabled");
        $('#modalInventarioCodigo').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE UN NUEVO ELEMENTO EN EL INVENTARIO 
$(document).on('click', '#modalInventarioGuardar', function () {
    if (validarFormInventario()) {
        MsgPregunta("Guardar Elmento Inventario", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/GuardarInventarioArticulo",
                    data: { InventarioData: InventarioAltaJSON },
                    beforeSend: function () {
                        LoadingOn("Guardando Elemento...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalAltaInventario').modal('hide');
                            setTimeout(function () {
                                consultarInventarios(tablaDivInventarioGLOBAL, tipoInventarioGLOBAL, function () {
                                    LoadingOff();
                                    MsgAlerta("Ok!", "Elemento de Inventario <b>guardado</b>", 2500, "success");
                                });
                            }, 1500);
                        } else {
                            ErrorLog(data, "Guardar Elemento Inventario");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Guardar Elemento Inventario");
                    }
                });
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL ABRIR EL MODAL PARA EDITAR LA EXISTENCIA (QUITAR / AÑADIR)
$(document).on('click', '.inventarioexistencias', function () {
    IdArticuloInventarioGLOBAL = parseInt($(this).attr("idelemento"));
    accionInventarioExitencia = $(this).attr("accion");
    existenciaArticuloInventario = parseFloat($('#tdinvexistencia_' + $(this).attr("idelemento")).text());
    $('#modalInventarioExistenciaTitulo').html(($(this).attr("accion") === "Q") ? '<span class="badge badge-danger">Salida Existencias</span>' : '<span class="badge badge-success">Entrada Existencias</span>');
    $('#modalInventarioExistenciaNombre').text($('#tdinvnombre_' + $(this).attr("idelemento")).text());
    $('#modalInventarioExistenciaActual').text($('#tdinvexistencia_' + $(this).attr("idelemento")).text());
    $('#modalInventarioExistenciaCant').val('0');
    $('#modalInventarioExistencia').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE LA EXISTENCIA DE UN ARTICULO DE INVENTARIO
$(document).on('click', '#modalBtnInventarioExistencia', function () {
    if (validarFormExistencias()) {
        MsgPregunta("Guardar Valores Existencias", "¿Desea Continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/ActInventarioExistencias",
                    data: { InventarioData: InventarioAltaJSON },
                    beforeSend: function () {
                        LoadingOn("Guardando Cambios...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalInventarioExistencia').modal('hide');
                            setTimeout(function () {
                                consultarInventarios(tablaDivInventarioGLOBAL, tipoInventarioGLOBAL, function () {
                                    LoadingOff();
                                    MsgAlerta("Ok!", "Elemento de Inventario <b>actualizado</b>", 2500, "success");
                                });
                            }, 1500);
                        } else {
                            ErrorLog(data, "Actualizar Existencia Elemento Inventario");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Actualizar Existencia Elemento Inventario");
                    }
                });
            }
        });
    }
});

// DOCUMENT - TAB QUE CONTROLA LA SELECCION DEL [ TIPO ] DE IMPRESION DE INVENTARIO
$(document).on('click', '.inventarioimprimirtab', function () {
    imprimirInventarioTipo = $(this).attr("opcion");
    $('.btnimprimirinventariohtml').hide();
    if ($(this).attr("opcion") === "t2") {
        $('.btnimprimirinventariohtml').show();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA EJECUCION DE IMPRESIÓN DEL INVENTARIO (ELECCION DEL FORMATO)
$(document).on('click', '.btnimprimirinventario', function () {
    InventarioImprimirFormato = parseInt($(this).attr("tipo"));
    if (validarFormImprimirInventario()) {
        MsgPregunta("Imprimir Reporte", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Dinamicos/InventarioImpresion",
                    dataType: 'JSON',
                    data: { InventarioImpresionData: InventarioImprimirDataJSON },
                    beforeSend: function () {
                        LoadingOn("Generando Reporte Inventario...");
                    },
                    success: function (data) {
                        if (data.Correcto) {
                            if (InventarioImprimirFormato === 1) {
                                imprimirInventarioReporte(data, imprimirInventarioGestion);
                            } else if (InventarioImprimirFormato === 2) {
                                abrirInventarioExcel(data.UrlDoc);
                            }
                            LoadingOff();
                        } else {
                            if (data.Error === "errFormato") {
                                LoadingOff();
                                MsgAlerta("Error", "Ocurrió un error al detectar el <b>Formato</b> del reporte\n\nFormatos Válidos: <b>Excel o PDF</b>", 3000, "error");
                            } else {
                                ErrorLog(data.Error, "Reporte Inventario");
                            }
                        }
                    },
                    error: function (error) {
                        ErrorLog(error.responseText, "Reporte Inventario");
                    }
                });
            }
        });
    }
});

// DOCUMENT - BOTON QUE MUESTRA UN MODAL CON LA TABLA DE LOS DETALLES DEL INVENTARIO (ENTRADAS Y SALIDAS)
$(document).on('click', '.btnimprimirinventariohtml', function () {
    InventarioImprimirFormato = 1;
    if (validarFormImprimirInventario()) {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Dinamicos/InventarioImpresion",
            dataType: 'JSON',
            data: { InventarioImpresionData: InventarioImprimirDataJSON },
            beforeSend: function () {
                LoadingOn("Generando Reporte Inventario...");
            },
            success: function (data) {
                if (data.Correcto) {
                    verReporteInventarios(data.InventarioData);
                } else {
                    ErrorLog(data.Error, "Reporte Inventario Tabla");
                }
            },
            error: function (error) {
                ErrorLog(error.responseText, "Reporte Inventario Tabla");
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA LAS ACCIONES DE LOS BOTONES DE LA DECISION DEL USUARIO PARA EL NUEVO INGRESO
$(document).on('click', '.configniarchivo, .confignitest', function () {
    var param = $(this).attr("param");
    $(listaNIngresoParamsDOM).each(function (key, value) {
        if (value.IdElem === param) {
            claveTestGLOBAL = value.Clave;
        }
    });
    if (parseInt($(this).attr("accion")) === 1) {
        nuevoIngresoSubirArchivo();
    } else if (parseInt($(this).attr("accion")) === 2) {

    }
});

// DOCUMENT - BOTON QUE REALIZA UNA PAUSA AL CERRAR EL FORMULARIO DEL SUBIR ARCHIVO NUEVO INGRESO
$(document).on('click', '#modalNuevoIngresoArchivoCancelar', function () {
    LoadingOn("Cargando parametros...");
    setTimeout(function () {
        LoadingOff();
    }, 1500);
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL INPUT FILE PARA SUBIR UN ARCHIVO DE NUEVO INGRESO
$(document).on('click', '#modalBtnNuevoIngresoArchivo', function () {
    $('#modalNuevoIngresoArchivoFile').click();
});

// DOCUMENT - TIPO FILE QUE CONTROLA EL ANEXO DEL ARCHIVO PARA EL NUEVO INGRESO
$(document).on('change', '#modalNuevoIngresoArchivoFile', function (e) {
    ArchivoDocNuevoIngreso = $(this).prop('files')[0];
    if (ArchivoDocNuevoIngreso !== undefined) {
        ArchivoDocNuevoIngresoDATA.Nombre = claveTestGLOBAL + "_" + IdPacienteNIngresoGLOBAL.toString();
        ArchivoDocNuevoIngresoDATA.Extension = ArchivoDocNuevoIngreso.name.substring(ArchivoDocNuevoIngreso.name.lastIndexOf('.') + 1);
        if (ArchivoDocNuevoIngresoDATA.Extension === 'pdf' || ArchivoDocNuevoIngresoDATA.Extension === 'jpg' || ArchivoDocNuevoIngresoDATA.Extension === 'jpeg' || ArchivoDocNuevoIngresoDATA.Extension === 'png') {
            $('#modalNuevoIngresoArchivoCard').attr("title", "Archivo Seleccionado").removeClass("border-danger").addClass("border-success");
            $('#modalNuevoIngresoArchivoIcono').css("color", "#28a745").removeClass("fa-times").addClass("fa-check");
        } else {
            MsgAlerta("Atención!", "El formato del archivo <b>NO es válido</b>\n\nSolo documentos <b>pdf</b> o archivos de imagen <b>jpg o png</b>", 4500, "default");
            $('#modalNuevoIngresoArchivoCard').attr("title", "Sin Archivo").removeClass("border-success").addClass("border-danger");
            $('#modalNuevoIngresoArchivoIcono').css("color", "#dc3545").removeClass("fa-check").addClass("fa-times");
            $(this).val('');
            ArchivoDocNuevoIngreso = $(this).prop('files')[0];
        }
    } else {
        $('#modalNuevoIngresoArchivoCard').attr("title", "Sin Archivo").removeClass("border-success").addClass("border-danger");
        $('#modalNuevoIngresoArchivoIcono').css("color", "#dc3545").removeClass("fa-check").addClass("fa-times");
    }
});

// DOCUMENT - BOTON QUE GUARDA LOS PARAMETROS DEL ARCHIVO DEL NUEVO INGRESO
$(document).on('click', '#modalNuevoIngresoArchivoGuardar', function () {
    if (validarFormNuevoIngreso(2)) {
        MsgPregunta("Guardar Archivo", "¿Desea continuar?", function (si) {
            if (si) {
                var archivoData = new FormData();
                var archivoInfo = {
                    Nombre: ArchivoDocNuevoIngresoDATA.Nombre,
                    Extension: ArchivoDocNuevoIngresoDATA.Extension
                };
                archivoData.append("Archivo", ArchivoDocNuevoIngreso);
                archivoData.append("Info", JSON.stringify(archivoInfo));
                $.ajax({
                    type: "POST",
                    url: "/Dinamicos/GuardarArchivoDinamicos",
                    data: archivoData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    beforeSend: function () {
                        LoadingOn("Guardando Archivo...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $.ajax({
                                type: "POST",
                                contentType: "application/x-www-form-urlencoded",
                                url: "/Dinamicos/GuardarPacienteNuevoIngreso",
                                data: { PacienteNuevoIngreso: NuevoIgresoAltaJSON },
                                beforeSend: function () {
                                    LoadingOn("Guardando Parametros...");
                                },
                                success: function (data) {
                                    if (data === "true") {
                                        $('#modalNuevoIngresoArchivo').modal('hide');
                                        setTimeout(function () {
                                            $('#modalNuevoIngresoOpciones').modal('hide');
                                            setTimeout(function () {
                                                configPacienteNuevoIngreso(IdPacienteNIngresoGLOBAL);
                                            }, 2000);
                                        }, 2000);
                                    } else {
                                        ErrorLog(data, "Guardar Nuevo Ingreso Archivo");
                                    }
                                },
                                error: function (error) {
                                    ErrorLog(error, "Guardar Nuevo Ingreso Archivo");
                                }
                            });
                        } else {
                            ErrorLog(data, "Guardar Archivo Servidor");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Guardar Archivo Servidor");
                    }
                });
            }
        });
    }
});

// DOCUMENT - BOTON QUE ACEPTA Y APRUEBA EL CASO DEL NUEVO INGRESO
$(document).on('click', '#nuevoIngresoAprobarCaso', function () {
    if (ValidarAprobacionNIngreso) {
        LoadingOn("Habilitando Opción...");
        $('#' + divsCoordsJSON[NuevoIngresoCoordGLOBAL]).append(modalNIngresoAprobHTML);
        $('#modalAprobarPacienteIngreso').modal('show');

        $('#modalAprobarPacienteIngreso').on('shown.bs.modal', function () {
            $('#modalAprobarPacienteIngresoCoord').html(CoordNombreCompletoNI());
            LoadingOff();
        });
        $('#modalAprobarPacienteIngreso').on('hidden.bs.modal', function () {
            $('#modalAprobarPacienteIngreso').remove();
            LoadingOff();
        });
    } else {
        MsgAlerta("Atención!", "No puede <b>Aprobar</b> el caso de este paciente todavía. Configure los formularios pendientes (derecha) para poder continuar", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE ACEPTA LA APROBACION DEL CASO DEL PACIENTE DE NUEVO INGRESO
$(document).on('click', '#modalAprobarPacienteIngresoAceptar', function () {
    MsgPregunta("Aprobar Caso Paciente", "¿Desea continuar?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/AprobarNuevoIngreso",
                data: { IDPaciente: IdPacienteNIngresoGLOBAL, Coordinacion: NuevoIngresoCoordGLOBAL },
                beforeSend: function () {
                    LoadingOn("Guardando Cambios...");
                },
                success: function (data) {
                    if (data === "true") {
                        $('#modalAprobarPacienteIngreso').modal('hide');
                        setTimeout(function () {
                            LoadingOn("Asignando Parametros...");
                            $('#modalNuevoIngresoOpciones').modal('hide');
                            setTimeout(function () {
                                MsgAlerta("Ok!", "Información de <b>Nuevo Ingreso</b> ha sido <b>actualizada</b>", 1500, "success");
                                LoadingOff();
                                setTimeout(function () {
                                    $('#btnObtenerListaNIngresos' + NuevoIngresoCoordGLOBAL).click();
                                }, 1800);
                            }, 3000);
                        }, 1500);
                    } else {
                        ErrorLog(data, "Aprobar Nuevo Ingreso - " + NuevoIngresoCoordGLOBAL);
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Aprobar Nuevo Ingreso - " + NuevoIngresoCoordGLOBAL);
                }
            });
        }
    });
});

// DOCUMENT - BOTON QUE CANCELA LA APROBACION DEL CASO DEL PACIENTE DE NUEVO INGRESO
$(document).on('click', '#modalAprobarPacienteIngresoCancelar', function () {
    LoadingOn("Cancelando Parametros...");
    $('#modalAprobarPacienteIngreso').modal('hide');
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
            var llaves = Object.keys(EstatusPacientesJSON), listaNiv = '';
            for (i = 0; i < llaves.length; i++) {
                listaNiv += '<option value="' + llaves[i] + '">' + EstatusPacientesJSON[llaves[i]] + '</option>';
            }
            $('#modalTxtPacienteBusquedaNivel').html(listaNiv);
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

                        var parcialDiv = '<span class="badge badge-secondary">Sin Pagos Parciales</span>';
                        if (data.Parcialidad) {
                            parcialDiv = '<span class="badge badge-info">Compromisos de Pagos</span><br><h6><b>Monto Pago: </b><span class="badge badge-secondary">$ ' + data.MontoPagoParcial.toFixed(2) + '</span></h6><h6><b>Cant. Pagos: </b><span class="badge badge-secondary">' + data.CantPagos + '</span></h6><h6><b>Periodos: </b><span class="badge badge-secondary">' + data.TipoPagos + '</span></h6>';
                        }
                        $('#modalDivPacientePagosParcial').html(parcialDiv);

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
            llenarTablaDinamicaPacienteBusq(data);
        },
        error: function (error) {
            ErrorLog(error.responseText, "Generar Consulta Pacientes");
        }
    });
}

// FUNCION QUE GENERA CONSULTA DE PACIENTE POR  PARAMETRO DE NIVEL
function llenarTablaConsultaPacientesNivel() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ConsultaPacienteNivel",
        data: { Estatus: $('#modalTxtPacienteBusquedaNivel').val() },
        dataType: "JSON",
        beforeSend: function () {
            ListaPacientesConsultaJSON = [];
            LoadingOn("Cargando pacientes...");
        },
        success: function (data) {
            llenarTablaDinamicaPacienteBusq(data);
        },
        error: function (error) {
            ErrorLog(error.responseText, "Generar Consulta Pacientes");
        }
    });
}

// --------------------- [ CONSULTA DINAMICA ] ---------------------
function llenarTablaDinamicaPacienteBusq(data) {
    if (Array.isArray(data)) {
        if (data.length > 0) {
            var tabla = "<div class='col-sm-12'><div class='table scrollestilo' style='max-height: 40vh; overflow: scroll;'><table class='table table-sm table-bordered'><thead><tr class='table-active'><th>Nombre Paciente</th><th style='text-align: center;'>Nivel</th><th style='text-align: center;'>Opciones</th></tr></thead><tbody>óê%TABLA%óê</tbody></table></div></div>";
            var pacientes = "";
            $(data).each(function (key, value) {
                var id = cadAleatoria(8), boton = "", nivel = "";
                if (value.Estatus === 1) {
                    boton = "<button class='btn badge badge-pill badge-warning editarPrePaciente' title='Editar Pre-registro'><i class='fa fa-user-edit'></i></button>&nbsp;<button class='btn badge badge-pill badge-dark reimprimircontrato' idpaciente='" + value.IdPaciente + "' title='Reimprimir Contrato'><i class='fa fa-print'></i></button>";
                    nivel = "<span class='badge badge-dark'>" + EstatusPacientesJSON[value.Estatus.toString()] + "</span>";
                } else if (value.Estatus === 2) {
                    boton = "<button class='btn badge badge-pill badge-warning configurarPacienteIngreso' idpaciente='" + id + "' title='Configurar Ingreso'><i class='fa fa-user-cog'></i>&nbsp;Configurar Ingreso</button>";
                    nivel = "<span class='badge badge-dark'>" + EstatusPacientesJSON[value.Estatus.toString()] + "</span>";
                } else if (value.Estatus === 3) {
                    boton = "<button class='btn badge badge-pill badge-warning' idpaciente='" + id + "' title='Ver Información'><i class='fa fa-search'></i>&nbsp;Ver Info.</button>";
                    nivel = "<span class='badge badge-dark'>" + EstatusPacientesJSON[value.Estatus.toString()] + "</span>";
                } else if (value.Estatus === 4) {

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

// FUNCION QUE CARGA LA TABLA DE INVENTARIO
function consultarInventarios(tablaDiv, tipoInventario, callback) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/Inventario",
        beforeSend: function () {
            $('.modalinventario').remove();
            LoadingOn("Abriendo Inventario...");
        },
        success: function (data) {
            $('#divMaestro').append(data);
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/ConsultaInventario",
                data: { TipoInventario: tipoInventario },
                dataType: 'JSON',
                beforeSend: function () {
                    $('#' + tablaDiv).html(tablaInventarioHTML);
                    $('input[name="modalcheckinventario"]').bootstrapToggle('off');
                    if (tipoInventario !== "*") {
                        $('#modalInventarioArea').val(tipoInventario).attr("disabled", true);
                    }
                    tablaDivInventarioGLOBAL = tablaDiv;
                    tipoInventarioGLOBAL = tipoInventario;
                    LoadingOn("Obteniendo Inventario...");
                },
                success: function (data) {
                    var headerTabla = (tipoInventario === "*") ?
                        [
                            { title: "Codigo/SKU" },
                            { title: "Nombre" },
                            { title: "Presentación" },
                            { title: "Prec. Compra" },
                            { title: "Prec. Vta." },
                            { title: "Exist." },
                            { title: "Area" },
                            { title: "Opciones", "orderable": false }
                        ] :
                        [
                            { title: "Codigo/SKU" },
                            { title: "Nombre" },
                            { title: "Presentación" },
                            { title: "Prec. Compra" },
                            { title: "Prec. Vta." },
                            { title: "Exist." },
                            { title: "Opciones", "orderable": false }
                        ];
                    $('#tablaInventario').DataTable({
                        scrollY: "50vh",
                        data: data,
                        columns: headerTabla,
                        info: false,
                        search: true,
                        "search": {
                            "regex": true
                        }
                    });
                    callback(true);
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Obtener Lista Inventarios");
                    callback(false);
                }
            });
        },
        error: function (error) {
            ErrorLog(error.responseText, "Abrir Inventario C. Medica");
            callback(false);
        }
    });
}

// FUNCION QUE ABRE EL MODAL DE INVENTARIOS
function abrirModalAltaInventario(nuevo) {
    $('#modalInventarioCodigoAut').bootstrapToggle('off', true);
    $('#modalInventarioCodigo').removeAttr("disabled");
    $('#modalInventarioExistencias').removeAttr("disabled");
    if (nuevo) {
        IdArticuloInventarioGLOBAL = 0;
        CodigoArticuloInventarioAuto = "";
        $('.modalinventariotxt').val('');
    } else {
        IdArticuloInventarioGLOBAL = InventarioArticuloSelecJSON.IdArticuloInventario;
        CodigoArticuloInventarioAuto = InventarioArticuloSelecJSON.Codigo;
        $('#modalInventarioCodigoAut').bootstrapToggle((InventarioArticuloSelecJSON.CodigoAut) ? 'on' : 'off', true);
        $('#modalInventarioCodigo').val(InventarioArticuloSelecJSON.Codigo);
        $('#modalInventarioNombre').val(InventarioArticuloSelecJSON.Nombre);
        $('#modalInventarioPresentacion').val(InventarioArticuloSelecJSON.Presentacion);
        $('#modalInventarioPrecioCompra').val(InventarioArticuloSelecJSON.PrecioCompra);
        $('#modalInventarioPrecioVenta').val(InventarioArticuloSelecJSON.PrecioVenta);
        $('#modalInventarioExistencias').val(parseFloat(InventarioArticuloSelecJSON.Existencias).toFixed(2));
        $('#modalInventarioStock').val(parseFloat(InventarioArticuloSelecJSON.Stock).toFixed(2));
        $('#modalInventarioArea').val(InventarioArticuloSelecJSON.Area);
        $('#modalInventarioExistencias').attr("disabled", true);
    }
    $('#modalDivAltaInventario').animate({ scrollTop: 0, scrollLeft: 0 });
    $('#modalAltaInventario').modal('show');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA DE INVENTARIO
function validarFormInventario() {
    var correcto = true, msg = "";
    if (!$('#modalInventarioCodigoAut').is(":checked") && $('#modalInventarioCodigo').val() === "") {
        $('#modalInventarioCodigo').focus();
        correcto = false;
        msg = "Coloque el <b>Código</b>";
    } else if ($('#modalInventarioNombre').val() === "") {
        $('#modalInventarioNombre').focus();
        correcto = false;
        msg = "Coloque el <b>Nombre</b>";
    } else if ($('#modalInventarioPresentacion').val() === "") {
        $('#modalInventarioPresentacion').focus();
        correcto = false;
        msg = "Coloque la <b>Presentación</b>";
    } else if ($('#modalInventarioPrecioCompra').val() === "") {
        $('#modalInventarioPrecioCompra').focus();
        correcto = false;
        msg = "Coloque el <b>Precio de Compra</b>";
    } else if (parseFloat($('#modalInventarioPrecioCompra').val()) < 0) {
        $('#modalInventarioPrecioCompra').focus();
        correcto = false;
        msg = "Coloque el <b>Precio de Compra</b>";
    } else if (isNaN(parseFloat($('#modalInventarioPrecioCompra').val()))) {
        $('#modalInventarioPrecioCompra').focus();
        correcto = false;
        msg = "<b>Precio de Compra</b> NO válido";
    } else if ($('#modalInventarioPrecioVenta').val() === "") {
        $('#modalInventarioPrecioVenta').focus();
        correcto = false;
        msg = "Coloque el <b>Precio de Venta</b>";
    } else if (parseFloat($('#modalInventarioPrecioVenta').val()) < 0) {
        $('#modalInventarioPrecioVenta').focus();
        correcto = false;
        msg = "Coloque el <b>Precio de Venta</b>";
    } else if (isNaN(parseFloat($('#modalInventarioPrecioVenta').val()))) {
        $('#modalInventarioPrecioVenta').focus();
        correcto = false;
        msg = "<b>Precio de Venta</b> NO válido";
    } else if ($('#modalInventarioExistencias').val() === "") {
        $('#modalInventarioExistencias').focus();
        correcto = false;
        msg = "Coloque las <b>Existencias</b>";
    } else if (parseFloat($('#modalInventarioExistencias').val()) < 0) {
        $('#modalInventarioExistencias').focus();
        correcto = false;
        msg = "Coloque las <b>Existencias</b>";
    } else if (isNaN(parseFloat($('#modalInventarioExistencias').val()))) {
        $('#modalInventarioExistencias').focus();
        correcto = false;
        msg = "<b>Cantidad de Existencias</b> NO válido";
    } else if ($('#modalInventarioStock').val() === "") {
        $('#modalInventarioStock').focus();
        correcto = false;
        msg = "Coloque el <b>Stock</b>";
    } else if (parseFloat($('#modalInventarioStock').val()) < 0) {
        $('#modalInventarioStock').focus();
        correcto = false;
        msg = "Coloque el <b>Stock</b>";
    } else if (isNaN(parseFloat($('#modalInventarioStock').val()))) {
        $('#modalInventarioStock').focus();
        correcto = false;
        msg = "<b>Cantidad de Stock</b> NO válido";
    } else {
        InventarioAltaJSON = {
            IdArticuloInventario: IdArticuloInventarioGLOBAL,
            Codigo: ($('#modalInventarioCodigo').val() !== "") ? $('#modalInventarioCodigo').val() : "--",
            Nombre: $('#modalInventarioNombre').val().toUpperCase(),
            Presentacion: $('#modalInventarioPresentacion').val().toUpperCase(),
            PrecioCompra: parseFloat($('#modalInventarioPrecioCompra').val()),
            PrecioVenta: parseFloat($('#modalInventarioPrecioVenta').val()),
            Existencias: parseFloat($('#modalInventarioExistencias').val()),
            Stock: parseFloat($('#modalInventarioStock').val()),
            Area: $('#modalInventarioArea').val(),
            CodigoAuto: $('#modalInventarioCodigoAut').is(":checked"),
        };
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE TRAE PARA EDITAR UN ELEMENTO SPECIFICO DEL INVENTARIO
function editarArticuloInventario(idElemInventario) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ConsultarArticuloInventario",
        data: { IdInventarioArticulo: idElemInventario },
        dataType: 'JSON',
        beforeSend: function () {
            LoadingOn("Cargando Elemento...");
        },
        success: function (data) {
            if (data.IdArticuloInventario !== undefined) {
                InventarioArticuloSelecJSON = data;
                abrirModalAltaInventario(false);
                LoadingOff();
            } else {
                ErrorLog(data.responseText, "Reimprimir Cargo Pago");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Reimprimir Cargo Pago");
        }
    });
}

// FUNCION QUE VALIDA EL FORMULARIO DE ACTUALIZAR EXISTENCIAS DEL INVENTARIO
function validarFormExistencias() {
    var correcto = true, msg = "";
    if ($('#modalInventarioExistenciaCant').val() === "") {
        $('#modalInventarioExistenciaCant').focus();
        correcto = false;
        msg = "Coloque la <b>Cantidad</b>";
    } else if (parseFloat($('#modalInventarioExistenciaCant').val()) <= 0) {
        $('#modalInventarioExistenciaCant').focus();
        correcto = false;
        msg = "La <b>Cantidad</b> es <b>Incorrecta</b>";
    } else if (isNaN(parseFloat($('#modalInventarioExistenciaCant').val()))) {
        $('#modalInventarioExistenciaCant').focus();
        correcto = false;
        msg = "<b>Cantidad </b>NO válido";
    } else if (accionInventarioExitencia === "Q" && (parseFloat($('#modalInventarioExistenciaCant').val()) > existenciaArticuloInventario)) {
        $('#modalInventarioExistenciaCant').focus();
        correcto = false;
        msg = "La <b>Cantidad</b> a reducir es <b>MAYOR</b> a la <b>existencia actual</b>\n\nExistencia: " + existenciaArticuloInventario.toFixed(4);
    } else if ($('#modalInventarioExistenciaMotivo').val() === "") {
        $('#modalInventarioExistenciaMotivo').focus();
        correcto = false;
        msg = "Coloque el <b>Motivo / Descripción</b>";
    } else {
        InventarioAltaJSON = {
            IdArticuloInventario: IdArticuloInventarioGLOBAL,
            Existencias: (accionInventarioExitencia === "Q") ? (existenciaArticuloInventario - parseFloat($('#modalInventarioExistenciaCant').val())) : (existenciaArticuloInventario + parseFloat($('#modalInventarioExistenciaCant').val())),
            Area: accionInventarioExitencia,
            PrecioCompra: parseFloat($('#modalInventarioExistenciaCant').val()),
            Nombre: $('#modalInventarioExistenciaMotivo').val().toUpperCase(),
        };
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3500, "default");
    }
    return correcto;
}

// FUNCION QUE ABRE EL MODAL PARA IMPRIMIR REPORTE DE INVENTARIO
function abrirModalInventarioImprimir() {
    $('.btnimprimirinventariohtml').hide();
    $('#modalInventarioImprimirFIni').val(FechaInput());
    $('#modalInventarioImprimirFFin').val(FechaInput());
    $('#modalInventarioImprimirAmbos').click();
    $('.inventarioimprimirtab[opcion="t1"]').click();
    $('#modalInventarioImprimirTodos').click();
    imprimirInventarioTipo = "t1";
    $('#modalInventarioImprimir').modal('show');
}

// FUNCION QUE VALIDA LOS PARAMETROS DE LA IMPRESION DE INVENTARIO
function validarFormImprimirInventario() {
    var correcto = true, msg = "";
    InventarioImprimirDataJSON = {};
    if (imprimirInventarioTipo == "t1" && (!$('#modalInventarioImprimirTodos').is(":checked") && !$('#modalInventarioImprimirStock').is(":checked"))) {
        correcto = false;
        msg = "Eligar <b>Un tipo de Impresión</b> General";
    } else if (imprimirInventarioTipo === "t2" && $('#modalInventarioImprimirFIni').val() === "") {
        $('#modalInventarioImprimirFIni').focus();
        correcto = false;
        msg = "Coloque la <b>Fecha de Inicio</b>";
    } else if (imprimirInventarioTipo === "t2" && $('#modalInventarioImprimirFFin').val() === "") {
        $('#modalInventarioImprimirFFin').focus();
        correcto = false;
        msg = "Coloque la <b>Fecha Fin</b>";
    } else if ($('#modalInventarioImprimirFIni').val() > $('#modalInventarioImprimirFFin').val()) {
        $('#modalInventarioImprimirFIni').focus();
        correcto = false;
        msg = "El rango de <b>Fechas</b> es <b>Incongruente</b>";
    } else {
        if (imprimirInventarioTipo === "t1") {
            $('input[name="inventariotabgeneral"]').each(function () {
                if ($(this).is(":checked")) {
                    imprimirInventarioGestion = $(this).attr("opcion");
                }
            });
        } else if (imprimirInventarioTipo === "t2") {
            $('input[name="inventariotabensal"]').each(function () {
                if ($(this).is(":checked")) {
                    imprimirInventarioGestion = $(this).attr("opcion");
                }
            });
            InventarioImprimirDataJSON = {
                FechaInicio: $('#modalInventarioImprimirFIni').val(),
                FechaFin: $('#modalInventarioImprimirFFin').val(),
            };
        }
        InventarioImprimirDataJSON["Area"] = tipoInventarioGLOBAL;
        InventarioImprimirDataJSON["Gestion"] = imprimirInventarioGestion;
        InventarioImprimirDataJSON["Formato"] = (InventarioImprimirFormato === 1) ? "pdf" : "excel";
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2500, "default");
    }
    return correcto;
}

// FUNCION QUE ABRE EN UNA NUEVA PESTAÑA EL DOCUMENTO EXCEL CON EL REPORTE DE INVENTARIOS
function abrirInventarioExcel(doc) {
    MsgAlerta("Ok!", "Su reporte se descargará en breve...", 2500, "success");
    setTimeout(function () {
        window.open(doc, '_blank');
    }, 2500);
}

// FUNCION QUE ABRE UN MODAL PARA MOSTRAR LA TABLA DEL REPORTE DEL INVENTARIO (ENTRADAS Y SALIDAS)
function verReporteInventarios(inventarioData) {
    LoadingOn("Generando Tabla...");
    $('#modalInventarioImprimir').modal('hide');
    $('#modalInventarioReporteDiv').html(tabDivInventarioHTML);
    var headersArr = paramsInventarioPDF(2, imprimirInventarioGestion), headerTabla = [];
    $(headersArr).each(function (key, value) {
        headerTabla.push({ title: value.split("ø")[0] });
    });
    setTimeout(function () {
        var tablasARR = [], navClick = "";
        $(inventarioData).each(function (k1, v1) {
            var idHTML = paramsInventarioPDF(3, v1.Area);
            if (k1 === 0) {
                navClick = "#modalInventarioReporte" + idHTML + "-tab";
            }
            $('#modalInventarioReporteTabs').append('<li class="nav-item"><a class="nav-link navinvreporte active" id="modalInventarioReporte' + idHTML + '-tab" data-toggle="tab" href="#modalInventarioReporte' + idHTML + '" role="tab" aria-controls="modalInventarioReporte' + idHTML + '" aria-selected="true">' + v1.Area + '</a></li>');
            $('#modalInventarioReporteDivTablas').append('<div class="tab-pane fade tabinvreporte show active" id="modalInventarioReporte' + idHTML + '" role="tabpanel" aria-labelledby="modalInventarioReporte' + idHTML + '-tab">' + tablaInventarioHTML.replace("tablaInventario", 'modalInventarioReporteTabla' + idHTML) + '</div>');
            var dataTabla = [];
            $(v1.InventarioData).each(function (k2, v2) {
                var invData = [];
                if (imprimirInventarioGestion === "E1" || imprimirInventarioGestion === "E2" || imprimirInventarioGestion === "E3") {
                    invData.push(
                        v2.Codigo,
                        v2.Nombre,
                        v2.Presentacion,
                        ((v2.Area === "Salida") ? '<span class="badge badge-pill badge-danger">' + v2.Area + '</span>' : '<span class="badge badge-pill badge-success">' + v2.Area + '</span>'),
                        v2.Existencias.toFixed(4),
                        v2.Usuario,
                        v2.FechaTxt,
                    );
                }
                dataTabla.push(invData);
            });
            var tabla = $('#modalInventarioReporteTabla' + idHTML).DataTable({
                scrollY: "55vh",
                responsive: true,
                data: dataTabla,
                columns: headerTabla,
                info: false,
                search: true,
                "search": {
                    "regex": true
                }
            });
            tablasARR.push(tabla);
        });
        $('#modalInventarioReporte').modal('show');
        $(document).on('shown.bs.modal', '#modalInventarioReporte', function () {
            $(tablasARR).each(function (key, value) {
                value.columns.adjust();
            });
            $('.navinvreporte').removeClass("active");
            $('.tabinvreporte').removeClass("show");
            $('.tabinvreporte').removeClass("active");
            $(navClick).click();
            LoadingOff();
        });
    }, 1800);
}


// -------------------------------- +++++++++++++++++++ --------------------------------
// :::::::::::::::::::::::::::::::: [ NUEVOS INGRESOS ] ::::::::::::::::::::::::::::::::

// FUNCION QUE CARGA LA TABLA DE NUEVOS INGRESOS DE ACUERDO A LA COORDINACION
function llenarListaNuevosIngresos(coord, callback) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/NuevoIngreso",
        beforeSend: function () {
            LoadingOn("Cargando Nuevos Ingresos...");
            $('.modalnuevoingreso').remove();
            NuevoIngresoCoordGLOBAL = coord;
            nuevosIngresosListaJSON = [];
        },
        success: function (data) {
            $('#divNIngresosTabla' + coord).parent().parent().append(data);
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/ListaPacientesNuevoIngreso",
                dataType: 'JSON',
                success: function (data) {
                    if (Array.isArray(data)) {
                        console.log(data);
                        var tablaNingresos = (data.length > 0) ? "" : '<tr><td class="table-info" colspan="2" style="text-align: center;"><h5><i class="fa fa-info-circle"></i>&nbsp;No tiene <b>Nuevos Ingresos</b> pendientes</h5></td></tr>';
                        $(data).each(function (key, value) {
                            tablaNingresos = '<tr><td>' + value.NombreCompleto + '</td><td style="text-align: center;"><button class="btn badge badge-pill badge-warning" onclick="configPacienteNuevoIngreso(' + value.IdPaciente + ')"><i class="fa fa-edit"></i>&nbsp;Configurar Paciente</button></td></tr>';
                            nuevosIngresosListaJSON.push(value);
                        });
                        var tablaNIngresosFull = tablaNIngresosHTML.replace("ÖØCUERPOØÖ", tablaNingresos);
                        $('#divNIngresosTabla' + coord).html(tablaNIngresosFull);
                        callback(true);
                    } else {
                        ErrorLog(data.responseText, "Lista Nuevos Ingresos");
                    }
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Lista Nuevos Ingresos");
                }
            });
        },
        error: function (error) {
            ErrorLog(error, "Cargar Vista Nuevos Ingresos");
        }
    });
}


// FUNCION QUE CONFIGURA UN PACIENTE DE NUEVO INGRESO
function configPacienteNuevoIngreso(id) {
    verificarCoordConfigNuevoIngreso(id, function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/ObtenerPacienteNuevoIngresoInfo",
                data: { IDPaciente: id },
                dataType: 'JSON',
                beforeSend: function () {
                    LoadingOn("Cargando Info. Paciente...");
                    IdPacienteNIngresoGLOBAL = id;
                    listaNIngresoParamsDOM = [];
                    PacienteNIngresoDataJSON = [];
                },
                success: function (data) {
                    if (Array.isArray(data)) {
                        $(nuevosIngresosListaJSON).each(function (key, value) {
                            if (value.IdPaciente === id) {
                                var cuerpo = '<h6><span class="badge badge-warning">ESTADO DE ALERTA: </span> ' + value.EstadoAlerta + '</h6><h6><span class="badge badge-warning">NIVEL DE INTOXICACIÓN: </span> ' + value.NivelIntoxicacion + '</h6><h6><span class="badge badge-warning">ESTADO DE ÁNIMO: </span> ' + value.EstadoAnimo + '</h6>';
                                $('#modalDivNuevoIngresoInfo').html(cardsNIngresoInfoHTML.replace("ØÖNOMBREPACIENTEÖØ", value.NombreCompleto).replace("ØÖCUEPORPACIENTEINFOÖØ", cuerpo));
                            }
                        });
                        $('#modalDivNuevoIngresoPrinc').html('');
                        $(NuevoIngresoTestJSON).each(function (k1, v1) {
                            if (v1.Coord === NuevoIngresoCoordGLOBAL) {
                                $('#modalDivNuevoIngresoPrinc').append(cardsNIngresoOpcHTML.replace("ØÖTITULOÖØ", v1.Titulo).replace("ØÖDIVIDÖØ", v1.IdHTML));
                                var idTabla = cadAleatoria(8);
                                $('#' + v1.IdHTML).html('<div class="row"><div class="col-sm-12"><div class="table table-responsive tablanitests"><table class="table table-sm table-bordered tablanitests" style="margin-bottom: 0;"><tbody id="tablani_' + idTabla + '"></tbody></table></div></div></div>');
                                $(v1.Test).each(function (k2, v2) {
                                    var idTd = cadAleatoria(6), idDOM = cadAleatoria(7);
                                    var tdTabla = '<tr><td><b>' + v2.Nombre + '</b></td><td id="tdni_' + idTd + '" style="text-align: center; width: 300px;"><button class="btn badge badge-pill badge-primary configniarchivo" param="' + idDOM + '" accion="1"><i class="fa fa-file-upload"></i>&nbsp;Subir Archivo Evidencia</button>&nbsp;&nbsp;<button class="btn badge badge-pill badge-info confignitest" param="' + idDOM + '" accion="2"><i class="fa fa-pencil-alt"></i>&nbsp;Contestar Test</button></td></tr>';
                                    listaNIngresoParamsDOM.push({
                                        IdElem: idDOM,
                                        Clave: v2.Clave,
                                    });
                                    $('.tablanitests').css("margin-bottom", "0rem");
                                    $('#tablani_' + idTabla).append(tdTabla);
                                    $(data).each(function (k3, v3) {
                                        if (v3.Clave === v2.Clave) {
                                            if (v3.TestArchivo !== "SD") {
                                                $('#tdni_' + idTd).html('<button class="btn badge badge-pill badge-success" onclick="mostrarIngresoPacienteInfo(' + v3.Id + ',1);"><i class="fa fa-file"></i>&nbsp;Mostrar Archivo Anexo</button>&nbsp;&nbsp;<button class="btn badge badge-pill badge-secondary" title="Diagnostico" onclick="mostrarIngresoPacienteInfo(' + v3.Id + ',2);"><i class="fa fa-info-circle"></i></button>&nbsp;&nbsp;<button class="btn badge badge-pill badge-danger" title="Reestablecer/Borrar" onclick="reestablecerPacienteIngreso(' + v3.Id + ');"><i class="fa fa-trash"></i></button>').parent().addClass("table-success");
                                            }
                                            PacienteNIngresoDataJSON.push(v3);
                                        }
                                    });
                                });
                            }
                        });
                        var tituloCoord = '';
                        if (NuevoIngresoCoordGLOBAL === "CM") {
                            tituloCoord = ' - Coordinación Médica';
                        } else if (NuevoIngresoCoordGLOBAL === "CP") {
                            tituloCoord = ' - Coordinación Psicológica';
                        } else if (NuevoIngresoCoordGLOBAL === "CC") {
                            tituloCoord = ' - Coordinación Consejería';
                        }
                        $('#modalSpanTituloCoord').html(tituloCoord);
                        validarAprobacionCoord(PacienteNIngresoDataJSON.length);
                        LoadingOff();
                        $('#modalNuevoIngresoOpciones').modal('show');
                    } else {
                        ErrorLog(data.responseText, "Cargar Info. Pacientes Nuevo Ingreso");
                    }
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Cargar Info. Pacientes Nuevo Ingreso");
                }
            });
        }
    });
}

// FUNCION QUE VERIFICA LAS COORDINACIONES (ESTA PAUSA ES EN ESPECIAL PARA LA COORDINACION DE CONSEJERIA)
function verificarCoordConfigNuevoIngreso(idPaciente, callback) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/VerificarNuevoIngresoCoords",
        dataType: 'JSON',
        data: { IDPaciente: idPaciente },
        beforeSend: function () {
            LoadingOn('Verificando Ingreso...');
        },
        success: function (data) {
            if (data.Err === "NA") {
                if ((NuevoIngresoCoordGLOBAL === 'CM' && !data.CoordMedica) || (NuevoIngresoCoordGLOBAL === 'CP' && !data.CoordPsicologica) || (NuevoIngresoCoordGLOBAL === 'CC' && data.Diagnostico)) {
                    callback(true);
                    LoadingOff();
                } else {
                    callback(false);
                    LoadingOff();
                    var msg = '', timer = 5000;
                    if (NuevoIngresoCoordGLOBAL === 'CM' || NuevoIngresoCoordGLOBAL === 'CP') {
                        msg = 'Este paciente de <b>Nuevo Ingreso</b> ya fue evaludado por su <b>Coordinación</b>';
                    } else if (NuevoIngresoCoordGLOBAL === 'CC') {
                        msg = "El nuevo Ingreso <b>NO</b> ha sido <b>Aprobado</b> por todas las Coordinaciones\n\nCoordinaciones Faltantes:\n" + ((data.CoordMedica) ? '' : '<b>Coordinación Médica</b>\n') + ((data.CoordPsicologica) ? '' : '<b>Coordinación Psicológica</b>');
                        timer = 8000;
                    }
                    MsgAlerta("Info!", msg, timer, "info");
                }
            } else {
                callback(false);
                ErrorLog(data.Err, "Verificar Coords. Nuevo Ingreso");
            }
        },
        error: function (error) {
            callback(false);
            ErrorLog(error.responseText, "Verificar Coords. Nuevo Ingreso");
        }
    });
}

// FUNCION QUE EJECUTA LOS  PARAMETROS PARA ANEXAR UN ARCHIVO  A UN NUEVO INGRESO
function nuevoIngresoSubirArchivo() {
    LoadingOn("Cargando Formulario...");
    $(NuevoIngresoTestJSON).each(function (k1, v1) {
        $(v1.Test).each(function (k2, v2) {
            if (v2.Clave === claveTestGLOBAL) {
                $('#modalNuevoIngresoArchivoTitutlo').html(v2.Nombre);
            }
        });
    });
    $('#modalNuevoIngresoArchivoFile').val('');
    ArchivoDocNuevoIngreso = $('#modalNuevoIngresoArchivoFile').prop('files')[0];
    $('#modalNuevoIngresoArchivoCard').attr("title", "Sin Archivo").removeClass("border-success").addClass("border-danger");
    $('#modalNuevoIngresoArchivoIcono').css("color", "#dc3545").removeClass("fa-check").addClass("fa-times");
    $('#modalNuevoIngresoDiagnostico').val('');
    $('#modalNuevoIngresoArchivo').modal('show');
    setTimeout(function () {
        LoadingOff();
    },1500);
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA DE ARCHIVO DE UN NUEVO INGRESO
function validarFormNuevoIngreso(accion) {
    var correcto = true, msg = '';
    if (accion === 1) {
        NuevoIgresoAltaJSON = {
            IdPaciente: IdPacienteNIngresoGLOBAL,
            Clave: claveTestGLOBAL,
            Archivo: 'SD',
            TestJson: {},
            Diagnostico: "--",
        };
    } else if (accion === 2) {
        if (ArchivoDocNuevoIngreso === undefined) {
            correcto = false;
            msg = "No ha seleccionado un <b>Archivo</b>";
        } else if ($('#modalNuevoIngresoDiagnostico').val() === "") {
            $('#modalNuevoIngresoDiagnostico').focus();
            correcto = false;
            msg = "Escriba un <b>Resultado de Diagnóstico</b>";
        } else {
            NuevoIgresoAltaJSON = {
                IdPaciente: IdPacienteNIngresoGLOBAL,
                Clave: claveTestGLOBAL,
                Archivo: claveTestGLOBAL + "_" + IdPacienteNIngresoGLOBAL.toString() + "." + ArchivoDocNuevoIngresoDATA.Extension,
                TestJson: 'SD',
                Diagnostico: $('#modalNuevoIngresoDiagnostico').val().toUpperCase(),
            };
        }
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 1800, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LA APROBACION DEL PACIENTE POR PARTE DE LA COORDINACION EN NUEVO INGRESOS
function validarAprobacionCoord(pacienteData) {
    var contTest = 0;
    $(NuevoIngresoTestJSON).each(function (k1, v1) {
        if (v1.Coord === NuevoIngresoCoordGLOBAL) {
            $(v1.Test).each(function (k2, v2) {
                contTest++;
            });
        }
    });
    ValidarAprobacionNIngreso = (pacienteData === contTest) ? true : false;
}

// FUNCION QUE MUESTRA LA INFO O EJECUTA UNA ACCION EN UN PACIENTE EN CONFIGURACION DE NUEVO INGRESO
function mostrarIngresoPacienteInfo(idIngreso, accion) {
    var data = {};
    $(PacienteNIngresoDataJSON).each(function (key, value) {
        if (value.Id === idIngreso) {
            data = value;
        }
    });
    if (accion === 1) {
        window.open(data.TestArchivo, '_blank');
    } else if (accion === 2) {
        MsgAlerta("Diagnóstico", data.Diagnostico, 8000, "info");
    }
}

// FUNCION QUE REESTABLECE LOS VALORES DEL PACIENTE EN CONFIGURACION DE NUEVO INGRESO
function reestablecerPacienteIngreso(idIngreso) {
    MsgPregunta("Reestablecer Parametros", "¿Desea continuar?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Dinamicos/BorrarPacienteNuevoIngreso",
                data: { IDIngreso: idIngreso },
                beforeSend: function () {
                    LoadingOn('Reestableciendo parametros...');
                },
                success: function (data) {
                    if (data === "true") {
                        $('#modalNuevoIngresoOpciones').modal('hide');
                        setTimeout(function () {
                            configPacienteNuevoIngreso(IdPacienteNIngresoGLOBAL);
                        }, 2000);
                    } else {
                        ErrorLog(data, "Reestablecer Paciente Nuevo Ingreso");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Reestablecer Paciente Nuevo Ingreso");
                }
            });
        }
    });
}

// FUNCION QUE DEFINE EN TEXTO EL NOMBRE DE LA COORDINACION DE ACUERDO A LA SIGLA
function CoordNombreCompletoNI() {
    if (NuevoIngresoCoordGLOBAL === 'CM') {
        return 'Coordinación Médica';
    } else if (NuevoIngresoCoordGLOBAL === 'CP') {
        return 'Coordinación Psicológica';
    } else if (NuevoIngresoCoordGLOBAL === 'CC') {
        return 'Coordinación Consejería';
    } else {
        return '';
    }
}

// :::::::::::::::::::::::::: [ VARIABLES DE USO EN DOM ] ::::::::::::::::::::::::::
// ---------------------------------------------------------------------------------
// -- INVENTARIOS
var tablaInventarioHTML = '<div class="table-responsive"><table id="tablaInventario" class="table table-sm table-striped table-bordered" style="width:100%"></table></div>';
var tabDivInventarioHTML = '<ul class="nav nav-tabs" id="modalInventarioReporteTabs" role="tablist"></ul><div class="tab-content" id="modalInventarioReporteDivTablas" style="padding-top: 10px;"></div>';
// -- NUEVOS INGRESOS
var tablaNIngresosHTML = '<div class="table table-responsive"><table class="table table-sm table-bordered"><thead><tr class="table-active"><th>Nombre del Paciente</th><th style="text-align: center;"><i class="fa fa-cog"></i>&nbsp;Opciones</th></tr></thead><tbody>ÖØCUERPOØÖ</tbody></table></div>';
var cardsNIngresoOpcHTML = '<div class="row" style="margin-top: 5px;"><div class="col-sm-12"><div class="card"><h6 class="card-header"><i class="fa fa-briefcase-medical"></i>&nbsp;ØÖTITULOÖØ</h6><div id="ØÖDIVIDÖØ" class="card-body"></div></div></div></div>';
var cardsNIngresoInfoHTML = '<div class="card border-warning mb-3"><div class="card-header bg-warning text-white border-warning"><h6 class="card-title">ØÖNOMBREPACIENTEÖØ</h6></div><div class="card-body"><h6><span class="badge badge-secondary">INFORMACIÓN DE INGRESO DEL PACIENTE</span></h6>ØÖCUEPORPACIENTEINFOÖØ<br><hr><h6><span class="badge badge-secondary">REVISIÓN Y APROBACIÓN DEL CASO</span></h6><div class="alert alert-warning" role="alert"><i class="fa fa-info"></i> Esta acción solo será habilitada una vez haya concluido los formularios de la derecha.</div><div class="row"><div class="col-sm-12"><button id="nuevoIngresoAprobarCaso" class="btn btn-sm btn-success btn-block"><i class="fa fa-check-circle"></i>&nbsp;Aprobar Caso del Paciente</button></div></div></div></div>';
var modalNIngresoAprobHTML = '<div id="modalAprobarPacienteIngreso" class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"><div class="row" style="padding-top: 5px; padding-bottom: 10px;"><div class="col-sm-12"><h5><span class="badge badge-secondary">Aprobar Caso del Paciente</span></h5></div></div><div class="row"><div class="col-sm-12"><div class="alert alert-warning" role="alert"><i class="fa fa-info-circle"></i>&nbsp;Por medio de esta acción queda establecido que la <b id="modalAprobarPacienteIngresoCoord"></b>, da por concluida la configuración del paciente de nuevo Ingreso, así como la conformidad de las evidencias/tests añadidas para su expediente.<br><br><i class="fa fa-info-circle"></i>&nbsp;De igual manera, la información establecida <b>NO</b> podrá ser modificada sin la autorización y participación del administrador del Centro.</div></div></div><div class="row"><div class="col-sm-6" style="padding-top: 5px; padding-bottom: 15px;"><button id="modalAprobarPacienteIngresoAceptar" class="btn btn-sm btn-block btn-success"><i class="fa fa-check-circle"></i>&nbsp;Aprobar Caso Paciente</button></div><div class="col-sm-6" style="padding-top: 5px; padding-bottom: 15px;" align="right"><button id="modalAprobarPacienteIngresoCancelar" class="btn btn-sm btn-block btn-danger"><i class="fa fa-times-circle"></i>&nbsp;Cancelar y Cerrar</button></div></div></div></div></div>';


// ******************************************* [ I M P O R T A N T E ] **********************************************
// :::::::::::::::::::::::::: [ VARIABLES TIPO JSON ESTRUCTURALES PARA LOS TIPOS DE TEST ] ::::::::::::::::::::::::::

// JSON DE GRUPOS DE TESTS
var NuevoIngresoTestJSON = [
    // COORDINACION MEDICA
    {
        Titulo: "SEMIOLOGÍA MÉDICA",
        Coord: 'CM',
        IdHTML: 'divNICM1',
        Test: [
            {
                Nombre: "Exámen Clínico",
                Clave: "ECM1-1",
            },
        ],
    },
    {
        Titulo: "HISTORIAL",
        Coord: 'CM',
        IdHTML: 'divNICM2',
        Test: [
            {
                Nombre: "Historia Clínica",
                Clave: "ECM2-1",
            },
        ],
    },
    {
        Titulo: "PRUEBAS Y ANÁLISIS",
        Coord: 'CM',
        IdHTML: 'divNICM3',
        Test: [
            {
                Nombre: "Exámenes Mínimos",
                Clave: "ECM3-1",
            },
        ],
    },
    {
        Titulo: "PRUEBAS COMPLEMENTARIAS",
        Coord: 'CM',
        IdHTML: 'divNICM4',
        Test: [
            {
                Nombre: "Otros Exámenes",
                Clave: "ECM4-1",
            },
        ],
    },
    // COORDINACION PSICOLOGICA
    {
        Titulo: "NOTA DE INGRESO: NIVEL DE ADICCIÓN",
        Coord: 'CP',
        IdHTML: 'divNICP1',
        Test: [
            {
                Nombre: "Alcoholismo",
                Clave: "ECP1-1",
            },
            {
                Nombre: "Tabaquismo",
                Clave: "ECP1-2",
            },
            {
                Nombre: "Sustancias Psicoactivas",
                Clave: "ECP1-3",
            },
        ],
    },
    {
        Titulo: "PRUEBAS COMPLEMENTARIAS",
        Coord: 'CP',
        IdHTML: 'divNICP2',
        Test: [
            {
                Nombre: "Otros Exámenes",
                Clave: "ECP2-1",
            },
        ],
    },
    // COORDINACION CONSEJERIA
    {
        Titulo: "REVISIÓN DEL CASO",
        Coord: 'CC',
        IdHTML: 'divNICC1',
        Test: [
            {
                Nombre: "Plan de Tratamiento",
                Clave: "ECC1-1",
            },
            {
                Nombre: "Hoja Ministerio Público",
                Clave: "ECC1-2",
            },
        ],
    },
];
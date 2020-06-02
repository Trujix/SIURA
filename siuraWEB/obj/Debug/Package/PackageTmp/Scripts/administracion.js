﻿// ********************************************************
// ARCHIVO JAVASCRIPT ADMINISTRACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var PreRegistrosJSON = {};
var PreRegistroIDPaciente = 0;
var ListaHorariosJSON = [];
var IdHorarioGLOBAL = 0;
var horarioParamsConfigJSON = {};
var horarioCuerpoJSON = [];
var fechaArrHorarioGLOBAL = [];
var IdHorarioTablaSELECT = '';
var diaNombreHorarioSELECT = '';

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL ABRIR LA OPCION DE ADMINISTRACION
$(document).on('click', 'a[name="opcAdm"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        preregistros: "PreRegistros",
        pagospacientes: "PacientesPagos",
        inventario: "Inventario",
        horario: "Horario",
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
            if (opcion === "horario") {
                paramsInicialesHorario();
            }
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

// DOCUMENT - COMBO QUE CONTROLA LA ACCION AL SELECCIONAR EL TIPO DE INVENTARIO A MOSTRAR (EXCLUSIVO DE ADMINISTRADOR) [ INVENTARIOS ]
$(document).on('change', '#selecTipoInventario', function () {
    LoadingOn('Ajustando Parametros...');
    setTimeout(function () {
        $('#divTabla').html('');
        LoadingOff();
    }, 1000);
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DE LOS INVENTARIOS [ INVENTARIOS ]
$(document).on('click', '#btnObtenerInventario', function () {
    consultarInventarios('divTabla', $('#selecTipoInventario').val(), function () {
        LoadingOff();
    });
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA AGREGAR NUEVO ELEMENTO AL INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btnNuevoInventario', function () {
    if ($('#divTabla').prop('innerHTML') !== "") {
        abrirModalAltaInventario(true);
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA IMPRIMIR UN REPORTE DE INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btImprimirInventario', function () {
    if ($('#divTabla').prop('innerHTML') !== "") {
        abrirModalInventarioImprimir();
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE LISTA COMPLETA DE LOS HORARIOS [ HORARIOS ]
$(document).on('click', '#obtenerListaHorarios', function () {

});

// DOCUMENT - BOTON QUE ABRE UN NUEVO MODAL PARA CREAR UN NUEVO HORARIO [ HORARIOS ]
$(document).on('click', '#crearNuevoHorario', function () {
    IdHorarioGLOBAL = 0;
    $('#modalNuevoHorarioP1').show();
    $('#modalNuevoHorarioP2').hide();
    $('#modalNuevoHorarioTabla').html('');
    $('#modalNuevoHorario').modal('show');
});

// DOCUMEMT - BOTON QUE CANCELA LA CREACION DEL NUEVO HORARIO [ HORARIOS ]
$(document).on('click', 'button[name="modalNuevoHorarioCancelar"]', function () {
    MsgPregunta("Cancelar Nuevo Horario", "¿Desea continuar?", function (si) {
        if (si) {
            $('#modalNuevoHorario').modal('hide');
        }
    });
});

// DOCUMENT - BOTON QUE VUELVE AL PASO 1 EN CREACION DE NUEVO HORARIO [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioSigP1', function () {
    MsgPregunta("TODOS LOS CAMBIOS SE PERDERAN", "¿Desea continuar?", function (si) {
        if (si) {
            $('#modalNuevoHorarioDescripcion').val(horarioParamsConfigJSON.Descripción);
            $('#modalNuevoHorarioHrInicio').val(horarioParamsConfigJSON.HoraInicio);
            $('#modalNuevoHorarioDuracion').val(horarioParamsConfigJSON.Duracion);
            $('#modalNuevoHorarioDuracionTipo').val(horarioParamsConfigJSON.Tipo);
            $('#modalNuevoHorarioReloj').val(horarioParamsConfigJSON.Reloj);
            $('#modalNuevoHorarioP1').show();
            $('#modalNuevoHorarioP2').hide();
        }
    });
});

// DOCUMENT - BOTON QUE PASA AL SIGUIENTE NIVEL DE CREACION DE NUEVO HORARIO [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioSigP2', function () {
    if (validarFormNuevoHorarioP2()) {
        MsgPregunta("Continuar con el paso 2", "¿Desea continuar?", function (si) {
            if (si) {
                $('#modalNuevoHorarioP1').hide();
                $('#modalNuevoHorarioP2').show();
            }
        });
    }
});

// DOCUMENT - BOTON QUE  CONTROLA LA ACCION DE ABRIR MODAL PARA AÑADIR UNA ACTIVIDAD A UN HORARIO [ HORARIOS ]
$(document).on('click', '.tdtablahorarios', function () {
    IdHorarioTablaSELECT = $(this).parent().attr("id");
    $(horarioCuerpoJSON).each(function (key, value) {
        if (value.IdHTML === IdHorarioTablaSELECT) {
            $('#modalHorarioActividadesHoras').html((horarioParamsConfigJSON.Reloj === "12hrs") ? value.HoraInicio12hrs + " - " + value.HoraTermino12hrs : value.HoraInicio24hrs + " - " + value.HoraTermino24hrs);
            return false;
        }
    });
    diaNombreHorarioSELECT = CrearCadOracion($(this).attr("dia"));
    $('#modalHorarioActividadesTitulo').html($(this).attr("dia").toUpperCase());
    $('#modalHorarioActividadesCA').click();
    $('#modalHorarioActividadesOtraTexto').prop("disabled", true);
    $('#modalHorarioActividadesOtraTexto').val('');
    $('#modalHorarioActividades').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL CLICK EN LOS RADIO BUTON DE TIPO DE ACTIVIDAD [ HORARIOS ]
$(document).on('change', 'input[name="horarioactmodal"]', function () {
    $('#modalHorarioActividadesOtraTexto').val('');
    $('#modalHorarioActividadesOtraTexto').prop("disabled", true);
    $('#modalHorarioActividadesOtraTexto').blur();
    if ($(this).is(":checked") && $(this).attr("opcion") === "OTRO") {
        $('#modalHorarioActividadesOtraTexto').removeAttr("disabled");
        $('#modalHorarioActividadesOtraTexto').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE ACTIVIDAD AL HORARIO [ HORARIOS ]
$(document).on('click', '#modalHorarioActividadesGuardar', function () {
    if (validarNuevaActividadHorario()) {
        MsgPregunta("Añadir Actividad", "¿Desea continuar?", function (si) {
            if (si) {
                var coordSelec = '', coords = ["CA", "CD", "CM", "CP", "CE", "CC"];
                $('input[name="horarioactmodal"]').each(function () {
                    if ($(this).is(":checked")) {
                        coordSelec = $(this).attr("opcion");
                    }
                });
                $(horarioCuerpoJSON).each(function (key, value) {
                    if (value.IdHTML === IdHorarioTablaSELECT) {
                        var coordJSON = '-'
                        if (coordSelec !== "SINACT") {
                            coordJSON = (coords.includes(coordSelec)) ? coordSelec : $('#modalHorarioActividadesOtraTexto').val().toUpperCase();
                        }
                        horarioCuerpoJSON[key][diaNombreHorarioSELECT] = coordJSON;
                        return false;
                    }
                });
                llenarTablaHorarios();
                $('#modalHorarioActividades').modal('hide');
            }
        });
    }
});

// DOCUMENT - BOTON QUE AGREGA UNA NUEVA FILA AL HORARIO [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioFilaNueva', function () {
    MsgPregunta("Nueva Fila", "¿Desea continuar?", function (si) {
        if (si) {
            var antHorario = horarioCuerpoJSON[horarioCuerpoJSON.length - 1].HoraTermino24hrs;
            horarioCuerpoJSON.push({
                IdHTML: cadAleatoria(8),
                HoraInicio24hrs: antHorario,
                HoraInicio12hrs: reloj12hrs(antHorario),
                HoraTermino24hrs: fechaAddHrs(fechaArrHorarioGLOBAL, antHorario, parseInt(horarioParamsConfigJSON.Duracion), horarioParamsConfigJSON.Tipo, true),
                HoraTermino12hrs: fechaAddHrs(fechaArrHorarioGLOBAL, antHorario, parseInt(horarioParamsConfigJSON.Duracion), horarioParamsConfigJSON.Tipo, false),
                Lunes: '-',
                Martes: '-',
                Miercoles: '-',
                Jueves: '-',
                Viernes: '-',
                Sabado: '-',
                Domingo: '-',
                Receso: false,
                NumOrden: horarioCuerpoJSON.length + 1,
            });
            llenarTablaHorarios();
        }
    });
});

// DOCUMENT - BOTON QUE ABRE MODAL PARA AÑADIR UN RECESO A LA TABLA DEL HORARIO [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioAddReceso', function () {
    $('#modalNuevoRecesoHorarioDuracion').val('1');
    $('#modalNuevoRecesoHorarioDuracionTipo').val("min");
    $('#modalNuevoRecesoHorario').modal('show');
});

// DOCUMENT - BOTON QUE AGREGA EL NUEVO RECESO [ HORARIOS ]
$(document).on('click', '#modalNuevoRecesoHorarioGuardar', function () {
    if (validarNuevoRecesoHorario()) {
        MsgPregunta("Añadir Receso", "¿Desea continuar?", function (si) {
            if (si) {
                var antHorario = horarioCuerpoJSON[horarioCuerpoJSON.length - 1].HoraTermino24hrs;
                horarioCuerpoJSON.push({
                    IdHTML: cadAleatoria(8),
                    HoraInicio24hrs: antHorario,
                    HoraInicio12hrs: reloj12hrs(antHorario),
                    HoraTermino24hrs: fechaAddHrs(fechaArrHorarioGLOBAL, antHorario, parseInt($('#modalNuevoRecesoHorarioDuracion').val()), $('#modalNuevoRecesoHorarioDuracionTipo').val(), true),
                    HoraTermino12hrs: fechaAddHrs(fechaArrHorarioGLOBAL, antHorario, parseInt($('#modalNuevoRecesoHorarioDuracion').val()), $('#modalNuevoRecesoHorarioDuracionTipo').val(), false),
                    Lunes: '-',
                    Martes: '-',
                    Miercoles: '-',
                    Jueves: '-',
                    Viernes: '-',
                    Sabado: '-',
                    Domingo: '-',
                    Receso: true,
                    NumOrden: horarioCuerpoJSON.length + 1,
                });
                llenarTablaHorarios();
                $('#modalNuevoRecesoHorario').modal('hide');
            }
        });
    }
});

// DOCUMENT - BOTON QUE EJECUTA LA ACCION DE LIMPIEZA DE LA TABLA DE HORARIOS [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioLimpiarHorario', function () {
    MsgPregunta("LIMPIAR HORARIO", "¿Desea continuar?", function (si) {
        if (si) {
            horarioCuerpoJSON = [];
            horarioCuerpoJSON.push({
                IdHTML: cadAleatoria(8),
                HoraInicio24hrs: horarioParamsConfigJSON.HoraInicio,
                HoraInicio12hrs: reloj12hrs(horarioParamsConfigJSON.HoraInicio),
                HoraTermino24hrs: fechaAddHrs(fechaArrHorarioGLOBAL, horarioParamsConfigJSON.HoraInicio, parseInt(horarioParamsConfigJSON.Duracion), horarioParamsConfigJSON.Tipo, true),
                HoraTermino12hrs: fechaAddHrs(fechaArrHorarioGLOBAL, horarioParamsConfigJSON.HoraInicio, parseInt(horarioParamsConfigJSON.Duracion), horarioParamsConfigJSON.Tipo, false),
                Lunes: '-',
                Martes: '-',
                Miercoles: '-',
                Jueves: '-',
                Viernes: '-',
                Sabado: '-',
                Domingo: '-',
                Receso: false,
                NumOrden: horarioCuerpoJSON.length + 1,
            });
            llenarTablaHorarios();
        }
    });
});

// DOCUMENT - BOTON QUE GUARDA TODA LA CONFIGURACION DEL HORARIO CONFIGURADO [ HORARIOS ]
$(document).on('click', '#modalNuevoHorarioGuardar', function () {
    if (validarGuardarHorario()) {
        MsgPregunta("Guardar Horario", "¿Desea continuar?", function (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Documentacion/GuardarHorario",
                data: { HorarioInfo: horarioParamsConfigJSON, HorarioConfig: horarioCuerpoJSON  },
                beforeSend: function () {
                    LoadingOn("Guardando Informacion...");
                },
                success: function (data) {
                    if (data === "true") {
                        $('#modalNuevoHorario').modal('hide');
                        setTimeout(function () {
                            LoadingOff();
                            MsgAlerta("Ok!", "Horario almacenado <b>correctamente</b>", 2000, "success");
                        }, 2000);
                    } else {
                        ErrorLog(data, "Guardar Horario");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Guardar Horario");
                }
            });
        });
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

// FUNCION QUE INICIALIZA LOS PARAMETROS DEL NUEVO HORARIO [ HORARIOS ]
function paramsInicialesHorario() {
    $('#modalNuevoHorario').on('shown.bs.modal', function (e) {
        fechaArrHorarioGLOBAL = fechaArr();
        horarioParamsConfigJSON = {};
        $('#modalNuevoHorarioDescripcion').val('');
        $('#modalNuevoHorarioHrInicio').val('');
        $('#modalNuevoHorarioDuracion').val('');
        $('#modalNuevoHorarioDuracionTipo').val('min');
        $('#modalNuevoHorarioReloj').val('12hrs');
    });
    cargarListaHorarios();
}

// FUNCION QUE CARGA LA  LISTA DE LOS HORARIOS [ HORARIOS ]
function cargarListaHorarios() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ObtenerListaHorarios",
        dataType: 'JSON',
        beforeSend: function () {
            ListaHorariosJSON = [];
            LoadingOn("Cargando Horarios...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                ListaHorariosJSON = data;
                if (data.length > 0) {
                    var horarios = '';
                    $(data).each(function (key, value) {
                        var activo = '<button class="btn badge badge-pill badge-' + (value.Activo) ? 'success' : 'danger' + '"><i class="fa fa-toggle-' + (value.Activo) ? 'on' : 'off' + '"></i></button>';
                        horarios += '<tr><td>' + value.Descripción + '</td><td>' + CrearCadOracion(value.FechaCreado) + '</td><td style="text-align: center;">' + activo + '</td><td style="text-align: center;"></td></tr>';
                    });
                    $('#tablaHorarios').html(horarios);
                } else {
                    $('#tablaHorarios').html('<tr class="table-info"><td colspan="4" style="text-align: center;"><label><i class="fa fa-info-circle"></i> No tiene Horarios que mostrar.</label></td></tr>');
                }
                LoadingOff();
            } else {
                ErrorLog(data.responseText, "Cargar Lista Horario");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Cargar Lista Horario");
        }
    });
}

// FUNCION QUE VALIDA EL SIGUIENTE PASO DE NUEVO HORARIO [ HORARIOS ]
function validarFormNuevoHorarioP2() {
    var correcto = true, msg = '';
    if ($('#modalNuevoHorarioDescripcion').val() === "") {
        correcto = false;
        msg = 'Coloque la <b>Descripción</b>';
        $('#modalNuevoHorarioDescripcion').focus();
    } else if ($('#modalNuevoHorarioHrInicio').val() === "") {
        correcto = false;
        msg = 'Coloque la <b>Hora de Inicio</b>';
        $('#modalNuevoHorarioHrInicio').focus();
    } else if (isNaN(parseFloat($('#modalNuevoHorarioDuracion').val()))) {
        correcto = false;
        msg = 'La <b>Duración</b> es incorecta';
        $('#modalNuevoHorarioDuracion').focus();
    } else if (parseFloat($('#modalNuevoHorarioDuracion').val()) <= 0) {
        correcto = false;
        msg = 'La <b>Duración</b> NO es válida';
        $('#modalNuevoHorarioDuracion').focus();
    } else if ($('#modalNuevoHorarioDuracion').val() === "") {
        correcto = false;
        msg = 'Coloque la <b>Descripción</b>';
        $('#modalNuevoHorarioDuracion').focus();
    } else {
        horarioCuerpoJSON = [];
        horarioParamsConfigJSON = {
            IdHorario: IdHorarioGLOBAL,
            Descripción: $('#modalNuevoHorarioDescripcion').val().toUpperCase(),
            HoraInicio: $('#modalNuevoHorarioHrInicio').val(),
            Duracion: $('#modalNuevoHorarioDuracion').val(),
            Tipo: $('#modalNuevoHorarioDuracionTipo').val(),
            Reloj: $('#modalNuevoHorarioReloj').val(),
        };
        horarioCuerpoJSON.push({
            IdHTML: cadAleatoria(8),
            HoraInicio24hrs: $('#modalNuevoHorarioHrInicio').val(),
            HoraInicio12hrs: reloj12hrs($('#modalNuevoHorarioHrInicio').val()),
            HoraTermino24hrs: fechaAddHrs(fechaArrHorarioGLOBAL, $('#modalNuevoHorarioHrInicio').val(), parseInt($('#modalNuevoHorarioDuracion').val()), $('#modalNuevoHorarioDuracionTipo').val(), true),
            HoraTermino12hrs: fechaAddHrs(fechaArrHorarioGLOBAL, $('#modalNuevoHorarioHrInicio').val(), parseInt($('#modalNuevoHorarioDuracion').val()), $('#modalNuevoHorarioDuracionTipo').val(), false),
            Lunes: '-',
            Martes: '-',
            Miercoles: '-',
            Jueves: '-',
            Viernes: '-',
            Sabado: '-',
            Domingo: '-',
            Receso: false,
            NumOrden: horarioCuerpoJSON.length + 1,
        });
        llenarTablaHorarios();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2900, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LA ADICION DE UNA ACTIVIDAD A UN HORARIO [ HORARIOS ]
function validarNuevaActividadHorario() {
    var correcto = true, msg = '', coords = ["-"], coordselec = '';
    $('input[name="horarioactmodal"]').each(function () {
        coords.push($(this).attr("opcion"));
        if ($(this).is(":checked")) {
            coordselec = $(this).attr("opcion");
        }
    });
    if (coordselec === "OTRO") {
        if ($('#modalHorarioActividadesOtraTexto').val() === "") {
            correcto = false;
            msg = 'Coloque el <b>Nombre de Actividad</b>';
            $('#modalHorarioActividadesOtraTexto').focus();
        } else if (coords.includes($('#modalHorarioActividadesOtraTexto').val().toUpperCase())) {
            correcto = false;
            msg = '<b>Nombre de Actividad</b> NO es válido';
            $('#modalHorarioActividadesOtraTexto').focus();
        }
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL AGREGAR UN NUEVO RECESO EN EL HORARIO [ HORARIOS ]
function validarNuevoRecesoHorario() {
    var correcto = true, msg = '';
    if (isNaN(parseFloat($('#modalNuevoRecesoHorarioDuracion').val()))) {
        correcto = false;
        msg = 'La <b>Duración</b> es incorecta';
        $('#modalNuevoRecesoHorarioDuracion').focus();
    } else if (parseFloat($('#modalNuevoRecesoHorarioDuracion').val()) <= 0) {
        correcto = false;
        msg = 'La <b>Duración</b> NO es válida';
        $('#modalNuevoRecesoHorarioDuracion').focus();
    } else if ($('#modalNuevoRecesoHorarioDuracion').val() === "") {
        correcto = false;
        msg = 'Coloque la <b>Descripción</b>';
        $('#modalNuevoRecesoHorarioDuracion').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}
  
// FUNCION QUE VALIDA EL GUARDADO DEL HORARIO [ HORARIOS ]
function validarGuardarHorario() {
    var correcto = true, msg = '';
    if (horarioCuerpoJSON.length === 1) {
        correcto = false;
        msg = 'No tiene suficientes <b>valores</b> asignados al <b>Horario</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION LLENAR LA TABLA DE HORARIOS [ HORARIOS ]
function llenarTablaHorarios() {
    var horario = '';
    $(horarioCuerpoJSON).each(function (key, value) {
        var horas = (horarioParamsConfigJSON.Reloj === "12hrs") ? "<b>" + value.HoraInicio12hrs + "<br />" + value.HoraTermino12hrs + "</b>" : "<b>" + value.HoraInicio24hrs + "<br />" + value.HoraTermino24hrs + "</b>";
        if (value.Receso) {
            horario += '<tr id="' + value.IdHTML + '"><td style="text-align: center;">' + horas + '</td><td colspan="7" style="text-align: center;"><label><b>R&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;S&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O</b></label></td></tr>';
        } else {
            horario += '<tr id="' + value.IdHTML + '"><td style="text-align: center;">' + horas + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Lunes, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="lunes">' + paramTablaHorarios(value.Lunes, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Martes, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="martes">' + paramTablaHorarios(value.Martes, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Miercoles, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="miercoles">' + paramTablaHorarios(value.Miercoles, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Jueves, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="jueves">' + paramTablaHorarios(value.Jueves, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Viernes, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="viernes">' + paramTablaHorarios(value.Viernes, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Sabado, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="sabado">' + paramTablaHorarios(value.Sabado, 't') + '</td><td class="tdtablahorarios ' + paramTablaHorarios(value.Domingo, 'e') + '" style="cursor: pointer; text-align: center;" title="Click para asignar Actividad" dia="domingo">' + paramTablaHorarios(value.Domingo, 't') + '</td></tr>';
        }
    });
    $('#modalNuevoHorarioTabla').html(horario);
}

// FUNCION EXCLUSIVA DE HORARIOS QUE DEVUELVE PARAMETROS PARA LA ESTRCUTRUA DE LA TABLA [ HORARIOS ]
function paramTablaHorarios(valor, tipo) {
    var retorno = '', coords = ["CA", "CD", "CM", "CP", "CE", "CC"];
    var coordsNoms = {
        CA: "<b>AL-Anon</b>",
        CD: "<b>Coord.<br />Deportiva</b>",
        CM: "<b>Coord.<br />Médica</b>",
        CP: "<b>Coord.<br />Psicológica</b>",
        CE: "<b>Coord.<br />Espiritual</b>",
        CC: "<b>Coord.<br />Consejería</b>",
    }
    if (tipo === 't') {
        if (valor === "-") {
            retorno = "<b>Sin<br />Actividad</b>";
        } else {
            if (coords.includes(valor)) {
                retorno = coordsNoms[valor];
            } else {
                retorno = "<b>" + valor + "</b>";
            }
        }
    } else if (tipo === 'e') {
        if (valor === "-") {
            retorno = "horariotablasinact";
        } else {
            if (coords.includes(valor)) {
                retorno = "horariotabla" + valor.toLowerCase();
            } else {
                retorno = "horariotablaotro";
            }
        }
    }
    return retorno;
}
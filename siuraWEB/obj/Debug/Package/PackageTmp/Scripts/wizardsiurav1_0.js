// ********************************************************
// ARCHIVO JAVASCRIPT WIZARDSIURA.JS
// http://localhost:90/WSiura/Index?1t5p9y0y3h5j9p0g3t1u5n3x3l
// --------------------------------------------------------
// VARIABLES GLOBALES
var resultadoVerifJSON = {};
var coordSelectValsJSON = {};
var testSelectValsJSON = {};
var wsListaTestCargarJSON = [];
var CoordParticipantesARR = [
    {
        Sigla: "CM",
        Nombre: "Coordinación Médica",
    },
    {
        Sigla: "CP",
        Nombre: "Coordinación Psicológica",
    },
    {
        Sigla: "CC",
        Nombre: "Coordinación Consejería",
    },
];
var wsCoordSelectGLOBAL = '';
var wsTipoTestSelectGLOBAL = '';
var wsParamsCargadosBOOL = false;
var wsNuevoTestEstructuraJSON = {};
var wsNuevoTestBOOL = false;
var wsTestSeccionesBOOL = false;
var wsTiposReactivosARR = ["Pregunta abierta (larga)Ø×ØPAL", "Pregunta abierta (corta)Ø×ØPAC", "BinariaØ×ØBI", "Opción MúltipleØ×ØOM", "Multi-SelecciónØ×ØMS"];
var wsTipoReactivosJSON = {};
var wsSeccionListaJSON = {};
var wsVistaPreviaHTML = '';
var wsNuevaSeccionBOOL = true;
var wsNuevoReactivoBOOL = true;
var wsIdEditarReactivoGLOBAL = '';
var wsIdSeccionGLOBAL = '';
var wsIdReactivoGLOBAL = '';
var wsMaxPuntajeRE = 0;
var wsRespuestasEstructurasJSON = {
    RA: {
        IdHTML: '',
        TituloRespuesta: '',
        MarcaAgua: '',
    },
    RE: {
        IdHTML: '',
        TituloRespuesta: '',
        TotalPuntaje: 0,
        Respuestas: [],
    },
    LF: {
        IdHTML: '',
        TituloRespuesta: '',
        Respuestas: [],
    },
};
var wsReactivosInfoJSON = {
    PAL: 'Reactivo de tipo abierto con la capacidad de colocar una respuesta <b>extensa</b>.<br /><br />Ø×IMG×Ø',
    PAC: 'Reactivo de tipo abierto con la capacidad de colocar una respuesta <b>breve</b>.<br /><br />Ø×IMG×Ø',
    BI: 'Reactivo con solo <b>2 opciones</b> posibles para elegir.<br /><br />Ø×IMG×Ø',
    OM: 'Reactivo donde puede elegir <b>solo 1 opcion</b> de entre una lista de respuestas.<br /><br />Ø×IMG×Ø',
    MS: 'Reactivo donde puede elegir <b>1 o más opciones</b> (o todas si se requiere) de entre una lista de respuestas.<br /><br />Ø×IMG×Ø',
};
// --- [ MASTER KEYS ] ---
var wsActivarUsoWizard = false;

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - SELECT  QUE MANIPULA LA SELECCIÓN DE LA COORDINACION EN EL WIZARD SIURA
$(document).on('change', '#wsCoordSelect', function () {
    wsCoordSelectGLOBAL = '';
    wsTipoTestSelectGLOBAL = '';
    testSelectValsJSON = {};
    wsParamsCargadosBOOL = false;
    $('#wsTestSelect').html('<option>- Eliga Tipo Test -</option>');
    $('#wsTablaTests').html(wsTdVacio);

    var testOpti = "";
    var coord = coordSelectValsJSON[$(this).val()];
    if (coord !== undefined) {
        $(NuevoIngresoTestJSON).each(function (k1, v1) {
            if (v1.Coord === coord) {
                $(v1.Test).each(function (k2, v2) {
                    var valOp = cadAleatoria(9);
                    testSelectValsJSON[valOp] = v2.Clave;
                    testOpti += '<option value="' + valOp + '">' + v2.Nombre + '</option>';
                });
            }
        });
        $('#wsTestSelect').append(testOpti);
        wsCoordSelectGLOBAL = coord;
    }
});

// DOCUMENT - SELECT QUE MANIPULA LA SELECCION DEL TIPO DE TEST EN EL WIZARD SIURA
$(document).on('change', '#wsTestSelect', function () {
    wsTipoTestSelectGLOBAL = '';
    wsParamsCargadosBOOL = false;
    $('#wsTablaTests').html(wsTdVacio);

    if (testSelectValsJSON[$(this).val()] !== undefined) {
        wsTipoTestSelectGLOBAL = testSelectValsJSON[$(this).val()];
    }
});

// DOCUMENT - BOTON QUE REESTABLECE LOS VALORES DEL PANEL PRINCIPAL
$(document).on('click', '#wsBtnRecargar', function () {
    wsLLenarCoordSelect();
});

// DOCUMENT - BOTON QUE EJECUTA EL CARGADO DE LA INFO DE LA COORDINACION Y SECCION DE TEST EN WIZARD SIURA
$(document).on('click', '#wsBtnCargarConfig', function () {
    if (wsValidarFormPanel()) {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/WSiura/ListaWizardTests",
            dataType: 'JSON',
            data: { ClaveTest: testSelectValsJSON[$('#wsTestSelect').val()] },
            beforeSend: function () {
                LoadingOn("Cargando Info. Wizard...");
            },
            success: function (data) {
                if (data.Correcto) {
                    LoadingOff();
                    wsParamsCargadosBOOL = true;
                    if (wsActivarUsoWizard) {
                        wsListaTestCargarJSON = data.Wizards;
                        if (data.Wizards.length > 0) {
                            var tablaTests = '';
                            $(wsListaTestCargarJSON).each(function (key, value) {
                                var activospan = '<button id="wstesthabcolor_' + value.IdWizard + '" class="btn badge badge-pill badge-' + ((value.Activo) ? 'success' : 'danger') + '" title="' + ((value.Activo) ? 'Deshabilitar Test' : 'Habilitar Test') + '" onclick="wsCambiarEstatusTest(' + key + ');"><span id="wstesthabicono_' + value.IdWizard + '" class="fa fa-toggle-' + ((value.Activo) ? 'on' : 'off') + '"></span></button>';
                                tablaTests += '<tr id="wstest_' + value.IdWizard + '">' + value.NombreTest + '<td style="text-align: center;">' + value.ClaveTest + '</td><td></td><td style="text-align: center;">' + activospan + '</td><td style="text-align: center;"><button class="btn badge badge-pill badge-warning" title="Editar Test" onclick="wsEditarTest(' + key + ');"><span class="fa fa-pen"></span></button>&nbsp;&nbsp;<button class="btn badge badge-pill badge-danger" title="Eliminar Test" onclick="wsEliminarTest(' + key + ');"><span class="fa fa-trash"></span></button></td></tr>';
                            });
                            $('#wsTablaTests').html(tablaTests);
                        } else {
                            MsgAlerta("Info!", "No tiene <b>Tests</b> configurados", 2900, "info");
                        }
                    }
                } else {
                    console.log(data.Error);
                    LoadingOff();
                    MsgAlerta("Error!", "Ocurrió un error al cargar la info de los <b>Wizard Tests</b>", 3000, "error");
                }
            },
            error: function (error) {
                console.log(error.responseText);
                LoadingOff();
                MsgAlerta("Error!", "Ocurrió un error al cargar la info de los <b>Wizard Tests</b>", 3000, "error");
            }
        });       
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA EJECUCION DE UN NUEVO TEST EN WIZARD SIURA
$(document).on('click', '#wsNuevoTest', function () {
    if (wsValidarNuevoTest()) {
        wsNuevoTestEstructuraJSON = {};
        wsNuevoTestBOOL = true;
        $('#wsModalNuevoTestPrincParamsTit').html($('#wsTestSelect option:selected').text().toUpperCase());
        $('#wsModalNuevoTestPrincParamsNombre').val('');
        $('#wsModalNuevoTestPrincParamsRA').attr("checked", true);
        $('#wsModalNuevoTestPrincParams').modal('show');
    }
});

// DOCUMENT - BOTON QUE CONTROLA UN MENSAJE DE INFO PARA SABER QUE SON LOS PARAMETROS INICIALES DE RESPUESTA
$(document).on('click', '.modalntppconfiginfo', function () {
    var msg = '';
    if ($(this).attr("opcion") === "RA") {
        msg = 'El test coloca un campo de texto para redactar de forma libre y abierta la respuesta, diagnóstico y/o conclusión.\n\n<b>Ejemplo:</b><br /><div><img src="../Media/wsinfora.png" style="width: 250px;" /></div>';
    } else if ($(this).attr("opcion") === "RE") {
        msg = 'Para esta opción, deberá asignar un puntaje a cada una de las respuestas del test para  al final generar una suma que definirá de forma automática la  respuesta, diagnóstico y/o conclusión.\n\n<b>Ejemplo:</b><br /><div><img src="../Media/wsinfore.png" style="width: 250px;" /></div>';
    } else if ($(this).attr("opcion") === "LF") {
        msg = 'En esta opción deberá configurar un conjunto de respuestas posibles para su selección. A comparación del test tipo <b>"Por Escalas"</b>, la respuesta no se selecciona de forma automática.\n\n<b>Ejemplo:</b><br /><div><img src="../Media/wsinfolf.png" style="width: 250px;" /></div>';
    }
    MsgAlerta("Info!", msg, 20000, 'info');
});

// DOCUMENT - BOTON QUE CONTROLA EL BOTON QUE ACEPTA LOS PARAMETROS INICIALES DEL NUEVO TEST EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestPrincParamsAcept', function () {
    if (validarFormNuevoTestPI()) {
        MsgPregunta("Guardar Parametros", "¿Desea continuar?", function (si) {
            if (si) {
                LoadingOn("Configurando Parametros...");
                var tipoRespuesta = '', txtTipoRespuesta = '';
                $('input[name="modalntppconfig"]').each(function () {
                    if ($(this).is(":checked")) {
                        tipoRespuesta = $(this).attr("id").replace("wsModalNuevoTestPrincParams", "");
                        txtTipoRespuesta = $('label[for="' + $(this).attr("id") + '"]').prop("innerHTML").split("<span")[0];
                    }
                });
                wsTestSeccionesBOOL = $('#wsModalNuevoTestPrincParamsSecc').is(":checked");
                wsNuevoTestEstructuraJSON = {
                    Nombre: $('#wsModalNuevoTestPrincParamsNombre').val().toUpperCase(),
                    TipoExamen: $('#wsTestSelect option:selected').text(),
                    EnSecciones: $('#wsModalNuevoTestPrincParamsSecc').is(":checked"),
                    SeccionesParam: [],
                    TipoRespuesta: tipoRespuesta,
                    TestEstructura: [],
                    Respuesta: {
                        Configurado: false,
                        Estructura: wsRespuestasEstructurasJSON[tipoRespuesta],
                    },
                };
                $('#wsModalNuevoTestPrincParams').modal('hide');
                setTimeout(function () {
                    wsSeccionListaJSON = {};
                    $('#wsModalNuevoTestConfigNombreTest').html(wsNuevoTestEstructuraJSON.Nombre);
                    $('#wsModalNuevoTestConfigPregLista').html(wsPregListaVacio);
                    $('#wsModalNuevoTestConfigSeccionDiv').html((wsTestSeccionesBOOL) ? wsTestSeccionesDiv : '');
                    $('#wsModalNuevoTestConfigTipoPreg').val('-1');
                    $('#wsModalNuevoTestConfigTipoPreg').removeAttr("disabled");
                    $('#wsModalNuevoTestConfigPregAdd').removeAttr("disabled");
                    $('#wsModalNuevoTestConfigSeccion').removeAttr("disabled");
                    $('#wsModalNuevoTestConfigSeccionAdd').removeAttr("disabled");
                    $('#wsModalNuevoTestConfigReactivoDiv').html('');
                    $('#wsModalConfigRespuestaTitulo').html("Configurar Respuesta - " + txtTipoRespuesta);
                    $('#wsModalNuevoTestConfig').modal('show');
                    setTimeout(function () {
                        LoadingOff();
                    }, 1200);
                }, 1200);
            }
        });
    }
});

// DOCUMENT - BOTON QUE CANCELA LA CONFIGURACIÓN DE PARAMETROS INICIALES DEL NUEVO TEST EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestPrincParamsCanc', function () {
    MsgPregunta("Cancelar Configuración", "¿Desea cerrar y cancelar?", function (si) {
        if (si) {
            $('#wsModalNuevoTestPrincParams').modal('hide');
        }
    });
});

// ------------------------------- [ MANEJO DE REACTIVOS ] -------------------------------
// DOCUMENT - BOTON QUE MUESTRA LA INFO DE UN REACTIVO EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigPregInfo', function () {
    if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] !== undefined) {
        MsgAlerta("Info", wsReactivosInfoJSON[wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]].replace("Ø×IMG×Ø", '<img src="../Media/ws' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()].toLowerCase() + 'info.png" style="width: 250px;" /></div>'), 10000, 'info');
    }
});

// DOCUMENT - BOTON QUE AGREGA UN NUEVO REACTIVO AL NUEVO TEST EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigPregAdd', function () {
    if (wsValidarNuevoReactivo()) {
        wsNuevoReactivoBOOL = true;
        $('#wsModalNuevoTestConfigTipoPreg').attr("disabled", true);
        $('#wsModalNuevoTestConfigPregAdd').attr("disabled", true);
        $('#wsModalNuevoTestConfigSeccion').attr("disabled", true);
        $('#wsModalNuevoTestConfigSeccionAdd').attr("disabled", true);
        $('#wsModalNuevoTestConfigReactivoDiv').html(wsDivNuevoReactivo);
        $('#wsAddNuevoReactivoAgregar').html('<i class="fa fa-plus"></i>&nbsp;Agregar Reactivo');
        wsGenerarTipoReactivo();
    }
});

// DOCUMENT - BOTON QUE ABRE EL MODAL PARA AÑADIR UNA NUEVA SECCIÓN EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigSeccionAdd', function () {
    LoadingOn("Cargando Menú");
    wsNuevaSeccionBOOL = true;
    wsIdSeccionGLOBAL = '';
    $('#wsModalNuevoTestAddSeccionGuardar').html('<i class="fa fa-plus"></i>&nbsp;Añadir Sección');
    $('#wsModalNuevoTestAddSeccionNombre').val('');
    $('#wsModalNuevoTestAddSeccion').modal('show');
    $('#wsModalNuevoTestAddSeccion').on('shown.bs.modal', function (e) {
        LoadingOff();
        $('#wsModalNuevoTestAddSeccionNombre').focus();
    });
});

// DOCUMENT - BOTON QUE AÑADE UN NUEVO ELEMENTO DE SECCION EN EL LISTADO EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestAddSeccionGuardar', function () {
    if (wsValidarNuevaSeccion()) {
        if (wsNuevaSeccionBOOL) {
            if (wsNuevoTestEstructuraJSON.SeccionesParam.length === 0) {
                $('#wsModalNuevoTestConfigPregLista').html('<div id="wsModalNuevoTestConfigPregAcordion"></div>');
            }
            var id = cadAleatoria(10), numero = (wsNuevoTestEstructuraJSON.SeccionesParam.length === 0) ? wsNuevoTestEstructuraJSON.SeccionesParam.length + 1 : maxNumJsonARR(wsNuevoTestEstructuraJSON.SeccionesParam, 'NSeccion') + 1;
            var seccion = {
                Titulo: $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase(),
                IdHTML: id,
                NSeccion: numero,
            };
            wsNuevoTestEstructuraJSON.SeccionesParam.push(seccion);
            wsSeccionListaJSON[id] = $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase();
            $('#wsModalNuevoTestConfigSeccion').append('<option value="' + id + '">' + $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase() + '</option>');
            $('#wsModalNuevoTestConfigPregAcordion').append(wsSeccionAcord.replace(/Ø×IDHTML×Ø/gi, id).replace(/Ø×NOMBRE×Ø/gi, $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase()));
            $('#secciondiv_' + id).html(wsNoReactivos);
            $('#wsModalNuevoTestAddSeccion').modal('hide');
        } else {
            $('button[aria-controls="cuerpo_' + wsIdSeccionGLOBAL + '"]').html($('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase());
            $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
                if (value.IdHTML === wsIdSeccionGLOBAL) {
                    wsNuevoTestEstructuraJSON.SeccionesParam[key].Titulo = $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase();
                }
            });
            $('#wsModalNuevoTestConfigSeccion option').each(function () {
                if ($(this).val() === wsIdSeccionGLOBAL) {
                    $(this).html($('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase());
                }
            });
            $('#wsModalNuevoTestAddSeccion').modal('hide');
        }
    }
});


// :::::::::::::::::::::::::::::::::::::: [ DOCUMENTS DE REACTIVOS ] ::::::::::::::::::::::::::::::::::::::
// DOCUMENT - BOTON QUE AÑADE UN NUEVO REACTIVO A LA  ESTRUCTURA DEL NUEVO TEST EN WIZARD SIURA
$(document).on('click', '#wsAddNuevoReactivoAgregar', function () {
    if (wsValidarReactivoParams()) {
        MsgPregunta("Agregar Reactivo", "¿Desea continuar?", function (si) {
            if (si) {
                wsNuevoReactivoPack();
            }
        });
    }
});

// DOCUMENT - BOTON QUE CANCELA EL AÑADIR UN NUEVO REACTIVO AL TEST EN WIZARD SIURA
$(document).on('click', '#wsAddNuevoReactivoCancelar', function () {
    MsgPregunta("Cancelar Agregar Reactivo", "¿Desea continuar?", function (si) {
        if (si) {
            $('#wsModalNuevoTestConfigTipoPreg').removeAttr("disabled");
            $('#wsModalNuevoTestConfigPregAdd').removeAttr("disabled");
            $('#wsModalNuevoTestConfigSeccion').removeAttr("disabled");
            $('#wsModalNuevoTestConfigSeccionAdd').removeAttr("disabled");
            $('#wsModalNuevoTestConfigReactivoDiv').html('');
        }
    });
});

// --------------------------- [ INPUTS DE PUNTUACION ] ---------------------------
// DOCUMENT - CHECK QUE CONTROLA SI ELIGE PUNTUAR O NO LA RESPUESTA
$(document).on('change', 'input[name="wspuntuarcheckbox"]', function () {
    $('.wspuntosinput').val('0');
});

// DOCUMENT - BOTON KIT QUE CONTROLA EL SUMAR/RESTAR LOS PUNTOS (PREGUNTAS ABIERTAS - LARGAS  Y CORTAS) EN  WIZARD SIURA
$(document).on('click', '.wspuntosctrl', function () {
    if ($('input[name="wspuntuarcheckbox"]').is(":checked")) {
        var puntos = parseFloat($('#wsPuntuos' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val());
        if ($(this).attr("accion") === "s") {
            $('#wsPuntuos' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val(puntos + 1);
        } else if ($(this).attr("accion") === "r") {
            if (puntos > 0) {
                $('#wsPuntuos' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val(puntos - 1);
            }
        }
    }
});

// DOCUMENT - BOTON KIT QUE CONTROLA EL  SUMAR/RESTAR LOS PUNTOS (BINARIOS) EN WIZARD SIURA
$(document).on('click', '.wspuntosbictrl', function () {
    if ($('input[name="wspuntuarcheckbox"]').is(":checked")) {
        var idInput = ($(this).attr("texto") === "pr") ? "#wsPuntuosPRBI" : "#wsPuntuosSRBI";
        var puntos = parseFloat($(idInput).val());
        if ($(this).attr("accion") === "s") {
            $(idInput).val(puntos + 1);
        } else if ($(this).attr("accion") === "r") {
            if (puntos > 0) {
                $(idInput).val(puntos - 1);
            }
        }
    }
});

// DOCUMENT - BOTON KIT QUE CONTROLA EL SUMAR/RESTAR LOS PUNTOS (MULTIRESPUESTAS) EN WIZARD SIURA
$(document).on('click', '.wspuntosmultictrl', function () {
    if ($('#wsPuntuar' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).is(":checked")) {
        var idHTML = $(this).parent().parent().parent().attr("id");
        var puntos = parseFloat($('#puntos_' + idHTML).val());
        if ($(this).attr("accion") === "s") {
            $('#puntos_' + idHTML).val(puntos + 1);
        } else if ($(this).attr("accion") === "r") {
            if (puntos > 0) {
                $('#puntos_' + idHTML).val(puntos - 1);
            }
        }
    }
});
// --------------------------- [ INPUTS DE PUNTUACION ] ---------------------------

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE MOSTRAR LA VISTA PREVIA DEL REACTIVO EN WIZARD SIURA
$(document).on('click', '#wsAddNuevoReactivoVistaPrevia', function () {
    if (wsValidarReactivoParams()) {
        $('#wsModalNuevoReactivoVistaPreviaDiv').html(wsVistaPreviaHTML);
        if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "MS") {
            $('#wsMultiResp').chosen({ width: "98%" });
        }
        $('#wsModalNuevoReactivoVistaPrevia').modal('show');
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE MOSTRAR  LA VISTA PREVIA DEL REACTIVO (DESDE  LA LISTA DE REACTIVOS) EN WIZARD SIURA
$(document).on('click', '.wsvpreviareactivo', function () {
    var id = $(this).parent().parent().parent().parent().attr("name"), parametros = {}, tipoReactivo = '', respMultiples = '';
    $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
        if (value.IdHTML === id) {
            parametros = value.Parametros;
            tipoReactivo = value.TipoReactivo;
        }
    });
    if (parametros.RespuestasLista !== undefined) {
        $(parametros.RespuestasLista).each(function (key, value) {
            respMultiples += '<option>' + value.TextoRespuesta + '</option>';
        });
    }
    if (tipoReactivo === "PAL") {
        wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaPAL"><b># - ' + parametros.TituloPregunta + '</b></label><textarea id="wsVistaPreviaPAL" class="form-control form-control-sm" placeholder="' + parametros.MarcaAgua + '"></textarea></div>';
    } else if (tipoReactivo === "PAC") {
        wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaPAC"><b># - ' + parametros.TituloPregunta + '</b></label><input type="text" id="wsVistaPreviaPAC" class="form-control form-control-sm" placeholder="' + parametros.MarcaAgua + '" /></div>';
    } else if (tipoReactivo === "BI") {
        wsVistaPreviaHTML = '<div class="form-group"><label for="formControlRange"><b># - ' + parametros.TituloPregunta + '</b></label><div class="form-check"><input id="wsPRBI" type="radio" name="wsradiobi" class="magic-radio" checked /><label for="wsPRBI">' + parametros.PPTexto + '</label></div><div class="form-check"><input id="wsSRBI" type="radio" name="wsradiobi" class="magic-radio" /><label for="wsSRBI">' + parametros.SPTexto + '</label></div></div>';
    } else if (tipoReactivo === "OM") {
        wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaOM"><b># - ' + parametros.TituloPregunta + '</b></label><select id="wsVistaPreviaOM" class="form-control form-control-sm">' + respMultiples + '</select></div>';
    } else if (tipoReactivo === "MS") {
        wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaMS"><b># - ' + parametros.TituloPregunta + '</b></label><select id="wsVistaPreviaMS" class="chosen-select" multiple data-placeholder="Lista de opciones">' + respMultiples + '</select></div>';
    }
    $('#wsModalNuevoReactivoVistaPreviaDiv').html(wsVistaPreviaHTML);
    if (tipoReactivo === "MS") {
        $('#wsVistaPreviaMS').chosen({ width: "98%" });
    }
    $('#wsModalNuevoReactivoVistaPrevia').modal('show');
});

// DOCUMENT  - BOTON QUE PERMITE EDITAR UN REACTIVO PREVIAMENTE PUESTO EN LA LISTA EN WIZARD SIURA
$(document).on('click', '.wseditarreactivo', function () {
    wsCargarReactivoEditar($(this).parent().parent().parent().parent().attr("name"));
});

// DOCUMENT - BOTON QUE ELIMINA EL REACTIVO DE LA LISTA EN WIZARD SIURA
$(document).on('click', '.wsborrarreactivo', function () {
    var id = $(this).parent().parent().parent().parent().attr("name");
    MsgPregunta("Borrar Reactivo de la Lista", "¿Desea continuar?", function (si) {
        if (si) {
            wsNuevoTestEstructuraJSON.TestEstructura.quitarElemento('IdHTML', id);
            $('div[name="' + id + '"]').remove();
        }
    });
});

// -------------------------------- [ MANEJO DE MULTIRESPUESTAS ] --------------------------------
// DOCUMENT - BOTON QUE AÑADE A UNA TABLA RESPUESTAS PARA LOS REACTIVOS  DE TIPO MULTIPLE EN WIZARD SIURA
$(document).on('click', '.wsbtnagregarresp', function () {
    if (wsValidarReactivoMultResp()) {
        var id = cadAleatoria(10), tdPuntos = '';
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            tdPuntos = '<td style="text-align: center;"><div style="display: inline-block;"><button class="btn badge badge-pill badge-secondary wspuntosmultictrl" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntos_' + id + '" type="text" class="form-control form-control-sm wspuntosinput" style="width: 100px; display: inline-block; text-align: center;" disabled="disabled" value="0" />&nbsp;<button class="btn badge badge-pill badge-secondary wspuntosmultictrl" accion="s"><i class="fa fa-chevron-right"></i></button></div></td>';
        }
        $('#wsTablaRespuestas').append('<tr id="' + id + '"><td><b id="textopreg_' + id + '">' + $('#wsTextoResp' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val() + '</b></td>' + tdPuntos + '<td style="text-align: center;"><button class="btn badge badge-pill badge-danger wsborrarrespmultireactivo" elem="' + id + '" title="Borrar Respuesta"><i class="fa fa-trash"></i></button></td></tr>');
        $('#wsTextoResp' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val('').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ELIMINACION DE UNA RESPUESTA EN LA LISTA DE MULTIRESPUESTAS EN WIZARD SIURA
$(document).on('click', '.wsborrarrespmultireactivo', function () {
    var id = $(this).attr("elem");
    MsgPregunta("Borrar Respuesta", "¿Desea continuar?", function (si) {
        if (si) {
            $('#' + id).remove();
        }
    });
});
// :::::::::::::::::::::::::::::::::::::: [ DOCUMENTS DE REACTIVOS ] ::::::::::::::::::::::::::::::::::::::
// DOCUMENT  - BOTON QUE GUARDA TODO EL TEST EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigGuardar', function () {
    if (wsValidarTestEstructura()) {
        MsgPregunta("GAURDAR TEST", "¿Desea continuar?", function (si) {
            if (si) {

            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA QUE CANCELA LA CONFIGURACION TOTAL DEL TEST EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigCancelar', function () {
    MsgPregunta("TODOS LOS CAMBIOS SE PERDERAN", "¿Desea cerrar el editor?", function (si) {
        if (si) {
            $('.ui-sortable').sortable("destroy");
            $('#wsModalNuevoTestConfig').modal('hide');
        }
    });
});

// :::::::::::::::::::::::::::::::::::::: [ DOCUMENTS DE SECCIONES ] ::::::::::::::::::::::::::::::::::::::
// DOCUMENT - BOTON (2 EN 1) QUE MANEJA EL SUBIR / BAJAR UNA SECCION DE LUGAR EN WIZARD SIURA
$(document).on('click', '.wssubirseccion, .wsbajarseccion', function () {
    if (wsNuevoTestEstructuraJSON.SeccionesParam.length > 1) {
        var jsonSeccHTML = {}, id = $(this).parent().parent().attr("id").split("_")[1], clase = $(this).attr("class").split("ws")[1], num = 0, numMas = 0, numMenos = 0, totalSeccs = wsNuevoTestEstructuraJSON.SeccionesParam.length;
        $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
            if (value.IdHTML === id) {
                num = value.NSeccion;
                numMas = num + 1;
                numMenos = num - 1;
            }
            jsonSeccHTML[value.IdHTML] = $('#' + value.IdHTML).prop('outerHTML');
        });
        if ((clase === "subirseccion" && num > 1) || (clase === "bajarseccion" && num < totalSeccs)) {
            $('.ui-sortable').sortable("destroy");
            $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
                if (clase === "subirseccion") {
                    if (value.NSeccion === num && value.IdHTML === id) {
                        wsNuevoTestEstructuraJSON.SeccionesParam[key].NSeccion = num - 1;
                    }
                    if (value.NSeccion === numMenos && value.IdHTML !== id) {
                        wsNuevoTestEstructuraJSON.SeccionesParam[key].NSeccion = num + 1;
                    }
                } else if (clase === "bajarseccion") {
                    if (value.NSeccion === num && value.IdHTML === id) {
                        wsNuevoTestEstructuraJSON.SeccionesParam[key].NSeccion = num + 1;
                    }
                    if (value.NSeccion === numMas && value.IdHTML !== id) {
                        wsNuevoTestEstructuraJSON.SeccionesParam[key].NSeccion = num - 1;
                    }
                }
            });
            var nuevasSeccHTML = '';
            OrdenarJSON(wsNuevoTestEstructuraJSON.SeccionesParam, 'NSeccion', 'asc');
            $(JsonORDENADO).each(function (key, value) {
                nuevasSeccHTML += jsonSeccHTML[value.IdHTML];
            });
            $('#wsModalNuevoTestConfigPregAcordion').html(nuevasSeccHTML);
            $(JsonORDENADO).each(function (key, value) {
                $('#secciondiv_' + value.IdHTML).sortable({
                    stop: function (e, ui) {
                        wsReactivosNPregunta();
                    }
                });
            });
            wsReactivosNPregunta();
        }
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA EDICION DE UNA SECCION EN WIZARD SIURA
$(document).on('click', '.wseditarseccion', function () {
    LoadingOn("Cargando Valores...");
    wsIdSeccionGLOBAL = id = $(this).parent().parent().attr("id").split("_")[1], seccTexto = '';
    wsNuevaSeccionBOOL = false;
    $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
        if (value.IdHTML === id) {
            seccTexto = value.Titulo;
        }
    });
    $('#wsModalNuevoTestAddSeccionGuardar').html('<i class="fa fa-save"></i>&nbsp;Guardar Sección');
    $('#wsModalNuevoTestAddSeccionNombre').val(seccTexto);
    $('#wsModalNuevoTestAddSeccion').modal('show');
    $('#wsModalNuevoTestAddSeccion').on('shown.bs.modal', function (e) {
        LoadingOff();
        $('#wsModalNuevoTestAddSeccionNombre').focus();
    });
});

// DOCUMENT - BOTON QUE ELIMINA UNA SECCION DE LA ESTRUCTURA DEL TEST JSON EN WIZARD SIURA
$(document).on('click', '.wsborrarseccion', function () {
    var id = $(this).parent().parent().attr("id").split("_")[1];
    MsgPregunta("LAS PREGUNTAS ANEXADAS A ESTA SECCIÓN SE PERDERÁN", "¿Desea continuar Y ELIMINAR?", function (si) {
        if (si) {
            wsNuevoTestEstructuraJSON.SeccionesParam.quitarElemento('IdHTML', id);
            var nuevoElems = [];
            $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
                if (value.Parametros.IdSeccionHTML !== id) {
                    nuevoElems.push(value);
                }
            });
            wsNuevoTestEstructuraJSON.TestEstructura = nuevoElems;
            $('#wsModalNuevoTestConfigSeccion option').each(function () {
                if ($(this).val() === id) {
                    $(this).remove();
                }
            });
            $('#' + id).remove();
        }
    });
});


// ---------------------- [ CONFIGURACION DE RESPUESTAS ] ----------------------
// DOCUMENT - QUE ABRE EL MODAL  PARA CONFIGURAR LA RESPUESTA EN WIZARD SIURA
$(document).on('click', '#wsModalNuevoTestConfigRespuesta', function () {
    console.log(wsNuevoTestEstructuraJSON);
    if (wsValidarPreguntaPE(wsNuevoTestEstructuraJSON.TipoRespuesta)) {
        $('#wsModalConfigRespuestaDiv').html(wsReaspuestasJSON[wsNuevoTestEstructuraJSON.TipoRespuesta]);
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('#wsPuntajeTotalRE').html(wsMaxPuntajeRE.toString());
            if (wsMaxPuntajeRE < 4) {
                MsgAlerta("Info!", "El puntaje [<b>" + wsMaxPuntajeRE.toString() + "</b>] al parecer es <b>Insuficiente</b> para configurar correctamente la Respuesta", 3500, "info");
            }
        }
        if (wsNuevoTestEstructuraJSON.Respuesta.Configurado) {
            if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RA") {
                $('#wsTituloRespuestaRA').val(wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta);
                $('#wsMarcaAguaRespuestaRA').val(wsNuevoTestEstructuraJSON.Respuesta.Estructura.MarcaAgua);
            } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
                var respuestas = '', cant = 2, idelem = 0;
                $('#wsTituloRespuestaRE').val(wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta);
                $('#wsRespuestasRE').val(wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas.length);
                $(wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas).each(function (key, value) {
                    if (key === 0) {
                        respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" value="' + value.TextoRespuesta + '" /></td><td style="text-align: center;"><div style="display:inline-block"><input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" value="1" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" />&nbsp;&nbsp;a&nbsp;&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + value.MaxPuntos + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="s"><i class="fa fa-chevron-right"></i></button></div></td></tr>';
                    } else if (key === (wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas.length - 1)) {
                        respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" value="' + value.TextoRespuesta + '" /></td><td style="text-align: center;"><div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + value.MinPuntos + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="s"><i class="fa fa-chevron-right"></i></button>&nbsp;a&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + value.MaxPuntos + '" /></div></td></tr>';
                    } else {
                        cant++;
                        respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" value="' + value.TextoRespuesta + '" /></td><td style="text-align: center;"><div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + value.MinPuntos + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="s"><i class="fa fa-chevron-right"></i></button></div>&nbsp;&nbsp;a&nbsp;&nbsp;<div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + value.MaxPuntos + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="s"><i class="fa fa-chevron-right"></i></button></div></td></tr>';
                    }
                    cant++;
                    idelem = idelem + 2;
                });
                $('#wsTablaRespuestasRE').html(respuestas);
            } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "LF") {
                var respuestas = '';
                $('#wsTituloRespuestaLF').val(wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta);
                $(wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas).each(function (key, value) {
                    respuestas += '<tr id="' + value.IdHTML + '" class="tdrespuestalf"><td><b id="txtrespuestalf_' + value.IdHTML + '">' + value.TextoRespuesta + '</b></td><td style="text-align: center;"><button class="btn badge badge-pill badge-danger wsborrarrespuestalf" elem="' + value.IdHTML + '" title="Borrar Respuesta"><i class="fa fa-trash"></i></button></td></tr>';
                });
                $('#wsTablaRespuestasLF').html(respuestas);
            }
        }
        $('#wsModalConfigRespuesta').modal('show');
    }
});

// DOCUMENT - BOTON QUE CONTROLA  EL AGREGADO DE RESPUESTAS EL LA LISTA FIJA EN WIZARD SIURA
$(document).on('click', '.wsbtnnuevarespuestalf', function () {
    if (wsValidarNuevaRespuestaLF()) {
        var id = cadAleatoria(11);
        $('#wsTablaRespuestasLF').append('<tr id="' + id + '" class="tdrespuestalf"><td><b id="txtrespuestalf_' + id + '">' + $('#wsTextoRespuestaLF').val() + '</b></td><td style="text-align: center;"><button class="btn badge badge-pill badge-danger wsborrarrespuestalf" elem="' + id + '" title="Borrar Respuesta"><i class="fa fa-trash"></i></button></td></tr>');
        $('#wsTextoRespuestaLF').val('').focus();
    }
});

// DOCUMENT - BOTON QUE ELIMINA UNA RESPUESTA DE LA LISTA FIJA EN WIZARD SIURA
$(document).on('click', '.wsborrarrespuestalf', function () {
    var id = $(this).attr("elem");
    MsgPregunta("Borrar Respuesta", "¿Desea continuar?", function (si) {
        if (si) {
            $('#' + id).remove();
            $('#wsTextoRespuestaLF').focus();
        }
    });
});

// DOCUMENT - BOTON QUE GUARDA LOS PARAMETROS DE LA RESPUESTA EN WIZARD SIURA
$(document).on('click', '#wsModalConfigRespuestaGuardar', function () {
    if (wsValidarRespuestaConfig()) {
        MsgPregunta("Guardar Respuesta", "¿Desea  continuar?", function (si) {
            if (si) {
                wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML = (!wsNuevoTestEstructuraJSON.Respuesta.Configurado) ? cadAleatoria(10) : wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML;
                if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RA") {
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta = $('#wsTituloRespuestaRA').val();
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.MarcaAgua = $('#wsMarcaAguaRespuestaRA').val();
                } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta = $('#wsTituloRespuestaRE').val();
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.TotalPuntaje = wsMaxPuntajeRE;
                    var respuestas = [];
                    $('#wsTablaRespuestasRE tr').each(function () {
                        var id = $(this).attr("respre");
                        respuestas.push({
                            IdHTML: cadAleatoria(10),
                            TextoRespuesta: $('#textrespre_' + id).val(),
                            MinPuntos: parseFloat($('#puntosrespre_' + id).val()),
                            MaxPuntos: parseFloat($('#puntosrespre_' + (parseFloat(id) + 1)).val()),
                        });
                    });
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas = respuestas;
                } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "LF") {
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta = $('#wsTituloRespuestaLF').val();
                    var respuestas = [];
                    $('#wsTablaRespuestasLF tr').each(function () {
                        var id = $(this).attr("id");
                        respuestas.push({
                            IdHTML: id,
                            TextoRespuesta: $('#txtrespuestalf_' + id).text(),
                        });
                    });
                    wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas = respuestas;
                }
                wsNuevoTestEstructuraJSON.Respuesta.Configurado = true;
                $('#wsModalConfigRespuesta').modal('hide');
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL MANEJO DE CANTIDAD DE RESPUESTAS PARA LA RESPUESTA EN ESCALA EN WIZARD SIURA
$(document).on('click', '.wsrespuestasctrlre', function () {
    var cant = parseFloat($('#wsRespuestasRE').val());
    if ($(this).attr("accion") === "s") {
        $('#wsRespuestasRE').val(cant + 1);
    } else if ($(this).attr("accion") === "r") {
        if (cant > 2) {
            $('#wsRespuestasRE').val(cant - 1);
        }
    }
});

// DOCUMENT - BOTON QUE CREA LAS RESPUESTAS PARA EL ESQUEMA DE RESPUESTAS EN ESCALA EN WIZARD SIURA
$(document).on('click', '.wsbtnnuevarespuestare', function () {
    if (wsValidarCrearRespuestasRE()) {
        var respuestas = '', cant = 2, idelem = 0;
        for (i = 0; i < parseFloat($('#wsRespuestasRE').val()); i++) {
            if (i === 0) {
                respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" /></td><td style="text-align: center;"><div style="display:inline-block"><input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" value="1" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" />&nbsp;&nbsp;a&nbsp;&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + cant + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="s"><i class="fa fa-chevron-right"></i></button></div></td></tr>';
            } else if (i === (parseFloat($('#wsRespuestasRE').val()) - 1)) {
                respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" /></td><td style="text-align: center;"><div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + cant + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="s"><i class="fa fa-chevron-right"></i></button>&nbsp;a&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + wsMaxPuntajeRE.toString() + '" /></div></td></tr>';
            } else {
                cant++;
                respuestas += '<tr respre="' + idelem + '"><td><input id="textrespre_' + idelem.toString() + '" placeholder="Texto de Respuesta" class="form-control form-control-sm wstextrespre" /></td><td style="text-align: center;"><div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + idelem.toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + (cant - 1).toString() + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + idelem.toString() + '" pos="prim" accion="s"><i class="fa fa-chevron-right"></i></button></div>&nbsp;&nbsp;a&nbsp;&nbsp;<div style="display:inline-block"><button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntosrespre_' + (idelem + 1).toString() + '" class="form-control form-control-sm" style="display:inline-block; width: 80px; text-align: center;" disabled="disabled" value="' + cant + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wsrespcantpuntosre" id="input_' + (idelem + 1).toString() + '" pos="seg" accion="s"><i class="fa fa-chevron-right"></i></button></div></td></tr>';
            }
            cant++;
            idelem = idelem + 2;
        }
        $('#wsTablaRespuestasRE').html(respuestas);
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL MECANISMO DE PUNTAJE DE LA RESPUESTA DE ESCALAS EN WIZARD SIURA
$(document).on('click', '.wsrespcantpuntosre', function () {
    var idTd = $(this).parent().parent().parent().attr("respre"), idElem = $(this).attr("id").split("_")[1], idsArr = [], posicion = $(this).attr("pos");
    $('#wsTablaRespuestasRE tr').each(function () {
        idsArr.push(parseFloat($(this).attr("respre")));
    });
    var maxIdTr = Math.max(...idsArr) + 1;
    if ($(this).attr("accion") === "r") {
        if ((parseFloat(idElem) - 2) >= 0) {
            if (posicion === "prim") {
                var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 2)).val());
                if ((parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val()) - 1) > tope) {
                    $('#puntosrespre_' + (parseFloat(idElem) - 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val()) - 1));
                    $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) - 1));
                }
            } else if (posicion === "seg") {
                var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val());
                if ((parseFloat($('#puntosrespre_' + idElem).val()) - 1) > tope) {
                    $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) - 1));
                    $('#puntosrespre_' + (parseFloat(idElem) + 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val()) - 1));
                }
            }
        } else {
            var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val());
            if ((parseFloat($('#puntosrespre_' + idElem).val()) - 1) > tope) {
                $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) - 1));
                $('#puntosrespre_' + (parseFloat(idElem) + 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val()) - 1));
            }
        }
    } else if ($(this).attr("accion") === "s") {
        if ((parseFloat(idElem) + 2) <= maxIdTr) {
            if (posicion === "prim") {
                var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val());
                if ((parseFloat($('#puntosrespre_' + idElem).val()) + 1) < tope) {
                    $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) + 1));
                    $('#puntosrespre_' + (parseFloat(idElem) - 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val()) + 1));
                }
            } else if (posicion === "seg") {
                var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 2)).val());
                if ((parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val()) + 1) < tope) {
                    $('#puntosrespre_' + (parseFloat(idElem) + 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val()) + 1));
                    $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) + 1));
                }
            }
        } else {
            var tope = parseFloat($('#puntosrespre_' + (parseFloat(idElem) + 1)).val());
            if ((parseFloat($('#puntosrespre_' + idElem).val()) + 1) < tope) {
                $('#puntosrespre_' + idElem).val((parseFloat($('#puntosrespre_' + idElem).val()) + 1));
                $('#puntosrespre_' + (parseFloat(idElem) - 1)).val((parseFloat($('#puntosrespre_' + (parseFloat(idElem) - 1)).val()) + 1));
            }
        }
    }
});

// --------------------- [ VISTA PREVIA ] ---------------------
// DOCUMENT - BOTON QUE CONTROLA LA VISTA PREVIA DE TODO EL TEST DE WIZARD SIURA
$(document).on('click', '#wsVistaPreviaTest', function () {
    wsConstruirTest();
});


// ------------------ [ CALIFICAR TEST DE REACTIVOS POR ESCALAS ] ------------------
// DOCUMENT - BOTON QUE CONTROLA EL CALIFICADO DEL TEST POR ESCALAS EN WIZARD SIURA
$(document).on('click', '.wscalificartestre', function () {
    wsCalificarTestRE();
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION INICIAL QUE VERIFICA LOS PARAMETROS DE USUARIO
$(function () {
    LoadingOn("Cargando Parametros...");
    var url = window.location.href;
    if (url.indexOf("?") >= 0) {
        var tokenAcceso = url.slice(window.location.href.indexOf('?') + 1).split('&').toString();
        tokenAcceso = tokenAcceso.trim();
        if (tokenAcceso !== "") {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/WSiura/VerificarTokenAcceso",
                dataType: "JSON",
                data: { TokenAcceso: tokenAcceso },
                beforeSend: function () {
                    wsReestVariables();
                    testSelectValsJSON = {};
                    LoadingOn("Verificando Parametros...");
                },
                success: function (data) {
                    resultadoVerifJSON = data;
                    if (data.Exito) {
                        if (data.Verificado) {
                            $.ajax({
                                type: "POST",
                                contentType: "application/x-www-form-urlencoded",
                                url: "/WSiura/WizardPagina",
                                beforeSend: function () {
                                    LoadingOn("Cargando Panel...");
                                },
                                success: function (data) {
                                    $('#wizardDivPrincipal').html(data);
                                    
                                    wsParamsIniciales(function () {
                                        LoadingOff();
                                    });
                                },
                                error: function (error) {
                                    console.log(error.responseText);
                                    $('#wizardDivPrincipal').html(errorFail);
                                    LoadingOff();
                                }
                            });
                        } else {
                            $('#wizardDivPrincipal').html(errorToken);
                            LoadingOff();
                        }
                    } else {
                        console.log(data.Error);
                        $('#wizardDivPrincipal').html(errorFail);
                        LoadingOff();
                    }
                },
                error: function (error) {
                    console.log(error.responseText);
                    $('#wizardDivPrincipal').html(errorFail);
                    LoadingOff();
                }
            });
        } else {
            $('#wizardDivPrincipal').html(errorRoto);
            LoadingOff();
        }
    } else {
        $('#wizardDivPrincipal').html(errorUrl);
        LoadingOff();
    }
});

// FUNCION QUE CARGA LOS PARAMETROS INICIALES DEL SISTEMA WIZARD SIURA
function wsParamsIniciales(callback) {    
    wsLLenarCoordSelect();
    $('#wsTablaTests').html(wsTdVacio);
    if (!resultadoVerifJSON.CoordMedica && !resultadoVerifJSON.CoordPsicologica) {
        MsgAlerta("Atención!", "Al parecer no tiene los <b>permisos</b> necesarios para manipular esta herramienta\n\nConsulte con su <b>Administrador</b> para revisar sus permisos en su perfil de usuario.", 10000, 'default');
    }
    wsModalTestParams();
    callback(true);
}

// FUNCION EXCLUSIVA QUE LLENA LOS VALORES DEL SELECT DE LA COORDINACION
function wsLLenarCoordSelect() {
    var coordsPermiso = [];
    if (resultadoVerifJSON.CoordMedica) {
        coordsPermiso.push('CM');
    }
    if (resultadoVerifJSON.CoordPsicologica) {
        coordsPermiso.push('CP');
    }
    if (resultadoVerifJSON.Coord12Pasos) {
        coordsPermiso.push('CC');
    }
    var wsCoordSelect = "<option value='-1'>- Eliga Coordinación -</option>";
    $(CoordParticipantesARR).each(function (key, value) {
        if (coordsPermiso.includes(value.Sigla)) {
            var cadAl = cadAleatoria(8);
            coordSelectValsJSON[cadAl] = value.Sigla;
            wsCoordSelect += '<option value="' + cadAl + '">' + value.Nombre + '</option>';
        }
    });
    $('#wsCoordSelect').html(wsCoordSelect);
    $('#wsTestSelect').html('<option>- Eliga Tipo Test -</option>');
    wsCoordSelectGLOBAL = '';
    wsTipoTestSelectGLOBAL = '';
}

// FUNCION QUE INICIALIZA LOS PARAMETROS DEL MODAL PARA CONFIGURAR EL NUEVO TEST WIZARD SIURA
function wsModalTestParams() {
    $('#wsModalNuevoTestPrincParamsSecc').bootstrapToggle('off');
    $('.toggle-off').css({
        'left': '39%'
    });
    wsTipoReactivosJSON = {};
    var tiposReactivos = '<option value="-1">- Eliga Tipo de Reactivo -</option>';
    for (i = 0; i < wsTiposReactivosARR.length; i++) {
        var id = cadAleatoria(6), reactivo = wsTiposReactivosARR[i].split("Ø×Ø");
        tiposReactivos += '<option value="' + id + '">' + reactivo[0] + '</option>';
        wsTipoReactivosJSON[id] = reactivo[1];
    }
    $('#wsModalNuevoTestConfigTipoPreg').html(tiposReactivos);
    $('#wsModalVistaPreviaTestCompleto').on('hidden.bs.modal', function (e) {
        $('#wsModalVistaPreviaTestCompletoDiv').html('');
    });
    $('#wsModalVistaPreviaTestCompletoHeader').css("margin-bottom", "");
}

// FUNCION QUE REESTABLECE LOS PARAMETROS Y VARIABLES DEL SISTEMA WIZARD SIURA
function wsReestVariables() {
    coordSelectValsJSON = {};
}

// FUNCION QUE EJECUTA EL LLENADO DE LOS MENU COLLAPSE CON SUS RESPECTIVOS REACTIVOS SI HAY SECCIONES EN WIZARD SIURA
function llenarReactivosListado(id) {
    var reactivo = '', idDiv = '', idHTML = '', seccionVacia = false, seccionC = 0;
    $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
        if (value.IdHTML === id) {
            reactivo = '<div name="' + value.IdHTML + '" class="table table-responsive wsreactivoelem" style="margin-bottom: 0rem"><table name="' + value.IdHTML + '" class="table table-bordered table-sm"><thead><tr class="table-active"><th id="reactivonpreg_' + value.IdHTML + '" style="width: 60px; text-align: center;">#' + value.NPregunta.toString() + '</th><th style="cursor: grab;"><i id="reactivotexto_' + value.IdHTML + '">' + truncarCadena(value.Parametros.TituloPregunta, 35) + '</i></th><th style="text-align: center; width: 120px;"><button class="btn badge badge-pill badge-primary wsvpreviareactivo" title="Vista Previa"><i class="fa fa-search"></i></button>&nbsp;<button class="btn badge badge-pill badge-warning wseditarreactivo" title="Editar Reactivo"><i class="fa fa-pen"></i></button>&nbsp;<button class="btn badge badge-pill badge-danger wsborrarreactivo" title="Borrar Reactivo"><i class="fa fa-trash"></i></button></th></tr></thead></table></div>';
            idDiv = (value.Parametros.IdSeccionHTML !== 'NS') ? '#secciondiv_' + value.Parametros.IdSeccionHTML : '#wsModalNuevoTestConfigPregLista';
            idHTML = value.Parametros.IdSeccionHTML;
        }
    });
    if (idHTML !== 'NS') {
        $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
            if (value.Parametros.IdSeccionHTML === idHTML) {
                seccionC++;
            }
        });
        seccionVacia = (seccionC > 1) ? false : true;
    }
    if ((wsNuevoTestEstructuraJSON.TestEstructura.length === 1 && idHTML === 'NS') || (seccionVacia)) {
        $(idDiv).html('');
        $(idDiv).sortable({
            stop: function (e, ui) {
                wsReactivosNPregunta();
            }
        });
        $(idDiv).disableSelection();
    }
    $(idDiv).append(reactivo);
    wsReactivosNPregunta();
    $('div[name="' + id + '"]').css("margin-bottom", "0rem");
    $('table[name="' + id + '"]').css("margin-bottom", "0rem");
}

// -------------------------- [ MANEJO DEL DRAG AND DROP ] --------------------------
// FUNCION QUE SE EJECUTA UNA VEZ FINALIZADO EL DRAG AND DROP DEL ELEMENTO REACTIVO EN WIZARD SIURA
function wsDragDropReactivo(e, ui) {
    // ->
}

// FUNCION QUE REASIGNA EL NUMERO DE PREGUNTA DE LOS REACTIVOS EN LA ESTRUCTURA DEL JSON MAESTRO DE WIZARD SIURA
function wsReactivosNPregunta() {
    var c = 1, s = 1;
    if (wsNuevoTestEstructuraJSON.EnSecciones) {
        $('.wsseccionelem').each(function () {
            var id = $(this).attr("id");
            $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
                if (value.IdHTML === id) {
                    wsNuevoTestEstructuraJSON.SeccionesParam[key].NSeccion = s;
                }
            });
            s++;
        });
    }
    $('.wsreactivoelem').each(function () {
        var id = $(this).attr("name");
        $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
            if (value.IdHTML === id) {
                wsNuevoTestEstructuraJSON.TestEstructura[key].NPregunta = c;
                $('#reactivonpreg_' + id).html('#' + c.toString());
            }
        });
        c++;
    });
}
// -------------------------- [ MANEJO DEL DRAG AND DROP ] --------------------------

// ----------------------------------- [ MANEJO DE REACTIVOS ] -----------------------------------
// FUNCION QUE CONSTRUYE EL TIPO DE REACTIVO SELECCIONADO EN WIZARD SIURA
function wsGenerarTipoReactivo() {
    $('#wsNuevoReactivoDiv').html(wsReactivosJSON[wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]]);
    if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAL") {
        $('#wsPuntuarPAL').bootstrapToggle('on');
        $('#wsPuntuosPAL').val('0');
        if (wsNuevoTestEstructuraJSON.TipoRespuesta !== 'RE') {
            $('#wsPuntuarDivPAL').remove();
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAC") {
        $('#wsPuntuarPAC').bootstrapToggle('on');
        $('#wsPuntuosPAC').val('0');
        if (wsNuevoTestEstructuraJSON.TipoRespuesta !== 'RE') {
            $('#wsPuntuarDivPAC').remove();
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "BI") {
        $('#wsPuntuarBI').bootstrapToggle('on');
        $('#wsPuntuosPRBI').val('0');
        $('#wsPuntuosSRBI').val('0');
        if (wsNuevoTestEstructuraJSON.TipoRespuesta !== 'RE') {
            $('#wsPuntuarDivBI').remove();
            $('.puntoscols').remove();
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "OM") {
        $('#wsPuntuarOM').bootstrapToggle('on');
        if (wsNuevoTestEstructuraJSON.TipoRespuesta !== 'RE') {
            $('#wsPuntuarDivOM').remove();
            $('.wspuntostablaelem').remove();
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "MS") {
        $('#wsPuntuarMS').bootstrapToggle('on');
        if (wsNuevoTestEstructuraJSON.TipoRespuesta !== 'RE') {
            $('#wsPuntuarDivMS').remove();
            $('.wspuntostablaelem').remove();
        }
    }
}

// FUNCION QUE EMPAQUETA EL NUEVO REACTIVO Y GENERA LAS LABORES DINAMICAS EN HTML EN WIZARD SIURA
function wsNuevoReactivoPack() {
    var idReactivo = (wsNuevoReactivoBOOL) ? cadAleatoria(10) : wsIdEditarReactivoGLOBAL, puntos = 0, puntosJson = {}, respuestasArr = [];
    var reactivo = {
        IdHTML: idReactivo,
        TipoReactivo: wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()],
        NPregunta: wsNuevoTestEstructuraJSON.TestEstructura.length + 1,
        Parametros: {},
    };
    if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAL") {
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            if ($('#wsPuntuarPAL').is(":checked")) {
                puntos = parseFloat($('#wsPuntuosPAL').val());
            }
        }
        reactivo.Parametros = {
            IdSeccionHTML: (wsNuevoTestEstructuraJSON.EnSecciones) ? $('#wsModalNuevoTestConfigSeccion').val() : 'NS',
            TituloPregunta: $('#wsPreguntaPAL').val(),
            MarcaAgua: ($('#wsMarcaAguaPAL').val() === "") ? " " : $('#wsMarcaAguaPAL').val(),
            Puntos: puntos,
            Puntuar: (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") ? $('#wsPuntuarPAL').is(":checked") : false,
        };
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAC") {
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            if ($('#wsPuntuarPAC').is(":checked")) {
                puntos = parseFloat($('#wsPuntuosPAC').val());
            }
        }
        reactivo.Parametros = {
            IdSeccionHTML: (wsNuevoTestEstructuraJSON.EnSecciones) ? $('#wsModalNuevoTestConfigSeccion').val() : 'NS',
            TituloPregunta: $('#wsPreguntaPAC').val(),
            MarcaAgua: ($('#wsMarcaAguaPAC').val() === "") ? " " : $('#wsMarcaAguaPAC').val(),
            Puntos: puntos,
            Puntuar: (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") ? $('#wsPuntuarPAC').is(":checked") : false,
        };
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "BI") {
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('.wspuntosinput').each(function () {
                puntosJson[$(this).attr("id")] = ($('#wsPuntuarBI').is(":checked")) ? parseFloat($(this).val()) : 0;
            });
        }
        reactivo.Parametros = {
            IdSeccionHTML: (wsNuevoTestEstructuraJSON.EnSecciones) ? $('#wsModalNuevoTestConfigSeccion').val() : 'NS',
            TituloPregunta: $('#wsPreguntaBI').val(),
            PPTexto: $('#wsPrimerRespBI').val(),
            PPPuntos: (puntosJson["wsPuntuosPRBI"] !== undefined) ? puntosJson["wsPuntuosPRBI"] : 0,
            PPName: "radio_" + idReactivo,
            SPTexto: $('#wsSegundaRespBI').val(),
            SPPuntos: (puntosJson["wsPuntuosSRBI"] !== undefined) ? puntosJson["wsPuntuosSRBI"] : 0,
            SPName: "radio_" + idReactivo,
            Puntuar: (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") ? $('#wsPuntuarBI').is(":checked") : false,
        };
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "OM" || wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "MS") {
        $('#wsTablaRespuestas tr').each(function () {
            respuestasArr.push({
                IdHTML: $(this).attr("id"),
                TextoRespuesta: $('#textopreg_' + $(this).attr("id")).text(),
                Puntos: (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE" && $('#wsPuntuar' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).is(":checked")) ? parseFloat($('#puntos_' + $(this).attr("id")).val()) : 0,
            });
        });
        reactivo.Parametros = {
            IdSeccionHTML: (wsNuevoTestEstructuraJSON.EnSecciones) ? $('#wsModalNuevoTestConfigSeccion').val() : 'NS',
            TituloPregunta: $('#wsPregunta' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val(),
            RespuestasLista: respuestasArr,
            Puntuar: (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") ? $('#wsPuntuar' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).is(":checked") : false,
        };
    }
    if (wsNuevoReactivoBOOL) {
        wsNuevoTestEstructuraJSON.TestEstructura.push(reactivo);
        llenarReactivosListado(idReactivo);
    } else {
        $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
            if (value.IdHTML === wsIdEditarReactivoGLOBAL) {
                wsNuevoTestEstructuraJSON.TestEstructura[key] = reactivo;
                $('#reactivotexto_' + wsIdEditarReactivoGLOBAL).html($('#wsPregunta' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val());
            }
        });
    }
    $('#wsModalNuevoTestConfigTipoPreg').removeAttr("disabled");
    $('#wsModalNuevoTestConfigPregAdd').removeAttr("disabled");
    $('#wsModalNuevoTestConfigSeccion').removeAttr("disabled");
    $('#wsModalNuevoTestConfigSeccionAdd').removeAttr("disabled");
    $('#wsModalNuevoTestConfigReactivoDiv').html('');
    if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
        wsNuevoTestEstructuraJSON.Respuesta = {
            Configurado: false,
            Estructura: wsRespuestasEstructurasJSON.RE,
        };
    }
}

// FUNCION QUE CARGA EL REACTIVO PARA EDITARLO EN WIZARD SIURA
function wsCargarReactivoEditar(id) {
    wsIdEditarReactivoGLOBAL = id;
    wsNuevoReactivoBOOL = false;
    var reactivo = {}, selecReactivo = '', tipoReactivo = '';
    $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
        if (value.IdHTML === id) {
            reactivo = value;
        }
    });
    $('#wsModalNuevoTestConfigTipoPreg option').each(function () {
        if (wsTipoReactivosJSON[$(this).val()] === reactivo.TipoReactivo) {
            selecReactivo = $(this).val();
            tipoReactivo = reactivo.TipoReactivo;
        }
    });
    if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
        $('#wsModalNuevoTestConfigSeccion').val(reactivo.Parametros.IdSeccionHTML);
    }
    $('#wsModalNuevoTestConfigTipoPreg').val(selecReactivo);
    $('#wsModalNuevoTestConfigTipoPreg').attr("disabled", true);
    $('#wsModalNuevoTestConfigPregAdd').attr("disabled", true);
    $('#wsModalNuevoTestConfigSeccion').attr("disabled", true);
    $('#wsModalNuevoTestConfigSeccionAdd').attr("disabled", true);
    $('#wsModalNuevoTestConfigReactivoDiv').html(wsDivNuevoReactivo);
    $('#wsAddNuevoReactivoAgregar').html('<i class="fa fa-save"></i>&nbsp;Guardar Reactivo');
    wsGenerarTipoReactivo();
    if (tipoReactivo === "PAL") {
        $('#wsPreguntaPAL').val(reactivo.Parametros.TituloPregunta);
        $('#wsMarcaAguaPAL').val(reactivo.Parametros.MarcaAgua);
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('#wsPuntuarPAL').bootstrapToggle((reactivo.Parametros.Puntuar) ? 'on' : 'off', true);
            $('#wsPuntuosPAL').val(reactivo.Parametros.Puntos);
        }
    } else if (tipoReactivo === "PAC") {
        $('#wsPreguntaPAC').val(reactivo.Parametros.TituloPregunta);
        $('#wsMarcaAguaPAC').val(reactivo.Parametros.MarcaAgua);
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('#wsPuntuarPAC').bootstrapToggle((reactivo.Parametros.Puntuar) ? 'on' : 'off', true);
            $('#wsPuntuosPAC').val(reactivo.Parametros.Puntos);
        }
    } else if (tipoReactivo === "BI") {
        $('#wsPreguntaBI').val(reactivo.Parametros.TituloPregunta);
        $('#wsPrimerRespBI').val(reactivo.Parametros.PPTexto);
        $('#wsSegundaRespBI').val(reactivo.Parametros.SPTexto);
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('#wsPuntuarBI').bootstrapToggle((reactivo.Parametros.Puntuar) ? 'on' : 'off', true);
            $('#wsPuntuosPRBI').val(reactivo.Parametros.PPPuntos);
            $('#wsPuntuosSRBI').val(reactivo.Parametros.SPPuntos);
        }
    } else if (tipoReactivo === "OM" || tipoReactivo === "MS") {
        $('#wsPregunta' + tipoReactivo).val(reactivo.Parametros.TituloPregunta);
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            $('#wsPuntuar' + tipoReactivo).bootstrapToggle((reactivo.Parametros.Puntuar) ? 'on' : 'off', true);
        }
        $(reactivo.Parametros.RespuestasLista).each(function (key, value) {
            var tdPuntos = '';
            if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
                tdPuntos = '<td style="text-align: center;"><div style="display: inline-block;"><button class="btn badge badge-pill badge-secondary wspuntosmultictrl" accion="r"><i class="fa fa-chevron-left"></i></button>&nbsp;<input id="puntos_' + value.IdHTML + '" type="text" class="form-control form-control-sm wspuntosinput" style="width: 100px; display: inline-block; text-align: center;" disabled="disabled" value="' + value.Puntos.toString() + '" />&nbsp;<button class="btn badge badge-pill badge-secondary wspuntosmultictrl" accion="s"><i class="fa fa-chevron-right"></i></button></div></td>';
            }
            $('#wsTablaRespuestas').append('<tr id="' + value.IdHTML + '"><td><b id="textopreg_' + value.IdHTML + '">' + value.TextoRespuesta + '</b></td>' + tdPuntos + '<td style="text-align: center;"><button class="btn badge badge-pill badge-danger wsborrarrespmultireactivo" elem="' + value.IdHTML + '" title="Borrar Respuesta"><i class="fa fa-trash"></i></button></td></tr>');
        });
    }
}

// --------------------- [ VALIDADORES DE WIZARD SIURA ] ---------------------
// FUNCION QUE VALIDA EL CARGADO DE LOS PARAMETROS DEL PANEL DE CONTROL
function wsValidarFormPanel() {
    var correcto = true, msg = '';
    if (wsCoordSelectGLOBAL === '') {
        correcto = false;
        msg = 'Eliga una <b>Coordinación</b>';
    } else if (wsTipoTestSelectGLOBAL === '') {
        correcto = false;
        msg = 'Eliga una <b>Sección y tipo de Test</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención", msg, 2800, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA SI SE PUEDE AGREGAR O NO UN NUEVO TEST
function wsValidarNuevoTest() {
    var correcto = true, msg = '';
    if (wsCoordSelectGLOBAL === '') {
        correcto = false;
        msg = 'Eliga una <b>Coordinación</b>';
    } else if (wsTipoTestSelectGLOBAL === '') {
        correcto = false;
        msg = 'Eliga una <b>Sección y tipo de Test</b>';
    } else if (!wsParamsCargadosBOOL) {
        correcto = false;
        msg = 'Presione el botón <b>Cargar Configuración</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención", msg, 2800, "default");
    }
    return (wsActivarUsoWizard) ? correcto : false;
}

// FUNCION QUE VALIDA EL FORMULARIO DE PARAMETROS INCIALES DEL NUEVO TEST DE WIZRD SIURA
function validarFormNuevoTestPI() {
    var correcto = true, msg = '';
    if ($('#wsModalNuevoTestPrincParamsNombre').val() === "") {
        correcto = false;
        msg = 'Coloque el <b>Nombre</b> del nuevo Test';
        $('#wsModalNuevoTestPrincParamsNombre').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LOS  PARAMETROS  PARA AÑADIR UN NUEVO REACTIVO AL TEST EN WIZARD SIURA
function wsValidarNuevoReactivo() {
    var correcto = true, msg = '';
    if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === undefined) {
        correcto = false;
        msg = 'Elige un <b>Tipo de Reactivo</b>';
    } else if ((wsTestSeccionesBOOL) && (wsSeccionListaJSON[$("#wsModalNuevoTestConfigSeccion").val()] === undefined)) {
        correcto = false;
        msg = 'Elige una <b>sección</b>, o añade una <b>Nueva Sección</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL AÑADIR UNA NUEVA SECCIÓN EN WIZARD SIURA
function wsValidarNuevaSeccion() {
    var correcto = true, msg = '', secc = 0;
    $(wsNuevoTestEstructuraJSON.SeccionesParam).each(function (key, value) {
        if (value.Titulo === $('#wsModalNuevoTestAddSeccionNombre').val().toUpperCase()) {
            secc++;
        }
    });
    if ($('#wsModalNuevoTestAddSeccionNombre').val() === "") {
        correcto = false;
        msg = 'Escriba el nombre de la <b>Nueva Sección</b>';
        $('#wsModalNuevoTestAddSeccionNombre').focus();
    } else if (secc > 0) {
        correcto = false;
        msg = 'Ya existe una <b>Sección</b> con ese <b>Nombre</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL FORMULARIO DE AGREGADO A LA LISTA PARA CREAR REACTIVO DE RESPUESTA MULTIPLE
function wsValidarReactivoMultResp() {
    var correcto = true, msg = '';
    if ($('#wsTextoResp' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).val() === "") {
        correcto = false;
        msg = 'Escriba el texto de la <b>Nueva Respuesta</b>';
        $('#wsTextoResp' + wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()]).focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2800, 'default');
    }
    return correcto;
}

// FUNCION QUE VALIDA LA ESTRUCTURA DEL NUEVO REACTIVO EN WIZARD SIURA
function wsValidarReactivoParams() {
    var correcto = true, msg = '';
    if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAL") {
        if ($('#wsPreguntaPAL').val() === "") {
            correcto = false;
            msg = 'Escriba el <b>Título / Pregunta</b>';
            $('#wsPreguntaPAL').focus();
        } else {
            wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaPAL"><b># - ' + $('#wsPreguntaPAL').val() + '</b></label><textarea id="wsVistaPreviaPAL" class="form-control form-control-sm" placeholder="' + $('#wsMarcaAguaPAL').val() + '"></textarea></div>';
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "PAC") {
        if ($('#wsPreguntaPAC').val() === "") {
            correcto = false;
            msg = 'Escriba el <b>Título / Pregunta</b>';
            $('#wsPreguntaPAC').focus();
        } else {
            wsVistaPreviaHTML = '<div class="form-group"><label for="wsVistaPreviaPAC"><b># - ' + $('#wsPreguntaPAC').val() + '</b></label><input type="text" id="wsVistaPreviaPAC" class="form-control form-control-sm" placeholder="' + $('#wsMarcaAguaPAC').val() + '" /></div>';
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "BI") {
        if ($('#wsPreguntaBI').val() === "") {
            correcto = false;
            msg = 'Escriba el <b>Título / Pregunta</b>';
            $('#wsPreguntaBI').focus();
        } else if ($('#wsPrimerRespBI').val() === "") {
            correcto = false;
            msg = 'Escriba texto <b>Respuesta Negativa</b>';
            $('#wsPrimerRespBI').focus();
        } else if ($('#wsSegundaRespBI').val() === "") {
            correcto = false;
            msg = 'Escriba texto <b>Segunda Respuesta</b>';
            $('#wsSegundaRespBI').focus();
        } else {
            wsVistaPreviaHTML = '<div class="form-group"><label for="formControlRange"><b># - ' + $('#wsPreguntaBI').val() + '</b></label><div class="form-check"><input id="wsPRBI" type="radio" name="wsradiobi" class="magic-radio" checked /><label for="wsPRBI">' + $('#wsPrimerRespBI').val() + '</label></div><div class="form-check"><input id="wsSRBI" type="radio" name="wsradiobi" class="magic-radio" /><label for="wsSRBI">' + $('#wsSegundaRespBI').val() + '</label></div></div>';
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "OM") {
        if ($('#wsPreguntaOM').val() === "") {
            correcto = false;
            msg = 'Escriba el <b>Título / Pregunta</b>';
            $('#wsPreguntaOM').focus();
        } else if ($('#wsTablaRespuestas').prop('innerHTML') === "") {
            correcto = false;
            msg = 'No tiene agregada ninguna <b>Respuesta</b>';
        } else {
            var options = '';
            $('#wsTablaRespuestas tr').each(function () {
                options += '<option>' + $('#textopreg_' + $(this).attr("id")).text() + '</option>';
            });
            wsVistaPreviaHTML = '<div class="form-group"><label for="wsMultiResp"><b># - ' + $('#wsPreguntaOM').val() + '</b></label><select id="wsMultiResp" class="form-control form-control-sm">' + options + '</select></div>';
        }
    } else if (wsTipoReactivosJSON[$('#wsModalNuevoTestConfigTipoPreg').val()] === "MS") {
        if ($('#wsPreguntaMS').val() === "") {
            correcto = false;
            msg = 'Escriba el <b>Título / Pregunta</b>';
            $('#wsPreguntaMS').focus();
        } else if ($('#wsTablaRespuestas').prop('innerHTML') === "") {
            correcto = false;
            msg = 'No tiene agregada ninguna <b>Respuesta</b>';
        } else {
            var options = '';
            $('#wsTablaRespuestas tr').each(function () {
                options += '<option>' + $('#textopreg_' + $(this).attr("id")).text() + '</option>';
            });
            wsVistaPreviaHTML = '<div class="form-group"><label for="wsMultiResp"><b># - ' + $('#wsPreguntaMS').val() + '</b></label><br /><select id="wsMultiResp" class="chosen-select" multiple data-placeholder="Lista de opciones">' + options + '</select></div>';
        }
    }
    if (!correcto) {
        MsgAlerta('Atención!', msg, 2500, 'default');
    }
    return correcto;
}

// FUNCION QUE VALIDA LA EJECUCION DE LA VISTA PREVIA DEL TEST EN WIZARD SIURA
function wsValidarTestCompleto() {
    var correcto = true, msg = '';
    if (wsNuevoTestEstructuraJSON.TestEstructura.length === 0) {
        correcto = false;
        msg = 'No tiene <b>Reactivos</b> añadidos al Test';
    } else if (!wsNuevoTestEstructuraJSON.Respuesta.Configurado) {
        correcto = false;
        msg = 'No ha configurado la <b>Respuesta</b> del Test';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3200, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LA CONFIGURACION DE LA RESPUESTA EN WIZARD SIURA
function wsValidarRespuestaConfig() {
    var correcto = true, msg = '';
    if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RA") {
        if ($('#wsTituloRespuestaRA').val() === "") {
            correcto = false;
            msg = 'Escribe el <b>Título Descriptivo</b> de la Respuesta';
            $('#wsTituloRespuestaRA').focus();
        }
    } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
        if ($('#wsTituloRespuestaRE').val() === "") {
            correcto = false;
            msg = 'Escribe el <b>Título Descriptivo</b> de la Respuesta';
            $('#wsTituloRespuestaRE').focus();
        } else if ($('#wsTablaRespuestasRE').prop("innerHTML") === "") {
            correcto = false;
            msg = 'No tiene <b>Ninguna Respuesta</b> en la Lista';
        }
        $('.wstextrespre').each(function () {
            if ($(this).val() === "") {
                correcto = false;
                msg = 'Agrege <b>Texto a la Respuesta</b>';
                $(this).focus();
                return false;
            }
        });
    } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "LF") {
        if ($('#wsTituloRespuestaLF').val() === "") {
            correcto = false;
            msg = 'Escribe el <b>Título Descriptivo</b> de la Respuesta';
            $('#wsTituloRespuestaLF').focus();
        } else if ($('#wsTablaRespuestasLF').prop("innerHTML") === "") {
            correcto = false;
            msg = 'No tiene <b>Ninguna Respuesta</b> en la Lista';
            $('#wsTextoRespuestaLF').focus();
        }
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2900, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL AGREGADO DE RESPUESTAS EN LA LISTA FIJA EN WIZARD SIURA
function wsValidarNuevaRespuestaLF() {
    var correcto = true, msg = '';
    if ($('#wsTextoRespuestaLF').val() === "") {
        correcto = false;
        msg = 'Escriba el <b>Texto</b> de la <b>Nueva Respuesta</b>';
        $('#wsTextoRespuestaLF').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2900, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LA CONFIGURACION DE LA RESPUESTA (PARA LA RESPUESTA TIPO ESCALAS) EN WIZARD SIURA
function wsValidarPreguntaPE(tipo) {
    var correcto = true, msg = '';
    if (tipo === "RE") {
        if (wsObtenerReactivosPuntaje() === 0) {
            correcto = false;
            msg = 'No puede configurar esta respuesta debido a que' + ((wsNuevoTestEstructuraJSON.TestEstructura.length === 0) ? ' <b>No</b> ha colocado <b>Ningún Reactivo</b> al Test.\n\nLe recordamos que para este tipo de Test, requiere que sus respuestas generen <b>puntaje</b>.' : ' los reactivos colocados en el test <b>NO</b> generan <b>puntaje</b> alguno.') + '\n\n<b>Nota: </b>Le recomendamos ampliamente que configure esta respuesta <b>AL FINAL</b>, ya que haya colocado todos los reactivos. Cada reactivo <b>nuevo</b> colocado, <b>reiniciará</b> la respuesta configurada.';
        }
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 15000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA LA CREACION DE LAS RESPUESTAS EN ESCALA DE WIZARD SIURA
function wsValidarCrearRespuestasRE() {
    var correcto = true, msg = '';
    if (isNaN(parseFloat($('#wsRespuestasRE').val()))) {
        correcto = false;
        msg = 'Hay un problema en la <b>Canti. Respuestas</b>';
    } else if (parseFloat($('#wsRespuestasRE').val()) < 2) {
        correcto = false;
        msg = 'La <b>Canti. Respuestas</b> es incorrecta. Debe ser igual o superior a <b>2</b>';
    } else if ((wsMaxPuntajeRE / (parseFloat($('#wsRespuestasRE').val()) * 2)) < 1) {
        correcto = false;
        msg = 'No puede crear esa <b>Cantidad de Respuestas</b> en relación al <b>puntaje</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA TODA  LA ESTRUCTURA DEL TEST EN WIZARD SIURA
function wsValidarTestEstructura() {
    var correcto = true, msg = '';
    if (wsNuevoTestEstructuraJSON.EnSecciones && wsNuevoTestEstructuraJSON.SeccionesParam.length === 0) {
        correcto = false;
        msg = 'No tiene <b>Reactivos</b> colocados en la lista';
    } else if (wsNuevoTestEstructuraJSON.TestEstructura.length === 0) {
        correcto = false;
        msg = 'No tiene <b>Reactivos</b> colocados en la lista';
    } else if (!wsNuevoTestEstructuraJSON.Respuesta.Configurado) {
        correcto = false;
        msg = 'No ha configurado la <b>Respuesta del Test</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}
// ---------------------------------  [ FIN DE VALIDACIONES ] ---------------------------------

// FUNCION QUE OBTIENE EL PUNTAJE DE LOS REACTIVOS (ESCENCIALMENTE PARA USARSE EN TIPO DE RESPUESTA EN ESCALAS) EN WIZARD SIURA
function wsObtenerReactivosPuntaje() {
    var puntaje = 0, puntosArr = [];
    $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
        if (value.TipoReactivo === "PAL" || value.TipoReactivo === "PAC") {
            puntaje += value.Parametros.Puntos;
        } else if (value.TipoReactivo === "BI") {
            puntosArr = [value.Parametros.PPPuntos, value.Parametros.SPPuntos];
            //var maxNum = Math.max(...puntosArr);
            puntaje += Math.max(...puntosArr)/*maxNum*/;
        } else if (value.TipoReactivo === "OM") {
            puntosArr = [];
            $(value.Parametros.RespuestasLista).each(function (k1, v1) {
                puntosArr.push(v1.Puntos);
            });
            //var maxNum = Math.max(...puntosArr);
            puntaje += Math.max(...puntosArr)/*maxNum*/;
        } else if (value.TipoReactivo === "MS") {
            $(value.Parametros.RespuestasLista).each(function (k1, v1) {
                puntaje += v1.Puntos;
            });
        }
    });
    wsMaxPuntajeRE = puntaje;
    return puntaje;
}

// ----------------------- [ VISTA PEVIA / VISTA REAL PARA PACIENTE ] -----------------------
// FUNCION QUE CREA LA ESTRUCTURA DEL TEST PARA MOSTRAR A VISTA PREVIA O AL PACIENTE EN WIZARD SIURA
function wsConstruirTest() {
    console.log(wsNuevoTestEstructuraJSON);
    if (wsValidarTestCompleto()) {
        if (wsNuevoTestEstructuraJSON.EnSecciones) {
            OrdenarJSON(wsNuevoTestEstructuraJSON.SeccionesParam, 'NSeccion', 'asc');
            $(JsonORDENADO).each(function (key, value) {
                $('#wsModalVistaPreviaTestCompletoDiv').append(wsSeccionVPHTML.replace("Ø×TITULO×Ø", value.Titulo).replace("Ø×IDHTML×Ø", value.IdHTML));
            });
        }
        OrdenarJSON(wsNuevoTestEstructuraJSON.TestEstructura, 'NPregunta', 'asc');
        $(JsonORDENADO).each(function (key, value) {
            var id = cadAleatoria(12);
            $((value.Parametros.IdSeccionHTML !== "NS") ? "#wsvpseccdiv_" + value.Parametros.IdSeccionHTML : "#wsModalVistaPreviaTestCompletoDiv").append('<div id="' + id + '" class="col-sm-6"></div>');
            wsVistaPreviaCrearReactivos(id, value.IdHTML, value.Parametros, value.TipoReactivo, value.NPregunta);
        });
        var respuesta = '';
        if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RA") {
            respuesta = '<div class="col-sm-12"><div class="card border-info"><div class="card-body text-secondary"><div class="form-group"></div><label for="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML + '"><b>' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta + '</b></label><textarea class="form-control form-control-sm" id="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML + '" placeholder="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.MarcaAgua + '"></textarea></div><div></div>';
        } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "RE") {
            respuesta = '<div class="col-sm-12"><div class="card border-info"><div class="card-body text-secondary"><div class="row"><div class="col-sm-3"></div><div class="col-sm-6"><button id="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML + '" class="btn btn-block btn-sm btn-success wscalificartestre"><i class="fa fa-check-circle"></i>&nbsp;Calificar Puntaje del Test</button></div><div class="col-sm-3"></div></div></div><div></div>';
        } else if (wsNuevoTestEstructuraJSON.TipoRespuesta === "LF") {
            var options = '';
            $(wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas).each(function (key, value) {
                options += '<option>' + value.TextoRespuesta + '</option>';
            });
            respuesta = '<div class="col-sm-12"><div class="card border-info"><div class="card-body text-secondary"><div class="form-group"></div><label for="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML + '"><b>' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta + '</b></label><select class="form-control form-control-sm" id="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.IdHTML + '" placeholder="' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.MarcaAgua + '">' + options + '</select></div></div><div></div>';
        }
        $('#wsModalVistaPreviaTestCompletoDiv').append(respuesta);
        $('#wsModalVistaPreviaTestCompletoNombre').html(wsNuevoTestEstructuraJSON.Nombre);
        $('#wsModalVistaPreviaTestCompletoExamen').html(wsNuevoTestEstructuraJSON.TipoExamen);
        $('#wsModalVistaPreviaTestCompleto').modal('show');
    }
}

// FUNCION QUE CREA LA  ESTRUCTURA DE LA VISTA PREVIA DE TODO EL TEST EN WIZARD SIURA
function wsVistaPreviaCrearReactivos(idDiv, idHTML, parametros, tipoReactivo, npregunta) {
    var respMultiples = '', reactivoHTML = '', idChosen = '';
    if (parametros.RespuestasLista !== undefined) {
        $(parametros.RespuestasLista).each(function (key, value) {
            respMultiples += '<option value="' + value.IdHTML + '">' + value.TextoRespuesta + '</option>';
        });
    }
    if (tipoReactivo === "PAL") {
        reactivoHTML = '<div class="form-group"><label for="' + idHTML + '"><b>' + npregunta + ' - ' + parametros.TituloPregunta + '</b></label><textarea id="' + idHTML + '" class="form-control form-control-sm" placeholder="' + parametros.MarcaAgua + '"></textarea></div>';
    } else if (tipoReactivo === "PAC") {
        reactivoHTML = '<div class="form-group"><label for="' + idHTML + '"><b>' + npregunta + ' - ' + parametros.TituloPregunta + '</b></label><input type="text" id="' + idHTML + '" class="form-control form-control-sm" placeholder="' + parametros.MarcaAgua + '" /></div>';
    } else if (tipoReactivo === "BI") {
        reactivoHTML = '<div class="form-group"><label for="' + idHTML + '"><b>' + npregunta + ' - ' + parametros.TituloPregunta + '</b></label><div class="form-check"><input id="pp_' + idHTML + '" type="radio" name="' + parametros.PPName + '" class="magic-radio" checked /><label for="pp_' + idHTML + '">' + parametros.PPTexto + '</label></div><div class="form-check"><input id="sp_' + idHTML + '" type="radio" name="' + parametros.PPName + '" class="magic-radio" /><label for="sp_' + idHTML + '">' + parametros.SPTexto + '</label></div></div>';
    } else if (tipoReactivo === "OM") {
        reactivoHTML = '<div class="form-group"><label for="' + idHTML + '"><b>' + npregunta + ' - ' + parametros.TituloPregunta + '</b></label><select id="' + idHTML + '" class="form-control form-control-sm">' + respMultiples + '</select></div>';
    } else if (tipoReactivo === "MS") {
        reactivoHTML = '<div class="form-group"><label for="' + idHTML + '"><b>' + npregunta + ' - ' + parametros.TituloPregunta + '</b></label><select id="' + idHTML + '" class="chosen-select" multiple data-placeholder="Lista de opciones">' + respMultiples + '</select></div>';
        idChosen = idHTML;
    }
    $('#' + idDiv).append(reactivoHTML);
    if (tipoReactivo === "MS") {
        $('#' + idChosen).chosen({ width: "98%" });
    }
}

// FUNCION QUE CALIFICA EL TEST EN FORMATO REACTIVOS EN ESCALA EN WIZARD SIURA
function wsCalificarTestRE() {
    MsgPregunta("Calificar Test", "¿Desea continuar?", function (si) {
        if (si) {
            var puntaje = 0, resultado = '';
            $('.wspuntosetiq').remove();
            $(wsNuevoTestEstructuraJSON.TestEstructura).each(function (key, value) {
                var reactivo = $('#' + value.IdHTML), reactivopuntos = 0;
                if (value.TipoReactivo === "PAL" || value.TipoReactivo === "PAC") {
                    if (reactivo.val().trim() !== "") {
                        reactivopuntos = value.Parametros.Puntos;
                    }
                } else if (value.TipoReactivo === "BI") {
                    if ($('#pp_' + value.IdHTML).is(":checked")) {
                        reactivopuntos = value.Parametros.PPPuntos;
                    } else if ($('#sp_' + value.IdHTML).is(":checked")) {
                        reactivopuntos = value.Parametros.SPPuntos;
                    }
                } else if (value.TipoReactivo === "OM") {
                    $(value.Parametros.RespuestasLista).each(function (k1, v1) {
                        if (v1.IdHTML === reactivo.val()) {
                            reactivopuntos = v1.Puntos;
                        }
                    });
                } else if (value.TipoReactivo === "MS") {
                    var vals = reactivo.val();
                    $(value.Parametros.RespuestasLista).each(function (k1, v1) {
                        if (vals.includes(v1.IdHTML)) {
                            reactivopuntos += v1.Puntos;
                        }
                    });
                }
                $('label[for="' + value.IdHTML + '"]').append((reactivopuntos > 0) ? '<span class="badge badge-primary wspuntosetiq" style="margin-left: 10px;">' + reactivopuntos + '</span>' : '<span class="badge badge-secondary wspuntosetiq" style="margin-left: 10px;">0</span>');
                puntaje += reactivopuntos;
            });
            if (puntaje === 0) {
                puntaje = 1;
            }
            var respuestasResultado = '<h5><b>' + wsNuevoTestEstructuraJSON.Respuesta.Estructura.TituloRespuesta + '</b></h5>';
            $(wsNuevoTestEstructuraJSON.Respuesta.Estructura.Respuestas).each(function (key, value) {
                if (puntaje >= value.MinPuntos && puntaje <= value.MaxPuntos) {
                    resultado = value.TextoRespuesta;
                    respuestasResultado += '<h6><b><span class="fa fa-arrow-alt-circle-right"></span>&nbsp;-&nbsp;<span class="badge badge-warning">' + value.TextoRespuesta + '<span></b></h6>';
                } else {
                    respuestasResultado += '<h6><b><span class="fa fa-arrow-alt-circle-right"></span>&nbsp;-&nbsp;' + value.TextoRespuesta + '</b></h6>';
                }
            });
            $('.wscalificartestre').parent().html(respuestasResultado);
        }
    });
}

// ---------------------- [ ELEMENTOS DOM ] ----------------------
// VARIABLES MULTIPLES DE ERROR Y OTROS  MENSAJES EN PANTALLA
var errorToken = '<div class="row" style="padding-top: 25px;"><div class="col-sm-12" style="padding-bottom: 5px;" align="center"><img src="../Media/wserrortoken.png" style="width: 150px;" /></div><div class="col-sm-2"></div><div class="col-sm-8"><div class="alert alert-warning" role="alert" align="center"><h5>Los parametros de acceso son inválidos o han caducado. Intente acceder al Sistema <b>Wizard SIURA</b> a través de la página principal.</h5></div></div><div class="col-sm-2"></div><div></div></div>';
var errorUrl = '<div class="row" style="padding-top: 25px;"><div class="col-sm-12" style="padding-bottom: 5px;" align="center"><img src="../Media/wserrorweb.png" style="width: 150px;" /></div><div class="col-sm-2"></div><div class="col-sm-8"><div class="alert alert-warning" role="alert" align="center"><h5>La url con la que intenta acceder es incorrecta.</h5></div></div><div class="col-sm-2"></div><div></div></div>';
var errorRoto = '<div class="row" style="padding-top: 25px;"><div class="col-sm-12" style="padding-bottom: 5px;" align="center"><img src="../Media/wslinkroto.png" style="width: 150px;" /></div><div class="col-sm-2"></div><div class="col-sm-8"><div class="alert alert-warning" role="alert" align="center"><h5>La url con la que intenta acceder no es válida o está incompleta.</h5></div></div><div class="col-sm-2"></div><div></div></div>';
var errorFail = '<div class="row" style="padding-top: 25px;"><div class="col-sm-12" style="padding-bottom: 5px;" align="center"><img src="../Media/wsfailweb.png" style="width: 150px;" /></div><div class="col-sm-2"></div><div class="col-sm-8"><div class="alert alert-danger" role="alert" align="center"><h5>Ocurrió un problema al cargar el sistema Wizard de Siura.</h5></div></div><div class="col-sm-2"></div><div></div></div>';
var wsTdVacio = '<tr style="table-alert"><td colspan="4" style="text-align: center;"><h6><i class="fa fa-exclamation-circle"></i>&nbsp;No hay tests para mostrar en la lista</h6></td></tr>';
var wsPregListaVacio = '<div class="alert alert-secondary" role="alert" align="center"><h5><i class="fa fa-question-circle"></i>&nbsp;No tiene preguntas configuradas.</h5></div>';
var wsNoReactivos = '<div class="alert alert-warning" role="alert" align="center"><h6><i class="fa fa-info-circle"></i>&nbsp;No tiene reactivos en esta sección.</h6></div>';
var wsTestSeccionesDiv = '<div class="form-group"><label><b>Elige/Añadir sección:</b></label><div class="input-group input-group-sm"><select id="wsModalNuevoTestConfigSeccion" class="form-control form-control-sm"><option value="-1">- Elige una sección -</option></select><div class="input-group-append" id="button-addon4"><button id="wsModalNuevoTestConfigSeccionAdd" class="btn btn-outline-secondary" type="button" title="Nueva Sección"><i class="fa fa-plus"></i>&nbsp;Nueva</button></div></div></div>';
var wsSeccionAcord = '<div id="Ø×IDHTML×Ø" class="card wsseccionelem" style="margin-bottom: 5px;"><div class="card-header" id="titulo_Ø×IDHTML×Ø"><h6 class="mb-0"><button class="btn badge badge-primary seccionacordionbtn" data-toggle="collapse" data-target="#cuerpo_Ø×IDHTML×Ø" aria-expanded="true" aria-controls="cuerpo_Ø×IDHTML×Ø">Ø×NOMBRE×Ø</button><span class="float-right badge badge-pill badge-danger wsborrarseccion" title="Borrar Seccion"style="cursor: pointer; font-size: 10px;"><i class="fa fa-minus-circle"></i></span><span class="float-right">&nbsp;</span><span class="float-right badge badge-pill badge-warning wseditarseccion" title="Editar Seccion"style="cursor: pointer; font-size: 10px;"><i class="fa fa-pen"></i></span><span class="float-right">&nbsp;</span><span class="float-right badge badge-pill badge-secondary wsbajarseccion" title="Bajar Seccion 1 nivel"style="cursor: pointer; font-size: 10px;"><i class="fa fa-angle-down"></i></span><span class="float-right">&nbsp;</span><span class="float-right badge badge-pill badge-secondary wssubirseccion" title="Subir Seccion 1 nivel"style="cursor: pointer; font-size: 10px;"><i class="fa fa-angle-up"></i></span></h6></div><div id="cuerpo_Ø×IDHTML×Ø" class="collapse seccioncollapse" aria-labelledby="titulo_Ø×IDHTML×Ø" data-parent="#wsModalNuevoTestConfigPregAcordion"><div class="card-body"><div id="secciondiv_Ø×IDHTML×Ø" style="width: 100%;"></div></div></div></div>';
var wsDivNuevoReactivo = '<div class="card"><div class="card-body"><div class="row scrollestilo" style="padding-bottom: 5px; max-height: 60vh;"><div id="wsNuevoReactivoDiv" class="col-sm-12"></div></div><hr><div class="row"><div class="col-sm-2"><button id="wsAddNuevoReactivoVistaPrevia" class="btn badge badge-pill badge-primary"><i class="fa fa-search"></i>&nbsp;Vista Previa</button></div><div class="col-sm-10" align="right"><button id="wsAddNuevoReactivoAgregar" class="btn badge badge-pill badge-success"><i class="fa fa-plus"></i>&nbsp;Agregar Reactivo</button>&nbsp;&nbsp;&nbsp;<button id="wsAddNuevoReactivoCancelar" class="btn badge badge-pill badge-danger"><i class="fa fa-times"></i>&nbsp;Cancelar y Cerrar</button></div></div></div></div>';
// <- REACTIVOS HTML ->
var wsReactivosJSON = {
    PAL: '<div class="row"><div class="col-sm-6"><div class="form-group"><label for="wsMarcaAguaPAL"><b><i class="fa fa-pencil"></i>&nbsp;Título / Pregunta (*)</b></label><textarea id="wsPreguntaPAL" class="form-control form-control-sm" placeholder="Escriba Título o Pregunta"></textarea></div></div><div class="col-sm-6"><div class="form-group"><label for="wsMarcaAguaPAL"><b><i class="fa fa-pencil"></i>&nbsp;Marca de Agua (opcional)</b></label><textarea id="wsMarcaAguaPAL" class="form-control form-control-sm" placeholder="Escriba Marca de Agua"></textarea></div></div></div><div id="wsPuntuarDivPAL" class="row"><div class="col-sm-4"><input id="wsPuntuarPAL" name="wspuntuarcheckbox" type="checkbox" data-on="Si" data-off="No" data-toggle="toggle" data-size="xs" data-onstyle="outline-primary" data-offstyle="outline-secondary"><label for="wsPuntuarPAL" class="form-check-label"><b>&nbsp;Puntuar Respuesta</b></label></div><div class="col-sm-2" align="right"><p><b>Puntos:</b></p></div><div class="col-sm-1"><button class="btn badge badge-pill badge-secondary wspuntosctrl" accion="r"><i class="fa fa-chevron-left"></i></button></div><div class="col-sm-2"><input id="wsPuntuosPAL" class="form-control form-control-sm wspuntosinput" style="text-align: center;" type="numer" disabled="disabled" /></div><div class="col-sm-1" align="right"><button class="btn badge badge-pill badge-secondary wspuntosctrl" accion="s"><i class="fa fa-chevron-right"></i></button></div></div>',
    PAC: '<div class="row"><div class="col-sm-6"><div class="form-group"><label for="wsMarcaAguaPAC"><b><i class="fa fa-pencil"></i>&nbsp;Título / Pregunta (*)</b></label><textarea id="wsPreguntaPAC" class="form-control form-control-sm" placeholder="Escriba Título o Pregunta"></textarea></div></div><div class="col-sm-6"><div class="form-group"><label for="wsMarcaAguaPAC"><b><i class="fa fa-pencil"></i>&nbsp;Marca de Agua (opcional)</b></label><textarea id="wsMarcaAguaPAC" class="form-control form-control-sm" placeholder="Escriba Marca de Agua"></textarea></div></div></div><div id="wsPuntuarDivPAC" class="row"><div class="col-sm-4"><input id="wsPuntuarPAC" name="wspuntuarcheckbox" type="checkbox" data-on="Si" data-off="No" data-toggle="toggle" data-size="xs" data-onstyle="outline-primary" data-offstyle="outline-secondary"><label for="wsPuntuarPAC" class="form-check-label"><b>&nbsp;Puntuar Respuesta</b></label></div><div class="col-sm-2" align="right"><p><b>Puntos:</b></p></div><div class="col-sm-1"><button class="btn badge badge-pill badge-secondary wspuntosctrl" accion="r"><i class="fa fa-chevron-left"></i></button></div><div class="col-sm-2"><input id="wsPuntuosPAC" class="form-control form-control-sm wspuntosinput" style="text-align: center;" type="numer" disabled="disabled" /></div><div class="col-sm-1" align="right"><button class="btn badge badge-pill badge-secondary wspuntosctrl" accion="s"><i class="fa fa-chevron-right"></i></button></div></div>',
    BI: '<div class="row"><div class="col-sm-12"><div class="form-group"><label for="wsPreguntaBI"><b><i class="fa fa-pencil"></i>&nbsp;Título / Pregunta (*)</b></label><textarea id="wsPreguntaBI" class="form-control form-control-sm" placeholder="Escriba Título o Pregunta"></textarea></div></div></div><div id="wsPuntuarDivBI" class="row"><div class="col-sm-12"><input id="wsPuntuarBI" name="wspuntuarcheckbox" type="checkbox" data-on="Si" data-off="No" data-toggle="toggle" data-size="xs" data-onstyle="outline-primary" data-offstyle="outline-secondary"><label for="wsPuntuarBI" class="form-check-label"><b>&nbsp;Puntuar Respuestas</b></label></div></div><hr /><div class="row"><div class="col-sm-6"><div class="form-group"><label for="wsPrimerRespBI"><b><i class="fa fa-pencil"></i>&nbsp;Texto Primer Resp. (*)</b></label><input type="text" id="wsPrimerRespBI" class="form-control form-control-sm" placeholder="Primer Respuesta" /></div></div><div class="col-sm-2 puntoscols" align="right"><br /><p><b>Puntos:</b></p></div><div class="col-sm-1 puntoscols"><br /><button class="btn badge badge-pill badge-secondary wspuntosbictrl" accion="r" texto="pr"><i class="fa fa-chevron-left"></i></button></div><div class="col-sm-2 puntoscols"><br /><input id="wsPuntuosPRBI" class="form-control form-control-sm wspuntosinput" style="text-align: center;" type="numer" disabled="disabled" /></div><div class="col-sm-1 puntoscols" align="right"><br /><button class="btn badge badge-pill badge-secondary wspuntosbictrl" accion="s" texto="pr"><i class="fa fa-chevron-right"></i></button></div><div class="col-sm-6"><div class="form-group"><label for="wsSegundaRespBI"><b><i class="fa fa-pencil"></i>&nbsp;Texto Segunda Resp. (*)</b></label><input type="text" id="wsSegundaRespBI" class="form-control form-control-sm" placeholder="Segunda Respuesta" /></div></div><div class="col-sm-2 puntoscols" align="right"><br /><p><b>Puntos:</b></p></div><div class="col-sm-1 puntoscols"><br /><button class="btn badge badge-pill badge-secondary wspuntosbictrl" accion="r" texto="sr"><i class="fa fa-chevron-left"></i></button></div><div class="col-sm-2 puntoscols"><br /><input id="wsPuntuosSRBI" class="form-control form-control-sm wspuntosinput" style="text-align: center;" type="numer" disabled="disabled" /></div><div class="col-sm-1 puntoscols" align="right"><br /><button class="btn badge badge-pill badge-secondary wspuntosbictrl" accion="s" texto="sr"><i class="fa fa-chevron-right"></i></button></div></div>',
    OM: '<div class="row"><div class="col-sm-12"><div class="form-group"><label for="wsPreguntaOM"><b><i class="fa fa-pencil"></i>&nbsp;Título / Pregunta (*)</b></label><textarea id="wsPreguntaOM" class="form-control form-control-sm" placeholder="Escriba Título o Pregunta"></textarea></div></div></div><div id="wsPuntuarDivOM" class="row"><div class="col-sm-12"><input id="wsPuntuarOM" name="wspuntuarcheckbox" type="checkbox" data-on="Si" data-off="No" data-toggle="toggle" data-size="xs" data-onstyle="outline-primary" data-offstyle="outline-secondary"><label for="wsPuntuarOM" class="form-check-label"><b>&nbsp;Puntuar Respuestas</b></label></div></div><hr /><div class="row"><div class="col-sm-8"><div class="form-group"><label for="wsTextoRespOM"><b>Texto Nueva Respuesta</b></label><input type="text" id="wsTextoRespOM" class="form-control form-control-sm" /></div></div><div class="col-sm-4"><p style="font-size: 11px;">&nbsp;</p><button class="btn btn-sm btn-block btn-primary wsbtnagregarresp"><i class="fa fa-plus"></i>&nbsp;Agregar Respuesta</button></div><div class="col-sm-12" style="padding-top: 5px;"><div class="table table-responsive"><table class="table table-sm table-bordered"><thead><tr class="table-active"><th>Texto Respuesta</th><th class="wspuntostablaelem" style="text-align: center; width: 210px;">Puntos</th><th style="text-align: center; width: 100px;"><i class="fa fa-trash"></i>&nbsp;Borrar</th></tr></thead><tbody id="wsTablaRespuestas"></tbody></table></div></div></div>',
    MS: '<div class="row"><div class="col-sm-12"><div class="form-group"><label for="wsPreguntaMS"><b><i class="fa fa-pencil"></i>&nbsp;Título / Pregunta (*)</b></label><textarea id="wsPreguntaMS" class="form-control form-control-sm" placeholder="Escriba Título o Pregunta"></textarea></div></div></div><div id="wsPuntuarDivMS" class="row"><div class="col-sm-12"><input id="wsPuntuarMS" name="wspuntuarcheckbox" type="checkbox" data-on="Si" data-off="No" data-toggle="toggle" data-size="xs" data-onstyle="outline-primary" data-offstyle="outline-secondary"><label for="wsPuntuarMS" class="form-check-label"><b>&nbsp;Puntuar Respuestas</b></label></div></div><hr /><div class="row"><div class="col-sm-8"><div class="form-group"><label for="wsTextoRespMS"><b>Texto Nueva Respuesta</b></label><input type="text" id="wsTextoRespMS" class="form-control form-control-sm" /></div></div><div class="col-sm-4"><p style="font-size: 11px;">&nbsp;</p><button class="btn btn-sm btn-block btn-primary wsbtnagregarresp"><i class="fa fa-plus"></i>&nbsp;Agregar Respuesta</button></div><div class="col-sm-12" style="padding-top: 5px;"><div class="table table-responsive"><table class="table table-sm table-bordered"><thead><tr class="table-active"><th>Texto Respuesta</th><th class="wspuntostablaelem" style="text-align: center; width: 210px;">Puntos</th><th style="text-align: center; width: 100px;"><i class="fa fa-trash"></i>&nbsp;Borrar</th></tr></thead><tbody id="wsTablaRespuestas"></tbody></table></div></div></div>',
}
// <- VISTAS PREVIAS
var wsSeccionVPHTML = '<div class="col-sm-12" style="padding-bottom: 5px;"><div class="card"><div class="card-header" style="padding: 0rem;"><h6 style="display:inline">&nbsp;&nbsp;&nbsp;Ø×TITULO×Ø</h6></div><div class="card-body"><div id="wsvpseccdiv_Ø×IDHTML×Ø" class="row"></div></div></div></div>';
// <- RESPUESTAS
var wsReaspuestasJSON = {
    RA: '<div class="col-sm-6"><div class="form-group"><label for="wsTituloRespuestaRA"><b>Título Descriptivo de Respuesta: (*)</b></label><textarea id="wsTituloRespuestaRA" class="form-control form-control-sm" placeholder="Escriba Título de Respuesta"></textarea></div></div><div class="col-sm-6"><div class="form-group"><label for="wsMarcaAguaRespuestaRA"><b>Marca de Agua: (opcional)</b></label><textarea id="wsMarcaAguaRespuestaRA" class="form-control form-control-sm" placeholder="Escriba Marca de Agua"></textarea></div></div>',
    RE: '<div class="col-sm-12"><div class="form-group"><label for="wsTituloRespuestaRE"><b><i class="fa fa-pencil"></i>&nbsp;Título Descriptivo de Respuesta (*)</b></label><textarea id="wsTituloRespuestaRE" class="form-control form-control-sm" placeholder="Escriba Título de Respuesta"></textarea></div></div><div class="col-sm-12"><h6>Máximo Puntaje disponible en el test: <span class="badge badge-warning"><i id="wsPuntajeTotalRE">0</i> puntos</span></h6></div><div class="col-sm-4"><b>Cant. Respuestas</b></div><div class="col-sm-1"><button class="btn badge badge-pill badge-secondary wsrespuestasctrlre" accion="r"><i class="fa fa-chevron-left"></i></button></div><div class="col-sm-3"><input id="wsRespuestasRE" class="form-control form-control-sm wsrespuestascantre" style="text-align: center;" type="numer" disabled="disabled" value="2" /></div><div class="col-sm-1" align="right"><button class="btn badge badge-pill badge-secondary wsrespuestasctrlre" accion="s"><i class="fa fa-chevron-right"></i></button></div><div class="col-sm-3"><button class="btn btn-sm btn-block btn-primary wsbtnnuevarespuestare"><i class="fa fa-cog"></i>&nbsp;Crear</button></div><div class="col-sm-12" style="padding-top: 5px;"><div class="table table-responsive"><table class="table table-sm table-bordered"><thead><tr class="table-active" style="text-align: center;"><th>Respuesta</th><th style="text-align: center;"><i class="fa fa-list-ol"></i>&nbsp;Escala de Puntaje</th></tr></thead><tbody id="wsTablaRespuestasRE"></tbody></table></div></div>',
    LF: '<div class="col-sm-12"><div class="form-group"><label for="wsTituloRespuestaLF"><b><i class="fa fa-pencil"></i>&nbsp;Título Descriptivo de Respuesta (*)</b></label><textarea id="wsTituloRespuestaLF" class="form-control form-control-sm" placeholder="Escriba Título de Respuesta"></textarea></div></div><div class="col-sm-8"><div class="form-group"><label for="wsTextoRespuestaLF"><b>Texto Nueva Respuesta</b></label><input type="text" id="wsTextoRespuestaLF" class="form-control form-control-sm" /></div></div><div class="col-sm-4"><p style="font-size: 11px;">&nbsp;</p><button class="btn btn-sm btn-block btn-primary wsbtnnuevarespuestalf"><i class="fa fa-plus"></i>&nbsp;Agregar Respuesta</button></div><div class="col-sm-12" style="padding-top: 5px;"><div class="table table-responsive"><table class="table table-sm table-bordered"><thead><tr class="table-active"><th>Texto Respuesta</th><th style="text-align: center; width: 100px;"><i class="fa fa-trash"></i>&nbsp;Borrar</th></tr></thead><tbody id="wsTablaRespuestasLF"></tbody></table></div></div>',
};
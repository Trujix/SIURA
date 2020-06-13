// ********************************************************
// ARCHIVO JAVASCRIPT CONFIGURACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var ArchivoDocInformativo;
var ArchivoDocInformativoDATA = {
    Nombre: "",
    Extension: ""
};
var ListaUrlsDocsUsuario = {};
var logoPersMiCentro = false;
var logoAlAnonChangeFirst = true;
var ListaDocsJSON = [];

var ArchivoImgLogoPers;

var IdModeloTratamientoGLOBAL = 0;
var IdFaseTratamientoGLOBAL = 0;

var modelosTratamientosJSON = [];

var fasesTratamientosJSON = [];
var fasesTiposJSON = [];

var FasesInfoALTA = {};
var FasesNombres = [];
var FasesTiposALTA = [];

var IdUsuarioSelecGLOBAL = 0;
var UsuarioGeneradoGLOBAL = "";
var IDUsuariosARRAY = [];
var UsuarioDataJSON = {};
var UsuariosListaJSON = [];

var IdEstadoAnimoGLOBAL = 0;
var estadosAnimoJSON = {};
var IdNivelIntoxicacionGLOBAL = 0;
var nivelesIntoxicacionJSON = {};
var IdEstadoAlertaGLOBAL = 0;
var estadosAlertaJSON = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - CONTROLA EL BOTON QUE MANDA LLAMAR AL MENU CONFIGURACION
$(document).on('click', '#menuConfiguracion', function () {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/MenuConfiguracion",
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMaestro').html(data);
            if (data.indexOf("<!-- USUARIO CONFIG -->") >= 0) {
                cargarUsuarioIndInfo(true);
            } else {
                LoadingOff();
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Config.");
        }
    });
});

// ------------- [ ENTRADAS A OPCIONES CONFIGURACION ] -------------
// DOCUMENT - MANEJA EL ABRIR LA OPCION DE DOCUMENTOS
$(document).on('click', 'a[name="opcDoc"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        documentos: "Documentos",
        catalogos: "Catalogos",
        micentro: "MiCentro",
        usuarios: "Usuarios",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuConfiguracion').html(data);
            if (opcion === "micentro") {
                cargarMiCentroInfo();
            } else if (opcion === "catalogos") {
                cargarConfigCatalogos();
            } else if (opcion === "documentos") {
                cargarDocumentos(false);
            } else if (opcion === "usuarios") {
                cargarUsuarios(true);
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Config Docs");
        }
    });
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ DOCUMENTOS INFORMATIVOS ]
$(document).on('change', '#archivoDocInf', function (e) {
    ArchivoDocInformativo = $(this).prop('files')[0];
    if (ArchivoDocInformativo !== undefined) {
        var nombre = ArchivoDocInformativo.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        var tipoArchivo = verifExtensionArchIcono(extension);

        $('#iconoDocInf').css("color", tipoArchivo.color);
        $('#iconoDocInf').html("<i class='" + tipoArchivo.icono + "'></i>&nbsp;" + tipoArchivo.descripcion);

        $('#nombreDocInf').focus();

        ArchivoDocInformativoDATA.Nombre = nombre;
        ArchivoDocInformativoDATA.Extension = extension;
    } else {
        $('#iconoDocInf').html("");
        $('#nombreDocInf').val('');
    }
});

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO INFORMATIVO [ DOCUMENTOS INFORMATIVOS ]
$(document).on('click', '#btnGuardarDocInf', function () {
    if (validarFormDocInf()) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: $('#nombreDocInf').val(),
            NombreArchivo: $('#nombreDocInf').val().toLowerCase().replace(/ /g, "_").replace(/á/g, "").replace(/é/g, "").replace(/í/g, "").replace(/ó/g, "").replace(/ú/g, ""),
            Extension: ArchivoDocInformativoDATA.Extension
        };
        archivoData.append("Archivo", ArchivoDocInformativo);
        archivoData.append("Info", JSON.stringify(archivoInfo));
        
        $.ajax({
            type: "POST",
            url: "/Configuracion/AltaDocInformativo",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    $('#nombreDocInf').val('');
                    cargarDocumentos(true);
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

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO [ DOCUMENTOS INFORMATIVOS ]
$(document).on('click', '#archivoBtnDocInf', function () {
    $('#archivoDocInf').click();
});

// DOCUMENT - BOTON QUE ENVIA EL CORREO CON LOS [ DOCUMENTOS INFORMATIVOS ]
$(document).on('click', '#modalBtnEnviarDocsInf', function () {
    if (validarMailDocsInf()) {
        var docs = [];
        $('input[name="docsinfadm"]').each(function () {
            if ($(this).is(":checked")) {
                docs.push(ListaDocsJSON.DocsInformativos[parseInt($(this).attr("id").split("_")[1])].Nombre);
            }
        });
        $.ajax({
            type: "POST",
            url: "/Configuracion/EnviarCorreoDocsInf",
            data: { Correo: $('#modalTextMailDocInf').val(), Docs: docs },
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    MsgAlerta("Ok!", "Correo enviado <b>exitósamente</b>", 2000, "success");
                    $('#modalMailDocInf').modal('hide');
                } else {
                    ErrorLog(error, "Enviar Correo");
                }
                LoadingOff();
            },
            error: function (error) {
                ErrorLog(error, "Enviar Correo");
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL SWITCH QUE PERMITE ELEGIR EL LOGO ALANON DEFAULT [ MI CENTRO ]
$(document).on('change', '#miCentroLogoDefault', function () {
    if (!logoAlAnonChangeFirst) {
        var estatus = $(this).is(":checked");
        if (logoPersMiCentro) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Configuracion/ActLogoALAnon",
                data: { Estatus: estatus },
                beforeSend: function () {
                    LoadingOn("Actualizando Config...");
                },
                success: function (data) {
                    if (data === "true") {
                        LoadingOff();
                    } else {
                        ErrorLog(data, "ALAnon Logo Config");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "ALAnon Logo Config");
                }
            });
        } else {
            $(this).bootstrapToggle('on', true);
            MsgAlerta("Atención!", "<b>NO</b> puede desactivar el Logo por default <b>sin configurar</b> un <b>Logo Personalizado</b>", 6000, "default");
        }
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA EDITAR  LOGO [ MI CENTRO ]
$(document).on('click', '#btnMiCentroSubirLogo', function () {
    ArchivoImgLogoPers;
    $('#modalArchivoSubirLogo').val("");
    $('#divModalLogoEditor').html("");
    $('#modalMiCentroLogoEditor').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL SELECTOR DE ARCHIVOS PARA ELEGIR LOGOTIPO [ MI CENTRO ]
$(document).on('click', '#btnModalArchivoSubirLogo', function () {
    $('#modalArchivoSubirLogo').click();
});

// DOCUMENT - INPUT QUE CONTROLA LA IMAGEN SELECCIONADA  PARA LOGOTIPO [ MI CENTRO ]
$(document).on('change', '#modalArchivoSubirLogo', function (e) {
    var input = this;
    ArchivoImgLogoPers = $(this).prop('files')[0];
    if (ArchivoImgLogoPers !== undefined) {
        var lector = new FileReader();
        lector.onload = function (e) {
            $('#divModalLogoEditor').html("<div id='imagenEditor'></div>");
            $('#imagenEditor').css('background-image', 'url(' + e.target.result + ')');
            $('#imagenEditor').draggable({
                containment: "#divModalLogoEditor"
            });
            $('#imagenEditor').resizable();
            $('.ui-icon-gripsmall-diagonal-se').css("background-color", "red");

            ArchivoImgLogoPers = e.target.result;
        }
        lector.readAsDataURL(input.files[0]);
    } else {
        $('#divModalLogoEditor').html("");
    }
});

// DOCUMENT - INPUT QUE GUARDA LA IMAGEN DE LOGO [ MI CENTRO ]
$(document).on('click', '#btnModalMiCentroGuardarLogo', function () {
    if (validarFormLogoPers()) {
        MsgPregunta("Guardar Logotipo", "¿Desea continuar?", function (si) {
            if (si) {
                LoadingOn("Renderizando Logo...");
                $('body').append("<div id='imagenLogo'></div>");
                $('#imagenLogo').css("width", $('#imagenEditor').width() + "px");
                $('#imagenLogo').css("height", $('#imagenEditor').height() + "px");
                $('#imagenLogo').css('background-image', 'url(' + ArchivoImgLogoPers + ')');
                $('#imagenLogo').css('background-repeat', 'no-repeat');
                $('#imagenLogo').css('background-size', '100% 100%');
                $('#imagenLogo').css("position", "absolute");
                $('#imagenLogo').css("top", (window.innerHeight / 2) + "px");
                $('#imagenLogo').css("left", (window.innerWidth / 2) + "px");
                setTimeout(function () {
                    html2canvas(document.querySelector("#imagenLogo"), {
                        logging: true,
                        letterRendering: 1,
                        allowTaint: false,
                        useCORS: true
                    }).then(canvas => {
                        $.ajax({
                            type: "POST",
                            contentType: "application/x-www-form-urlencoded",
                            url: "/Configuracion/GuardarLogo",
                            data: { LogoB64: canvas.toDataURL("image/png") },
                            success: function (data) {
                                if (data == "true") {
                                    logoPersMiCentro = true;
                                    $('#imagenLogo').remove();
                                    $('#divMiCentroEstatusLogoImg').html('<span title="Abrir Logo" onclick="abrirLogoPers();" class="badge badge-success" style="cursor: pointer;"><i class="fa fa-check-circle"></i>&nbsp;Logo Detectado</span>&nbsp;&nbsp;<span title="Borrar Logo" onclick="borrarLogoPers();" class="btn badge badge-pill badge-danger" style="cursor: pointer;"><i class="fa fa-trash-alt"></i></span>');
                                    $('#modalMiCentroLogoEditor').modal('hide');
                                    LoadingOff();
                                    MsgAlerta("Ok!", "Logo personalizado <b>guardado correctamente.</b>", 2500, "success");
                                } else {
                                    ErrorLog(data, "Crear Logo Pers.");
                                }
                            },
                            error: function (error) {
                                ErrorLog(error, "Crear Logo Pers.");
                            }
                        });
                    });
                }, 2000);
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE CONFIGURACION DE [ MI CENTRO ]
$(document).on('click', '#btnMiCentroGuardarConfig', function () {
    var centroData = {
        NombreCentro: ($('#miCentroNombre').val() !== "") ? $('#miCentroNombre').val() : "--",
        Direccion: ($('#miCentroDireccion').val() !== "") ? $('#miCentroDireccion').val() : "--",
        ClaveInstitucion: ($('#miCentroClave').val() !== "") ? $('#miCentroClave').val() : "--",
        CP: ((parseFloat($('#miCentroCP').val()) > 0) && !isNaN(parseFloat($('#miCentroCP').val())) && ($('#miCentroCP').val() !== "")) ? parseFloat($('#miCentroCP').val()) : 0,
        Telefono: ((parseFloat($('#miCentroTelefono').val()) > 0) && !isNaN(parseFloat($('#miCentroTelefono').val())) && ($('#miCentroTelefono').val() !== "")) ? parseFloat($('#miCentroTelefono').val()) : 0,
        Colonia: ($('#miCentroColonia').val() !== "") ? $('#miCentroColonia').val() : "--",
        Localidad: ($('#miCentroLocalidad').val() !== "") ? $('#miCentroLocalidad').val() : "--",
        EstadoIndx: ($('#miCentroEstado').val() !== "-1") ? $('#miCentroEstado').val() : "--",
        MunicipioIndx: ($('#miCentroMunicipio').val() !== "-1") ? $('#miCentroMunicipio').val() : "--",
        Estado: ($('#miCentroEstado').val() !== "-1") ? $('#miCentroEstado option:selected').text() : "--",
        Municipio: ($('#miCentroMunicipio').val() !== "-1") ? $('#miCentroMunicipio option:selected').text() : "--",
        Director: ($('#miCentroNombreDirector').val() !== "") ? $('#miCentroNombreDirector').val() : "--",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/GuardarMiCentro",
        data: { CentroData: centroData },
        beforeSend: function () {
            LoadingOn("Guardando parámetros...");
        },
        success: function (data) {
            if (data === "true") {
                LoadingOff();
                MsgAlerta("Ok!", "Parametros <b>guardados</b>", 2000, "success");
            } else {
                ErrorLog(data, "Guardar Mi Centro");
            }
        },
        error: function (error) {
            ErrorLog(error, "Guardar Mi Centro");
        }
    });
});

// DOCUMENT - SELECT QUE CONTROLA EL COMBO QUE CAMBIA EL ESTADO [ MI CENTRO ]
$(document).on('change', '#miCentroEstado', function () {
    var estado = $(this).val();
    $('#miCentroMunicipio').html("<option value='-1'>- Elige Municipio -</option>");
    $.getJSON("../Media/municipios.json", function (municipios) {
        $(municipios[estado]).each(function (key, value) {
            $('#miCentroMunicipio').append("<option value='" + value + "'>" + value + "</option>");
        });
    });
});

// DOCUMENT - BOTON QUE CONTROLA LA FUNCION QUE ABRE EL MODAL PARA NUEVO MODELO TRATAMIENTO [ CATALOGOS ]
$(document).on('click', '#nuevoModeloTratamiento', function () {
    IdModeloTratamientoGLOBAL = 0;
    $('#modalModeloTratamientoTitulo').html("Nuevo Modelo");
    $('#modalModeloTratamientoNombre').val("");
    $('#modalModeloTratamiento').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE UN MODELO DE TRATAMIENTO [ CATALOGOS ]
$(document).on('click', '#modalModeloTratamientoGuardar', function () {
    if ($('#modalModeloTratamientoNombre').val() !== "") {
        var url = "GuardarModeloTratamiento", data = { NombreModelo: $('#modalModeloTratamientoNombre').val().trim().toUpperCase() }, msg = "Guardar";
        if (IdModeloTratamientoGLOBAL > 0) {
            url = "ActModeloTratamiento";
            msg = "Editar";
            data = {
                IdModeloTratamiento: IdModeloTratamientoGLOBAL,
                NombreModelo: $('#modalModeloTratamientoNombre').val().trim().toUpperCase(),
                Estatus: 1
            };
        }
        MsgPregunta(msg + " Modelo Tratamiento", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/" + url,
                    data: data,
                    beforeSend: function () {
                        LoadingOn("Guardando Modelo...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalModeloTratamiento').modal('hide');
                            MsgAlerta("Ok!", "Modelo <b>Guardado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, msg + " Modelo Tratamiento");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, msg + " Modelo Tratamiento");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Coloque el <b>Nombre del Modelo de Tratamiento</b>", 3000, "default");
        $('#modalModeloTratamientoNombre').focus();
    }
});

// DOCUMENT - BOTON QUE ELIMINA UN MODELO DE TRATAMIENTO [ CATALOGOS ]
$(document).on('click', '#eliminarModeloTratamiento', function () {
    if (parseFloat($('#modelosTratamientosSelect').val()) > 0) {
        MsgPregunta("Eliminar Modelo Tratamiento " + $('#modelosTratamientosSelect option:selected').text(), "¿Desea continuar?", function (si) {
            var Modelo = {
                IdModeloTratamiento: parseInt($('#modelosTratamientosSelect').val()),
                NombreModelo: $('#modelosTratamientosSelect option:selected').text(),
                Estatus: 0
            };
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActModeloTratamiento",
                    data: { ModeloTratamientoInfo: Modelo },
                    beforeSend: function () {
                        LoadingOn("Eliminando Modelo...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalModeloTratamiento').modal('hide');
                            MsgAlerta("Ok!", "Modelo <b>Eliminado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Eliminar Modelo Tratamiento");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Eliminar Modelo Tratamiento");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga un Modelo de Tratamiento", 2500, "default");
        $('#modelosTratamientosSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE EDITAR UN MODELO DE TRATAMIENTO - [ CATALOGOS ]
$(document).on('click', '#editarModeloTratamiento', function () {
    if (parseFloat($('#modelosTratamientosSelect').val()) > 0) {
        IdModeloTratamientoGLOBAL = parseInt($('#modelosTratamientosSelect').val());
        $('#modalModeloTratamientoTitulo').html("Editar Modelo");
        $('#modalModeloTratamientoNombre').val($('#modelosTratamientosSelect option:selected').text());
        $('#modalModeloTratamiento').modal('show');
    } else {
        MsgAlerta("Atención!", "Eliga un Modelo de Tratamiento", 2500, "default");
        $('#modelosTratamientosSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION QUE LLAMA MODAL PARA GENERAR NUEVA FASE TRATAMIENTO [ CATALOGOS ]
$(document).on('click', '#nuevaFasesTratamiento', function () {
    IdFaseTratamientoGLOBAL = 0;
    fasesTiposJSON = [];
    $('#modalNumFasesTratamiento').val("0");
    $('#modalTablaFasesTratamiento').html('');
    $('#modalFasesTratamiento').modal('show');
});

// DOCUMENT - BOTON QUE LIMPIA LOS PARAMETROS DE LAS FASES [ CATALOGOS ]
$(document).on('click', '#modalLimpiarFasesTratamiento', function () {
    $('#modalNumFasesTratamiento').val("0");
    $('#modalTablaFasesTratamiento').html('');
});

// DOCUMENT QUE CONTROLA EL INPUT DE NUMERO DE FASES [ CATALOGOS ]
$(document).on('change keyup', '#modalNumFasesTratamiento', function () {
    fasesTiposJSON = [];
    $('#modalTablaFasesTratamiento').html('');
    if (isNaN(parseFloat($(this).val()))) {
        $(this).val("0");
    } else {
        var fases = "", modelos = "", trs = "";
        for (i = 0; i < parseFloat($(this).val()); i++) {
            fases += "<div class='row' style='padding-top: 5px;'><div class='col-sm-11'><input type='text' class='form-control form-control-sm faseNombre' placeholder='Nombre de Fase' /></div></div>";
        }
        if (fases !== "") {
            modelos += '<div class="row"><div class="col-sm-2"></div><div class="col-sm-10"><input class="magic-radio" type="radio" name="modelotratamiento" id="modelo_0"><label for="modelo_0">Sin Modelo</label></div></div>';
            $(modelosTratamientosJSON).each(function (key, value) {
                modelos += '<div class="row"><div class="col-sm-2"></div><div class="col-sm-10"><input class="magic-radio" type="radio" name="modelotratamiento" id="modelo_' + value.IdTratamiento + '"><label for="modelo_' + value.IdTratamiento + '">' + value.NombreTratamiento + '</label></div></div>';
            });
            trs = '<tr><td style="width: 280px;"><div class="row"><div class="col-sm-12 scrollestilo" style="height: 50vh; overflow: scroll;">' + fases + '</div></div></td><td><div class="row"><div class="col-sm-1"></div><div class="col-sm-11 scrollestilo" style="height: 50vh; overflow: scroll;"><div class="row" style="padding-top: 10px;"><div class="col-sm-10"><input id="modalFaseNombreTipo" type="text" class="form-control form-control-sm" placeholder="Nombre del Tipo" /></div><div class="col-sm-1"><button id="modalBtnAgregarFaseTipoLista" title="Añadir a la lista" class="btn btn-sm btn-info"><i class="fa fa-plus-circle"></i></button></div></div><div class="row" style="padding-top: 10px;"><div class="col-sm-12"><div class="card"><div id="modalFasesTiposLista" class="card-body"></div></div></div></div></div></div></td><td style="width: 300px;"><div class="row"><div class="col-sm-12 scrollestilo" style="height: 50vh; overflow: scroll;">' + modelos + '</div></div></td></tr>';
        }
        $('#modalTablaFasesTratamiento').html(trs);
        $('#modelo_0').attr("checked", true);
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE MOSTRAR UN INFO AUXILIAR SOBRE LAS OPCIONES DE LA TABLA DE FASES [ CATALOGOS ]
$(document).on('click', '.infofasetabla', function () {
    if ($(this).attr("columna") === "nombre") {
        MsgAlerta("Info!", "<b>Ejemplos</b>\n\n'INGRESO'\n'PROGESO'\n'EGRESO'", 10000, "info");
    } else if ($(this).attr("columna") === "tipo") {
        MsgAlerta("Info!", "<b>Ejemplos</b>\n\n'FILOSÓFICO'\n'HUMANISTA'\n'LÚDICO'", 10000, "info");
    } else if ($(this).attr("columna") === "modelo") {
        MsgAlerta("Info!", "Permite anexar la fase, o grupo de fases a un <b>Modelo de Tratamiento</b> previamente almacenado.", 10000, "info");
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL AGREGAR UN TIPO A LA LISTA EN MODAL DE FASES [ CATALOGOS ]
$(document).on('click', '#modalBtnAgregarFaseTipoLista', function () {
    if ($('#modalFaseNombreTipo').val() !== "") {
        var id = cadAleatoria(6);
        $('#modalFasesTiposLista').append('<h6 id="' + id + '"><span class="badge badge-secondary">' + $('#modalFaseNombreTipo').val().toUpperCase() + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i style="cursor: pointer;" class="quitarFaseTipo" trid="' + id + '" title="Quitar tipo">x</i></span></h6>');
        fasesTiposJSON.push({
            IdTipo: id,
            NombreTipo: $('#modalFaseNombreTipo').val().toUpperCase()
        });
        $('#modalFaseNombreTipo').val("").focus();
    } else {
        $('#modalFaseNombreTipo').focus();
        MsgAlerta("Atencion!", "Coloque <b>Nombre del Tipo</b>", 2000, "default");
    }
});

// DOCUMENT - BOTON QUE ELIMINA UN TIPO DE LA FASE DE TRATAMIENTO [ CATALOGOS ]
$(document).on('click', '.quitarFaseTipo', function () {
    var id = $(this).attr("trid");
    $('#' + id).remove();
    fasesTiposJSON.quitarElemento('IdTipo', id);
    $('#modalFaseNombreTipo').focus();
});

// DOCUMENT - BOTON QUE GUARDA LA CONFIGURACION DEL NUEVO ESQUEMA DE FASES [ CATALOGOS ]
$(document).on('click', '#modalFasesTratamientoGuardar', function () {
    var msg = "Guardar", loader = "Guardando Fases...";
    if (IdFaseTratamientoGLOBAL > 0) {
        msg = "Editar", loader = "Guardando Cambios...";
    }
    if (validarFasesForm()) {
        MsgPregunta(msg + " Esquema Fases", "¿Desea continuar?", function (si) {
            if (si) {
                LoadingOn(loader);
                var idModelo = 0;
                $('input[name="modelotratamiento"]').each(function () {
                    if ($(this).is(":checked")) {
                        idModelo = parseInt($(this).attr("id").split("_")[1]);
                    }
                });
                FasesInfoALTA = {
                    IdFase: IdFaseTratamientoGLOBAL,
                    CantidadFases: parseInt($('#modalNumFasesTratamiento').val()),
                    IdModelo: idModelo,
                };
                FasesNombres = [];
                FasesTiposALTA = [];
                $('.faseNombre').each(function () {
                    FasesNombres.push({
                        NombreFase: $(this).val().toUpperCase()
                    });
                });
                $(fasesTiposJSON).each(function (key, value) {
                    FasesTiposALTA.push({
                        NombreTipo: value.NombreTipo
                    });
                });
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/GuardarFasesTratamiento",
                    data: { FasesInfo: FasesInfoALTA, FasesNombres: FasesNombres, FasesTipo: FasesTiposALTA },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalFasesTratamiento').modal('hide');
                            LoadingOff();
                            cargarConfigCatalogos();
                            MsgAlerta("Ok!", "Fases tratamientos <b>guardado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Guardar Fases Tratamientos");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Guardar Fases Tratamientos");
                    }
                });
            }
        });
    }
});

// DOCUMENT - BOTON QUE ABRE UN MENSAJE CON LA INFO DE UN ESQUEMA DE FASES [ CATALOGOS ]
$(document).on('click', '#infoFaseTratamiento', function () {
    if (parseFloat($('#fasesTratamientosSelect').val()) > 0) {
        LoadingOn("Cargando Fase...");
        $(fasesTratamientosJSON).each(function (key, value) {
            if (value.IdFase === parseInt($('#fasesTratamientosSelect').val())) {
                var msg = "Este esquema de <b>Fases</b> NO contiene <b>Tipos</b>";
                if (value.FasesTiposTxt !== "") {
                    msg = "<b>Tipos:</b>\n\n" + value.FasesTiposTxt;
                }
                MsgAlerta("Info!", msg, 6000, "info");
                LoadingOff();
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga una Fase de Tratamiento", 2500, "default");
        $('#fasesTratamientosSelect').focus();
    }
});

// DOCUMENT - BOTON QUE ABRE EL MODAL DE FASES PARA EDITAR UN ESQUEMA DE FASES [ CATALOGOS ]
$(document).on('click', '#editarFaseTratamiento', function () {
    if (parseFloat($('#fasesTratamientosSelect').val()) > 0) {
        LoadingOn("Cargando Fase...");
        $(fasesTratamientosJSON).each(function (key, value) {
            if (value.IdFase === parseInt($('#fasesTratamientosSelect').val())) {
                $('#modalNumFasesTratamiento').val(value.CantidadFases);
                $('#modalNumFasesTratamiento').keyup();
                IdFaseTratamientoGLOBAL = value.IdFase;
                fasesTiposJSON = [];
                $('#modelo_0').prop("checked", true);
                $('#modelo_' + value.IdModelo).prop("checked", true);

                var c = 0;
                $('.faseNombre').each(function () {
                    $(this).val(value.FasesNombres[c]);
                    c++;
                });

                for (i = 0; i < value.FasesTipos.length; i++) {
                    var id = cadAleatoria(6);
                    $('#modalFasesTiposLista').append('<h6 id="' + id + '"><span class="badge badge-secondary">' + value.FasesTipos[i] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i style="cursor: pointer;" class="quitarFaseTipo" trid="' + id + '" title="Quitar tipo">x</i></span></h6>');
                    fasesTiposJSON.push({
                        IdTipo: id,
                        NombreTipo: value.FasesTipos[i]
                    });
                };

                $('#modalFasesTratamiento').modal('show');
                LoadingOff();
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga una Fase de Tratamiento", 2500, "default");
        $('#fasesTratamientosSelect').focus();
    }
});

// DOCUMENT - BOTON QUE EJECUTA LA ACCION DE ELIMINAR UN ESQUEMA DE FASES [ CATALOGOS ]
$(document).on('click', '#eliminarFaseTratamiento', function () {
    if (parseFloat($('#fasesTratamientosSelect').val()) > 0) {
        LoadingOn("Cargando Fase...");
        var nombreFase = "";
        $(fasesTratamientosJSON).each(function (key, value) {
            if (value.IdFase === parseInt($('#fasesTratamientosSelect').val())) {
                nombreFase = value.FasesNombresTxt;
            }
        });
        LoadingOff();
        MsgPregunta("Borrar Fase " + nombreFase, "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActDesFasesTratamiento",
                    data: { IdFase: parseInt($('#fasesTratamientosSelect').val()), Estatus: 0 },
                    beforeSend: function () {
                        LoadingOn("Guardando Cambios...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            LoadingOff();
                            cargarConfigCatalogos();
                            MsgAlerta("Ok!", "Fase <b>eliminada correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Borrar Fase");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Borrar Fase");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga una Fase de Tratamiento", 2500, "default");
        $('#fasesTratamientosSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA FUNCION QUE ABRE EL MODAL PARA NUEVO ESTADO DE ALERTA [ CATALOGOS ]
$(document).on('click', '#nuevoEstadoAlerta', function () {
    IdEstadoAlertaGLOBAL = 0;
    $('#modalEstadosAlertaTitulo').html("Nuevo Estado Alerta");
    $('#modalEstadosAlertaNombre').val("");
    $('#modalEstadosAlerta').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE UN ESTADO DE ALERTA [ CATALOGOS ]
$(document).on('click', '#modalEstadosAlertaGuardar', function () {
    if ($('#modalEstadosAlertaNombre').val() !== "") {
        var url = "GuardarEstadoAlerta", data = { NombreEstadoAlerta: $('#modalEstadosAlertaNombre').val().trim().toUpperCase() }, msg = "Guardar";
        if (IdEstadoAlertaGLOBAL > 0) {
            url = "ActEstadoAlerta";
            msg = "Editar";
            data = {
                IdEstadoAlerta: IdEstadoAlertaGLOBAL,
                NombreEstadoAlerta: $('#modalEstadosAlertaNombre').val().trim().toUpperCase(),
                Estatus: 1
            };
        }
        MsgPregunta(msg + " Estado Alerta", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/" + url,
                    data: data,
                    beforeSend: function () {
                        LoadingOn("Guardando Estado Alerta...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalEstadosAlerta').modal('hide');
                            MsgAlerta("Ok!", "Estado Alerta <b>Guardado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, msg + " Estado Alerta");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, msg + " Estado Alerta");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Coloque el <b>Nombre del Estado de Alerta</b>", 3000, "default");
        $('#modalEstadosAlertaNombre').focus();
    }
});

// DOCUMENT - BOTON QUE ELIMINA UN ESTADO DE ALERTA [ CATALOGOS ]
$(document).on('click', '#eliminarEstadoAlerta', function () {
    if (parseFloat($('#estadosAlertaSelect').val()) > 0) {
        MsgPregunta("Eliminar Estado Alerta " + $('#estadosAlertaSelect option:selected').text(), "¿Desea continuar?", function (si) {
            var EstadoAlerta = {
                IdEstadoAlerta: parseInt($('#estadosAlertaSelect').val()),
                NombreEstadoAlerta: $('#estadosAlertaSelect option:selected').text(),
                Estatus: 0
            };
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActEstadoAlerta",
                    data: { EstadoAlertaInfo: EstadoAlerta },
                    beforeSend: function () {
                        LoadingOn("Eliminando Estado Alerta...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalModeloTratamiento').modal('hide');
                            MsgAlerta("Ok!", "Estado Alerta <b>Eliminado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Eliminar Estado Alerta");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Eliminar Estado Alerta");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga un Estado de Alerta", 2500, "default");
        $('#estadosAlertaSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE EDITAR UN ESTADO DE ALERTA - [ CATALOGOS ]
$(document).on('click', '#editarEstadoAlerta', function () {
    if (parseFloat($('#estadosAlertaSelect').val()) > 0) {
        IdEstadoAlertaGLOBAL = parseInt($('#estadosAlertaSelect').val());
        $('#modalEstadosAlertaTitulo').html("Editar Estado Alerta");
        $('#modalEstadosAlertaNombre').val($('#estadosAlertaSelect option:selected').text());
        $('#modalEstadosAlerta').modal('show');
    } else {
        MsgAlerta("Atención!", "Eliga un Estado de Alerta", 2500, "default");
        $('#estadosAlertaSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA FUNCION QUE ABRE EL MODAL PARA NUEVO NIVEL DE INTOXICACION [ CATALOGOS ]
$(document).on('click', '#nuevoNivelIntoxicacion', function () {
    IdNivelIntoxicacionGLOBAL = 0;
    $('#modalNivelIntoxicacionTitulo').html("Nuevo Nivel Intoxicación");
    $('#modalNivelIntoxicacionNombre').val("");
    $('#modalNivelIntoxicacion').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE UN NIVEL DE INTOXICACION [ CATALOGOS ]
$(document).on('click', '#modalNivelIntoxicacionGuardar', function () {
    if ($('#modalNivelIntoxicacionNombre').val() !== "") {
        var url = "GuardarNivelIntoxicacion", data = { NombreNivelIntoxicacion: $('#modalNivelIntoxicacionNombre').val().trim().toUpperCase() }, msg = "Guardar";
        if (IdNivelIntoxicacionGLOBAL > 0) {
            url = "ActNivelIntoxicacion";
            msg = "Editar";
            data = {
                IdNivelesIntoxicacion: IdNivelIntoxicacionGLOBAL,
                NombreNivelIntoxicacion: $('#modalNivelIntoxicacionNombre').val().trim().toUpperCase(),
                Estatus: 1
            };
        }
        MsgPregunta(msg + " Nivel Intoxicacion", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/" + url,
                    data: data,
                    beforeSend: function () {
                        LoadingOn("Guardando Nivel Intoxicación..");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalNivelIntoxicacion').modal('hide');
                            MsgAlerta("Ok!", "Nivel Intoxicación <b>Guardado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, msg + " Nivel Intoxicación");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, msg + " Nivel Intoxicación");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Coloque el <b>Nombre del Nivel de Intoxicación</b>", 3000, "default");
        $('#modalNivelIntoxicacionNombre').focus();
    }
});

// DOCUMENT - BOTON QUE ELIMINA UN NIVEL DE INTOXICACION [ CATALOGOS ]
$(document).on('click', '#eliminarNivelIntoxicacion', function () {
    if (parseFloat($('#nivelIntoxicacionSelect').val()) > 0) {
        MsgPregunta("Eliminar Nivel Intoxicacion " + $('#nivelIntoxicacionSelect option:selected').text(), "¿Desea continuar?", function (si) {
            var NIntoxicacion = {
                IdNivelesIntoxicacion: parseInt($('#nivelIntoxicacionSelect').val()),
                NombreNivelIntoxicacion: $('#nivelIntoxicacionSelect option:selected').text(),
                Estatus: 0
            };
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActNivelIntoxicacion",
                    data: { NivelIntoxicacionInfo: NIntoxicacion },
                    beforeSend: function () {
                        LoadingOn("Eliminando Nivel Intoxicacion...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalModeloTratamiento').modal('hide');
                            MsgAlerta("Ok!", "Nivel Intoxicacion <b>Eliminado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Eliminar Nivel Intoxicacion");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Eliminar Nivel Intoxicacion");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Eliga un Nivel de Intoxicacion", 2500, "default");
        $('#nivelIntoxicacionSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE EDITAR UN NIVEL DE INTOXICACION - [ CATALOGOS ]
$(document).on('click', '#editarNivelIntoxicacion', function () {
    if (parseFloat($('#nivelIntoxicacionSelect').val()) > 0) {
        IdNivelIntoxicacionGLOBAL = parseInt($('#nivelIntoxicacionSelect').val());
        $('#modalNivelIntoxicacionTitulo').html("Editar Nivel Intoxicación");
        $('#modalNivelIntoxicacionNombre').val($('#nivelIntoxicacionSelect option:selected').text());
        $('#modalNivelIntoxicacion').modal('show');
    } else {
        MsgAlerta("Atención!", "Eliga un Nivel Intoxicación", 2500, "default");
        $('#nivelIntoxicacionSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA FUNCION QUE ABRE EL MODAL PARA NUEVO ESTADO DE ANIMO [ CATALOGOS ]
$(document).on('click', '#nuevoEstadoAnimo', function () {
    IdEstadoAnimoGLOBAL = 0;
    $('#modalEstadoAnimoTitulo').html("Nuevo Estado Ánimo");
    $('#modalEstadoAnimoNombre').val("");
    $('#modalEstadoAnimo').modal('show');
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE UN ESTADO DE ALERTA [ CATALOGOS ]
$(document).on('click', '#modalEstadoAnimoGuardar', function () {
    if ($('#modalEstadoAnimoNombre').val() !== "") {
        var url = "GuardarEstadoAnimo", data = { NombreEstadoAnimo: $('#modalEstadoAnimoNombre').val().trim().toUpperCase() }, msg = "Guardar";
        if (IdEstadoAnimoGLOBAL > 0) {
            url = "ActEstadoAnimo";
            msg = "Editar";
            data = {
                IdEstadoAnimo: IdEstadoAnimoGLOBAL,
                NombreEstadoAnimo: $('#modalEstadoAnimoNombre').val().trim().toUpperCase(),
                Estatus: 1
            };
        }
        MsgPregunta(msg + " Estado Animo", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/" + url,
                    data: data,
                    beforeSend: function () {
                        LoadingOn("Guardando Estado Animo..");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalEstadoAnimo').modal('hide');
                            MsgAlerta("Ok!", "Estado Animo <b>Guardado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, msg + " Estado Animo");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, msg + " Estado Animo");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Coloque el <b>Nombre del Estado de Ánimo</b>", 3000, "default");
        $('#modalEstadoAnimoNombre').focus();
    }
});

// DOCUMENT - BOTON QUE ELIMINA UN ESTADO DE ANIMO [ CATALOGOS ]
$(document).on('click', '#eliminarEstadoAnimo', function () {
    if (parseFloat($('#estadoAnimoSelect').val()) > 0) {
        MsgPregunta("Eliminar Estado Animo " + $('#estadoAnimoSelect option:selected').text(), "¿Desea continuar?", function (si) {
            var EstadoAnimo = {
                IdEstadoAnimo: parseInt($('#estadoAnimoSelect').val()),
                NombreEstadoAnimo: $('#estadoAnimoSelect option:selected').text(),
                Estatus: 0
            };
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActEstadoAnimo",
                    data: { EstadoAnimoInfo: EstadoAnimo },
                    beforeSend: function () {
                        LoadingOn("Eliminando Estado Animo...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            cargarConfigCatalogos();
                            $('#modalModeloTratamiento').modal('hide');
                            MsgAlerta("Ok!", "Estado Animo <b>Eliminado correctamente</b>", 2000, "success");
                        } else {
                            ErrorLog(data, "Eliminar Estado Animo");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Eliminar Estado Animo");
                    }
                });
            }
        });
    } else {
        MsgAlerta("Atención!", "Elige un Estado de Animo", 2500, "default");
        $('#estadoAnimoSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE EDITAR UN ESTADO DE ANIMO - [ CATALOGOS ]
$(document).on('click', '#editarEstadoAnimo', function () {
    if (parseFloat($('#estadoAnimoSelect').val()) > 0) {
        IdEstadoAnimoGLOBAL = parseInt($('#estadoAnimoSelect').val());
        $('#modalEstadoAnimoTitulo').html("Editar Estado de Animo");
        $('#modalEstadoAnimoNombre').val($('#estadoAnimoSelect option:selected').text());
        $('#modalEstadoAnimo').modal('show');
    } else {
        MsgAlerta("Atención!", "Eliga un Estado de Animo", 2500, "default");
        $('#estadoAnimoSelect').focus();
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACCION DE LLAMAR EL MODAL PARA CREAR  NUEVO USUARIO [ MENU USUARIOS ]
$(document).on('click', '#agregarNuevoUsuario', function () {
    IdUsuarioSelecGLOBAL = 0;
    UsuarioGeneradoGLOBAL = generarUsuarioID();
    $('#modalUsuario').html(UsuarioGeneradoGLOBAL);
    limpiarFormUsuarios();
    $('#modalUsuarios').modal('show');
});

// DOCUMENT - BOTON QUE SE ENCARGA DE GUARDAR / EDITAR USUARIO [ MENU USUARIOS ]
$(document).on('click', '#modalGuardarUsuario', function () {
    if (validarFormUsuario()) {
        MsgPregunta((IdUsuarioSelecGLOBAL > 0) ? "Guardar Cambios" : "Guardar Usuario", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/GuardarUsuario",
                    data: { UsuarioInfo: UsuarioDataJSON },
                    beforeSend: function () {
                        LoadingOn("Guardando Usuario...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalUsuarios').modal('hide');
                            LoadingOff();
                            cargarUsuarios(false);
                        } else {
                            ErrorLog(data, "Guardar Usuario");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Guardar Usuario");
                    }
                });
            }
        });
    }
});

// DOCUMENT - BOTON QUE GENERA UNA NUEVA CONTRASEÑA A UN USUARIO Y SE ENVIA POR CORREO [ MENU USUARIOS ]
$(document).on('click', '#modalBtnNuevaPasUsuario', function () {
    MsgPregunta("Generar Nueva Contraseña", "¿Desea continuar?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Configuracion/NuevaPassUsuario",
                data: { UsuarioInfo: UsuarioDataJSON },
                beforeSend: function () {
                    LoadingOn("Enviando Nueva Contraseña...");
                },
                success: function (data) {
                    if (data === "true") {
                        $('#modalNuevaPassUsuario').modal('hide');
                        LoadingOff();
                        MsgAlerta("Ok!", "Contraseña generada y enviada <b>correctamente</b>", 2500, "success");
                    } else {
                        ErrorLog(data, "Nueva Contraseña Usuario");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Nueva Contraseña Usuario");
                }
            });
        }
    });
});

// DOCUMENT  - BOTON QUE ABRE UN MODAL PARA EDITAR LA OPCION DEL USUARIO ADMINISTRADOR
$(document).on('click', '#configurarUsuarioAdmin', function () {
    LoadingOn("Cargando Configuración...");
    $('#modalConfigAdmin').modal('show');
    cargarUsuarioIndInfo(true);
});

// DOCUMENT - BOTON QUE CONTROLA EL GUARDADO DE LA INFO GENERAL DE USUARIO [ MENU USUARIO INFIVIDUAL ]
$(document).on('click', '#btnConfigUsuGuardar', function () {
    if (validarFormUsuarioInd()) {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Configuracion/ActUsuarioInfo",
            data: { UsuarioInfo: UsuarioDataJSON },
            beforeSend: function () {
                LoadingOn("Guardando Cambios...");
            },
            success: function (data) {
                if (data === "true") {
                    $('#configUsuNombre').val($('#configUsuNombre').val().toUpperCase());
                    $('#configUsuApellido').val($('#configUsuApellido').val().toUpperCase());
                    LoadingOff();
                    MsgAlerta("Ok!", "Información actualizada <b>Correctamente</b>", 2000, "success");
                } else {
                    ErrorLog(data, "Actualizar Info. Usuario");
                }
            },
            error: function (error) {
                ErrorLog(error, "Actualizar Info. Usuario");
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA ACTUALIZACION DE LA CONTRASEÑA DE USUARIO [ MENU USUARIO INFIVIDUAL ]
$(document).on('click', '#btnConfigUsuGuardarPass', function () {
    if (validarFormUsuNuevaPass()) {
        MsgPregunta("Cambiar Contraseña", "¿Desea continuar?", function (si) {
            if (si) {
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ActUsuarioPass",
                    data: { UsuarioPass: UsuarioDataJSON },
                    beforeSend: function () {
                        LoadingOn("Guardando Contraseña...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#configUsuNuevaPass').val('');
                            $('#configUsuConfirmPass').val('');
                            $('#configUsuAntPass').val('');
                            LoadingOff();
                            MsgAlerta("Ok!", "Información actualizada <b>Correctamente</b>", 2000, "success");
                        } else if (data === "errorPass") {
                            LoadingOff();
                            setTimeout(function () {
                                $('#configUsuAntPass').focus();
                            }, 1000);
                            MsgAlerta("Atención!", "La antigua contraseña es <b>Incorrecta</b>", 3500, "default");
                        } else {
                            ErrorLog(data, "Actualizar Usuario Contraseña");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Actualizar Usuario Contraseña");
                    }
                });
            }
        });
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS DEL MENU [ DOCUMENTOS [ DOCUMENTOS INFORMATIVOS ] ]
function cargarDocumentos(msg) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/ListaDocs",
        dataType: "JSON",
        beforeSend: function () {
            ListaUrlsDocsUsuario = {};
        },
        success: function (data) {
            ListaDocsJSON = data;
            var i = 0;
            var docsInfHTML = (data.DocsInformativos.length > 0) ? "" : "<div class='col-sm-12' style='text-align: center;'><h2 style='color: #95A5A6;'><i class='fa fa-exclamation'></i>&nbsp;No tiene archivos agregados aún.</h2></div>";
            $(data.DocsInformativos).each(function (key, value) {
                var archivoInfo = verifExtensionArchIcono(value.Extension);
                docsInfHTML += "<div class='col-sm-1' style='text-align: center;'><h1 class='" + archivoInfo.icono + "' style='color: #95A5A6; cursor: pointer;' onclick='configAbrirDocumento(" + i + ")'></h1><p></p><label><b>" + value.Nombre + "</b></label></div>";
                ListaUrlsDocsUsuario["doc_" + i.toString()] = data.UrlFolderCliente + value.Archivo + "." + value.Extension;
                i++;
            });


            $('#divDocsInformativos').html(docsInfHTML);
            UrlFolderUsuario = data.UrlFolderCliente;
            (data.DocsInformativos.length > 0) ? $('#btnMailDocInf').removeAttr("disabled") : $('#btnMailDocInf').attr("disabled", "");

            $('#modalMailDocInf').on('shown.bs.modal', function (e) {
                $('#modalTextMailDocInf').val('');
                $('#modalTextMailDocInf').focus();
                var tablaDocs = '<h6><b>Eliga documentos a enviar:</b></h6>';
                $(ListaDocsJSON.DocsInformativos).each(function (key, value) {
                    tablaDocs += '<div class="col-sm-4"><div class="checkbox icheck-info"><input type="checkbox" name="docsinfadm" id="docInf_' + key + '" /><label for="docInf_' + key + '"><b>' + value.Nombre + '</b></label></div></div>';
                });
                $('#modalMailDocInfLista').html(tablaDocs);
            });

            LoadingOff();
            if (msg) {
                MsgAlerta("Ok!", "Documento almacenado <b>correctamente</b>", 2000, "success");
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Config Docs.");
        }
    });
}

// FUNCION QUE ABRE LOS DOCUMENTOS EN NUEVA PESTAÑA DIRECTO DEL NAVEGADOR  [ DOCUMENTOS INFORMATIVOS ]
function configAbrirDocumento(id) {
    window.open(ListaUrlsDocsUsuario["doc_" + id.toString()], '_blank');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA [ DOCUMENTOS INFORMATIVOS ]
function validarFormDocInf() {
    var verifArchivo = $('#archivoDocInf').prop('files')[0];
    var respuesta = true;
    if (verifArchivo === undefined) {
        respuesta = false;
        MsgAlerta("Atención!", "No ha seleccionado <b>un archivo</b>", 2000, "default");
    } else if ($('#nombreDocInf').val() === "") {
        respuesta = false;
        $('#nombreDocInf').focus();
        MsgAlerta("Atención!", "Coloque el <b>nombre del archivo</b>", 2000, "default");
    }
    return respuesta;
}

// FUNCION QUE VALIDA EL ENVIO DEL MAIL CON DOCUMENTOS INFORMATIVOS [ DOCUMENTOS INFORMATIVOS ]
function validarMailDocsInf() {
    var correcto = true, msg = '', docscheck = false;
    $('input[name="docsinfadm"]').each(function () {
        if ($(this).is(":checked")) {
            docscheck = true;
        }
    });
    if ($('#modalTextMailDocInf').val() === "") {
        correcto = false;
        msg = 'Escriba el <b>correo electrónico</b>';
        $('#modalTextMailDocInf').focus();
    } else if (!esEmail($('#modalTextMailDocInf').val())) {
        correcto = false;
        msg = 'El formato del <b>correo electrónico</b> NO es válido';
        $('#modalTextMailDocInf').focus();
    } else if (!docscheck) {
        correcto = false;
        msg = 'Eliga al menos <b>1 documento de la lista</b>';
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE CARGA LOS PARAMETROS DEL CENTRO DE REHABILITACION [ MI CENTRO ]
function cargarMiCentroInfo() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/MiCentroInfo",
        dataType: "JSON",
        beforeSend: function () {
            logoAlAnonChangeFirst = true;
            LoadingOn("Cargando Mi Centro...");
            $('#miCentroEstado').html("<option value='-1'>- Elige Estado -</option>");
            $('#miCentroMunicipio').html("<option value='-1'>- Elige Municipio -</option>");
        },
        success: function (data) {
            if (data.Nombre !== undefined) {
                logoPersMiCentro = data.LogoPers;
                $('#miCentroLogoDefault').bootstrapToggle((data.LogoAlAnon) ? "on" : "off");
                if (data.LogoPers) {
                    $('#divMiCentroEstatusLogoImg').html('<span title="Abrir Logo" onclick="abrirLogoPers();" class="badge badge-success" style="cursor: pointer;"><i class="fa fa-check-circle"></i>&nbsp;Logo Detectado</span>&nbsp;&nbsp;<span title="Borrar Logo" onclick="borrarLogoPers();" class="btn badge badge-pill badge-danger" style="cursor: pointer;"><i class="fa fa-trash-alt"></i></span>');
                } else {
                    $('#divMiCentroEstatusLogoImg').html('<span class="badge badge-danger"><i class="fa fa-times-circle"></i>&nbsp;Sin logo personalizado</span>');
                }

                $('#miCentroNombre').val(data.Nombre);
                $('#miCentroDireccion').val(data.Direccion);
                $('#miCentroClave').val(data.Clave);
                $('#miCentroCP').val(data.CP);
                $('#miCentroTelefono').val(data.Telefono);
                $('#miCentroColonia').val(data.Colonia);
                $('#miCentroLocalidad').val(data.Localidad);
                $('#miCentroNombreDirector').val(data.NombreDirector);

                logoAlAnonChangeFirst = false;
                LoadingOff();

                $.getJSON("../Media/estados.json", function (estados) {
                    $(estados).each(function (key, value) {
                        $('#miCentroEstado').append("<option value='" + value.clave + "'>" + value.nombre + "</option>");
                    });
                    $('#miCentroEstado').val((data.EstadoIndx !== "--") ? data.EstadoIndx : "-1");
                    if (data.MunicipioIndx !== "--") {
                        $.getJSON("../Media/municipios.json", function (municipios) {
                            $(municipios[$('#miCentroEstado').val()]).each(function (key, value) {
                                $('#miCentroMunicipio').append("<option value='" + value + "'>" + value + "</option>");
                            });
                            $('#miCentroMunicipio').val(data.MunicipioIndx);
                        });
                    }
                });
            } else {
                ErrorLog(data.responseText, "Cargar Mi Centro Info");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Cargar Mi Centro Info");
        }
    });
}

// FUNCION QUE ABRE EL LOGOTIPO PARA VISUALIZARLO
function abrirLogoPers() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/AbrirLogoPers",
        dataType: 'JSON',
        beforeSend: function () {
            LoadingOn("Cargando Logo...");
        },
        success: function (data) {
            if (data.LogoCentro !== undefined) {
                window.open().document.write('<img src="' + data.LogoCentro + '" />');
                LoadingOff();
            } else {
                ErrorLog(data.responseText, "Abrir Logo Pers.");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Abrir Logo Pers.");
        }
    });
}

// FUNCION QUE BORRA EL LOGOTIPO PERSONALIZADO
function borrarLogoPers() {
    MsgPregunta("Borrar Logotipo", "¿Desea continuar?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Configuracion/BorrarLogo",
                beforeSend: function () {
                    LoadingOn("Actualizando Config...");
                },
                success: function (data) {
                    if (data == "true") {
                        logoPersMiCentro = false;
                        $('#divMiCentroEstatusLogoImg').html('<span class="badge badge-danger"><i class="fa fa-times-circle"></i>&nbsp;Sin logo personalizado</span>');
                        logoAlAnonChangeFirst = true;
                        $('#miCentroLogoDefault').bootstrapToggle('on', true);
                        LoadingOff();
                        MsgAlerta("Ok!", "Logo personalizado <b>eliminado correctamente.</b>", 2500, "success");

                        setTimeout(function () {
                            logoAlAnonChangeFirst = false;
                        }, 1500);
                    } else {
                        ErrorLog(data, "Borrar Logo Pers.");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Borrar Logo Pers.");
                }
            });
        }
    });
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA DE  LOGOTIPO [ MI CASA ]
function validarFormLogoPers() {
    var correcto = true, msg = "";
    if ($('#imagenEditor').attr("id") === undefined) {
        msg = "No ha seleccionado una <b>Imagen</b>";
        correcto = false;
    } else if ($('#imagenEditor').width() > 120 || $('#imagenEditor').height() > 120) {
        msg = "Las <b>Dimensiones de la Imagen</b> no son correctas";
        correcto = false;
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2000, "default");
    }
    return correcto;
}

// FUNCION QUE CARGA LOS PARAMETROS DEL MENU DE CATALOGOS [ MENU CATALOGOS ]
function cargarConfigCatalogos() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/ListaModelosTratamiento",
        dataType: 'JSON',
        beforeSend: function () {
            modelosTratamientosJSON = [];
            LoadingOn("Modelos Tratamientos...");
        },
        success: function (data) {
            var tratamientos = "<option value='-1'>- Eliga un Modelo Tratamiento -</option>";
            $(data.Activos).each(function (key, value) {
                tratamientos += "<option value='" + value.IdTratamiento + "'>" + value.NombreTratamiento + "</option>";
                modelosTratamientosJSON.push({
                    IdTratamiento: value.IdTratamiento,
                    NombreTratamiento: value.NombreTratamiento
                });
            });
            $('#modelosTratamientosSelect').html(tratamientos);
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Configuracion/ListaFasesTratamientos",
                dataType: 'JSON',
                beforeSend: function () {
                    fasesTratamientosJSON = [];
                    LoadingOn("Fases Tratamientos...");
                },
                success: function (data) {
                    var fases = "<option value='-1'>- Eliga Fase de Tratamiento -</option>";
                    $(data).each(function (key, value) {
                        fases += "<option value='" + value.IdFase + "'>" + value.FasesNombresTxt + "</option>";
                        fasesTratamientosJSON.push(value);
                    });
                    $('#fasesTratamientosSelect').html(fases);
                    $.ajax({
                        type: "POST",
                        contentType: "application/x-www-form-urlencoded",
                        url: "/Configuracion/ListaEstadosAlerta",
                        dataType: 'JSON',
                        beforeSend: function () {
                            estadosAlertaJSON = [];
                            LoadingOn("Estados Alerta...");
                        },
                        success: function (data) {
                            var estadosalerta = "<option value='-1'>- Eliga un Estado de Alerta -</option>";
                            $(data.Activos).each(function (key, value) {
                                estadosalerta += "<option value='" + value.IdEstadoAlerta + "'>" + value.NombreEstadoAlerta + "</option>";
                                estadosAlertaJSON.push({
                                    IdEstadoAlerta: value.IdEstadoAlerta,
                                    NombreEstadoAlerta: value.NombreEstadoAlerta
                                });
                            });
                            $('#estadosAlertaSelect').html(estadosalerta);
                            $.ajax({
                                type: "POST",
                                contentType: "application/x-www-form-urlencoded",
                                url: "/Configuracion/ListaNivelIntoxicacion",
                                dataType: 'JSON',
                                beforeSend: function () {
                                    nivelesIntoxicacionJSON = [];
                                    LoadingOn("Niveles Intoxicacion...");
                                },
                                success: function (data) {
                                    var nintoxicacion = "<option value='-1'>- Eliga un Nivel de Intoxicación -</option>";
                                    $(data.Activos).each(function (key, value) {
                                        nintoxicacion += "<option value='" + value.IdNivelesIntoxicacion + "'>" + value.NombreNivelIntoxicacion + "</option>";
                                        nivelesIntoxicacionJSON.push({
                                            IdNivelesIntoxicacion: value.IdNivelesIntoxicacion,
                                            NombreNivelIntoxicacion: value.NombreNivelIntoxicacion
                                        });
                                    });
                                    $('#nivelIntoxicacionSelect').html(nintoxicacion);
                                    $.ajax({
                                        type: "POST",
                                        contentType: "application/x-www-form-urlencoded",
                                        url: "/Configuracion/ListaEstadosAnimo",
                                        dataType: 'JSON',
                                        beforeSend: function () {
                                            estadosAnimoJSON = [];
                                            LoadingOn("Estados Animo...");
                                        },
                                        success: function (data) {
                                            var estadoanimo = "<option value='-1'>- Eliga un Estado de Animo -</option>";
                                            $(data.Activos).each(function (key, value) {
                                                estadoanimo += "<option value='" + value.IdEstadoAnimo + "'>" + value.NombreEstadoAnimo + "</option>";
                                                estadosAnimoJSON.push({
                                                    IdEstadoAnimo: value.IdEstadoAnimo,
                                                    NombreEstadoAnimo: value.NombreEstadoAnimo
                                                });
                                            });
                                            $('#estadoAnimoSelect').html(estadoanimo);
                                            LoadingOff();
                                        },
                                        error: function (error) {
                                            ErrorLog(error.responseText, "Lista Estados Animo");
                                        }
                                    });
                                },
                                error: function (error) {
                                    ErrorLog(error.responseText, "Lista Niveles Intoxicacion");
                                }
                            });
                        },
                        error: function (error) {
                            ErrorLog(error.responseText, "Lista Estados Alerta");
                        }
                    });
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Lista Fases Tratamientos");
                }
            });
        },
        error: function (error) {
            ErrorLog(error.responseText, "Lista Modelos Tratamientos");
        }
    });
}

// FUNCION QUE VALIDA EL FORMULARIO DEL MODAL DE FASES
function validarFasesForm() {
    var correcto = true, fases = 0, fasesTxt = true;
    $('.faseNombre').each(function () {
        fases++;
        if ($(this).val() === "") {
            fasesTxt = false;
        }
    });
    if ($('#modalNumFasesTratamiento').val() === "" || parseFloat($('#modalNumFasesTratamiento').val()) === 0) {
        correcto = false;
        MsgAlerta("Atención!", "No tiene configurado <b>parametros</b> para el <b>Nuevo esquema de Fases<b>", 3500, "default");
        $('#modalNumFasesTratamiento').focus();
    }
    if (!fasesTxt) {
        correcto = false;
        MsgAlerta("Atención!", "No deje <b>Nombres de Fases</b> en blanco", 3500, "default");
    }
    if (fases > 0) {
        $('#modalNumFasesTratamiento').val(fases);
    }
    return correcto;
}

// FUNCION QUE CARGA LA  LISTA DE  LOS USUARIOS REGISTRADOS DEL CENTRO [ MENU USUARIOS ]
function cargarUsuarios(inicial) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/CargarUsuarios",
        dataType: 'JSON',
        beforeSend: function () {
            UsuariosListaJSON = [];
            IDUsuariosARRAY = [];
            $('input[name="modalcheckpermisos"]').bootstrapToggle('off');
            $('.toggle-off').css({
                'left' : '39%'
            });
            LoadingOn("Obteniendo Lista Usuarios...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                UsuariosListaJSON = data;
                var tabla = (data.length > 0) ? "" : '<tr><td colSpan="4" style="text-align: center;"><label><i class="fa fa-info-circle"></i>&nbsp;No hay Usuarios registrados</label></td></tr>';
                $(data).each(function (key, value) {
                    var activo = '<span onclick="activarDesactivarUsuario(' + value.IdUsuario + ',0);" class="btn badge badge-pill badge-success" title="Click para Desactivar" style="cursor: pointer;"><i class="fa fa-check-circle"></i></span>';
                    if (value.Activo === 0) {
                        activo = '<span onclick="activarDesactivarUsuario(' + value.IdUsuario + ',1);" class="btn badge badge-pill badge-danger" title="Click para Activar" style="cursor: pointer;"><i class="fa fa-times-circle"></i></span>';
                    }
                    tabla += '<tr><td>' + value.Usuario + '</td><td>' + value.Nombre + " " + value.Apellido + '</td><td style="text-align: center;">' + activo + '</td><td style="text-align: center;"><button class="btn badge badge-pill badge-primary" onclick="editarUsuario(' + value.IdUsuario + ');"><i class="fa fa-edit"></i>&nbsp;Editar</button>&nbsp;&nbsp;<button class="btn badge badge-pill badge-secondary" onclick="nuevaPassUsuario(' + value.IdUsuario + ');"><i class="fa fa-envelope"></i>&nbsp;Nueva Contraseña</button></td></tr>';
                    IDUsuariosARRAY.push(value.Usuario);
                });
                $('#tablaListaUsuarios').html(tabla);
                LoadingOff();

                if (!inicial) {
                    MsgAlerta("Ok!", "Usuario registrado <b>Correctamente</b>", 5000, "success");
                }
            } else {
                ErrorLog(data.responseText, "Obtener Lista Usuarios");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Obtener Lista Usuarios");
        }
    });
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA DE USUARIOS [ MENU USUARIOS ]
function limpiarFormUsuarios() {
    $('.modalNombreUsuario').val('');
    $('input[name="modalcheckpermisos"]').bootstrapToggle('off', true);
}

// FUNCION QUE GENERA UN ID DE USUARIO ALEATORIO [ MENU USUARIOS ]
function generarUsuarioID() {
    var numAl = ""
    do {
        numAl = "usu" + numAleatorio(4);
    } while (IDUsuariosARRAY.includes(numAl));
    return numAl;
}

// FUNCION QUE VALIDA EL FORMULARIO DE USUARIOS [ MENU USUARIOS ]
function validarFormUsuario() {
    var correcto = true;
    if ($('#modalNombreUsuario').val() === "") {
        $('#modalNombreUsuario').focus();
        msg = "Coloque el <b>Nombre</b>";
        correcto = false;
    } else if ($('#modalApellidoUsuario').val() === "") {
        $('#modalApellidoUsuario').focus();
        msg = "Coloque el <b>Apellido</b>";
        correcto = false;
    } else if ($('#modalCorreoUsuario').val() === "") {
        $('#modalCorreoUsuario').focus();
        msg = "Coloque el <b>Correo</b>";
        correcto = false;
    } else if (!esEmail($('#modalCorreoUsuario').val())) {
        $('#modalCorreoUsuario').focus();
        msg = "Dirección de <b>Correo NO valida</b>";
        correcto = false;
    } else {
        UsuarioDataJSON = {
            IdUsuario: IdUsuarioSelecGLOBAL,
            Usuario: UsuarioGeneradoGLOBAL,
            Nombre: $('#modalNombreUsuario').val().toUpperCase(),
            Apellido: $('#modalApellidoUsuario').val().toUpperCase(),
            Correo: $('#modalCorreoUsuario').val(),
            Perfiles: {
                AlAnon: $('#modalUsuAlAnon').is(":checked"),
                CoordDeportiva: $('#modalUsuDeportiva').is(":checked"),
                CoordMedica: $('#modalUsuMedica').is(":checked"),
                CoordPsicologica: $('#modalUsuPsicologica').is(":checked"),
                CoordEspiritual: $('#modalUsuEspiritual').is(":checked"),
                Cord12Pasos: $('#modalUsuDocepasos').is(":checked"),
                Documentacion: $('#modalUsuDocumentacion').is(":checked"),
            }
        };
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2500, "default");
    }
    return correcto;
}

// FUNCION QUE ABRE EL MODAL PARA EDITAR UN USUARIO [ MENU USUARIOS ]
function editarUsuario(idUsuario) {
    limpiarFormUsuarios();
    IdUsuarioSelecGLOBAL = idUsuario;
    $(UsuariosListaJSON).each(function (key, value) {
        if (value.IdUsuario === idUsuario) {
            $('#modalUsuario').html(value.Usuario);
            $('#modalNombreUsuario').val(value.Nombre);
            $('#modalApellidoUsuario').val(value.Apellido);
            $('#modalCorreoUsuario').val(value.Correo);
            var perfiles = value.Perfiles;
            console.log(perfiles);
            $('#modalUsuAlAnon').bootstrapToggle((perfiles.AlAnon) ? 'on' : 'off', true);
            $('#modalUsuDeportiva').bootstrapToggle((perfiles.CoordDeportiva) ? 'on' : 'off', true);
            $('#modalUsuMedica').bootstrapToggle((perfiles.CoordMedica) ? 'on' : 'off', true);
            $('#modalUsuPsicologica').bootstrapToggle((perfiles.CoordPsicologica) ? 'on' : 'off', true);
            $('#modalUsuEspiritual').bootstrapToggle((perfiles.CoordEspiritual) ? 'on' : 'off', true);
            $('#modalUsuDocepasos').bootstrapToggle((perfiles.Cord12Pasos) ? 'on' : 'off', true);
            $('#modalUsuDocumentacion').bootstrapToggle((perfiles.Documentacion) ? 'on' : 'off', true);
        }
    });
    $('#modalUsuarios').modal('show');
}

// FUNCION QUE ABRE UN MODAL PARA GENERAR UNA NUEVA PASS [ MENU USUARIOS ]
function nuevaPassUsuario(idUsuario) {
    IdUsuarioSelecGLOBAL = idUsuario;
    $(UsuariosListaJSON).each(function (key, value) {
        if (value.IdUsuario === idUsuario) {
            $('#modalUsuarioNuevaPass').html(value.Usuario);
            $('#modalNombreNuevaPass').html(value.Nombre + " " + value.Apellido);
            $('#modalCorreoNuevaPass').html(value.Correo);
            UsuarioDataJSON = {
                IdUsuario: IdUsuarioSelecGLOBAL,
                Nombre: value.Nombre + " " + value.Apellido,
                Correo: value.Correo,
            };
        }
    });
    $('#modalNuevaPassUsuario').modal("show");
}

// FUNCION QUE ACTIVA O DESACTIVA UN USUARIO
function activarDesactivarUsuario(idUsuario, actDes) {
    MsgPregunta((actDes > 0) ? "Activar Usuario" : "Desactivar Usuario", "¿Desea Continuar?", function (si) {
        if (si) {
            UsuarioDataJSON = {
                IdUsuario: idUsuario,
                Activo: actDes,
            };
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Configuracion/ActivarDesactivarUsuario",
                data: { UsuarioInfo: UsuarioDataJSON },
                dataType: 'JSON',
                beforeSend: function () {
                    LoadingOn(((actDes > 0) ? "Activado" : "Desactivando") + " Usuario...");
                },
                success: function (data) {
                    if (data.Respuesta) {
                        LoadingOff();
                        cargarUsuarios(true);

                        if (actDes === 0) {
                            notifEnviarDataJSON = {
                                Tipo: "U",
                                NotifCentroId: "--",
                                NotifUsuIds: [data.NotifUsuarioId],
                                AccionPush: "CerrarSesionUsuario",
                                Parametros: {},
                            };
                            pushServidorWEB();
                        }
                    } else {
                        ErrorLog(data.ErrorMsg, "Activar / Desactivar Usuario");
                    }
                },
                error: function (error) {
                    ErrorLog(error.responseText, "Activar / Desactivar Usuario");
                }
            });
        }
    });
}

// FUNCION QUE CARGA LA INFO DEL USUARIOS [ MENU USUARIO INDIVIDUAL ]
function cargarUsuarioIndInfo(inicial) {
    setTimeout(function () {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Configuracion/InfoUsuarioIndividual",
            dataType: 'JSON',
            beforeSend: function () {
                $('.usuarioindtxtform').val('');
                LoadingOn("Cargando Info. Usuario...");
            },
            success: function (data) {
                if (data.IdUsuario !== undefined) {
                    $('#configUsuNombre').val(data.Nombre);
                    $('#configUsuApellido').val(data.Apellido);
                    $('#configUsuCorreo').val(data.Correo);
                    LoadingOff();
                    if (!inicial) {
                        MsgAlerta("Ok!", "Información actualizada <b>Correctamente</b>", 5000, "success");
                    }
                } else {
                    ErrorLog(data, "Obtener Info. Usuario");
                }
            },
            error: function (error) {
                ErrorLog(error, "Obtener Info. Usuario");
            }
        });
    }, 1200);
}

// FUNCION QUE VALIDA EL FORMULARIO DE USUARIO INDIVIDUAL [ MENU USUARIO INDIVIDUAL ]
function validarFormUsuarioInd() {
    var correcto = true, msg = "";
    if ($('#configUsuNombre').val() === "") {
        correcto = false;
        msg = "Coloque el <b>Nombre</b>";
        $('#configUsuNombre').focus();
    } else if ($('#configUsuApellido').val() === "") {
        correcto = false;
        msg = "Coloque el <b>Apellido</b>";
        $('#configUsuApellido').focus();
    } else if ($('#configUsuCorreo').val() === "") {
        correcto = false;
        msg = "Coloque el <b>Correo</b>";
        $('#configUsuCorreo').focus();
    } else if (!esEmail($('#configUsuCorreo').val())) {
        correcto = false;
        msg = "Formato de <b>Correo</b> es <b>Inválido</b>";
        $('#configUsuCorreo').focus();
    } else {
        UsuarioDataJSON = {
            Nombre: $('#configUsuNombre').val().toUpperCase(),
            Apellido: $('#configUsuApellido').val().toUpperCase(),
            Correo: $('#configUsuCorreo').val(),
        };
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL FORMULARIO DE CAMBIO DE CONTRASEÑA [ MENU USUARIO INDIVIDUAL ]
function validarFormUsuNuevaPass() {
    var correcto = true, msg = "";
    if ($('#configUsuNuevaPass').val() === "") {
        correcto = false;
        msg = "Coloque la <b>Nueva Contraseña</b>";
        $('#configUsuNuevaPass').focus();
    } else if (($('#configUsuConfirmPass').val() === "")) {
        correcto = false;
        msg = "Coloque <b>Repetir Contraseña</b>";
        $('#configUsuConfirmPass').focus();
    } else if (($('#configUsuAntPass').val() === "")) {
        correcto = false;
        msg = "Coloque la <b>Antigua Contraseña</b>";
        $('#configUsuAntPass').focus();
    } else if ($('#configUsuNuevaPass').val() !== $('#configUsuConfirmPass').val()) {
        correcto = false;
        msg = "La <b>Nueva Contraseña</b> y la <b>Confirmación</b> NO coinciden";
        $('#configUsuConfirmPass').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
    } else {
        UsuarioDataJSON = {
            NuevaPass: $('#configUsuNuevaPass').val(),
            AntiguaPass: $('#configUsuAntPass').val(),
        };
    }
    return correcto;
}
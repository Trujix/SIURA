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

var ArchivoImgLogoPers;

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
            LoadingOff();
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
        micentro: "MiCentro"
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
            if (opcion === "documentos") {
                cargarDocumentos(false);
            } else if (opcion === "micentro") {
                cargarMiCentroInfo();
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
    $.ajax({
        type: "POST",
        url: "/Configuracion/EnviarCorreoDocsInf",
        data: { Correo: $('#modalTextMailDocInf').val() },
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
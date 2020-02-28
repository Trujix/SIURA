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
        documentos: "Documentos"
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
            cargarDocumentos(false);
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Config Docs");
        }
    });
});

// -------------- [ OPCION - DOCUMENTOS ] --------------
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

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO INFORMATIVO
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

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO
$(document).on('click', '#archivoBtnDocInf', function () {
    $('#archivoDocInf').click();
});

// DOCUMENT - BOTON QUE ENVIA EL CORREO CON LOS [ DOCS INFORMATIVOS ]
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

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS DEL MENU [ DOCUMENTOS ]
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

// FUNCION QUE ABRE LOS DOCUMENTOS EN NUEVA PESTAÑA DIRECTO DEL NAVEGADOR
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
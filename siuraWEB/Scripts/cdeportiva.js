// ********************************************************
// ARCHIVO JAVASCRIPT CMEDICA.JS (COORDINACION MEDICA)

// --------------------------------------------------------
// VARIABLES GLOBALES
var ArchivoDocInformativoCD;
var ArchivoDocInformativoDATACD = {
    Nombre: "",
    Extension: ""
};
var ListaUrlsDocsDeportivo = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL LA BARRA DE OPCIONES
$(document).on('click', 'a[name="opcCDep"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        archivero: "Archivero",
        inventario: "Inventario",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CDeportiva/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuCDeportiva').html(data);
            LoadingOff();
            if (opcion === "archivero") {
                cargarDocumentosCD(false);
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Coord. Deportiva");
        }
    });
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ ARCHIVERO ]
$(document).on('change', '#archivoDocInfCD', function (e) {
    ArchivoDocInformativoCD = $(this).prop('files')[0];
    if (ArchivoDocInformativoCD !== undefined) {
        var nombre = ArchivoDocInformativoCD.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        var tipoArchivo = verifExtensionArchIcono(extension);

        $('#iconoDocInfCD').css("color", tipoArchivo.color);
        $('#iconoDocInfCD').html("<i class='" + tipoArchivo.icono + "'></i>&nbsp;" + tipoArchivo.descripcion);

        $('#nombreDocInfCD').focus();

        ArchivoDocInformativoDATACD.Nombre = nombre;
        ArchivoDocInformativoDATACD.Extension = extension;
    } else {
        $('#iconoDocInfCD').html("");
        $('#nombreDocInfCD').val('');
    }
});

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO [ ARCHIVERO ]
$(document).on('click', '#archivoBtnDocInfCD', function () {
    $('#archivoDocInfCD').click();
});

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO [ ARCHIVERO ]
$(document).on('click', '#btnGuardarDocInfCD', function () {
    if (validarFormDocCD()) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: $('#nombreDocInfCD').val(),
            NombreArchivo: $('#nombreDocInfCD').val().toLowerCase().replace(/ /g, "_").replace(/á/g, "").replace(/é/g, "").replace(/í/g, "").replace(/ó/g, "").replace(/ú/g, ""),
            Extension: ArchivoDocInformativoDATACD.Extension
        };
        archivoData.append("Archivo", ArchivoDocInformativoCD);
        archivoData.append("Info", JSON.stringify(archivoInfo));

        $.ajax({
            type: "POST",
            url: "/CDeportiva/AltaDocCDeportiva",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    $('#nombreDocInfCD').val('');
                    cargarDocumentosCD(true);
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

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DE LOS INVENTARIOS [ INVENTARIOS ]
$(document).on('click', '#btnObtenerInventarioCD', function () {
    consultarInventarios('divTablaCD', 'CD', function () {
        LoadingOff();
    });
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA AGREGAR NUEVO ELEMENTO AL INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btnNuevoInventarioCD', function () {
    if ($('#divTablaCD').prop('innerHTML') !== "") {
        abrirModalAltaInventario(true);
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA IMPRIMIR UN REPORTE DE INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btImprimirInventarioCD', function () {
    if ($('#divTablaCD').prop('innerHTML') !== "") {
        abrirModalInventarioImprimir();
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS INICIALES DEL [ ARCHIVERO ]
function cargarDocumentosCD(msg) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CDeportiva/ListaDocsCDeportiva",
        dataType: "JSON",
        beforeSend: function () {
            ListaUrlsDocsDeportivo = {};
        },
        success: function (data) {
            var i = 0;
            var docsInfHTML = (data.DocsInformativos.length > 0) ? "" : "<div class='col-sm-12' style='text-align: center;'><h2 style='color: #95A5A6;'><i class='fa fa-exclamation'></i>&nbsp;No tiene archivos agregados aún.</h2></div>";
            $(data.DocsInformativos).each(function (key, value) {
                var archivoInfo = verifExtensionArchIcono(value.Extension);
                docsInfHTML += "<div class='col-sm-1' style='text-align: center;'><h1 class='" + archivoInfo.icono + "' style='color: #95A5A6; cursor: pointer;' onclick='configAbrirDocumentoCD(" + i + ")'></h1><p></p><label><b>" + value.Nombre + "</b></label></div>";
                ListaUrlsDocsDeportivo["doc_" + i.toString()] = data.UrlFolderCliente + value.Archivo + "." + value.Extension;
                i++;
            });

            $('#divDocsInformativosCD').html(docsInfHTML);
            UrlFolderUsuario = data.UrlFolderCliente;
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

// FUNCION QUE ABRE LOS DOCUMENTOS EN NUEVA PESTAÑA DIRECTO DEL NAVEGADOR  [ ARCHIVERO ]
function configAbrirDocumentoCD(id) {
    window.open(ListaUrlsDocsDeportivo["doc_" + id.toString()], '_blank');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA [ ARCHIVERO ]
function validarFormDocCD() {
    var verifArchivo = $('#archivoDocInfCD').prop('files')[0];
    var respuesta = true;
    if (verifArchivo === undefined) {
        respuesta = false;
        MsgAlerta("Atención!", "No ha seleccionado <b>un archivo</b>", 2000, "default");
    } else if ($('#nombreDocInfCD').val() === "") {
        respuesta = false;
        $('#nombreDocInfCD').focus();
        MsgAlerta("Atención!", "Coloque el <b>nombre del archivo</b>", 2000, "default");
    }
    return respuesta;
}
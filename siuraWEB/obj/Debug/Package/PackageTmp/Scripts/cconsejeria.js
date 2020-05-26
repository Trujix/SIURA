// ********************************************************
// ARCHIVO JAVASCRIPT CCONSEJERIA.JS (COORDINACION CONSEJERIA)

// --------------------------------------------------------
// VARIABLES GLOBALES
var ArchivoDocInformativoCC;
var ArchivoDocInformativoDATACC = {
    Nombre: "",
    Extension: ""
};
var ListaUrlsDocsConsejeria = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL LA BARRA DE OPCIONES
$(document).on('click', 'a[name="opcCCon"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        archivero: "Archivero",
        inventario: "Inventario",
        nuevosingresos: "NuevosIngresos",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CConsejeria/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuCConsejeria').html(data);
            LoadingOff();
            if (opcion === "archivero") {
                cargarDocumentosCC(false);
            } else if (opcion === "nuevosingresos") {
                $('#btnObtenerListaNIngresosCC').click();
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Coord. Consejeria");
        }
    });
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ ARCHIVERO ]
$(document).on('change', '#archivoDocInfCC', function (e) {
    ArchivoDocInformativoCC = $(this).prop('files')[0];
    if (ArchivoDocInformativoCC !== undefined) {
        var nombre = ArchivoDocInformativoCC.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        var tipoArchivo = verifExtensionArchIcono(extension);

        $('#iconoDocInfCC').css("color", tipoArchivo.color);
        $('#iconoDocInfCC').html("<i class='" + tipoArchivo.icono + "'></i>&nbsp;" + tipoArchivo.descripcion);

        $('#nombreDocInfCC').focus();

        ArchivoDocInformativoDATACC.Nombre = nombre;
        ArchivoDocInformativoDATACC.Extension = extension;
    } else {
        $('#iconoDocInfCC').html("");
        $('#nombreDocInfCC').val('');
    }
});

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO [ ARCHIVERO ]
$(document).on('click', '#archivoBtnDocInfCC', function () {
    $('#archivoDocInfCC').click();
});

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO [ ARCHIVERO ]
$(document).on('click', '#btnGuardarDocInfCC', function () {
    if (validarFormDocCC()) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: $('#nombreDocInfCC').val(),
            NombreArchivo: $('#nombreDocInfCC').val().toLowerCase().replace(/ /g, "_").replace(/á/g, "").replace(/é/g, "").replace(/í/g, "").replace(/ó/g, "").replace(/ú/g, ""),
            Extension: ArchivoDocInformativoDATACC.Extension
        };
        archivoData.append("Archivo", ArchivoDocInformativoCC);
        archivoData.append("Info", JSON.stringify(archivoInfo));

        $.ajax({
            type: "POST",
            url: "/CConsejeria/AltaDocCConsejeria",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    $('#nombreDocInfCC').val('');
                    cargarDocumentosCC(true);
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
$(document).on('click', '#btnObtenerInventarioCC', function () {
    consultarInventarios('divTablaCC', 'CC', function () {
        LoadingOff();
    });
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA AGREGAR NUEVO ELEMENTO AL INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btnNuevoInventarioCC', function () {
    if ($('#divTablaCC').prop('innerHTML') !== "") {
        abrirModalAltaInventario(true);
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA IMPRIMIR UN REPORTE DE INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btImprimirInventarioCC', function () {
    if ($('#divTablaCC').prop('innerHTML') !== "") {
        abrirModalInventarioImprimir();
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENTO - BOTON QUE CONTROLA EL LLAMADO DE LA TABLA DE PACIENTES NUEVOS [ NUEVOS INGRESOS ]
$(document).on('click', '#btnObtenerListaNIngresosCC', function () {
    llenarListaNuevosIngresos('CC', function () {
        LoadingOff();
    });
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS INICIALES DEL [ ARCHIVERO ]
function cargarDocumentosCC(msg) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CConsejeria/ListaDocsCConsejeria",
        dataType: "JSON",
        beforeSend: function () {
            ListaUrlsDocsConsejeria = {};
        },
        success: function (data) {
            var i = 0;
            var docsInfHTML = (data.DocsInformativos.length > 0) ? "" : "<div class='col-sm-12' style='text-align: center;'><h2 style='color: #95A5A6;'><i class='fa fa-exclamation'></i>&nbsp;No tiene archivos agregados aún.</h2></div>";
            $(data.DocsInformativos).each(function (key, value) {
                var archivoInfo = verifExtensionArchIcono(value.Extension);
                docsInfHTML += "<div class='col-sm-1' style='text-align: center;'><h1 class='" + archivoInfo.icono + "' style='color: #95A5A6; cursor: pointer;' onclick='configAbrirDocumentoCC(" + i + ")'></h1><p></p><label><b>" + value.Nombre + "</b></label></div>";
                ListaUrlsDocsConsejeria["doc_" + i.toString()] = data.UrlFolderCliente + value.Archivo + "." + value.Extension;
                i++;
            });

            $('#divDocsInformativosCC').html(docsInfHTML);
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
function configAbrirDocumentoCC(id) {
    window.open(ListaUrlsDocsConsejeria["doc_" + id.toString()], '_blank');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA [ ARCHIVERO ]
function validarFormDocCC() {
    var verifArchivo = $('#archivoDocInfCC').prop('files')[0];
    var respuesta = true;
    if (verifArchivo === undefined) {
        respuesta = false;
        MsgAlerta("Atención!", "No ha seleccionado <b>un archivo</b>", 2000, "default");
    } else if ($('#nombreDocInfCC').val() === "") {
        respuesta = false;
        $('#nombreDocInfCC').focus();
        MsgAlerta("Atención!", "Coloque el <b>nombre del archivo</b>", 2000, "default");
    }
    return respuesta;
}
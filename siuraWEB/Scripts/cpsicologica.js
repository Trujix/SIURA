// ********************************************************
// ARCHIVO JAVASCRIPT CMEDICA.JS (COORDINACION MEDICA)

// --------------------------------------------------------
// VARIABLES GLOBALES
var ArchivoDocInformativoCP;
var ArchivoDocInformativoDATACP = {
    Nombre: "",
    Extension: ""
};
var ListaUrlsDocsPsicologo = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL LA BARRA DE OPCIONES
$(document).on('click', 'a[name="opcCPsi"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        archivero: "Archivero",
        inventario: "Inventario",
        nuevosingresos: "NuevosIngresos",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CPsicologica/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuCPsicologica').html(data);
            LoadingOff();
            if (opcion === "archivero") {
                cargarDocumentosCP(false);
            } else if (opcion === "nuevosingresos") {
                $('#btnObtenerListaNIngresosCP').click();
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Coord. Psicologica");
        }
    });
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ ARCHIVERO ]
$(document).on('change', '#archivoDocInfCP', function (e) {
    ArchivoDocInformativoCP = $(this).prop('files')[0];
    if (ArchivoDocInformativoCP !== undefined) {
        var nombre = ArchivoDocInformativoCP.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        var tipoArchivo = verifExtensionArchIcono(extension);

        $('#iconoDocInfCP').css("color", tipoArchivo.color);
        $('#iconoDocInfCP').html("<i class='" + tipoArchivo.icono + "'></i>&nbsp;" + tipoArchivo.descripcion);

        $('#nombreDocInfCP').focus();

        ArchivoDocInformativoDATACP.Nombre = nombre;
        ArchivoDocInformativoDATACP.Extension = extension;
    } else {
        $('#iconoDocInfCP').html("");
        $('#nombreDocInfCP').val('');
    }
});

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO [ ARCHIVERO ]
$(document).on('click', '#archivoBtnDocInfCP', function () {
    $('#archivoDocInfCP').click();
});

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO [ ARCHIVERO ]
$(document).on('click', '#btnGuardarDocInfCP', function () {
    if (validarFormDocCP()) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: $('#nombreDocInfCP').val(),
            NombreArchivo: $('#nombreDocInfCP').val().toLowerCase().replace(/ /g, "_").replace(/á/g, "").replace(/é/g, "").replace(/í/g, "").replace(/ó/g, "").replace(/ú/g, ""),
            Extension: ArchivoDocInformativoDATACP.Extension
        };
        archivoData.append("Archivo", ArchivoDocInformativoCP);
        archivoData.append("Info", JSON.stringify(archivoInfo));

        $.ajax({
            type: "POST",
            url: "/CPsicologica/AltaDocCPsicologica",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    $('#nombreDocInfCP').val('');
                    cargarDocumentosCP(true);
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
$(document).on('click', '#btnObtenerInventarioCP', function () {
    consultarInventarios('divTablaCP', 'CP', function () {
        LoadingOff();
    });
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA AGREGAR NUEVO ELEMENTO AL INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btnNuevoInventarioCP', function () {
    if ($('#divTablaCP').prop('innerHTML') !== "") {
        abrirModalAltaInventario(true);
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA IMPRIMIR UN REPORTE DE INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btImprimirInventarioCP', function () {
    if ($('#divTablaCP').prop('innerHTML') !== "") {
        abrirModalInventarioImprimir();
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENTO - BOTON QUE CONTROLA EL LLAMADO DE LA TABLA DE PACIENTES NUEVOS [ NUEVOS INGRESOS ]
$(document).on('click', '#btnObtenerListaNIngresosCP', function () {
    llenarListaNuevosIngresos('CP', function () {
        LoadingOff();
    });
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS INICIALES DEL [ ARCHIVERO ]
function cargarDocumentosCP(msg) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CPsicologica/ListaDocsCPsicologica",
        dataType: "JSON",
        beforeSend: function () {
            ListaUrlsDocsPsicologo = {};
        },
        success: function (data) {
            var i = 0;
            var docsInfHTML = (data.DocsInformativos.length > 0) ? "" : "<div class='col-sm-12' style='text-align: center;'><h2 style='color: #95A5A6;'><i class='fa fa-exclamation'></i>&nbsp;No tiene archivos agregados aún.</h2></div>";
            $(data.DocsInformativos).each(function (key, value) {
                var archivoInfo = verifExtensionArchIcono(value.Extension);
                docsInfHTML += "<div class='col-sm-1' style='text-align: center;'><h1 class='" + archivoInfo.icono + "' style='color: #95A5A6; cursor: pointer;' onclick='configAbrirDocumentoCP(" + i + ")'></h1><p></p><label><b>" + value.Nombre + "</b></label></div>";
                ListaUrlsDocsPsicologo["doc_" + i.toString()] = data.UrlFolderCliente + value.Archivo + "." + value.Extension;
                i++;
            });

            $('#divDocsInformativosCP').html(docsInfHTML);
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
function configAbrirDocumentoCP(id) {
    window.open(ListaUrlsDocsPsicologo["doc_" + id.toString()], '_blank');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA [ ARCHIVERO ]
function validarFormDocCP() {
    var verifArchivo = $('#archivoDocInfCP').prop('files')[0];
    var respuesta = true;
    if (verifArchivo === undefined) {
        respuesta = false;
        MsgAlerta("Atención!", "No ha seleccionado <b>un archivo</b>", 2000, "default");
    } else if ($('#nombreDocInfCP').val() === "") {
        respuesta = false;
        $('#nombreDocInfCP').focus();
        MsgAlerta("Atención!", "Coloque el <b>nombre del archivo</b>", 2000, "default");
    }
    return respuesta;
}
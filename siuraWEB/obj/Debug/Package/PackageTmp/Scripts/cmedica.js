// ********************************************************
// ARCHIVO JAVASCRIPT CMEDICA.JS (COORDINACION MEDICA)

// --------------------------------------------------------
// VARIABLES GLOBALES
var ArchivoDocInformativoCM;
var ArchivoDocInformativoDATACM = {
    Nombre: "",
    Extension: ""
};
var ListaUrlsDocsMedico = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - MANEJA EL LA BARRA DE OPCIONES
$(document).on('click', 'a[name="opcCMed"]', function () {
    var opcion = $(this).attr("opcion");
    var opciones = {
        archivero: "Archivero",
        inventario: "Inventario",
        nuevosingresos: "NuevosIngresos",
    };
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CMedica/" + opciones[opcion],
        beforeSend: function () {
            LoadingOn("Por favor espere...");
        },
        success: function (data) {
            $('#divMenuCMedica').html(data);
            LoadingOff();
            if (opcion === "archivero") {
                cargarDocumentosCM(false);
            } else if (opcion === "nuevosingresos") {
                $('#btnObtenerListaNIngresosCM').click();
            }
        },
        error: function (error) {
            ErrorLog(error, "Abrir Menu Coord. Médica");
        }
    });
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ ARCHIVERO ]
$(document).on('change', '#archivoDocInfCM', function (e) {
    ArchivoDocInformativoCM = $(this).prop('files')[0];
    if (ArchivoDocInformativoCM !== undefined) {
        var nombre = ArchivoDocInformativoCM.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        var tipoArchivo = verifExtensionArchIcono(extension);

        $('#iconoDocInfCM').css("color", tipoArchivo.color);
        $('#iconoDocInfCM').html("<i class='" + tipoArchivo.icono + "'></i>&nbsp;" + tipoArchivo.descripcion);

        $('#nombreDocInfCM').focus();

        ArchivoDocInformativoDATACM.Nombre = nombre;
        ArchivoDocInformativoDATACM.Extension = extension;
    } else {
        $('#iconoDocInfCM').html("");
        $('#nombreDocInfCM').val('');
    }
});

// DOCUMENT  - BOTON QUE CONTROLA EL INPUT PARA SUBIR ARCHIVO [ ARCHIVERO ]
$(document).on('click', '#archivoBtnDocInfCM', function () {
    $('#archivoDocInfCM').click();
});

// DOCUMENT - CONTROLA EL BOTON DE GUARDADO DEL DOCUMENTO [ ARCHIVERO ]
$(document).on('click', '#btnGuardarDocInfCM', function () {
    if (validarFormDocCM()) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: $('#nombreDocInfCM').val(),
            NombreArchivo: $('#nombreDocInfCM').val().toLowerCase().replace(/ /g, "_").replace(/á/g, "").replace(/é/g, "").replace(/í/g, "").replace(/ó/g, "").replace(/ú/g, ""),
            Extension: ArchivoDocInformativoDATACM.Extension
        };
        archivoData.append("Archivo", ArchivoDocInformativoCM);
        archivoData.append("Info", JSON.stringify(archivoInfo));

        $.ajax({
            type: "POST",
            url: "/CMedica/AltaDocCMedica",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn();
            },
            success: function (data) {
                if (data === "true") {
                    $('#nombreDocInfCM').val('');
                    cargarDocumentosCM(true);
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
$(document).on('click', '#btnObtenerInventarioCM', function () {
    consultarInventarios('divTablaCM', 'CM', function () {
        LoadingOff();
    });
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA AGREGAR NUEVO ELEMENTO AL INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btnNuevoInventarioCM', function () {
    if ($('#divTablaCM').prop('innerHTML') !== "") {
        abrirModalAltaInventario(true);
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }  
});

// DOCUMENT - BOTON QUE CONTROLA EL LLAMADO DEL MODAL PARA IMPRIMIR UN REPORTE DE INVENTARIO [ INVENTARIOS ]
$(document).on('click', '#btImprimirInventarioCM', function () {
    if ($('#divTablaCM').prop('innerHTML') !== "") {
        abrirModalInventarioImprimir();
    } else {
        MsgAlerta("Atención!", "No ha cargado la <b>Lista de Inventario</b>", 3000, "default");
    }
});

// DOCUMENTO - BOTON QUE CONTROLA EL LLAMADO DE LA TABLA DE PACIENTES NUEVOS [ NUEVOS INGRESOS ]
$(document).on('click', '#btnObtenerListaNIngresosCM', function () {
    llenarListaNuevosIngresos('CM', function () {
        LoadingOff();
    });
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS INICIALES DEL [ ARCHIVERO ]
function cargarDocumentosCM(msg) {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/CMedica/ListaDocsCMedica",
        dataType: "JSON",
        beforeSend: function () {
            ListaUrlsDocsMedico = {};
        },
        success: function (data) {
            var i = 0;
            var docsInfHTML = (data.DocsInformativos.length > 0) ? "" : "<div class='col-sm-12' style='text-align: center;'><h2 style='color: #95A5A6;'><i class='fa fa-exclamation'></i>&nbsp;No tiene archivos agregados aún.</h2></div>";
            $(data.DocsInformativos).each(function (key, value) {
                var archivoInfo = verifExtensionArchIcono(value.Extension);
                docsInfHTML += "<div class='col-sm-1' style='text-align: center;'><h1 class='" + archivoInfo.icono + "' style='color: #95A5A6; cursor: pointer;' onclick='configAbrirDocumentoCM(" + i + ")'></h1><p></p><label><b>" + value.Nombre + "</b></label></div>";
                ListaUrlsDocsMedico["doc_" + i.toString()] = data.UrlFolderCliente + value.Archivo + "." + value.Extension;
                i++;
            });

            $('#divDocsInformativosCM').html(docsInfHTML);
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
function configAbrirDocumentoCM(id) {
    window.open(ListaUrlsDocsMedico["doc_" + id.toString()], '_blank');
}

// FUNCION QUE VALIDA EL FORMULARIO DE ALTA [ ARCHIVERO ]
function validarFormDocCM() {
    var verifArchivo = $('#archivoDocInfCM').prop('files')[0];
    var respuesta = true;
    if (verifArchivo === undefined) {
        respuesta = false;
        MsgAlerta("Atención!", "No ha seleccionado <b>un archivo</b>", 2000, "default");
    } else if ($('#nombreDocInfCM').val() === "") {
        respuesta = false;
        $('#nombreDocInfCM').focus();
        MsgAlerta("Atención!", "Coloque el <b>nombre del archivo</b>", 2000, "default");
    }
    return respuesta;
}
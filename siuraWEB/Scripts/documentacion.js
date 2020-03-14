// ********************************************************
// ARCHIVO JAVASCRIPT DOCUMENTACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var registroPacienteJSON = {};
var registroIngresoJSON = {};
var registroPacienteFinanzasJSON = {};

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - BOTON QUE INICIA UN NUEVO REGISTRO DE UN PACIENTE ()
$(document).on('click', '#btnNuevoRegistro', function () {
    MsgPregunta("Atención!", "¿Desea iniciar un nuevo registro de un paciente?", function (si) {
        if (si) {
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Documentacion/NuevoPaciente",
                beforeSend: function () {
                    LoadingOn("Abriendo formulario");
                },
                success: function (data) {
                    $('#divPacienteDatos').html(data);
                    $('#pacienteRegistroBecario').bootstrapToggle('off');
                    $('#contratoVoluntario').click();
                    nuevoPacienteParams();
                    LoadingOff();
                },
                error: function (error) {
                    ErrorLog(error, "Cargar Formulario Nuevo Paciente");
                }
            });
        }
    });
});

// DOCUMENT - CONTROLA LAS ACCIONES DEL CHECKBOX PARA HABILITAR SI ES BECARIO O NO EN [ PACIENTE REGISTRO ]
$(document).on('change', '#pacienteRegistroBecario', function () {
    $('#pacienteRegistroPago').val('');
    if ($(this).is(":checked")) {
        $('#pacienteRegistroPago').attr("disabled", "");
    } else {
        $('#pacienteRegistroPago').removeAttr("disabled");
    }
});

// DOCUMENT - BOTON QUE GUARDA EL [ REGISTRO DEL PACIENTE ]
$(document).on('click', '#btnRegistroPacienteGuardar', function () {
    MsgPregunta("Registrar Paciente", "¿Los datos ingresados son correctos?", function (si) {
        if (si) {
            generarPacienteDataV1();
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Documentacion/GuardarPaciente",
                data: { PacienteInfo: registroPacienteJSON, PacienteIngreso: registroIngresoJSON, PacienteFinanzas: registroPacienteFinanzasJSON },
                dataType: 'JSON',
                beforeSend: function () {
                    LoadingOn("Guardando Paciente...");
                },
                success: function (data) {
                    if (Array.isArray(data)) {
                        try {
                            var logoIMG = JSON.parse(data[0]);
                            var jsonContrato = JSON.parse(data[1]);
                            $('#divPacienteDatos').html('');
                            LoadingOff();
                            MsgAlerta("Ok!", "Paciente registrado <b>correctamente</b>", 2000, "success");
                            if (jsonContrato.TipoContrato === "I") {
                                imprimirContratoCI(jsonContrato, logoIMG.LogoCentro);
                            } else if (jsonContrato.TipoContrato === "V") {
                                imprimirContratoCV(jsonContrato, logoIMG.LogoCentro);
                            }
                        } catch (e) {
                            ErrorLog(e.toString(), "Registrar Paciente");
                        }
                    } else {
                        ErrorLog(data.responseText , "Registrar Paciente");
                    }
                },
                error: function (error) {
                    ErrorLog(error.responseText , "Registrar Paciente");
                }
            });
        }
    });
});

// DOCUMENT - BOTON QUE CANCELA EL GUARDADO DEL PACIENTE [ REGISTRO DEL PACIENTE ]
$(document).on('click', '#btnRegistroPacienteCancelar', function () {
    MsgPregunta("Atención!", "¿Desea cancelar el nuevo registro?", function (si) {
        if (si) {
            $('#divPacienteDatos').html('');
        }
    });
});

// DOCUMENT - BOTON QUE ABRE UN MODAL DE BUSQUEDA DE PACIENTES
$(document).on('click', '#btnConsultarRegistro', function () {
    estatusPacienteConsulta = 0;
    consultarPacientes();
});

// DOCUMENT - INPUT QUE CONTROLA UNA ACCION AUXILIAR QUE CALCULA LA EDAD DE UN PACIENTE (DEBE ESTAR PUESTA UNA FECHA DE NACIMIENTO) [ REGISTRO DEL PACIENTE ]
$(document).on('click focus', '#edadPaciente', function () {
    if ($('#nacimientoPaciente').val() !== "") {
        var nac = $('#nacimientoPaciente').val().split("-");
        $('#edadPaciente').val(calcularEdad(nac[1] + "/" + nac[2] + "/" + nac[0]));
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA REIMPRESION DE UN CONTRATO [ REGISTRO DE PACIENTES ] ¿ANEXO¿ - [ DINAMICOS ]
$(document).on('click', '.reimprimircontrato', function () {
    var idPaciente = parseInt($(this).attr("idpaciente"));
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Documentacion/ReimprimirContrato",
        data: { IDPaciente: idPaciente },
        dataType: 'JSON',
        beforeSend: function () {
            LoadingOn("Generando documento...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                try {
                    var logoIMG = JSON.parse(data[0]);
                    var jsonContrato = JSON.parse(data[1]);
                    LoadingOff();
                    if (jsonContrato.TipoContrato === "I") {
                        imprimirContratoCI(jsonContrato, logoIMG.LogoCentro);
                    } else if (jsonContrato.TipoContrato === "V") {
                        imprimirContratoCV(jsonContrato, logoIMG.LogoCentro);
                    }
                } catch (e) {
                    ErrorLog(e.toString(), "Reimprimir Contrato");
                }
            } else {
                ErrorLog(error.responseText, "Reimprimir Contrato");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Reimprimir Contrato");
        }
    });
});

// DOCUMENT - SELECT QUE CONTROLA LA SELECCION DE UN MODELO PARA TRAER ESQUEMAS DE FASES [ REGISTRO PREVIO ]
$(document).on('change', '#pacienteModeloTratamiento', function () {
    /*if (parseFloat($(this).val()) > 0) {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Configuracion/ListaFasesTratIdModelo",
            dataType: 'JSON',
            data: { IdModelo: parseInt($('#pacienteModeloTratamiento').val()) },
            beforeSend: function () {
                LoadingOn("Cargando Parametros...");
            },
            success: function (data) {
                console.log(data);
                LoadingOff();
            },
            error: function (error) {
                ErrorLog(error.responseText, "Lista Fases Tratamientos");
            }
        });
    }*/
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE CARGA PARAMETROS DE NUEVO PACIENTE [ PRE-REGISTRO DE PACIENTE ] - [ REGISTRO PREVIO ]
function nuevoPacienteParams() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Configuracion/ListaModelosTratamiento",
        dataType: 'JSON',
        beforeSend: function () {
            LoadingOn("Cargando Parametros...");
        },
        success: function (data) {
            $(data.Activos).each(function (key, value) {
                $('#pacienteModeloTratamiento').append("<option value='" + value.IdTratamiento + "'>" + value.NombreTratamiento + "</option>");
            });
            LoadingOff();
        },
        error: function (error) {
            ErrorLog(error.responseText, "Lista Modelos Tratamientos");
        }
    });
}

// FUNCION QUE EMPAQUETA LOS DATOS EN EL JSON PARA GUARDAR REGISTRO PACIENTE [ FASE DE COBRO ]
function generarPacienteDataV1() {
    //registroPacienteFinanzasJSON = {};
    /*var estatus = 0;
    if ($('#pacienteRegistroBecario').is(":checked")) {
        estatus = 2;
    } else {
        estatus = 1;

        registroPacienteFinanzasJSON = {
            MontoPagar: parseFloat($('#pacienteRegistroPago').val())
        };
    }*/
    registroPacienteJSON = {
        Nombre: ($('#ingresoPacienteNombre').val().trim() !== "") ? $('#ingresoPacienteNombre').val().trim().trim() : "--",
        PacienteApellidoP: ($('#ingresoPacienteApellidoP').val() !== "") ? $('#ingresoPacienteApellidoP').val().trim() : "--",
        PacienteApellidoM: ($('#ingresoPacienteApellidoM').val() !== "") ? $('#ingresoPacienteApellidoM').val().trim() : "--",
        PacienteFechaNac: ($('#nacimientoPaciente').val() !== "") ? $('#nacimientoPaciente').val() : "--",
        Edad: (parseInt($('#edadPaciente').val()) > 0) ? parseInt($('#edadPaciente').val()) : 0,
        Sexo: $('#sexoPaciente option:selected').text(),
        SexoSigno: $('#sexoPaciente').val(),
        CURP: ($('#curpPaciente').val() !== "") ? $('#curpPaciente').val() : "--",
        PacienteAlias: ($('#apodoPaciente').val() !== "") ? $('#apodoPaciente').val() : "--",
        ParienteNombre: ($('#ingresoParienteNombre').val().trim() !== "") ? $('#ingresoParienteNombre').val().trim() : "--",
        ParienteApellidoP: ($('#ingresoParienteApellidoP').val().trim() !== "") ? $('#ingresoParienteApellidoP').val().trim() : "--",
        ParienteApellidoM: ($('#ingresoParienteApellidoM').val().trim() !== "") ? $('#ingresoParienteApellidoM').val().trim() : "--",
        ParentescoIndx: $('#parentescoPaciente').val(),
        Parentesco: $('#parentescoPaciente option:selected').text(),
        TelefonoCasa: (parseFloat($('#ingresoTelefonoCasa').val()) > 0) ? parseFloat($('#ingresoTelefonoCasa').val()) : 0,
        TelefonoPariente: (parseFloat($('#ingresoTelefonoPariente').val()) > 0) ? parseFloat($('#ingresoTelefonoPariente').val()) : 0,
        TelefonoUsuario: (parseFloat($('#ingresoTelefonoUsuario').val()) > 0) ? parseFloat($('#ingresoTelefonoUsuario').val()) : 0,
        Estatus: /*estatus*/1
    };
    var tipoIngreso = "";
    $('input[name="contratoradio"]').each(function () {
        if ($(this).is(":checked")) {
            tipoIngreso = $(this).attr("opcion");
        }
    });
    registroIngresoJSON = {
        TipoIngreso: tipoIngreso,
        TiempoEstancia: (parseInt($('#tiempoEstanciaCantidad').val()) > 0) ? parseInt($('#tiempoEstanciaCantidad').val()) : 0,
        TipoEstancia: $('#tiempoEstanciaTipo option:selected').text(),
        TipoEstanciaIndx: $('#tiempoEstanciaTipo').val(),
        TestigoNombre: $('#testigoPaciente').val(),
        TipoTratamiento: $('#pacienteModeloTratamiento option:selected').text(),
        TipoTratamientoIndx: $('#pacienteModeloTratamiento').val(),
        FasesCantTratamiento: "3",
        FasesCantTratamientoIndx: "FC1",
        FasesTratamiento: "(INGRESO, PROGRESO, EGRESO)",
        FasesTratamientoIndx: "FT1"
    };
    registroPacienteFinanzasJSON = {
        MontoPagar: parseFloat($('#pacienteRegistroPago').val()),
        TipoMoneda: "PESOS MEXICANOS"
    };
}
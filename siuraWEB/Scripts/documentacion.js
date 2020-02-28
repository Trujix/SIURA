// ********************************************************
// ARCHIVO JAVASCRIPT DOCUMENTACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var registroPacienteJSON = {};
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
                data: { PacienteInfo: registroPacienteJSON, PacienteFinanzas: registroPacienteFinanzasJSON },
                beforeSend: function () {
                    LoadingOn("Guardando Paciente");
                },
                success: function (data) {
                    if (data === "true") {
                        $('#divPacienteDatos').html('');
                        LoadingOff();
                        MsgAlerta("Ok!", "Paciente registrado <b>correctamente</b>", 2000, "success");
                    } else {
                        ErrorLog(data, "Registrar Paciente");
                    }
                },
                error: function (error) {
                    ErrorLog(error, "Registrar Paciente");
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
    estatusPacienteConsulta = 1;
    consultarPacientes();
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE EMPAQUETA LOS DATOS EN EL JSON PARA GUARDAR REGISTRO PACIENTE [ FASE DE COBRO ]
function generarPacienteDataV1() {
    registroPacienteFinanzasJSON = {};
    var estatus = 0;
    if ($('#pacienteRegistroBecario').is(":checked")) {
        estatus = 2;
    } else {
        estatus = 1;

        registroPacienteFinanzasJSON = {
            MontoPagar: parseFloat($('#pacienteRegistroPago').val())
        };
    }

    registroPacienteJSON = {
        Nombre: ($('#ingresoPacienteNombre').val() !== "") ? $('#ingresoPacienteNombre').val().trim() : "--",
        PacienteApellidoP: ($('#ingresoPacienteApellidoP').val() !== "") ? $('#ingresoPacienteApellidoP').val().trim() : "--",
        PacienteApellidoM: ($('#ingresoPacienteApellidoM').val() !== "") ? $('#ingresoPacienteApellidoM').val().trim() : "--",
        PacienteFechaNac: ($('#nacimientoPaciente').val() !== "") ? $('#nacimientoPaciente').val() : "--",
        Edad: (parseInt($('#edadPaciente').val()) > 0) ? parseInt($('#edadPaciente').val()) : 0,
        CURP: ($('#curpPaciente').val() !== "") ? $('#curpPaciente').val() : "--",
        PacienteAlias: ($('#apodoPaciente').val() !== "") ? $('#apodoPaciente').val() : "--",
        ParienteNombre: ($('#ingresoParienteNombre').val() !== "") ? $('#ingresoParienteNombre').val() : "--",
        ParienteApellidoP: ($('#ingresoParienteApellidoP').val() !== "") ? $('#ingresoParienteApellidoP').val() : "--",
        ParienteApellidoM: ($('#ingresoParienteApellidoM').val() !== "") ? $('#ingresoParienteApellidoM').val() : "--",
        TelefonoCasa: (parseFloat($('#ingresoTelefonoCasa').val()) > 0) ? parseFloat($('#ingresoTelefonoCasa').val()) : 0,
        TelefonoPariente: (parseFloat($('#ingresoTelefonoPariente').val()) > 0) ? parseFloat($('#ingresoTelefonoPariente').val()) : 0,
        TelefonoUsuario: (parseFloat($('#ingresoTelefonoUsuario').val()) > 0) ? parseFloat($('#ingresoTelefonoUsuario').val()) : 0,
        Estatus: estatus
    };
}
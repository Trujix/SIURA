// ********************************************************
// ARCHIVO JAVASCRIPT DINAMICOS.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var estatusPacienteConsulta = 0;

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)

// DOCUMENT - QUE CONTROLA LAS TECLAS PRESIONADAS AL ESCRIBIR EN LA CONSULTA DE PACIENTES
$(document).on('keyup', '#modalTxtPacienteBusqueda', function (e) {
    if (e.keyCode === 13 && $(this).val().length > 5) {
        llenarTablaConsultaPacientes();
    }
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION QUE EJECUTA EL LLAMADO DEL MODAL DE CONSULTA DE PACIENTES
function consultarPacientes() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/Pacientes",
        beforeSend: function () {
            LoadingOn("Cargando catálogo...");
        },
        success: function (data) {
            $('body').append(data);
            $('#modalPacienteBusqueda').modal('show');

            $('#modalPacienteBusqueda').on('shown.bs.modal', function (e) {
                LoadingOff();
                $('#modalTxtPacienteBusqueda').focus();
            });

            $('#modalPacienteBusqueda').on('hidden.bs.modal', function (e) {
                $('#modalPacienteBusqueda').remove();
            });
        },
        error: function (error) {
            ErrorLog(error, "Cargar Catalogo Pacientes");
        }
    });
}

// FUNCION QUE LLENA LA TABLA EN EL MODAL DE CONSULTA DE PACIENTES
function llenarTablaConsultaPacientes() {
    $('#modalTxtPacienteBusqueda').blur();
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Dinamicos/ConsultaPaciente",
        data: { PacienteConsulta: $('#modalTxtPacienteBusqueda').val().toUpperCase(), Estatus: estatusPacienteConsulta },
        dataType: "JSON",
        beforeSend: function () {
            LoadingOn("Cargando pacientes...");
        },
        success: function (data) {
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    var tabla = "<div class='col-sm-12'><div class='table scrollestilo' style='max-height: 40vh; overflow: scroll;'><table class='table table-sm table-bordered'><thead><tr class='table-active'><th>Nombre Paciente</th><th>Opciones</th></tr></thead><tbody>óê%TABLA%óê</tbody></table></div></div>";
                    var pacientes = "";
                    $(data).each(function (key, value) {
                        pacientes += "<tr><td>" + value.NombreCompleto + "</td><td></td></tr>";
                    });
                    LoadingOff();
                    $('#modalTxtPacienteBusqueda').focus();
                    $('#modalTablaConsultaPacientes').html(tabla.replace("óê%TABLA%óê", pacientes));
                } else {
                    LoadingOff();
                    $('#modalTxtPacienteBusqueda').focus();
                    $('#modalTablaConsultaPacientes').html("<div class='col-sm-12' style='text-align: center;'><h2 style='color: #85929E;'><i class='fa fa-exclamation-circle'></i> No se encontraron pacientes.</h2></div>");
                }
            } else {
                ErrorLog(data.responseText, "Generar Consulta Pacientes");
            }
        },
        error: function (error) {
            ErrorLog(error.responseText, "Generar Consulta Pacientes");
        }
    });
}
// ********************************************************
// ARCHIVO JAVASCRIPT DOCUMENTACION.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var registroPacienteJSON = {};
var registroIngresoJSON = {};
var registroPacienteFinanzasJSON = {};
var registroPacienteCargosJSON =[]

var MontoTotalPaciente = 0;
var habilitarPagosConfig = false;
var listaPagosConfig = {};
var listaCargosAdicionales = [];
var ArchivoComrpobanteBeca;
var comprobanteBecaJSON = {
    Nombre: "",
    Extension: ""
};
var msgBecarioInfo = "";

var IdPacienteSelecGLOBAL = 0;
var registroFasesModeloJSON = [];
var registroFasesNoModeloJSON = [];
var registroFasesNombresJSON = {};

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

// DOCUMENT - CONTROLA LAS ACCIONES DEL INPUT DE MONTO TOTAL (REALIZA LABORES ESPECIALES SI EL PACIENTE ES BECARIO Y PAGOS SI ESTA HABILITADO) [ PACIENTE REGISTRO ]
$(document).on('change keyup keydown keypress click blur', '#pacienteRegistroPago', function () {
    var montototal = (isNaN(parseFloat($(this).val())) ? 0 : parseFloat($(this).val()));
    var porcmonto = (isNaN(parseFloat($('#becarioPorcentajeMonto').val())) ? 0 : parseFloat($('#becarioPorcentajeMonto').val()));
    var montodesc = 0, montosindesc = 0;
    $(listaCargosAdicionales).each(function (key, value) {
        if (value.Becario) {
            montodesc += value.Importe;
        } else {
            montosindesc += value.Importe;
        }
    });
    montototal = montototal + montodesc;
    if ($('#pacienteBecarioPorcMonto').is(":checked")) {
        MontoTotalPaciente = (((montototal - porcmonto) < 0) ? 0 : parseFloat(montototal - porcmonto));
    } else {
        MontoTotalPaciente = (((montototal - ((montototal * porcmonto) / 100)) < 0) ? 0 : parseFloat(montototal - ((montototal * porcmonto) / 100)));
    }
    MontoTotalPaciente = MontoTotalPaciente + montosindesc;
    $('#pacienteBecaMontoTotal').html(MontoTotalPaciente.toFixed(2));
    if ($('#pacientePagosParciales').is(":checked")) {
        pacienteEsquemaPagos();
    }
});

// DOCUMENT - CONTROLA LAS ACCIONES DEL INPUT DEL MOTO/PORCENTAJE QUE  APLICA LA BECA DEL PACIENTE [ PACIENTE REGISTRO ]
$(document).on('change keyup', '#becarioPorcentajeMonto', function () {
    $('#pacienteRegistroPago').keyup();
});

// DOCUMENT - CONTROLA LAS ACCIONES DEL CHECKBOX PARA HABILITAR SI ES BECARIO O NO EN [ PACIENTE REGISTRO ]
$(document).on('change', '#pacienteRegistroBecario', function () {
    $('#becarioPorcentajeMonto').val('');
    if ($(this).is(":checked")) {
        $('div[name="divPacienteBeca"]').show(200);
    } else {
        $('div[name="divPacienteBeca"]').hide(200);
        $(listaCargosAdicionales).each(function (key, value) {
            listaCargosAdicionales[key].Becario = false;
        });
        llenarTablaCargosAdicionales();
    }
});

// DOCUMENT - CONTROLA EL SWITCH QUE MANEJA EL CAMBIO DE PORCENTAJE O MONTO QUE CUBRE EL BECARIO [ PACIENTE REGISTRO ]
$(document).on('change', '#pacienteBecarioPorcMonto', function () {
    $('#becarioPorcentajeMonto').val('');
    if ($(this).is(":checked")) {
        $('#becarioPorcentajeMonto').attr("placeholder", "Monto que cubre...");
    } else {
        $('#becarioPorcentajeMonto').attr("placeholder", "Porcentaje que cubre...");
    }
    $('#pacienteRegistroPago').keyup();
    $('#becarioPorcentajeMonto').focus();
});

// DOCUMENT - CONTROLA EL SWITCH QUE ACTIVA LOS PAGOS PARCIALES Y MUESTRA PANEL PARA CONFIGURARLOS [ PACIENTE REGISTRO ]
$(document).on('change', '#pacientePagosParciales', function () {
    limpiarPacientePagosVals();
    if ($(this).is(":checked")) {
        $('#divPacientePagosParciales').show(200);
    } else {
        $('#divPacientePagosParciales').hide(200);
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
                data: { PacienteInfo: registroPacienteJSON, PacienteIngreso: registroIngresoJSON, PacienteFinanzas: registroPacienteFinanzasJSON, PacienteCargos: registroPacienteCargosJSON },
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
                            altaBecaDoc(jsonContrato.ClavePaciente, function (doc) {
                                LoadingOff();
                                MsgAlerta("Ok!", "Paciente registrado <b>correctamente</b>", 2000, "success");
                                if (jsonContrato.TipoContrato === "I") {
                                    imprimirContratoCI(jsonContrato, logoIMG.LogoCentro);
                                } else if (jsonContrato.TipoContrato === "V") {
                                    imprimirContratoCV(jsonContrato, logoIMG.LogoCentro);
                                }
                            });
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
    $('#pacienteFasesTratamiento').html('<option value="-1">- Eliga Fase de Tratamiento -</option>');
    if (parseFloat($(this).val()) > 0) {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Configuracion/ListaFasesTratIdModelo",
            dataType: 'JSON',
            data: { IdModelo: parseInt($('#pacienteModeloTratamiento').val()) },
            beforeSend: function () {
                LoadingOn("Cargando Parametros...");
                registroFasesNombresJSON = {};
            },
            success: function (data) {
                registroFasesModeloJSON = data.Relacionado;
                registroFasesNoModeloJSON = data.NoRelacionado;
                var conModelo = "", sinModelo = "", opciones = "";
                $(data.Relacionado).each(function (key, value) {
                    conModelo += '<option value="' + value.IdFase + '" cant="' + value.CantidadFases + '" fasesnombres="' + value.FasesNombres + '">' + value.FasesNombresTxt + '</option>';
                    registroFasesNombresJSON["Fases_" + value.IdFase] = value.FasesNombres;
                });
                $(data.NoRelacionado).each(function (key, value) {
                    sinModelo += '<option value="' + value.IdFase + '" cant="' + value.CantidadFases + '" fasesnombres="' + value.FasesNombres + '">' + value.FasesNombresTxt + '</option>';
                    registroFasesNombresJSON["Fases_" + value.IdFase] = value.FasesNombres;
                });
                opciones = ((conModelo !== "") ? '<optgroup label="Relacionadas al Modelo">' + conModelo + '</optgroup>' : "") + ((sinModelo !== "") ? '<optgroup label="Sin Relacionar">' + sinModelo + '</optgroup>' : "");
                $('#pacienteFasesTratamiento').append(opciones);
                LoadingOff();
            },
            error: function (error) {
                ErrorLog(error.responseText, "Lista Fases Tratamientos");
            }
        });
    }
});

// DOCUMENT - BOTON QUE CONTROLA EL  LLAMADO DEL INPUT FILE PARA SUBIR COMPROBANTE [ REGISTRO PREVIO ]
$(document).on('click', '#btnPacienteBecarioDoc', function () {
    $('#pacienteBecarioDoc').click();
});

// DOCUMENT - QUE CONTROLA EL INPUT FILE AL SELECCIONAR  UN ARCHIVO [ REGISTRO PREVIO ]
$(document).on('change', '#pacienteBecarioDoc', function (e) {
    ArchivoComrpobanteBeca = $(this).prop('files')[0];
    if (ArchivoComrpobanteBeca !== undefined) {
        var nombre = ArchivoComrpobanteBeca.name;
        var extension = nombre.substring(nombre.lastIndexOf('.') + 1);
        if (extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "pdf") {
            comprobanteBecaJSON.Nombre = nombre;
            comprobanteBecaJSON.Extension = extension;
            $('#iconoBecaComprobante').css("cursor", "pointer").attr("onclick", "mostrarBecaDocInfo();").attr("title", nombre.replace("." + extension, "")).removeClass("badge-danger").addClass("badge-success").html('<i class="fa fa-check-circle"></i>');
            msgBecarioInfo = "Archivo seleccionado:\n\n<b>Nombre: </b>" + nombre.replace("." + extension, "") + "\n<b>Extensión/Tipo: </b>" + extension;
        } else {
            ArchivoComrpobanteBeca = undefined;
            MsgAlerta("Atención!", "Formato de archivo para <b>Comprobante</b> NO <b>válido</b>", 3500, "default");
            $('#pacienteBecarioDoc').val('');
        }
    } else {
        $('#iconoBecaComprobante').css("cursor", "").removeAttr("onclick").removeClass("badge-success").addClass("badge-danger").html('<i class="fa fa-times-circle"></i>');
    }
});

// DOCUMENT - BOTON QUE CONTROLA LA INSERCIÓN DE UN CARGO ADICIONAL [ REGISTRO PREVIO ]
$(document).on('click', '#pacienteAddCargoAdic', function () {
    if (MontoTotalPaciente > 0) {
        if (validarFormCargoAdicional()) {
            MsgPregunta("Agregar Cargo Adicional", "¿Desea continuar?", function (si) {
                if (si) {
                    listaCargosAdicionales.push({
                        IdCA: cadAleatoria(6),
                        Descripcion: $('#pacienteDescCargoAdic').val().toUpperCase(),
                        Importe: parseFloat($('#pacienteCantCargoAdic').val()),
                        Becario: false
                    });
                    llenarTablaCargosAdicionales();
                    $('#pacienteDescCargoAdic').val('');
                    $('#pacienteCantCargoAdic').val('');
                    $('#pacienteCantCargoAdic').focus();
                    $('#pacienteRegistroPago').keyup();
                }
            });
        }
    } else {
        $('#pacienteDescCargoAdic').val('');
        $('#pacienteCantCargoAdic').val('');
        MsgAlerta("Atención!", "No puede añadir <b>Cargos Adicionales</b> sin asignar un <b>Monto</b>", 4000, "default");
    }
});

// DOCUMENT - CONTROLA EL BOTON QUE GENERA LA CONFIGURACION DEL ESQUEMA DE PAGOS - [ REGISTRO PREVIO ]
$(document).on('click', '#generarPagoParcial', function () {
    if (MontoTotalPaciente > 0 && $('#pacienteRegistroPago').val() !== "") {
        if (validarFormPagosLista()) {
            habilitarPagosConfig = true;
            pacienteEsquemaPagos();
        }
    } else {
        MsgAlerta("Atención!", "No ha colocado <b>Monto a pagar</b>", 3000, "default");
    }
});

// DOCUMENT - BOTON QUE LIMPIA LOS PARAMETROS DE ESQUEMA DEPAGOS - [ REGISTRO PREVIO ]
$(document).on('click', '#limpiarPagoParcial', function () {
    MsgPregunta("Reiniciar Configuracion Pagos", "¿Desea continuar?", function (si) {
        if (si) {
            limpiarPacientePagosVals();
        }
    });
});

// DOCUMENT - CONTROLA LOS BOTONES QUE AGREGAN O RESTAN CANTIDAD DE PAGOS - [ REGISTRO PREVIO ]
$(document).on('click', '.masmenoscantpagos', function () {
    var cant = parseFloat($('#cantidadPagoParcial').val());
    if ($(this).attr("accion") === "mas") {
        $('#cantidadPagoParcial').val(cant + 1);
    } else if ($(this).attr("accion") === "menos") {
        if (cant > 2) {
            $('#cantidadPagoParcial').val(cant - 1);
        }
    }
    pacienteEsquemaPagos();
});

// DOCUMENT - CONTROLA EL COMBO DE TIPOS DE PAGOS PARA EL ESQUEMA DE PAGOS - [ REGISTRO PREVIO ]
$(document).on('change', '#tipoPagoParcial', function () {
    pacienteEsquemaPagos();
});

// DOCUMENT - CONTROLA EL INPUT DE FECHA PARA EL ESQUEMA DE PAGOS
$(document).on('change keyup', '#fechaInicioPagoParcial', function () {
    pacienteEsquemaPagos();
});

// DOCUMENT - QUE CONTROLA EL BOTON PARA EDITAR UN PACIENTE DE PRE-REGISTRO - [ REGISTRO PREVIO - (VIENE DE DINAMICO)  ]
$(document).on('click', '.editarPrePaciente', function () {
    alert('EN ELABORACION');
});

// DOCUMENT - QUE CONTROLA EL BOTON QUE PERMITE CONFIGURAR EL INGRESO DEL PACIENTE - [ PRE-INGRESO - (VIENE DE DINAMICO) ]
$(document).on('click', '.configurarPacienteIngreso', function () {
    var idPaciente = $(this).attr("idpaciente");
    LoadingOn("Cargando Parametros...");
    $('#modalPacienteBusqueda').modal('hide');
    setTimeout(function () {
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            url: "/Configuracion/ListaEstadosAlerta",
            dataType: 'JSON',
            beforeSend: function () {
                $('#divMaestro').append(modalPacienteIngreso.replace(/×ØIDPACIENTEØ×/gi, idPaciente));
                $('#modalIngresoPaciente').modal('show');
                LoadingOn("Estados Alerta...");
            },
            success: function (data) {
                var estadosalerta = "<option value='-1'>- Eliga un Estado de Alerta -</option>";
                $(data.Activos).each(function (key, value) {
                    estadosalerta += "<option value='" + value.IdEstadoAlerta + "'>" + value.NombreEstadoAlerta + "</option>";
                });
                $('#modalIngresoEstAlerta').html(estadosalerta);
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Configuracion/ListaNivelIntoxicacion",
                    dataType: 'JSON',
                    beforeSend: function () {
                        LoadingOn("Niveles Intoxicacion...");
                    },
                    success: function (data) {
                        var nintoxicacion = "<option value='-1'>- Eliga un Nivel de Intoxicación -</option>";
                        $(data.Activos).each(function (key, value) {
                            nintoxicacion += "<option value='" + value.IdNivelesIntoxicacion + "'>" + value.NombreNivelIntoxicacion + "</option>";
                        });
                        $('#modalIngresoNivIntoxicacion').html(nintoxicacion);
                        $.ajax({
                            type: "POST",
                            contentType: "application/x-www-form-urlencoded",
                            url: "/Configuracion/ListaEstadosAnimo",
                            dataType: 'JSON',
                            beforeSend: function () {
                                LoadingOn("Estados Animo...");
                            },
                            success: function (data) {
                                var estadoanimo = "<option value='-1'>- Eliga un Estado de Animo -</option>";
                                $(data.Activos).each(function (key, value) {
                                    estadoanimo += "<option value='" + value.IdEstadoAnimo + "'>" + value.NombreEstadoAnimo + "</option>";
                                });
                                $('#modalIngresoEstAnimo').html(estadoanimo);

                                $('#modalIngresoPaciente').on('hidden.bs.modal', function (e) {
                                    $('#modalIngresoPaciente').remove();
                                });
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
    }, 2000);
});

// DOCUMENT - BOTON QUE GUARDA LA CONFIGURACION DE INGRESO DEL PACIENTE - [ PRE-INGRESO - (VIENE DE DINAMICO) ]
$(document).on('click', '#modalIngresoPacienteGuardar', function () {
    var idPaciente = $(this).attr("idpaciente");
    if (validarFormIngresoPaciente()) {
        MsgPregunta("Guardar Ingreso de Paciente", "¿Desea continuar?", function (si) {
            if (si) {
                $(ListaPacientesConsultaJSON).each(function (key, value) {
                    if (idPaciente === value.Id) {
                        IdPacienteSelecGLOBAL = value.IdPaciente;
                    }
                });
                var pacienteIngreso = {
                    IdPaciente: IdPacienteSelecGLOBAL,
                    EstadoAlerta: $('#modalIngresoEstAlerta option:selected').text(),
                    EstadoAlertaIndx: parseInt($('#modalIngresoEstAlerta').val()),
                    NivelIntoxicacion: $('#modalIngresoNivIntoxicacion option:selected').text(),
                    NivelIntoxicacionIndx: parseInt($('#modalIngresoNivIntoxicacion').val()),
                    EstadoAnimo: $('#modalIngresoEstAnimo option:selected').text(),
                    EstadoAnimoIndx: parseInt($('#modalIngresoEstAnimo').val()),
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: "/Documentacion/ActIngresoPaciente",
                    data: { PacienteIngreso: pacienteIngreso },
                    beforeSend: function () {
                        LoadingOn("Guardando Configuración...");
                    },
                    success: function (data) {
                        if (data === "true") {
                            $('#modalIngresoPaciente').modal('hide');
                            LoadingOff();
                            MsgAlerta("Ok!", "Configuracion almacenada <b>correctamente</b>", 2500, "success");
                        } else {
                            ErrorLog(error, "Act. Ingreso Paciente");
                        }
                    },
                    error: function (error) {
                        ErrorLog(error, "Act. Ingreso Paciente");
                    }
                });
            }
        });
    }
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
            $('#pacienteRegistroBecario').bootstrapToggle('off');
            $('#pacienteBecarioPorcMonto').bootstrapToggle('off');
            $('#pacientePagosParciales').bootstrapToggle('off');
            $('#becarioPorcentajeMonto').attr("placeholder", "Porcentaje que cubre...");
            $('#contratoVoluntario').click();
            $('div[name="divPacienteBeca"]').hide();
            $('#divPacientePagosParciales').hide();
            $('#divPacienteDatos').animate({ scrollTop: 0, scrollLeft: 0 });
            listaCargosAdicionales = [];
            LoadingOn("Cargando Parametros...");
        },
        success: function (data) {
            $(data.Activos).each(function (key, value) {
                $('#pacienteModeloTratamiento').append("<option value='" + value.IdTratamiento + "'>" + value.NombreTratamiento + "</option>");
            });
            llenarTablaCargosAdicionales();
            LoadingOff();
        },
        error: function (error) {
            ErrorLog(error.responseText, "Lista Modelos Tratamientos");
        }
    });
}

// FUNCION QUE GENERA LA TABLA  DE ESQUEMA DE PAGOS
function pacienteEsquemaPagos() {
    if (habilitarPagosConfig && $('#pacientePagosParciales').is(":checked") && MontoTotalPaciente > 0 && parseFloat($('#cantidadPagoParcial').val()) > 1 && $('#fechaInicioPagoParcial').val() !== "") {
        var pagos = MontoTotalPaciente / parseFloat($('#cantidadPagoParcial').val());
        var fecha = $('#fechaInicioPagoParcial').val().split("-");
        var tabla = "<tr><td>" + fecha[2] + "/" + fecha[1] + "/" + fecha[0] + "</td><td>$&nbsp;" + pagos.toFixed(2) + "</td></tr>";
        var semana = 7;
        listaPagosConfig = {
            CantidadPagos: parseInt($('#cantidadPagoParcial').val()),
            MontoPago: pagos,
            TipoPago: $('#tipoPagoParcial option:selected').text().toUpperCase(),
            TipoPagoIndx: parseInt($('#tipoPagoParcial').val()),
            FechaInicio: fecha[2] + "/" + fecha[1] + "/" + fecha[0],
            FechaFin: ""
        };
        for (i = 0; i < parseFloat($('#cantidadPagoParcial').val()); i++) {
            if (i > 0) {
                if ($('#tipoPagoParcial').val() === "1") {
                    tabla += "<tr><td>" + crearFechaDDMMYYYY(new Date(parseInt(fecha[0]), parseInt(fecha[1]) - 1, parseInt(fecha[2])).addDiasFecha(semana).toString()) + "</td><td>$&nbsp;" + pagos.toFixed(2) + "</td></tr>";

                    if (i === (parseFloat($('#cantidadPagoParcial').val()) - 1)) {
                        listaPagosConfig.FechaFin = crearFechaDDMMYYYY(new Date(parseInt(fecha[0]), parseInt(fecha[1]) - 1, parseInt(fecha[2])).addDiasFecha(semana).toString());
                    }
                    semana = semana + 7;
                } else if ($('#tipoPagoParcial').val() === "2") {
                    tabla += "<tr><td>" + crearFechaDDMMYYYY(addMesesFecha(new Date(parseInt(fecha[0]), parseInt(fecha[1]) - 1, parseInt(fecha[2])), i).toString()) + "</td><td>$&nbsp;" + pagos.toFixed(2) + "</td></tr>";

                    if (i === (parseFloat($('#cantidadPagoParcial').val()) - 1)) {
                        listaPagosConfig.FechaFin = crearFechaDDMMYYYY(addMesesFecha(new Date(parseInt(fecha[0]), parseInt(fecha[1]) - 1, parseInt(fecha[2])), i).toString());
                    }
                }
            }
        }
        $('#pacienteTablaPagoPlazos').html(tabla);
    } else {
        $('#pacienteTablaPagoPlazos').html("");
        listaPagosConfig = {};
    }
}

// FUNCION QUE LIMPIA LOS PARAMETROS Y VALORES DEL ESQUEMA DE PAGOS
function limpiarPacientePagosVals() {
    $('#cantidadPagoParcial').val('2');
    document.getElementById('fechaInicioPagoParcial').valueAsDate = new Date();
    document.getElementById("fechaInicioPagoParcial").setAttribute("min", FechaInput());
    $('#pacienteTablaPagoPlazos').html('');
    $('#tipoPagoParcial').val("1");
    habilitarPagosConfig = false;
    listaPagosConfig = {};
}

// FUNCION QUE LLENA LA TABLA DE CARGOS ADICIONALES - [ REGISTRO PREVIO ]
function llenarTablaCargosAdicionales() {
    if (listaCargosAdicionales.length > 0) {
        var tabla = "";
        $(listaCargosAdicionales).each(function (key, value) {
            tabla += '<tr id="' + value.IdCA + '"><td>' + value.Descripcion + '</td><td>$&nbsp;' + value.Importe.toFixed(2) + '</td><td style="text-align: center;"><button onclick="descuentoCargoAdicional(' + "'" + value.IdCA + "'" + ');" class="btn badge badge-pill badge-' + ((value.Becario) ? "success" : "secondary") + '" title="Descuento Becario">' + ((value.Becario) ? "Si" : "No") + '</button></td><td style="text-align: center;"><button onclick="quitarCargoAdicional(' + "'" + value.IdCA + "'" + ');" class="btn badge badge-pill badge-danger" title="Quitar Cargo Adicional"><i class="fa fa-trash"></i></button></td></tr>';
        });
        $('#pacienteTablaCargoAdic').html(tabla);
    } else {
        $('#pacienteTablaCargoAdic').html('<tr><td colSpan="4" style="text-align: center;"><label><i class="fa fa-info-circle"></i>&nbsp;No hay cargos adicionales</label></td></tr>');
    }
    $('#pacienteRegistroPago').keyup();
}

// FUNCION QUE ELIMINA UN CARGO ADICIONAL DE LA LISTA - [ REGISTRO PREVIO ]
function quitarCargoAdicional(idCA) {
    MsgPregunta("Quitar Cargo Adicional", "¿Desea Continuar?", function (si) {
        if (si) {
            listaCargosAdicionales.quitarElemento('IdCA', idCA);
            llenarTablaCargosAdicionales();
        }
    });
}

// FUNCION QUE APLICA/RETIRA DESCUENTO A CARGO ADICIONAL - [ REGISTRO PREVIO ]
function descuentoCargoAdicional(idCA) {
    if ($('#pacienteRegistroBecario').is(":checked")) {
        MsgPregunta("Descuento Becario Cargo Adicional", "¿Desea Continuar?", function (si) {
            if (si) {
                $(listaCargosAdicionales).each(function (key, value) {
                    if (idCA === value.IdCA) {
                        listaCargosAdicionales[key].Becario = ((listaCargosAdicionales[key].Becario) ? false : true);
                    }
                });
                llenarTablaCargosAdicionales();
            }
        });
    } else {
        MsgAlerta("Atención!", "El paciente <b>NO es Becario</b>", 3000, "default");
    }
}

// FUNCION QUE VALIDA LOS INPUTS DEL FORMULARIO PARA AÑADIR CARGO ADICIONAL - [ REGISTRO PREVIO ]
function validarFormCargoAdicional() {
    var correcto = true, msg = "";
    if ($('#pacienteCantCargoAdic').val() === "") {
        msg = "Coloque el <b>Importe</b>";
        $('#pacienteCantCargoAdic').focus();
        correcto = false;
    } else if (isNaN(parseFloat($('#pacienteCantCargoAdic').val()))) {
        msg = "El <b>Importe</b> es <b>inválido</b>";
        $('#pacienteCantCargoAdic').focus();
        correcto = false;
    } else if ($('#pacienteDescCargoAdic').val() === "") {
        msg = "Coloque la <b>Descripción</b>";
        $('#pacienteDescCargoAdic').focus();
        correcto = false;
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2500, "default");
    }
    return correcto;
}

// FUNCION QUE VALIDA EL FORMULARIO DE ESQUEMA DE PAGOS - [ REGISTRO PREVIO ]
function validarFormPagosLista() {
    var correcto = true, msg = "";
    if ($('#cantidadPagoParcial').val() === "" || parseFloat($('#cantidadPagoParcial').val()) < 2 || isNaN(parseFloat($('#cantidadPagoParcial').val()))) {
        correcto = false;
        msg = (parseFloat($('#cantidadPagoParcial').val()) < 2) ? "La cantidad debe ser <b>mayor a 1</b>" : "La cantidad es <b>Incorrecta</b>";
        $('#cantidadPagoParcial').focus();
    } else if ($('#tipoPagoParcial').val() === "-1") {
        correcto = false;
        msg = "Elige <b>Tipo de Pago</b>";
        $('#tipoPagoParcial').focus();
    } else if ($('#fechaInicioPagoParcial').val() === "") {
        correcto = false;
        msg = "La fecha de Inicio es <b>Inválida</b>";
        $('#fechaInicioPagoParcial').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 3000, "default");
        $('#pacienteTablaPagoPlazos').html("");
        listaPagosConfig = {};
    }
    return correcto;
}

// FUNCION QUE EMPAQUETA LOS DATOS EN EL JSON PARA GUARDAR REGISTRO PACIENTE [ FASE DE COBRO ]
function generarPacienteDataV1() {
    try {
        var becario = $('#pacienteRegistroBecario').is(":checked"), parcialidad = $('#pacientePagosParciales').is(":checked");
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
            Estatus: 1
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
            FasesCantTratamiento: $('#pacienteFasesTratamiento option:selected').attr("cant"),
            FasesCantTratamientoIndx: $('#pacienteFasesTratamiento').val(),
            FasesTratamiento: registroFasesNombresJSON["Fases_" + $('#pacienteFasesTratamiento').val()],
            FasesTratamientoIndx: $('#pacienteFasesTratamiento').val()
        };
        registroPacienteFinanzasJSON = {
            MontoPagar: MontoTotalPaciente,
            TipoMoneda: "PESOS MEXICANOS",
            Becario: becario,
            BecaValor: (becario) ? parseFloat($('#becarioPorcentajeMonto').val()) : 0,
            BecaTipo: ($('#pacienteBecarioPorcMonto').is(":checked")) ? "$" : "%",
            Parcialidad: parcialidad,
            CantidadPagos: (parcialidad) ? listaPagosConfig.CantidadPagos : 0,
            MontoPagoParcial: (parcialidad) ? listaPagosConfig.MontoPago : 0,
            TipoPago: (parcialidad) ? listaPagosConfig.TipoPago : "--",
            TipoPagoIndx: (parcialidad) ? listaPagosConfig.TipoPagoIndx : 0,
            TipoPagoCantPers: 0,
            FechaInicioPago: (parcialidad) ? listaPagosConfig.FechaInicio : "--",
            FechaFinPago: (parcialidad) ? listaPagosConfig.FechaFin : "--",
        };
        registroPacienteCargosJSON = [];
        $(listaCargosAdicionales).each(function (key, value) {
            registroPacienteCargosJSON.push({
                Descripcion: value.Descripcion,
                Importe: value.Importe
            })
        });
    } catch (e) {
        console.log(e.toString());
    }
}

// FUNCION QUE MUESTRA EL MENSAJE DEL DOCUMENTO RELACIONADO CON EL PACIENTE BECARIO
function mostrarBecaDocInfo() {
    MsgAlerta("Info!", msgBecarioInfo, 7000, "info");
}

// FUNCION QUE GUARDA EL DOCUMENTO QUE AVALA LA BECA DEL PACIENTE
function altaBecaDoc(nombreArchivo, callback) {
    if (ArchivoComrpobanteBeca !== undefined) {
        var archivoData = new FormData();
        var archivoInfo = {
            Nombre: nombreArchivo + "_becadoc",
            Extension: comprobanteBecaJSON.Extension
        };
        archivoData.append("Archivo", ArchivoComrpobanteBeca);
        archivoData.append("Info", JSON.stringify(archivoInfo));

        $.ajax({
            type: "POST",
            url: "/Configuracion/AltaBecaComprobante",
            data: archivoData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                LoadingOn("Guardando Comprobante...");
            },
            success: function (data) {
                if (data === "true") {
                    callback(true);
                } else {
                    ErrorLog(data, "Guardar Comprobante Beca");
                    callback(false);
                }
            },
            error: function (error) {
                ErrorLog(error, "Guardar Comprobante Beca");
                callback(false);
            }
        });
    } else {
        callback(true);
    }
}

// FUNCION QUE VALIDA EL FORMULARIO DE INGRESO DEL PACIENTE
function validarFormIngresoPaciente() {
    var correcto = true, msg = "";
    if ($('#modalIngresoEstAlerta').val() === "-1") {
        correcto = false;
        msg = "Elige <b>Estado de Alerta</b>";
        $('#modalIngresoEstAlerta').focus();
    } else if ($('#modalIngresoNivIntoxicacion').val() === "-1") {
        correcto = false;
        msg = "Elige <b>Nivel de Intoxicación</b>";
        $('#modalIngresoNivIntoxicacion').focus();
    } else if ($('#modalIngresoEstAnimo').val() === "-1") {
        correcto = false;
        msg = "Elige <b>Estado de Ánimo</b>";
        $('#modalIngresoEstAnimo').focus();
    }
    if (!correcto) {
        MsgAlerta("Atención!", msg, 2800, "default");
    }
    return correcto;
}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ----------------- [ ELEMENTOS Y OBJETOS COMPLEJOS (ELEMENTOS DOM Y DINAMICOS) ] -----------------
var modalPacienteIngreso = '' +
    '<div id="modalIngresoPaciente" class="modal fade" tabindex="-1" role="dialog" data-keyboard="false" data-backdrop="static">'+
        '<div class="modal-dialog" role="document">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<h5 class="modal-title">Configurar Ingreso</h5>'+
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                '</div>'+
                '<div class="modal-body">' +

                    '<div class="row">' +
                        '<div class="col-sm-12">' +
                            '<div class="form-group">' +
                                '<label for="modalIngresoEstAlerta"><b><i class="fa fa-exclamation"></i>&nbsp;Estado de Alerta:</b></label>' +
                                '<select id="modalIngresoEstAlerta" class="form-control form-control-sm"></select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-sm-12">' +
                            '<div class="form-group">' +
                                '<label for="modalIngresoNivIntoxicacion"><b><i class="fa fa-pills"></i>&nbsp;Nivel de Intoxicacíón:</b></label>' +
                                '<select id="modalIngresoNivIntoxicacion" class="form-control form-control-sm"></select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-sm-12">' +
                            '<div class="form-group">' +
                                '<label for="modalIngresoEstAnimo"><b><i class="fa fa-smile"></i>&nbsp;Estado de Ánimo:</b></label>' +
                                '<select id="modalIngresoEstAnimo" class="form-control form-control-sm"></select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                '</div>' +
                '<div class="modal-footer">'+
                    '<button id="modalIngresoPacienteGuardar" idpaciente="×ØIDPACIENTEØ×" type="button" class="btn btn-sm btn-success"><i class="fa fa-save"></i> Guardar Configuración</button>' +
                    '<button type="button" class="btn btn-sm btn-danger" data-dismiss="modal">Cancelar</button>' +
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
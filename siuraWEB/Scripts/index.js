// ********************************************************
// ARCHIVO JAVASCRIPT INDEX.JS

// --------------------------------------------------------
// VARIABLES GLOBALES
var calendarioActividades;

// --------------------------------------------------------
// FUNCIONES TIPO DOCUMENT (BUTTONS, INPUTS, TEXTAREAS ETC)
// DOCUMENT - CONTROLA LA SELECCION DEL MENU DE OPCIONES
$(document).on('click', 'a[name="menuopc"]', function () {
    var vista = CrearCadOracion($(this).attr("vista")), pagina = CrearCadOracion($(this).attr("pagina"));
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/" + vista + "/" + pagina,
        beforeSend: function () {
            LoadingOn("Validando Usuario");
        },
        success: function (data) {
            if (data.indexOf("<!-- LOGIN FORMULARIO -->") >= 0) {
                location.reload();
            } else {
                $('#divMaestro').html(data);
                LoadingOff();
            } 
        },
        error: function (error) {
            ErrorLog(error.responseText, "Iniciar Sesión");
        }
    });
});

// DOCUMENT QUE CONTROLA EL BOTON QUE RETORNA A LA PANTALLA PRINCIPAL
$(document).on('click', '#pantallaPrincipal', function () {
    location.reload();
});

// --------------------------------------------------------
// FUNCIONES GENERALES

// FUNCION INICIAL DEL HTML DE INDEX
function indexParams() {
    document.getElementsByTagName('body')[0].style.backgroundColor = '#17a2b8';
}

// FUNCION INICIAL DEL HTML PRINCIPAL
function principalParams() {
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        url: "/Home/BarraMenu",
        beforeSend: function () {
            LoadingOn("Asignando parametros...");
        },
        success: function (data) {
            $('#barraMenuPrincipal').html(data);
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                url: "/Home/UsuarioParametros",
                dataType: "JSON",
                success: function (data) {
                    $(data).each(function (key, value) {
                        if (value.Visible) {
                            $('#' + value.Nombre).attr("id", value.IdHTML);
                        } else {
                            $('#' + value.Nombre).parent().remove();
                        }
                    });
                    mostrarCalendario();
                    LoadingOff();
                },
                error: function (error) {
                    ErrorLog(error.responseText, "principalParams");
                }
            });
        },
        error: function (error) {
            ErrorLog(error.responseText, "principalParams");
        }
    });
}

// FUNCION QUE LLENA EL CALENDARIO PRINCIPAL
function mostrarCalendario() {
    calendario = $('#calendarioActividades').fullCalendar({
        header: { left: 'title', right: 'prev,next' },
        eventClick: function (calEvent, jsEvent, view) {
            console.log(calEvent);
            console.log(jsEvent);
            console.log(view);
        },
    });

    $('.fc-prev-button').attr("id", "antMesCalendario");
    $('#antMesCalendario').addClass("btn btn-sm btn-info");
    $('#antMesCalendario').removeClass("fc-prev-button").removeClass("fc-button").removeClass("fc-state-default").removeClass("fc-corner-left");

    $('.fc-next-button').attr("id", "sigMesCalendario");
    $('#sigMesCalendario').addClass("btn btn-sm btn-info");
    $('#sigMesCalendario').removeClass("fc-next-button").removeClass("fc-button").removeClass("fc-state-default").removeClass("fc-corner-right");
    $('#sigMesCalendario').css("margin-left", "5px");
    $('#calendarioActividades').css("padding", "10px");
    $('.fc-left').addClass("badge badge-info");

    calendario.fullCalendar('addEventSource', [
        {
            title: 'Cita Medica',
            description: 'Lorem ipsum 1...',
            start: '2020-02-01',
            end: '2020-02-01',
            color: '#3A87AD',
            textColor: '#FFFFFF',
        },
        {
            title: 'Terapia Psic.',
            description: 'Lorem ipsum 1...',
            start: '2020-02-01',
            end: '2020-02-06',
            color: '#F1C40F',
            textColor: '#FFFFFF',
        },
        {
            title: 'Act. Deportiva',
            description: 'Lorem ipsum 1...',
            start: '2020-02-01',
            end: '2020-02-02',
            color: '#CB4335',
            textColor: '#FFFFFF',
        },
        {
            title: 'Junta AA',
            description: 'Lorem ipsum 1...',
            start: '2020-02-05',
            end: '2020-02-05',
            color: '#27AE60',
            textColor: '#FFFFFF',
        },
        {
            title: 'Expo cuaresma y santa cruz',
            description: 'Lorem ipsum 1...',
            start: '2020-02-27',
            end: '2020-03-01',
            color: '#000000',
            textColor: '#FFFFFF',
        }
    ]);
}
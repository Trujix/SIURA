﻿// ********************************************************
// ARCHIVO JAVASCRIPT MISCELANEAS.JS

// EN ESTE DOCUMENTO SE ALMACENARÁN FUNCIONES QUE AUXILIEN LAS ACTIVIDADES VARIAS DEL SISTEMA
// ESTO CON LA INTENCION DE QUE NO SE VUELVAN A DECLARAR EN DISTINTOS ARCHIVOS JS

// ----------------- [ ++++ DOCUMENTS ++++ ] -----------------
// DOCUMENT - QUE CONTROLA LOS CLICKS AL MENU PRINCIPAL
$(document).on('click', '.menuopcion', function () {
    $('.menuopcion').removeClass("active");
    $(this).addClass("active");
});

// DOCUMENT - QUE CONTROLA LOS CLICKS AL MENU CONFIGURACION
$(document).on('click', '.menu-opc2', function () {
    $('.menu-opc2').removeClass("active");
    $(this).addClass("active");
});

// ----------------- [ ++++ FUNCIONES ++++ ] -----------------
// FUNCION QUE MUESTRA UN ERROR (PUEDE USARSE PRINCIPALMENTE EN EL EVENTO ERROR DE AJAX)
function ErrorLog(errorTxt, accion) {
    MsgAlerta("Error!", "Ocurrió un problema al ejecutar la acción: <b>" + accion + "</b>", 3000, "error");
    console.log(errorTxt);
    LoadingOff();
}

// FUNCION QUE CONVIERTE UNA CADENA TXT 'TRUE' A TIPO BOOLEANO
function CrearBoolValor(cadena) {
    if (cadena !== undefined) {
        if (cadena.toString().toUpperCase() === "TRUE") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// FUNCION QUE GENERA UNA FECHA PARA ASIGANR A LOS INPUTS TIPO  FECHA
function FechaInput() {
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth() + 1;
    var yyyy = hoy.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    return yyyy + '-' + mm + '-' + dd;
}

// FUNCION QUE DEVUELVE FECHA FORMATO DD/MM/YYYY DE  UNA FECHA CAD COMPLETA
function crearFechaDDMMYYYY(fechaCad) {
    var f = fechaCad.split(" ");
    var meses = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12"
    };
    return f[2] + '/' + meses[f[1]] + '/' + f[3];
}

// FUNCION QUE AÑADE MESES A UNA FECHA
function addMesesFecha(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
        date.setDate(0);
    }
    return date;
}

// FUNCION QUE  AÑADE DIAS A UNA FECHA
Date.prototype.addDiasFecha = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// FUNCION QUE ORDENA UN JSON
var JsonORDENADO;
function OrdenarJSON(json, prop, tipo) {
    JsonORDENADO = json.sort(function (a, b) {
        if (tipo === "asc") {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });
}

// FUNCION QUE AJUSTA EL TAMAÑO DEL DIV PRINCIPAL PARA COLOCAR LA  PANTALLA  DE MONITOREO ABARCANDO LA MAYORIA DE LA PANTALLA
function AjustarDivPrincipal(monitoreo) {
    if (monitoreo) {
        $('#DivPrincipal').removeClass("container");
        $('#DivPrincipal').css("width", "98vw");
        $('#DivPrincipal').css("padding-left", "25px");
    } else {
        $('#DivPrincipal').addClass("container");
        $('#DivPrincipal').css("width", "");
        $('#DivPrincipal').css("padding-left", "");
    }
}

// FUNCION QUE DEVUELVE UNA CADENA EN FORMA ORACION (MAYUSCULA PRIMERA LETRA)
function CrearCadOracion(cadena) {
    var cad = cadena.charAt(0).toUpperCase() + cadena.toLowerCase().slice(1);
    return cad;
}

// FUNCION QUE CALCULA LA EDAD UNA EDAD DE UNA FECHA A LA FECHA DE HOY [ NACIMIENTOS ]
function calcularEdad(edadComparar) {
    var d = new Date();
    const date1 = new Date(edadComparar);
    const date2 = new Date((d.getMonth() + 1).toString() + "/" + ((d.getDate() < 10) ? "0" + d.getDate().toString() : d.getDate().toString()) + "/" + d.getFullYear().toString());
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    var edad = parseInt(diffDays / 365);
    return edad;
}

// FUNCION QUE CREA CADENA ALEATORIA (LONGITUD QUE SE NECESITE)
function cadAleatoria(lng) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
    for (var r = 0; r < lng; r++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// FUNCION PARA REMOVER ELEMENTO DE JSON
Array.prototype.quitarElemento = function (llave, valor) {
    var array = $.map(this, function (v, i) {
        return v[llave] === valor ? null : v;
    });
    this.length = 0;
    this.push.apply(this, array);
}

// FUNCION QUE DEVUELVE EL NOMBRE DEL ICONO DE ACUERDO AL ARCHIVO
function verifExtensionArchIcono(extension) {
    var data = {
        icono: "fa fa-file",
        color: "#95A5A6",
        descripcion: "Archivo"
    };
    var archivos = {
        jpg: "fa fa-file-image&#F1C40F&Imagen",
        jpeg: "fa fa-file-image&#F1C40F&Imagen",
        png: "fa fa-file-image&#F1C40F&Imagen",
        gif: "fa fa-file-image&#F1C40F&Imagen",
        tiff: "fa fa-file-image&#F1C40F&Imagen",
        psd: "fa fa-file-image&#F1C40F&Imagen",
        eps: "fa fa-file-image&#F1C40F&Imagen",
        ai: "fa fa-adobe&#CD6155&Adobe",
        pdf: "fa fa-file-pdf&#CB4335&PDF",
        doc: "fa fa-file-word&#2980B9&Word",
        docx: "fa fa-file-word&#2980B9&Word",
        xls: "fa fa-file-excel6#27AE60&Excel",
        xslx: "fa fa-file-excel&#27AE60&Excel",
        ppt: "fa fa-file-powerpoint&#B9770E&PowerPoint",
        pot: "fa fa-file-powerpoint&#B9770E&PowerPoint",
        pptx: "fa fa-file-powerpoint&#B9770E&Imagen",
        txt: "fa fa-file-alt&#212F3D&Texto",
        zip: "fa fa-file-archive&#7D3C98&Zip",
        rar: "fa fa-file-archive&#7D3C98&Rar",
    }
    if (archivos[extension.toLowerCase()] !== undefined) {
        data.icono = archivos[extension.toLowerCase()].split("&")[0];
        data.color = archivos[extension.toLowerCase()].split("&")[1];
        data.descripcion = archivos[extension.toLowerCase()].split("&")[2];
    }
    return data;
}

// FUNCION QUE VALIDA SI UNA CADENA DE MAIL ES VALIDA
function esEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// FUNCION QUE DEVUELVE UN NUMERO ALEATORIO DE ACUERDO A LA LONGITUD
function numAleatorio(lng) {
    var num = "";
    for (i = 0; i < lng; i++) {
        num += "9";
    }
    return Math.floor(Math.random() * parseInt(num)) + 1;
}

// FUNCION QUE DEVUELVE EL TITULO PARA EL REPORTE DE INVENTARIO SEGUN SU GESTION (PDF)
function paramsInventarioPDF(param, gestion) {
    if (param === 1) {
        if (gestion === "G1") {
            return "Lista de Inventario General";
        }
        else if (gestion === "G2") {
            return "Lista de Inventario (Debajo del Stock/Minimo)";
        }
        else if (gestion === "E1") {
            return "EntradasSalidas", "Lista de Entradas y Salidas";
        }
        else if (gestion === "E2") {
            return "Entradas", "Lista de Entradas";
        }
        else if (gestion === "E3") {
            return "Salidas", "Lista de Salidas";
        }
    } else if (param === 2) {
        if (gestion === "G1" || gestion === "G2") {
            return ["CODIGOøautoøauto", "NOMBREø*", "PRESENTACIÓNøauto", "PRECIO COMPRAøauto", "PRECIO VENTAøauto", "EXISTENCIASøauto", "STOCK/MINIMOSøauto"];
        }
        else if (gestion === "E1" || gestion === "E2" || gestion === "E3") {
            return ["CODIGOøauto", "NOMBREø*", "PRESENTACIÓNøauto", "ACCIONøauto", "CANTIDADøauto", "NOMBRE USUARIOøauto", "FECHA Y HORAøauto"];
        }
    } else if (param == 3) {
        if (gestion === "COORD. DEPORTIVA") {
            return "cd";
        }
        else if (gestion === "COORD. MÉDICA") {
            return "cm";
        }
        else if (gestion === "COORD. PSICOLÓGICA") {
            return "cp";
        }
        else if (gestion === "INSUMOS GENERALES") {
            return "insumos";
        }
    }
}
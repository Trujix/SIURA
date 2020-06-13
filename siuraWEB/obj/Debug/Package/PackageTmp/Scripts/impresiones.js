// ********************************************************
// ARCHIVO JAVASCRIPT IMPRESIONES.JS
/* ---------------------------------------------- */

// ----------- VARIABLES GLOBALES ------------
// IMPORTANTE MANTENER ACTUALIZADAS ESTAS VARIABLES AL EDITAR LOS CONTRATOS
var ContratoVoluntarioVersion = "01";
var ContratoVoluntarioRevision = "03/06/2020";

var ContratoInvoluntarioVersion = "01";
var ContratoInvoluntarioRevision = "03/06/2020";
/* ---------------------------------------------- */

// --------- FUNCIONES GENERALES ----------

// FUNCION QUE IMPRIME RECIBO DE PAGO
function imprimirReciboPago(reciboData, logoIMG) {
    var reciboPago = {
        pageSize: 'LETTER',
        content: [
            { text: '\nRECIBO DE PAGO', bold: true, decoration: 'underline', italics: true, fontSize: 18, alignment: 'center' },
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: logoIMG, width: 100, alignment: 'center', border: [false, false, false, false] },
                            {
                                table: {
                                    widths: ['*', 'auto'],
                                    body: [
                                        [
                                            { text: reciboData.NombreCentro.toUpperCase(), bold: true, border: [false, false, false, false] },
                                            { text: [{ text: "Telf: " }, { text: reciboData.Telefono, bold: true }], alignment: 'right', border: [false, false, false, false] }
                                        ],
                                        [
                                            { text: [{ text: "Folio: " }, { text: reciboData.FolioPago, bold: true }], border: [false, false, false, false] },
                                            { text: [{ text: "Fecha: " }, { text: reciboData.FechaEmision.toUpperCase(), bold: true }], alignment: 'right', border: [false, false, false, false] }
                                        ],
                                        [
                                            { text: reciboData.DireccionCentro.toUpperCase(), colSpan: 2, alignment: 'right', border: [false, false, false, false] }
                                        ]
                                    ],
                                },
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                },
            },
            {
                table: {
                    widths: ['*', 'auto', '*', 'auto'],
                    body: [
                        [
                            {
                                text: [
                                    { text: "Nombre del paciente:\n" },
                                    { text: reciboData.NombrePaciente, bold: true }
                                ], colSpan: 3
                            }, {}, {},
                            {
                                text: [
                                    { text: "Identificación Paciente:\n" },
                                    { text: reciboData.CedulaPaciente, bold: true }
                                ]
                            }
                        ],
                        [
                            { text: "Tipo de Pago: ", alignment: 'right', border: [true, true, false, true] },
                            { text: reciboData.TipoPago, fillColor: '#EAEDED', border: [false, true, true, true] },
                            { text: "Referencia: ", alignment: 'right', border: [false, true, false, true] },
                            { text: reciboData.ReferenciaPago, fillColor: '#EAEDED', border: [false, true, true, true] }
                        ]
                    ]
                },
            },
            { text: "\n", fontSize: 5 },
            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: "CONCEPTO", border: [true, true, false, true] },
                            { text: "MONTO", alignment: 'center', border: [false, true, true, true] }
                        ],
                        [
                            { text: reciboData.ConceptoPago, alignment: 'center', bold: true, border: [true, true, false, true] },
                            { text: "$ " + reciboData.MontoPago.toFixed(2), fillColor: '#EAEDED', alignment: 'center', border: [false, true, true, true] }
                        ]
                    ]
                }
            },

            { text: "\n\n" },
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAArCAYAAAAkL+tRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAPySURBVHja3NpbiFVVGMDxXwRdVAQdiSZCksrAqCjTgiIOTT3UdLEJpCwKkpAKBMMuNJIREXS/wEg6PXQz6EahJWM2RlkPNSRlYVlIRlhRMuIUxGR2eph1YM/m7LP36lxmTh+s87LX7b/3t771XY5yuayKzEIP7sMaPIEV6MIR2lTK5XL4GS/L8AnKVdqfGMDV/wfgmfg0A7RaG8CUdgb+NgW0DXdiMa7HI/g+1WcXDm9H4OUpkJU1xj2V6vviJGI6ESV0B3szNwv46wTA1gITD6agj59AyAvRjz0ZR283+lBKAic73FZgke7UmCsnALQbQxE2544k8E+JB88VWKyUmqyrhaDzsDEC9CV0plX6yUSHf3BmzqLrEv3/xtQWgM7A0xGgnwV1r3qGZwTQSudRXJax8HWpiZe3AHYlRgqCjuDWItfSRVUGD+Iu3BjANqSer2sy6FXYGfFV1wZ/orCndS6+Kjj5O00EPRtbIkA/wML/6lrCDeFrjuaozqs4p4Ggx+CZCNDfsLReXzopHViC9dhXY+HBOv3rw3BP8NWLwj4WayyLACflSFwevuqhjE3sCgYjxt28Fj9EgL6LUxsZLRWR47Aawxmb2ou7Ma3GHOeHs1cUdA+uaUZ4GCPTgmplbXI/elMx9Gy8HAFaxv1B7U00cEXOy1HLX4JxuT113+e1N9MBwGQBrpzxrZFfLqvtxKWtynjUKwN1gB4M1rqlKZ5GyIZI1f09BC1NDTObCQwHIoBXT2QSrxGyOVKV/8DzwYK3HfC2Os7woXCNtQVwJ7Y3yEp/04wsSiOBFwfDkwXwOS4OfvlwBPjbIcMxaYDn4bUaG96Nm1NjplfJfOa1BzWg4lEPcCnHPfwCNxV4WW9EQO8NiYiWAZ8enIIdOWFiT+Q+LgkvqCj4+zirWcAXGKs4fJnjHa3F/Do17hb8GgG+plY6Jwa4A4/WSGxX2s/BYTi2gYb0aDwcAT1SMI+eCdyTY22TbaiJPsIpeD0CfCjYlSjgK6pM1BeymSeFLMNS/Jh4Pow5TQTvElddWB+SE7nA00NCvTLwABZkjJsSrptK3x0tcIOXhZi6CPRoSC3XBO41vvJwRs4G0rWlBS2APgoPRHpri7KAk9XAjQUWn5WafJXWyRy8EgH+VsVbSwJ/lOjQX2DR+alJ79V6KeHDCPAlSeBkkWpfATfuvdRkC02clPBsSBEfNL7I9x1eCL5+ZxJ4bgpgO06oMvnsKr7zJpNHZuLkwNORdy31VlGDTXjcWDl1S4bP3Jb/8ajICvxV8Ez0NyJXPNHAlUB+FT5Oxa77jf1/6yGcpg2lVvAw1VhBvDd4W33hJSwyVuHTrsD/DgBWuslpoXaojgAAAABJRU5ErkJggg==", width: 15, border: [false, false, false, false], alignment: 'center' },
                            { text: "----------------------------------------------------------------------------------------------------------------------------------------------------", border: [false, false, false, false] }
                        ]
                    ]
                }
            },
            { text: "\n\n" },

            { text: '\nRECIBO DE PAGO', bold: true, decoration: 'underline', italics: true, fontSize: 18, alignment: 'center' },
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: logoIMG, width: 100, alignment: 'center', border: [false, false, false, false] },
                            {
                                table: {
                                    widths: ['*', 'auto'],
                                    body: [
                                        [
                                            { text: reciboData.NombreCentro, bold: true, border: [false, false, false, false] },
                                            { text: [{ text: "Telf: " }, { text: reciboData.Telefono, bold: true }], alignment: 'right', border: [false, false, false, false] }
                                        ],
                                        [
                                            { text: [{ text: "Folio: " }, { text: reciboData.FolioPago, bold: true }], border: [false, false, false, false] },
                                            { text: [{ text: "Fecha: " }, { text: CrearCadOracion(reciboData.FechaEmision), bold: true }], alignment: 'right', border: [false, false, false, false] }
                                        ],
                                        [
                                            { text: reciboData.DireccionCentro, colSpan: 2, alignment: 'right', border: [false, false, false, false] }
                                        ]
                                    ],
                                },
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                },
            },
            {
                table: {
                    widths: ['*', 'auto', '*', 'auto'],
                    body: [
                        [
                            {
                                text: [
                                    { text: "Nombre del paciente:\n" },
                                    { text: reciboData.NombrePaciente, bold: true }
                                ], colSpan: 3
                            }, {}, {},
                            {
                                text: [
                                    { text: "Identificación Paciente:\n" },
                                    { text: reciboData.CedulaPaciente, bold: true }
                                ]
                            }
                        ],
                        [
                            { text: "Tipo de Pago: ", alignment: 'right', border: [true, true, false, true] },
                            { text: reciboData.TipoPago, fillColor: '#EAEDED', border: [false, true, true, true] },
                            { text: "Referencia: ", alignment: 'right', border: [false, true, false, true] },
                            { text: reciboData.ReferenciaPago, fillColor: '#EAEDED', border: [false, true, true, true] }
                        ]
                    ]
                },
            },
            { text: "\n", fontSize: 5 },
            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: "CONCEPTO", border: [true, true, false, true] },
                            { text: "MONTO", alignment: 'center', border: [false, true, true, true] }
                        ],
                        [
                            { text: reciboData.ConceptoPago, alignment: 'center', bold: true, border: [true, true, false, true] },
                            { text: "$ " + reciboData.MontoPago.toFixed(2), fillColor: '#EAEDED', alignment: 'center', border: [false, true, true, true] }
                        ]
                    ]
                }
            },
        ]
    };
    try {
        pdfMake.createPdf(reciboPago).open();
    } catch (e) {
        ErrorLog(e.toString(), "Imprimir Recibo");
    }
}

// FUNCION QUE IMPRIME CONTRATO DE TIPO VOLUNTARIO
function imprimirContratoCV(jsonCV, logoIMG) {
    var pagoPacienteJSON = {
        text: [
            { text: "Aportación monetaria de ingreso de " },
            { text: "$ " + jsonCV.MontoPago.toFixed(2), bold: true, decoration: 'underline' },
            { text: " " + jsonCV.TipoMoneda, bold: true },
            { text: ", misma que liquidaré al ingreso." },
        ], alignment: 'justify', fontSize: 12
    };
    if (jsonCV.Parcialidad) {
        pagoPacienteJSON = {
            text: [
                { text: "Aportaciones monetarias con una periodicidad " },
                { text: jsonCV.TipoPago, bold: true },
                { text: " dividida en " },
                { text: jsonCV.CantidadPagos.toString(), bold: true },
                { text: " exhibiciones de " },
                { text: "$ " + jsonCV.MontoPagoParcial.toFixed(2), bold: true, decoration: 'underline' },
                { text: " " + jsonCV.TipoMoneda, bold: true },
                { text: ", las cuales comenzarán el día " },
                { text: jsonCV.FechaInicioPago.toUpperCase(), bold: true },
                { text: " y finalizan el día " },
                { text: jsonCV.FechaFinPago.toUpperCase() + ".", bold: true },
            ], alignment: 'justify', fontSize: 12
        };
    }
    var contrato = {
        pageSize: 'LETTER',
        pageMargins: [50, 60, 50, 70],
        footer: function (currentPage, pageCount) {
            return [
                {
                    text: [
                        { text: "\n" },
                        { text: "Página " + currentPage.toString() + " de " + pageCount.toString(), alignment: 'right' },
                        { text: "--------------------", color: 'white' }
                    ], fontSize: 9
                }
            ]
        },
        content: [
            {
                table: {
                    widths: ['auto', '*', 'auto'],
                    body: [
                        [
                            { image: logoIMG, width: 120, alignment: 'center', border: [false, false, false, false] },
                            { text: jsonCV.NombreCentro + "\n" + jsonCV.ClaveCentro, bold: true, fontSize: 15, border: [false, false, false, false] },
                            {
                                table: {
                                    widths: [100],
                                    body: [
                                        [
                                            { text: "Folio", fontSize: 11, bold: true, alignment: 'center', fillColor: '#EAEDED' }
                                        ],
                                        [
                                            { text: jsonCV.FolioContrato, fontSize: 10, alignment: 'center' }
                                        ]
                                    ]
                                },
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                }
            },
            { text: "\n\n" },
            { text: "Consentimiento Informado Voluntario Mixto (CIV-M)", fontSize: 15, bold: true, alignment: 'center' },
            { text: "\n\n" },
            {
                text: [
                    { text: "Consentimiento Informado de: ", fontSize: 13 },
                    { text: jsonCV.NombrePaciente, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Info del: ", fontSize: 13 },
                    { text: jsonCV.NombreCentro, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Revisión: ", fontSize: 13 },
                    { text: ContratoVoluntarioRevision, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Versión: ", fontSize: 13 },
                    { text: ContratoVoluntarioVersion, fontSize: 13, bold: true }
                ],
            },
            { text: "\n" },
            {
                table: {
                    widths: ['*', 120],
                    body: [
                        [
                            { text: "Título", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Código", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "Consentimiento Informado", fontSize: 12 },
                            { text: "FA-02", fontSize: 12 }
                        ]
                    ]
                }
            },
            { text: "\n", fontSize: 5 },
            {
                table: {
                    widths: ['auto', '*', 100],
                    body: [
                        [
                            { text: "Expendiente Número", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Fecha y Hora de Ingreso", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Tipo Ingreso", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "001", fontSize: 12 },
                            { text: CrearCadOracion(jsonCV.FechaIngreso), fontSize: 12 },
                            { text: "Voluntario", fontSize: 12 },
                        ]
                    ]
                }
            },
            { text: "\n\n" },
            { text: "Por parte del usuario:", fontSize: 14, bold: true },
            { text: "\n" },
            {
                text: [
                    { text: "---------------------------------------", color: 'white' },
                    { text: "Por medio de la presente, yo " },
                    { text: jsonCV.NombrePaciente, bold: true, decoration: 'underline' },
                    { text: ", de sexo " },
                    { text: jsonCV.SexoPaciente, bold: true },
                    { text: " con " },
                    { text: jsonCV.EdadPaciente, bold: true },
                    { text: " años de edad, declaro haber sido informado(a) que el establecimiento " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " ubicado en el domicilio " },
                    { text: jsonCV.DomicilioDoc, bold: true },
                    { text: ", ofrece un tratamiento residencial por un tiempo de " },
                    { text: jsonCV.Estancia, bold: true },
                    { text: ", que tiene la finalidad de brindar atención para mi consumo de alcohol y/o drogas.\nDicho tratamiento se basa en un modelo de tratamiento MIXTO cuyo objetivo consiste en lograr la abstinencia y la reinserción social." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "El programa está estructurado en 3 fases (INGRESO, PROGRESO Y EGRESO) con sus etapas y actividades complementarias.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            {
                text: [
                    { text: "Estoy de acuerdo en participar activamente durante todo el proceso de tratamiento, lo que implica proporcionar información veraz y fidedigna al momento de las evaluaciones, realizar las actividades planificadas por el equipo de " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " conformado por Consejero, médico y/o psicólogo, coordninación y personal profesional. Cumplir el reglamento interno, asistir a las sesiones de seguimiento una vez terminado el tratamiento, todo ello en beneficio de lograr mi abstinencia y facilitar mi reinserción social." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "Acepto de que en caso necesario y al no obtener los resultados esperados, se me proporcione información por escrito o verbal respecto a otro tipo de alternativas de atención. Tengo conocimiento de que la relación de mi persona con el personal del establecimiento, será únicamente profesional.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "Por otra parte, me comprometo a cumplir con las siguientes aportaciones monetarias:", alignment: 'justify', fontSize: 12 },
            { text: "\n" },

            pagoPacienteJSON,

            { text: "\n" },
            { text: "En caso de necesitar atención médica, previo aviso, cubriré los gastos que generen los honorarios médicos, los medicamentos que necesite y los servicios de traslado y hospitalización si es necesaria, todo en beneficio de tener acceso a servicios dignos y apropiados durante mi estancia.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            {
                text: [
                    { text: "En el caso de cancelar mi permanencia antes de haber cumplido con el período de tratamiento, estoy de acuerdo en cubrir los atrasos en mis aportaciones hasta el momento de mi egreso y no reclamar devolución alguna de las aportaciones monetarias y/o aportaciones en especie dadas por mi persona, amigos, conocidos y/o familiares en mi nombre a " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: ". En caso de no contar con los recursos económicos necesarios para pagar las aportaciones antes mencionadas, estoy de acuerdo en prestar servicio social, durante mi estancia en este establecimiento, hasta saldar el adeudo." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Estoy de acuerdo en recibir visitas de mis familiares, representante legal y/o amigos en los términos y condiciones que el equipo de " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " considere adecuados para promover mi rehabilitación y reinserción social, respetando mi integridad y derechos en todo momento." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Estoy de acuerdo en que el equipo de " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " recabe mis datos, imágenes y/o videos de mi persona para mi seguridad y expediente electrónico e impreso, estoy de acuerdo en que todos los datos que se recaben sobre mi persona en evaluaciones, test, dinámicas y reportes se utilicen con fines estadísticos, de investigación , control de calidad y cualquier otra forma que " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " considere pertinente, sin que se revele y/o publique mi identidad personal, fotografías y/o videos de mi persona con excepción de las que indique la ley." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "Ratifico que he sido informado respecto a las características del tratamiento, los procedimientos, los riesgos que implica, los costos, así como los beneficios esperados y estoy de acuerdo en los requerimientos necesarios para su aplicación.", alignment: 'justify', fontSize: 12, pageBreak: 'after' },

            {
                text: [
                    { text: "Consentimiento Informado de: ", fontSize: 13 },
                    { text: jsonCV.NombrePaciente, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Info del: ", fontSize: 13 },
                    { text: jsonCV.NombreCentro, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Revisión: ", fontSize: 13 },
                    { text: ContratoVoluntarioRevision, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Versión: ", fontSize: 13 },
                    { text: ContratoVoluntarioVersion, fontSize: 13, bold: true }
                ],
            },
            { text: "\n\n" },
            {
                table: {
                    widths: ['*', 120],
                    body: [
                        [
                            { text: "Título", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Código", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "Consentimiento Informado", fontSize: 12 },
                            { text: "FA-02", fontSize: 12 }
                        ]
                    ]
                }
            },
            { text: "\n\n" },
            { text: "Por parte del establecimiento:", fontSize: 14, bold: true },
            { text: "\n" },
            {
                text: [
                    { text: "---------------------------------------", color: 'white' },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a brindar un servicio de atención de calidad que facilite la recuperación y la reinserción del usuario a una vida productiva, garantizando en todo momento el respeto a la integridad del usuario y haciendo valer sus derechos. Por ello, en el caso de que el usuario desee suspender el tratamiento antes de que éste finalice, el centro se compromete a no mantenerlo de forma involuntaria y a brindarle la información y la orientación necesaria para continuar con el proceso de rehabilitación en otra instancia" },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "Se pone de manifiesto que los datos personales del usuario o datos que hagan posible su identificación son de carácter confidencial y sólo tendrán acceso a éstos el equipo involucrado en el proceso terapéutico, por lo que no se revelarán a ningún otro individuo, si no es bajo el consentimiento escrito del usuario, exceptuando los casos previstos por la ley y autoridades sanitarias.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En el caso de que el usuario presente una condición médica previa al ingreso, el establecimiento dará continuidad al tratamiento médico o farmacológico, suministrando los medicamentos en las dosis y horarios indicados, siempre y cuando éstos sean proporcionados por prescripción médica y existan los estudios y recetas avaladas por un médico certificado y no se contraindique con el tratamiento recibido durante la estancia. ", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En caso de que el usuario requiera estudios complementarios o el servicio de un médico especializado, se le informará al respecto y se dará aviso a los familiares. En el caso de que el usuario requiera atención médica urgente, se dará aviso inmediato a los familiares y se trasladará a algún hospital del segundo nivel de atención. En caso de que el usuario tenga que ser referido a otra institución, ya sea por el consejero, médico y/o psicólogo se le notificará al usuario, a la familia y/o representante legal.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            {
                text: [
                    { text: "Por otro lado, el establecimiento se exime de toda responsabilidad por los actos en contra de la ley en que el usuario se haya visto involucrado, previo y posterior al tratamiento. En caso de que el usuario abandone las instalaciones sin autorización del responsable, se le notificara a su familia, el " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se exime de toda responsabilidad en caso de que el usuario abandone las instalaciones sin autorización del responsable." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "En el caso de que el usuario o sus familiares presenten alguna duda respecto al proceso de rehabilitación o a cualquier otro asunto relacionado con el mismo, " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a aclararla y a proporcionar información relativa al estado de salud del usuario y evolución del tratamiento cada que el familiar directo o representante legal lo solicite." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Finalmente " },
                    { text: jsonCV.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a proporcionar y a dar lectura del reglamento interno del establecimiento al usuario, familiar y/o responsable legal." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Siendo el " },
                    { text: CrearCadOracion(jsonCV.FechaFirma) + ", en ", bold: true },
                    { text: jsonCV.Municipio + ", " + CrearCadOracion(jsonCV.Estado.toLowerCase()) + ", México", bold: true },
                    { text: " y habiendo sido informado y aceptando los compromisos anteriormente expuestos. Firman el presente consentimiento." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n\n\n\n\n" },
            {
                text: [
                    { text: "____________________________________________\n" },
                    { text: jsonCV.NombreCentro + "\n", bold: true, decoration: 'underline' },
                    { text: jsonCV.NombreDirector, fontSize: 11, bold: true },
                    { text: "\nDIRECTOR", fontSize: 10 },
                ], alignment: 'center'
            },
            { text: "\n\n\n" },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            {
                                text: [
                                    { text: "___________________________________\n" },
                                    { text: jsonCV.NombrePaciente, bold: true },
                                    { text: "\nPACIENTE", fontSize: 10 },
                                ], alignment: 'center', border: [false, false, false, false]
                            },
                            {
                                text: [
                                    { text: "___________________________________\n" },
                                    { text: jsonCV.Testigo, bold: true },
                                    { text: "\nTESTIGO", fontSize: 10 },
                                ], alignment: 'center', border: [false, false, false, false]
                            },
                        ]
                    ]
                }
            },
        ]
    };
    try {
        pdfMake.createPdf(contrato).open();
    } catch (e) {
        ErrorLog(e.toString(), "Imprimir Contrato");
    }
}

// FUNCION QUE IMPRIME CONTRATO DE TIPO INVOLUNTARIO
function imprimirContratoCI(jsonCI, logoIMG) {
    var pagoPacienteJSON = {
        text: [
            { text: "- Aportación monetaria de ingreso de " },
            { text: "$ " + jsonCI.MontoPago.toFixed(2), bold: true, decoration: 'underline' },
            { text: ", misma que liquidaré al ingreso." },
        ], alignment: 'justify', fontSize: 12
    };
    if (jsonCI.Parcialidad) {
        pagoPacienteJSON = {
            text: [
                { text: "Aportaciones monetarias con una periodicidad " },
                { text: jsonCI.TipoPago, bold: true },
                { text: " dividida en " },
                { text: jsonCI.CantidadPagos.toString(), bold: true },
                { text: " exhibiciones de " },
                { text: "$ " + jsonCI.MontoPagoParcial.toFixed(2), bold: true, decoration: 'underline' },
                { text: " " + jsonCI.TipoMoneda, bold: true },
                { text: ", las cuales comenzarán el día " },
                { text: jsonCI.FechaInicioPago.toUpperCase(), bold: true },
                { text: " y finalizan el día " },
                { text: jsonCI.FechaFinPago.toUpperCase() + ".", bold: true },
            ], alignment: 'justify', fontSize: 12
        };
    }
    var contrato = {
        pageSize: 'LETTER',
        pageMargins: [50, 60, 50, 70],
        footer: function (currentPage, pageCount) {
            return [
                {
                    text: [
                        { text: "\n" },
                        { text: "Página " + currentPage.toString() + " de " + pageCount.toString(), alignment: 'right' },
                        { text: "--------------------", color: 'white' }
                    ], fontSize: 9
                }
            ]
        },
        content: [
            {
                table: {
                    widths: ['auto', '*', 'auto'],
                    body: [
                        [
                            { image: logoIMG, width: 120, alignment: 'center', border: [false, false, false, false] },
                            { text: jsonCI.NombreCentro + "\n" + jsonCI.ClaveCentro, bold: true, fontSize: 15, border: [false, false, false, false] },
                            {
                                table: {
                                    widths: [100],
                                    body: [
                                        [
                                            { text: "Folio", fontSize: 11, bold: true, alignment: 'center', fillColor: '#EAEDED' }
                                        ],
                                        [
                                            { text: jsonCI.FolioContrato, fontSize: 10, alignment: 'center' }
                                        ]
                                    ]
                                },
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                }
            },
            { text: "\n" },
            { text: "Consentimiento Informado Involuntario Mixto (CIV-M)", fontSize: 15, bold: true, alignment: 'center' },
            { text: "\n" },
            {
                text: [
                    { text: "Consentimiento Informado de: ", fontSize: 13 },
                    { text: jsonCI.NombrePaciente, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Info del: ", fontSize: 13 },
                    { text: jsonCI.NombreCentro, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Revisión: ", fontSize: 13 },
                    { text: ContratoInvoluntarioRevision, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Versión: ", fontSize: 13 },
                    { text: ContratoInvoluntarioVersion, fontSize: 13, bold: true }
                ],
            },
            { text: "\n" },
            {
                table: {
                    widths: ['*', 120],
                    body: [
                        [
                            { text: "Título", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Código", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "Consentimiento Informado", fontSize: 12 },
                            { text: "FA-02", fontSize: 12 }
                        ]
                    ]
                }
            },
            { text: "\n", fontSize: 5 },
            {
                table: {
                    widths: ['auto', 'auto', '*'],
                    body: [
                        [
                            { text: "Expendiente Número", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Fecha y Hora de Ingreso", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Tipo Ingreso", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "001", fontSize: 12 },
                            { text: CrearCadOracion(jsonCI.FechaIngreso), fontSize: 12 },
                            { text: "Voluntario", fontSize: 12 },
                        ]
                    ]
                }
            },
            { text: "\n\n" },
            { text: "Por parte del familiar:", fontSize: 14, bold: true },
            { text: "\n" },
            {
                text: [
                    { text: "-------------------------", color: 'white' },
                    { text: "Por medio de la presente, yo " },
                    { text: jsonCI.FamiliarNombre, bold: true, decoration: 'underline' },
                    { text: " declaro haber sido informado(a) que el establecimiento " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " ubicado en el domicilio " },
                    { text: jsonCI.DomicilioDoc, bold: true },
                    { text: " ofrece un tratamiento residencial por un tiempo de " },
                    { text: jsonCI.Estancia, bold: true },
                    { text: ", que tiene la finalidad de brindar atención para el consumo de alcohol o drogas de mi  " },
                    { text: jsonCI.Parentesco, bold: true },
                    { text: " de sexo " },
                    { text: jsonCI.SexoPaciente, bold: true },
                    { text: " con " },
                    { text: jsonCI.EdadPaciente, bold: true },
                    { text: " años de edad. Dicho tratamiento que personalmente he solicitado se basa en un modelo de tratamiento " },
                    { text: jsonCI.TipoTratamiento, bold: true },
                    { text: " cuyo objetivo consiste en lograr la abstinencia y la reinserción social, dividido en " },
                    { text: jsonCI.FasesCantTratamiento, bold: true }, /* <- POSIBLE VARIABLE */
                    { text: " fases " },
                    { text: jsonCI.FasesTratamiento, bold: true }, /* <- POSIBLE VARIABLE */
                    { text: "  con sus etapas y actividades complementarias." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "Estoy de acuerdo en participar activamente durante todo el proceso de tratamiento de mi familiar con la finalidad de lograr su recuperación y facilitar su reinserción, lo que implica proporcionar información veraz y fidedigna al momento de las evaluaciones, para lo cual asistiré a las sesiones que el equipo de atención me indique. En caso necesario y al no obtener los resultados esperados, acepto se me proporcione información por escrito o verbal respecto a otro tipo de alternativas de atención a donde puedo acudir yo o mi familiar.", alignment: 'justify', fontSize: 12 },
            { text: "Tengo conocimiento de que la relación de mi persona y mi familiar con el personal del establecimiento será únicamente profesional. En caso de que mi familiar necesite atención médica cubriré los gastos que generen los honorarios médicos, los medicamentos que necesite y los servicios de traslado y hospitalización si es necesaria, también me han informado que se me notificará antes de realizar dichos gastos siempre y cuando no se trate de una emergencia, todo en beneficio de que mi familiar tenga acceso a servicios dignos y apropiados durante su estancia.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En el caso de cancelar la permanencia de mi familiar antes de haber cumplido con el período de tratamiento, estoy de acuerdo en cubrir los atrasos en mis aportaciones hasta el momento de su egreso y no reclamar devolución alguna de las aportaciones monetarias o aportaciones en especie dadas por mi persona, amigos, conocidos o familiares en mi nombre.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            {
                text: [
                    { text: "Estoy de acuerdo en que el equipo de " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " recabe los datos, imágenes o videos de mi familiar para su seguridad, expediente electrónico o impreso. Estoy de acuerdo en que todos los datos que se recaben de mi familiar en evaluaciones, test, dinámicas, instrumentos y reportes se utilicen con fines estadísticos, de investigación, control de calidad y cualquier otra forma que considere pertinente, sin que se revele o publique la identidad personal, fotografías o videos de mi familiar, todo esto conforme a la Ley de Protección de Datos Personales. Estoy de acuerdo en visitar a mi familiar en los términos y condiciones que el equipo de " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " considere adecuados para para mi familiar, respetando sus derechos en todo momento." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "También, me comprometo a cumplir con las siguientes aportaciones monetarias: ", alignment: 'justify', fontSize: 12 },
            { text: "\n" },

            pagoPacienteJSON,

            { text: "\n" },
            { text: "En caso de que incumpla con el pago de las aportaciones, tanto de ingreso o periódicas a las cuales me he comprometido, acepto se me llame o requiera mi presencia por motivos de cobranza, en caso de que no acuda a las oficinas y liquide mi adeudo, estoy de acuerdo en que se suspenda el servicio que brinda este establecimiento a mi persona y el residencial a mi familiar, dando con esto por concluida la relación que tengo y tiene mi familiar con el establecimiento en cualquiera de las siguientes situaciones que se mencionan a continuación:", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "1. Adeudo en aportaciones periódicas o de ingreso por el equivalente a 4 semanas o más.", alignment: 'justify', fontSize: 11 },
            { text: "2. Adeudo de más de 2 semanas en medicamento, atención médica, atención psicológica, atención psiquiátrica, alimentación especial, gasolina de traslados o cualquier gasto especial que realice el establecimiento en la atención a mi familiar o mi persona.", alignment: 'justify', fontSize: 11 },
            { text: "\n" },
            { text: "En caso de que mi familiar abandone las instalaciones del establecimiento sin autorización del responsable por cualquier motivo, se me ha informado que se respetará la aportación de ingreso durante el tiempo que falte para concluir el periodo de tratamiento desde la fecha de ingreso. Confirmo que he sido informado(a) respecto a las características del tratamiento en el que participará mi familiar, los procedimientos, los riesgos que implica, los costos, así como los beneficios esperados, y estoy de acuerdo en los requerimientos necesarios para su aplicación.", alignment: 'justify', fontSize: 12, pageBreak: 'after' },
            {
                text: [
                    { text: "Info del: ", fontSize: 13 },
                    { text: jsonCI.NombreCentro, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Revisión: ", fontSize: 13 },
                    { text: ContratoInvoluntarioRevision, fontSize: 13, bold: true }
                ],
            },
            {
                text: [
                    { text: "Versión: ", fontSize: 13 },
                    { text: ContratoInvoluntarioVersion, fontSize: 13, bold: true }
                ],
            },
            { text: "\n\n" },
            {
                table: {
                    widths: ['*', 120],
                    body: [
                        [
                            { text: "Título", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' },
                            { text: "Código", fontSize: 12, bold: true, alignment: 'left', fillColor: '#EAEDED' }
                        ],
                        [
                            { text: "Consentimiento Informado", fontSize: 12 },
                            { text: "FA-02", fontSize: 12 }
                        ]
                    ]
                }
            },
            { text: "\n\n" },
            { text: "Por parte del establecimiento:", fontSize: 14, bold: true },
            { text: "\n" },
            {
                text: [
                    { text: "---------------------------------------", color: 'white' },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a brindar un servicio de atención de calidad que facilite la recuperación y la reinserción del usuario a una vida productiva, garantizando en todo momento el respeto a la integridad del usuario y haciendo valer sus derechos. Se pone de manifiesto que los datos personales del usuario o datos que hagan posible su identificación son de carácter confidencial y sólo tendrán acceso a éstos el equipo involucrado en el proceso terapéutico, por lo que no se revelarán a ningún otro individuo, si no es bajo el consentimiento escrito del usuario, exceptuando los casos previstos por la ley y autoridades sanitarias." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            { text: "En el caso de que el usuario presente una condición médica previa al ingreso, el establecimiento dará continuidad al tratamiento médico o farmacológico, suministrando los medicamentos en las dosis y horarios indicados, siempre y cuando éstos sean proporcionados por prescripción médica y existan los estudios y recetas avaladas por un médico certificado y no se contraindique con el tratamiento recibido durante la estancia.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En caso de que el usuario requiera estudios complementarios o el servicio de un médico especializado, se le informará al respecto y se dará aviso a los familiares.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En el caso de que el usuario requiera atención médica urgente, se dará aviso inmediato a los familiares y se trasladará a algún hospital del siguiente nivel de atención.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            { text: "En caso de que el usuario tenga que ser referido a otra institución, ya sea por el consejero, médico y/o psicólogo se le notificará al usuario, a la familia y/o representante legal.", alignment: 'justify', fontSize: 12 },
            { text: "\n" },
            {
                text: [
                    { text: "Por otro lado, el establecimiento se exime de toda responsabilidad por los actos en contra de la ley en que el usuario se haya visto involucrado, previo y posterior al tratamiento. En caso de que el usuario abandone las instalaciones sin autorización del responsable, se le notificara a su familia, el " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se exime de toda responsabilidad en caso de que el usuario abandone las instalaciones sin autorización del responsable." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "En el caso de que el usuario o sus familiares presenten alguna duda respecto al proceso de rehabilitación o a cualquier otro asunto relacionado con el mismo, " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a aclararla y a proporcionar información relativa al estado de salud del usuario y evolución del tratamiento cada que el familiar directo o representante legal lo solicite." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Finalmente " },
                    { text: jsonCI.NombreCentro, bold: true, decoration: 'underline' },
                    { text: " se compromete a proporcionar y a dar lectura del reglamento interno del establecimiento al usuario, familiar y/o responsable legal." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n" },
            {
                text: [
                    { text: "Siendo el " },
                    { text: CrearCadOracion(jsonCI.FechaFirma) + ", en ", bold: true },
                    { text: jsonCI.Municipio + ", " + CrearCadOracion(jsonCI.Estado.toLowerCase()) + ", México", bold: true },
                    { text: " y habiendo sido informado y aceptando los compromisos anteriormente expuestos. Firman el presente consentimiento." },
                ], alignment: 'justify', fontSize: 12
            },
            { text: "\n\n\n\n\n" },
            {
                text: [
                    { text: "____________________________________________\n" },
                    { text: jsonCI.NombreCentro + "\n", bold: true, decoration: 'underline' },
                    { text: jsonCI.NombreDirector, fontSize: 11, bold: true },
                    { text: "\nDIRECTOR", fontSize: 10 },
                ], alignment: 'center'
            },
            { text: "\n\n\n" },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            {
                                text: [
                                    { text: "___________________________________\n" },
                                    { text: /*jsonCI.NombrePaciente*/jsonCI.FamiliarNombre, bold: true },
                                    { text: "\nFAMILIAR DEL PACIENTE", fontSize: 10 },
                                ], alignment: 'center', border: [false, false, false, false]
                            },
                            {
                                text: [
                                    { text: "___________________________________\n" },
                                    { text: jsonCI.Testigo, bold: true },
                                    { text: "\nTESTIGO", fontSize: 10 },
                                ], alignment: 'center', border: [false, false, false, false]
                            },
                        ]
                    ]
                }
            },
        ]
    }
    try {
        pdfMake.createPdf(contrato).open();
    } catch (e) {
        ErrorLog(e.toString(), "Imprimir Contrato");
    }
}

// FUNCION QUE IMPRIME EL REPORTE DE INVENTARIO (GENERAL, MINIMOS, ENTRADAS, SALIDAS)
function imprimirInventarioReporte(jsonInventario, gestion) {
    var logoIMG = JSON.parse(jsonInventario.Logo);
    var tablasInventario = [], fechasRangoBusq = "";;
    $(jsonInventario.InventarioData).each(function (k1, v1) {
        tablasInventario.push({
            text: v1.Area + "\n", bold: true, fontSize: 12,
        });
        var tablaInv = {
            table: {
                widths: [],
                body: [],
            },
        };
        var headersTabla = paramsInventarioPDF(2, gestion);
        var filas = [];
        for (i = 0; i < headersTabla.length; i++) {
            tablaInv.table.widths.push(headersTabla[i].split("ø")[1]);
            filas.push({
                text: headersTabla[i].split("ø")[0],
                bold: true,
                alignment: 'center',
                fontSize: 10,
                fillColor: '#D5D8DC',
            });
        }
        tablaInv.table.body.push(filas);
        $(v1.InventarioData).each(function (k2, v2) {
            filas = [];
            var data1 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2" || gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data1["text"] = v2.Codigo;
                filas.push(data1);
            }

            var data2 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2" || gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data2["text"] = v2.Nombre;
                filas.push(data2);
            }

            var data3 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2" || gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data3["text"] = v2.Presentacion;
                filas.push(data3);
            }

            var data4 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2") {
                data4["text"] = "$ " + v2.PrecioCompra.toFixed(2);
                filas.push(data4);
            } else if (gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data4["text"] = v2.Area;
                if (v2.Area === "Salida") {
                    data4["fillColor"] = "#F5B7B1";
                } else {
                    data4["fillColor"] = "#ABEBC6";
                }
                filas.push(data4);
            }

            var data5 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2") {
                data5["text"] = "$ " + v2.PrecioVenta.toFixed(2);
                filas.push(data5);
            } else if (gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data5["text"] = v2.Existencias.toFixed(4);
                filas.push(data5);
            }

            var data6 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2") {
                data6["text"] = "$ " + v2.Existencias.toFixed(4);
                if (v2.Existencias < v2.Stock) {
                    data6["fillColor"] = "#F5B7B1";
                }
                filas.push(data6);
            } else if (gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data6["text"] = v2.Usuario;
                filas.push(data6);
            }

            var data7 = {
                bold: false,
                fontSize: 8,
            };
            if (gestion == "G1" || gestion == "G2") {
                data7["text"] = "$ " + v2.Stock.toFixed(4);
                filas.push(data7);
            } else if (gestion == "E1" || gestion == "E2" || gestion == "E3") {
                data7["text"] = v2.FechaTxt;
                filas.push(data7);
                fechasRangoBusq = "\nRango de Busqueda: " + v2.FechaBusquedaIni + " a " + v2.FechaBusquedaFin;
            }

            tablaInv.table.body.push(filas);
        });
        tablasInventario.push(tablaInv);
        tablasInventario.push({
            text: "\n"
        });
    });
    var inventario = {
        pageSize: 'LETTER',
        pageMargins: [50, 60, 50, 70],
        footer: function (currentPage, pageCount) {
            return [
                {
                    text: [
                        { text: "\n" },
                        { text: "Página " + currentPage.toString() + " de " + pageCount.toString(), alignment: 'right' },
                        { text: "--------------------", color: 'white' }
                    ], fontSize: 9
                }
            ]
        },
        content: [
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: logoIMG.LogoCentro, width: 120, alignment: 'center', border: [false, false, false, false] },
                            {
                                text: [
                                    { text: jsonInventario.NombreCentro + "\n", bold: true, fontSize: 15, },
                                    { text: jsonInventario.Direccion + ", " + jsonInventario.Colonia + " C.P." + jsonInventario.CodigoPostal + " Tel: (" + jsonInventario.Telefono + ")" + "\n", bold: true, fontSize: 14, },
                                    { text: jsonInventario.Estado + ", " + jsonInventario.Municipio + "\n\n", bold: true, fontSize: 14, },
                                    { text: paramsInventarioPDF(1, gestion), bold: true, fontSize: 14, },
                                ],
                                alignment: 'center',
                                bold: true, fontSize: 15,
                                border: [false, false, false, false],
                            },
                        ]
                    ]
                },
            },
            { text: "\n" },
            { text: fechasRangoBusq, bold: true, fontSize: 12, alignment: 'center' },
        ],
    };
    $(tablasInventario).each(function (key, value) {
        inventario.content.push(value);
    });
    try {
        pdfMake.createPdf(inventario).open();
    } catch (e) {
        ErrorLog(e.toString(), "Imprimir Reporte Inventario");
    }
}

// FUNCION QUE IMPRIME UN HORARIO ESPECIFICO
function imprimirHorario(jsonHorario, jsonInfo, centroInfo, centroLogo) {
    var tablaCUerpo = [
        [
            { text: "HORARIO", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "LUNES", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "MARTES", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "MIERCOLES", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "JUEVES", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "VIERNES", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "SABADO", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
            { text: "DOMINGO", fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] },
        ],
    ];
    $(jsonHorario).each(function (key, value) {
        var td = [];
        td.push({ text: ((jsonInfo.Reloj === '12hrs') ? value.HoraInicio12hrs + '\n' + value.HoraTermino12hrs : value.HoraInicio24hrs + '\n' + value.HoraTermino24hrs), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
        if (!value.Receso) {
            td.push({ text: paramTablaHorarios(value.Lunes, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Lunes, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Martes, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Martes, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Miercoles, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Miercoles, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Jueves, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Jueves, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Viernes, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Viernes, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Sabado, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Sabado, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
            td.push({ text: paramTablaHorarios(value.Domingo, 't', false).replace("<b>", "").replace("</b>", "").replace("<br />", "\n"), fillColor: paramTablaHorarios(value.Domingo, 'e', true), fontSize: 8, alignment: 'center', bold: true, border: [true, true, true, true] });
        } else {
            td.push({ text: "R        E        C        E        S        O", fontSize: 8, colSpan: 7, alignment: 'center', bold: true, border: [true, true, true, true] });
        }
        tablaCUerpo.push(td);
    });
    var docHorario = {
        pageSize: 'LETTER',
        pageMargins: [40, 40, 40, 40],
        content: [
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: centroLogo.LogoCentro, width: 100, alignment: 'center', border: [false, false, false, false] },
                            {
                                text: [
                                    { text: "\n" + centroInfo.NombreCentro, alignment: 'center', fontSize: 12, bold: true },
                                    { text: "\n" + centroInfo.ClaveCentro, alignment: 'center', fontSize: 11, bold: false },
                                    { text: "\n" + centroInfo.DireccionCentro + ", Colonia: " + centroInfo.ColoniaCentro + " - C.P. " + centroInfo.CPCentro, alignment: 'center', fontSize: 11, bold: false },
                                    { text: "\n" + centroInfo.MunicipioCentro + ", " + centroInfo.EstadoCentro, alignment: 'center', fontSize: 11, bold: false },
                                    //{ text: "\nTeléfono: " + centroInfo.TelefonoCentro, alignment: 'center', fontSize: 11, bold: false },
                                ], border: [false, false, false, false]
                            },
                        ],
                    ],
                },
            },
            {
                text: "HORARIO DE ACTIVIDADES", fontSize: 12, colSpan: 7, alignment: 'center', bold: true
            },
            {
                table: {
                    widths: [45, '*', '*', '*', '*', '*', '*', '*'],
                    body: tablaCUerpo,
                },
            },
        ],
    };
    try {
        pdfMake.createPdf(docHorario).open();
        LoadingOff();
    } catch (e) {
        ErrorLog(e.toString(), "Imprimir Horario");
    }
}
// ********************************************************
// ARCHIVO JAVASCRIPT IMPRESIONES.JS
/* ---------------------------------------------- */

// ----------- VARIABLES GLOBALES ------------
// IMPORTANTE MANTENER ACTUALIZADAS ESTAS VARIABLES AL EDITAR LOS CONTRATOS
var ContratoVoluntarioVersion = "01";
var ContratoVoluntarioRevision = "05/03/2020";

var ContratoInvoluntarioVersion = "01";
var ContratoInvoluntarioRevision = "05/03/2020";
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
                            { text: "\n\nServicios de rehabilitación, atención médica y terapéutica\n\n\n\n", alignment: 'center', bold: true, border: [true, true, false, true] },
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
                            { text: "\n\nServicios de rehabilitación, atención médica y terapéutica\n\n\n\n", alignment: 'center', bold: true, border: [true, true, false, true] },
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
            {
                text: [
                    { text: "Aportación monetaria de ingreso de " },
                    { text: "$ " + jsonCV.MontoPago.toFixed(2), bold: true },
                    { text: " " + jsonCV.TipoMoneda, bold: true },
                    { text: ", misma que liquidaré al ingreso." },
                ], alignment: 'justify', fontSize: 12
            },
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
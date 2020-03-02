// ********************************************************
// ARCHIVO JAVASCRIPT IMPRESIONES.JS

// --------- FUNCIONES GENERALES ----------

// FUNCION QUE IMPRIME RECIBO DE PAGO
function imprimirReciboPago(reciboData) {
    var reciboPago = {
        content: [
            { text: '\nRECIBO DE PAGO', bold: true, decoration: 'underline', italics: true, fontSize: 18, alignment: 'center' },
            {
                table: {
                    widths: ['auto', '*'],
                    body: [
                        [
                            { image: 'sampleImage.jpg', fit: [120, 120], alignment: 'center', border: [false, false, false, false] },
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
                                            { text: [{ text: "Fecha: " }, { text: reciboData.FechaEmision, bold: true }], alignment: 'right', border: [false, false, false, false] }
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
            { text: "\n" },
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

            { text: "\n\n\n" },
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
                            { image: 'sampleImage.jpg', fit: [120, 120], alignment: 'center', border: [false, false, false, false] },
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
                                            { text: [{ text: "Fecha: " }, { text: reciboData.FechaEmision, bold: true }], alignment: 'right', border: [false, false, false, false] }
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
            { text: "\n" },
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
    }
    try {
        pdfMake.createPdf(reciboPago).open();
    } catch (e) {
        console.log(e.toString());
        MsgAlerta('Error!', 'Ocurrió un problema al generar <b>Recibo de Pago</b>', 5000, 'error');
    }
}
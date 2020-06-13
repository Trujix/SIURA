/*
	::: BASE DE DATOS DE SISTEMA SIUR-A VER 1.0 :::
*/

If(db_id(N'siura') IS NULL) 
	CREATE DATABASE siura;

USE siura;

DROP TABLE IF EXISTS dbo.centros;
DROP TABLE IF EXISTS dbo.usuarios;
DROP TABLE IF EXISTS dbo.usuariosperfiles;
DROP TABLE IF EXISTS dbo.modelostratamientos;
DROP TABLE IF EXISTS dbo.fasestratamientos;
DROP TABLE IF EXISTS dbo.fasesnombres;
DROP TABLE IF EXISTS dbo.fasestipos;
DROP TABLE IF EXISTS dbo.estadoalerta;
DROP TABLE IF EXISTS dbo.nivelintoxicacion;
DROP TABLE IF EXISTS dbo.estadoanimo;
DROP TABLE IF EXISTS dbo.usuarioscentro;
DROP TABLE IF EXISTS dbo.usuariomenuprincipal;
DROP TABLE IF EXISTS dbo.menuprincipal;
DROP TABLE IF EXISTS dbo.usuariodocumentos;
DROP TABLE IF EXISTS dbo.pacienteregistro;
DROP TABLE IF EXISTS dbo.pacienteingreso;
DROP TABLE IF EXISTS dbo.pacienteregistrofinanzas;
DROP TABLE IF EXISTS dbo.pacientecargosadicionales;
DROP TABLE IF EXISTS dbo.pacienteregistropagos;
DROP TABLE IF EXISTS dbo.pacienteevalucacioncoords;
DROP TABLE IF EXISTS dbo.pacienteevaluacion;
DROP TABLE IF EXISTS dbo.deportivodocumentos;
DROP TABLE IF EXISTS dbo.medicodocumentos;
DROP TABLE IF EXISTS dbo.psicologodocumentos;
DROP TABLE IF EXISTS dbo.consejeriadocumentos;
DROP TABLE IF EXISTS dbo.inventarios;
DROP TABLE IF EXISTS dbo.inventariomovimientos;
DROP TABLE IF EXISTS dbo.wizardaccesos;
DROP TABLE IF EXISTS dbo.wizartests;
DROP TABLE IF EXISTS dbo.horarios;
DROP TABLE IF EXISTS dbo.horariosconfig;

CREATE TABLE [dbo].[centros](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[clave] [varchar](200) NOT NULL,
	[tokencentro] [varchar](200) NOT NULL,
	[idnotificacion] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_CentrosID] PRIMARY KEY CLUSTERED ([clave] ASC)
);
INSERT INTO centros (clave,tokencentro,idnotificacion,fechahora,admusuario) VALUES ('1234','1a2b3c4d','56789','2017-08-09','SiuraMTG');

CREATE TABLE [dbo].[usuarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[usuario] [varchar](200) NOT NULL,
	[tokenusuario] [varchar](200) NOT NULL,
	[tokencentro] [varchar](200) NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[apellido] [varchar](200) NOT NULL,
	[correo] [varchar](200) NOT NULL,
	[pass] [varchar](200) NOT NULL,
	[administrador] [bit] NOT NULL DEFAULT 'False',
	[activo] [int] NOT NULL DEFAULT 1,
	[estatus] [int] NOT NULL DEFAULT 1,
	[idnotificacion] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioID] PRIMARY KEY CLUSTERED ([id] ASC)
);
INSERT INTO usuarios (usuario,tokenusuario,tokencentro,nombre,apellido,correo,pass,administrador,idnotificacion,fechahora,admusuario) VALUES ('adm','75996de9e8471c8a7dd7b05ff064b34d','1a2b3c4d','Admin','Siura','correo@mail.com','202cb962ac59075b964b07152d234b70','true','56789','2017-08-09','SiuraMTG');

CREATE TABLE [dbo].[usuariosperfiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idusuario] [int] NOT NULL,
	[idcentro] [int] NOT NULL,
	[alanon] [bit] NOT NULL DEFAULT 'False',
	[coorddeportiva] [bit] NOT NULL DEFAULT 'False',
	[coordmedica] [bit] NOT NULL DEFAULT 'False',
	[coordpsicologica] [bit] NOT NULL DEFAULT 'False',
	[coordespiritual] [bit] NOT NULL DEFAULT 'False',
	[coorddocepasos] [bit] NOT NULL DEFAULT 'False',
	[documentacion] [bit] NOT NULL DEFAULT 'False',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioPerfil] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[modelostratamientos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombretratamiento] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_ModelosTratamientosID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[fasestratamientos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idmodelo] [int] NOT NULL DEFAULT 0,
	[cantidadfases] [int] NOT NULL DEFAULT 0,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_FasesTratamientosID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[fasesnombres](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idfases] [int] NOT NULL DEFAULT 0,
	[nombrefase] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_FasesNombresID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[fasestipos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idfases] [int] NOT NULL DEFAULT 0,
	[nombretipo] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_FasesTipoID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[estadoalerta](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombreestadoalerta] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_EstadosAlertaID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[nivelintoxicacion](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombrenivelintoxicacion] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_NivelIntoxicacionID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[estadoanimo](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombreestadoanimo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_EstadoAnimoID] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[usuarioscentro](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombrecentro] [varchar](MAX) NOT NULL DEFAULT '--',
	[clavecentro] [varchar](MAX) NOT NULL DEFAULT '--',
	[direccion] [varchar](MAX) NOT NULL DEFAULT '--',
	[cp] [int] NOT NULL DEFAULT 0,
	[telefono] [float] NOT NULL DEFAULT 0,
	[colonia] [varchar](MAX) NOT NULL DEFAULT '--',
	[localidad] [varchar](MAX) NOT NULL DEFAULT '--',
	[estadoindx] [varchar](50) NOT NULL DEFAULT '--',
	[municipioindx] [varchar](50) NOT NULL DEFAULT '--',
	[estado] [varchar](MAX) NOT NULL DEFAULT '--',
	[municipio] [varchar](MAX) NOT NULL DEFAULT '--',
	[alanonlogo] [bit] NOT NULL DEFAULT 'True',
	[logopersonalizado] [bit] NOT NULL DEFAULT 'False',
	[nombredirector] [varchar](MAX) NOT NULL DEFAULT '--',
	[siglalegal] [varchar](10) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioCentroID] PRIMARY KEY CLUSTERED ([id] ASC)
);
INSERT INTO usuarioscentro (idcentro,siglalegal,fechahora,admusuario) VALUES ('1','AA','2017-08-09','SiuraMTG');

CREATE TABLE [dbo].[usuariomenuprincipal](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[visible] [bit] NOT NULL DEFAULT 'False',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioMenuPrincipal] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[menuprincipal](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[folder] [varchar](200) NOT NULL,
	[vista] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_MenuPrincipalID] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[usuariodocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[extension] [varchar](200) NOT NULL,
	[archivo] [varchar](200) NOT NULL,
	[tipo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioDocumento] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[pacienteregistro](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [varchar](200) NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[apellidopaterno] [varchar](200) NOT NULL,
	[apellidomaterno] [varchar](200) NOT NULL,
	[fechanacimiento] [datetime] NULL,
	[edad] [int] NOT NULL,
	[sexo] [varchar](50) NOT NULL,
	[sexosigno] [varchar](50) NOT NULL,
	[curp] [varchar](200) NOT NULL,
	[alias] [varchar](200) NOT NULL,
	[parientenombre] [varchar](200) NOT NULL,
	[parienteapellidop] [varchar](200) NOT NULL,
	[parienteapellidom] [varchar](200) NOT NULL,
	[parentesco] [varchar](200) NOT NULL,
	[parentescoindx] [varchar](200) NOT NULL,
	[telefonocasa] [float] NULL,
	[telefonopariente] [float] NULL,
	[telefonousuario] [float] NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteRegistro] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteingreso](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[tipoingreso] [varchar](50) NOT NULL,
	[foliocontrato] [varchar](200) NOT NULL,
	[tiempoestancia] [int] NOT NULL,
	[tipoestancia] [varchar](200) NOT NULL,
	[tipoestanciaindx] [varchar](200) NOT NULL,
	[nombretestigo] [varchar](MAX) NOT NULL,
	[tipotratamiento] [varchar](200) NOT NULL,
	[tipotratamientoindx] [varchar](200) NOT NULL,
	[fasescantratamiento] [varchar](200) NOT NULL,
	[fasescantratamientoindx] [varchar](200) NOT NULL,
	[fasestratamiento] [varchar](200) NOT NULL,
	[fasestratamientoindx] [varchar](200) NOT NULL,
	[estadoalerta] [varchar](200) NOT NULL DEFAULT '--',
	[estadoalertaindx] [int] NOT NULL DEFAULT 0,
	[nivelintoxicacion] [varchar](200) NOT NULL DEFAULT '--',
	[nivelintoxicacionindx] [int] NOT NULL DEFAULT 0,
	[estadoanimo] [varchar](200) NOT NULL DEFAULT '--',
	[estadoanimoindx] [int] NOT NULL DEFAULT 0,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteIngreso] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteregistrofinanzas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[montototal] [float] NOT NULL DEFAULT 0,
	[becario] [bit] NOT NULL DEFAULT 'False',
	[becavalor] [float] NOT NULL DEFAULT 0,
	[becatipo] [varchar](20) NULL,
	[parcialidad] [bit] NOT NULL DEFAULT 'False',
	[cantidadpagos] [int] NOT NULL,
	[montopagoparcial] [float] NOT NULL DEFAULT 0,
	[tipopago] [varchar](200) NULL,
	[tipopagoindx] [int] NOT NULL,
	[tipopagocantpers] [int] NOT NULL DEFAULT 0,
	[fechainiciopago] [varchar](200) NULL,
	[fechafinpago] [varchar](200) NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteRegistroFinanzas] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacientecargosadicionales](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idfinanzas] [int] NOT NULL,
	[folio] [varchar](200) NULL,
	[descripcion] [varchar](200) NULL,
	[importe] [float] NULL,
	[cargoinicial] [bit] NOT NULL DEFAULT 'False',
	[pagado] [bit] NOT NULL DEFAULT 'False',
	[tipopago] [varchar](200) NOT NULL DEFAULT '--',
	[folrefdesc] [varchar](200) NOT NULL DEFAULT '--',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteCargosAdicionales] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteregistropagos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idfinanzas] [int] NOT NULL,
	[folio] [varchar](200) NULL,
	[montopago] [float] NULL,
	[tipopago] [varchar](200) NULL,
	[folrefdesc] [varchar](200) NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteRegistroPagos] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteevalucacioncoords](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[cmedica] [bit] NOT NULL DEFAULT 'False',
	[cpsicologica] [bit] NOT NULL DEFAULT 'False',
	[cconsejeria] [bit] NOT NULL DEFAULT 'False',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteEvaluacionCoords] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteevaluacion](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[testclave] [varchar](200) NOT NULL,
	[testarchivo] [varchar](MAX) NOT NULL DEFAULT 'SD',
	[testjson] [varchar](MAX) NOT NULL DEFAULT 'SD',
	[diagnostico] [varchar](MAX) NOT NULL DEFAULT 'SD',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteEvaluacion] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[deportivodocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[extension] [varchar](200) NOT NULL,
	[archivo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_DeportivoDocumento] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[medicodocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[extension] [varchar](200) NOT NULL,
	[archivo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_MedicoDocumento] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[psicologodocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[extension] [varchar](200) NOT NULL,
	[archivo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PsicologoDocumento] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[consejeriadocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[extension] [varchar](200) NOT NULL,
	[archivo] [varchar](200) NOT NULL,
	[estatus] [int] NOT NULL DEFAULT 1,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_ConsejeroDocumento] PRIMARY KEY CLUSTERED ([nombre] ASC)
);

CREATE TABLE [dbo].[inventarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[codigo] [varchar](200) NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[presentacion] [varchar](200) NOT NULL,
	[preciocompra] [float] NOT NULL DEFAULT 0,
	[precioventa] [float] NOT NULL DEFAULT 0,
	[existencias] [float] NOT NULL DEFAULT 0,
	[stock] [float] NOT NULL DEFAULT 0,
	[codigoauto] [bit] NOT NULL DEFAULT 'False',
	[area] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_IDInventarioElemento] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[inventariomovimientos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idinventario] [int] NOT NULL,
	[accion] [varchar](50) NOT NULL,
	[cantidad] [float] NOT NULL DEFAULT 0,
	[descripcion] [varchar](MAX) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_IDInventarioMovimiento] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[wizardaccesos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[token] [varchar](200) NOT NULL,
		CONSTRAINT [PK_IDWizardAcceso] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[wizartests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[nombretest] [varchar](200) NOT NULL,
	[clavetest] [varchar](200) NOT NULL,
	[testestructura] [varchar](MAX) NOT NULL,
	[activo] [bit] NOT NULL DEFAULT 'True',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_IDWizardTests] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[horarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[descripcion] [varchar](200) NOT NULL,
	[horainicio] [varchar](200) NOT NULL,
	[duracion] [int] NOT NULL,
	[tipo] [varchar](200) NOT NULL,
	[reloj] [varchar](200) NOT NULL,
	[activo] [bit] NOT NULL DEFAULT 'True',
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_Horarios] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[horariosconfig](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idhorario] [int] NOT NULL,
	[idhtml] [varchar](200) NOT NULL,
	[hrinicio24hrs] [varchar](200) NOT NULL,
	[hrinicio12hrs] [varchar](200) NOT NULL,
	[hrtermino24hrs] [varchar](200) NOT NULL,
	[hrtermino12hrs] [varchar](200) NOT NULL,
	[lunes] [varchar](200) NULL DEFAULT '',
	[martes] [varchar](200) NULL DEFAULT '',
	[miercoles] [varchar](200) NULL DEFAULT '',
	[jueves] [varchar](200) NULL DEFAULT '',
	[viernes] [varchar](200) NULL DEFAULT '',
	[sabado] [varchar](200) NULL DEFAULT '',
	[domingo] [varchar](200) NULL DEFAULT '',
	[receso] [bit] NOT NULL DEFAULT 'False',
	[numorden] [int] NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_HorariosConfig] PRIMARY KEY CLUSTERED ([id] ASC)
);

INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'alanon','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'deportiva','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'medica','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'psicologica','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'espiritual','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'12pasos','true','2017-08-09','Admin');
--INSERT INTO usuariomenuprincipal (idcentro,nombre,visible,fechahora,admusuario) VALUES (1,'ludico','true','2017-08-09','Admin');

UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'alanon';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'deportiva';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'medica';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'psicologica';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'espiritual';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = '12pasos';
--UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'ludico';
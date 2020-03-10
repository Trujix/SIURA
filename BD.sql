/*
	BASE DE DATOS DE SISTEMA SIUR-A
*/
/*
	CREATE DATABASE siura;
*/
USE siura;

DROP TABLE IF EXISTS dbo.centros;
DROP TABLE IF EXISTS dbo.usuarios;
DROP TABLE IF EXISTS dbo.usuarioscentro;
DROP TABLE IF EXISTS dbo.usuariomenuprincipal;
DROP TABLE IF EXISTS dbo.menuprincipal;
DROP TABLE IF EXISTS dbo.usuariodocumentos;
DROP TABLE IF EXISTS dbo.pacienteregistro;
DROP TABLE IF EXISTS dbo.pacienteingreso;
DROP TABLE IF EXISTS dbo.pacienteregistrofinanzas;
DROP TABLE IF EXISTS dbo.pacienteregistropagos;

CREATE TABLE [dbo].[centros](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[clave] [varchar](200) NOT NULL,
	[tokencentro] [varchar](200) NOT NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_CentrosID] PRIMARY KEY CLUSTERED ([clave] ASC)
);
INSERT INTO centros (clave,tokencentro,fechahora,admusuario) VALUES ('1234','1a2b3c4d','2017-08-09','Manuel');

CREATE TABLE [dbo].[usuarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[usuario] [varchar](200) NOT NULL,
	[tokenusuario] [varchar](200) NOT NULL,
	[tokencentro] [varchar](200) NOT NULL,
	[pass] [varchar](200) NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioID] PRIMARY KEY CLUSTERED ([usuario] ASC)
);
INSERT INTO usuarios (usuario,tokenusuario,tokencentro,pass,fechahora,admusuario) VALUES ('adm','75996de9e8471c8a7dd7b05ff064b34d','1a2b3c4d','202cb962ac59075b964b07152d234b70','2017-08-09','Admin');

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
INSERT INTO usuarioscentro (idcentro,siglalegal,fechahora,admusuario) VALUES ('1','AA','2017-08-09','Manuel');

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
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteIngreso] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE TABLE [dbo].[pacienteregistrofinanzas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idcentro] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[montototal] [float] NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteRegistroFinanzas] PRIMARY KEY CLUSTERED ([id] ASC)
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
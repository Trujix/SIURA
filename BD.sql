/*
	BASE DE DATOS DE SISTEMA SIUR-A
*/
/*
	CREATE DATABASE siura;
*/
USE siura;

DROP TABLE IF EXISTS dbo.usuarios;
DROP TABLE IF EXISTS dbo.usuariomenuprincipal;
DROP TABLE IF EXISTS dbo.menuprincipal;
DROP TABLE IF EXISTS dbo.usuariodocumentos;
DROP TABLE IF EXISTS dbo.pacienteregistro;
DROP TABLE IF EXISTS dbo.pacienteregistrofinanzas;

CREATE TABLE [dbo].[usuarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[usuario] [varchar](200) NOT NULL,
	[tokenusuario] [varchar](200) NOT NULL,
	[pass] [varchar](200) NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_UsuarioID] PRIMARY KEY CLUSTERED ([usuario] ASC)
);
INSERT INTO usuarios (usuario,tokenusuario,pass,fechahora,admusuario) VALUES ('adm','75996de9e8471c8a7dd7b05ff064b34d','202cb962ac59075b964b07152d234b70','2017-08-09','Admin');

CREATE TABLE [dbo].[usuariomenuprincipal](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idusuario] [int] NOT NULL,
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
	[idusuario] [int] NOT NULL,
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
	[idusuario] [int] NOT NULL,
	[nombre] [varchar](200) NOT NULL,
	[apellidopaterno] [varchar](200) NOT NULL,
	[apellidomaterno] [varchar](200) NOT NULL,
	[fechanacimiento] [datetime] NULL,
	[edad] [int] NOT NULL,
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

CREATE TABLE [dbo].[pacienteregistrofinanzas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idusuario] [int] NOT NULL,
	[idpaciente] [int] NOT NULL,
	[montototal] [float] NULL,
	[fechahora] [datetime] NULL,
	[admusuario] [varchar](50) NULL,
		CONSTRAINT [PK_PacienteRegistroFinanzas] PRIMARY KEY CLUSTERED ([id] ASC)
);

INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'alanon','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'deportiva','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'medica','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'psicologica','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'espiritual','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'ludico','true','2017-08-09','Admin');
INSERT INTO usuariomenuprincipal (idusuario,nombre,visible,fechahora,admusuario) VALUES (1,'12pasos','true','2017-08-09','Admin');

UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'alanon';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'deportiva';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'medica';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'psicologica';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'espiritual';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = 'ludico';
UPDATE usuariomenuprincipal SET visible = 'true' WHERE nombre = '12pasos';
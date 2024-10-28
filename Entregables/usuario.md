# Manual Técnico

## Luis Antonio Castro Padilla (202109750)

## Índice
1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Interfaz de Usuario](#descripción-de-archivos)
4. [Funciones principales](#funciones-principales)
    - [Crear archivo](#crear-archivo)
    - [Abrir archivo](#abrir-archivo)
    - [Guardar archivo](#guardar-archivo)
    - [Ejecutar código](#ejecutar-codigo)
    - [Reportes](#reportes)
4. [Ejemplo de uso](#ejemplo-de-uso)

## Introducción
OakLang es un entorno de desarrollo para el lenguaje de programación Oak. Este manual de usuario proporciona una guía detallada sobre cómo utilizar las funciones principales de la aplicación.

## Requisitos del Sistema
- Navegador web moderno (Chrome, Firefox, Edge, etc.)
- Conexión a Internet (para descargar el proyecto)

## Interfaz de usuario

La interfaz de usuario de OakLang está dividida en varias secciones:

- Barra Lateral: Contiene botones para crear, abrir, guardar archivos, ejecutar código y generar reportes.
- Área del Editor: Donde se escribe el código fuente.
- Consola: Muestra la salida del código ejecutado.
- Reportes: Muestra tablas de errores y símbolos.

## Funciones Principales

### Crear Archivo
1. Haga clic en el botón "Crear Archivo" en la barra lateral.
2. Se creará una nueva pestaña en el área del editor con un nombre predeterminado (e.g., Archivo1).
3. Escriba su código en el área del editor.

### Abrir Archivo
1. Haga clic en el botón "Abrir Archivo" en la barra lateral.
2. Seleccione un archivo con extensión `.oak` desde su sistema de archivos.
3. El contenido del archivo se cargará en una nueva pestaña en el área del editor.

![Imagen que abre el explorador el archivos](/Entregables/src/abrirarch.png)

### Guardar Archivo
1. Haga clic en el botón "Guardar Archivo" en la barra lateral.
2. El contenido de la pestaña activa se guardará en un archivo con extensión `.oak`.
3. Si el archivo no tiene un nombre, se le asignará uno automáticamente.

### Ejecutar Código
1. Escriba su código en el área del editor.
2. Haga clic en el botón "Ejecutar" en la barra lateral.
3. La salida del código se mostrará en la consola.


### Reporte de errores y tabla de simbolos

1. Haga clic en el botón "Reporte Tabla de Símbolos" o "Reporte de Errores"  en la barra lateral.
2. Se abrirá una nueva ventana con una tabla que muestra los símbolos utilizados o el listado de errores que existen en el código.

![Reportes](/Entregables/src/reportes.png)

## Ejemplo de uso

![Interfaz](/Entregables/src/interfaz.png)

1. Crear un nuevo archivo:
- Haga clic en "Crear Archivo".
- Escriba el siguiente código en el área del editor:

``` javascript
var x = 10;
var y = 20;
var z = x + y;
print(z);
```
- Haga clic en "Guardar Archivo" y asigne un nombre al archivo (e.g., miArchivo.oak).

2. Ejecutar el código:
- Haga clic en "Ejecutar".
- La consola mostrará 30 como resultado.

3. Generar reportes:
- Haga clic en "Reporte de Errores" para ver si hay errores en el código.
- Haga clic en "Reporte Tabla de Símbolos" para ver los símbolos utilizados.
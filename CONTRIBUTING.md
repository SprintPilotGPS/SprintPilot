# Detalles del Proyecto
Se va explicar las aplicaciones que se deben instalar, como clonar el repositorio, la estructura del proyecto y funciones que ayudan a trabajar en el proyecto.

## Índice
1. [Introducción](#introducción)
2. [Preparación](#preparación)
   1. [Herremientas](#herramientas)
   2. [Clonado](#clonado)
3. [Estructura](#estructura)
   1. [PUBLIC (FRONTEND)](#public-frontend)
   2. [SRC (BACKEND/SERVIDOR)](#src-backendservidor)
   3. [TEST](#test)
5. [Comandos](#comandos)
6. [Otros detalles](#otros-detalles)

## Introducción
El proyecto usa las siguientes tecnologías:
- **[Node.js](https://nodejs.org/es)** usando el framework [Express 5](https://expressjs.com/)
- **[MongoDB](https://www.mongodb.com/)** con la biblioteca de [Mongoose](https://mongoosejs.com/)
- **[EJS](https://ejs.co/)** como motor de plantillas
- **[Jest](https://jestjs.io/es-ES/)** para hacer las pruebas
- **[Helmet.js](https://helmetjs.github.io/)**: Seguridad de la aplicación

Herramientas que facilitan el uso de la aplicación:
- **[Bootstrap](https://getbootstrap.com/)**: Framework de css para evitar tener que hacer el css desde 0
- **[Nodemon](https://nodemon.io/)**: permite reiniciar la aplicación al detectar cambios en el código.
- **[ESLint](https://eslint.org/)**: ayuda a identificar problemas en el código y arreglarlos
- **[Morgan](https://www.npmjs.com/package/morgan)**: middleware que facilita el manejo de peticiones y repuestas HTTP

El editor del código que se usa es [VSCode](https://code.visualstudio.com/), aunque puedes usar otro es más que recomendable usar el mismo por compatibilidad.

## Preparación
Para poder desarrollar probar y ejecutar la aplicación se deberá instalar el software de la sección de herramientas. En caso de no tener alguno de estos puede no funcionar o tener problemas para desarrollarlo

### Herramientas
Instala Node.js desde: [Descargar](https://nodejs.org/es/download).
Una vez instalado ejecuta los siguientes comandos para comrpobar que se a instalado correctamente:
````powershell
node.js -v # muestra la version de node.js mira que se la ultima
npm -v # muestra la version de npm (instalador de paquetes de javascript)
````
Si crees que no tienes la ultima versión de npm ejecuta:
````powershell
npm install -g npm@latest # actualiza a la ultima version npm
````

Instala MongoDB desde: [Descargar](https://www.mongodb.com/try/download/community) cuando lo estes instalando asergurate de marca la opción de "_Intalar Mongo Compass_" y 
comprobar el nombre del servidor que se te instala (Generalmente es "_MongoDB_"). <br>
El nombre del servidor podrás buscarlo desde Servicios de windows:
<img width="1156" height="282" alt="image" src="https://github.com/user-attachments/assets/e117b8a2-bea2-4701-8792-d8ed912fa1d1" />
Y busca el nombre del servidor
<img width="1092" height="41" alt="image" src="https://github.com/user-attachments/assets/7244a721-8071-48cc-9fed-7021c8646e04" />
<br><br>
En cuanto a extensiones recomendadas para facilitar el desarrollo esta:
- **Git Graph**
- **EJS language support**
- **Jest**
- **Node.js Modules Intellisense**
- Javascript Debugger
- Error lens

### Clonado
Para clonar el proyecto simplemente dirigete a la carpeta donde quieras clonarlo luego abre una terminal en esa ruta y ejecuta:
````
git clone https://github.com/SprintPilotGPS/SprintPilot
cd SprintPilot
code .
````
Esto te habrira el proyecto en VSCode si lo tienes instalado

## Estructura
La estructura del proyecto se divide en 3:
- **public**: Carpeta del frontend
- **src**: Carpeta del backend (servidor)
- **tests**: Carpeta para los tests

#### PUBLIC (FRONTEND)
<img width="223" height="205" alt="image" src="https://github.com/user-attachments/assets/b5f5f13c-568a-49cf-8472-206284987d33" />

- **css**: Archivos de estilos, aunque se usa [Bootstrap](https://getbootstrap.com/) a veces se querra tener un mayor control sobre los estilos de la página.
- **js**: Archivos de javascript, dan interacción a la pagina se encargan de mandar peticiones al Backend (Servidor).
- **views**: Plantillas de [EJS](https://ejs.co/).
- **partials**: Secciones de las paginas en [EJS](https://ejs.co/) que se pueden incluir en las plantillas con:
````ejs
<%- include('./partials/loquesea') %>
````

#### SRC (BACKEND/SERVIDOR)
<img width="250" height="401" alt="image" src="https://github.com/user-attachments/assets/468b99b9-c1de-4878-8f9a-7ae11e07dc86" />

#### TEST

## Comandos

## Otros detalles

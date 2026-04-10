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
   4. [Otros archivos importantes](#otros-archivos-importantes)
5. [Comandos](#comandos)
   1. [Setup para la aplicación](#setup-para-la-aplicación)
7. [Otros detalles](#otros-detalles)

## Introducción
El proyecto usa las siguientes tecnologías:
- **[Node.js](https://nodejs.org/es)** usando el framework [Express 5](https://expressjs.com/).
- **[MongoDB](https://www.mongodb.com/)** con la biblioteca de [Mongoose](https://mongoosejs.com/).
- **[EJS](https://ejs.co/)** como motor de plantillas.
- **[Jest](https://jestjs.io/es-ES/)** para hacer las pruebas.
- **[Helmet.js](https://helmetjs.github.io/)**: Seguridad de la aplicación.

Herramientas que facilitan el uso de la aplicación:
- **[Bootstrap](https://getbootstrap.com/)**: Framework de css para evitar tener que hacer el css desde 0.
- **[Nodemon](https://nodemon.io/)**: permite reiniciar la aplicación al detectar cambios en el código.
- **[ESLint](https://eslint.org/)**: ayuda a identificar problemas en el código y arreglarlos.
- **[Morgan](https://www.npmjs.com/package/morgan)**: middleware que facilita el manejo de peticiones y repuestas HTTP.

El editor del código que se usa es [VSCode](https://code.visualstudio.com/), aunque puedes usar otro es más que recomendable usar el mismo por compatibilidad.

## Preparación
Para poder desarrollar probar y ejecutar la aplicación se deberá instalar el software de la sección de herramientas. En caso de no tener alguno de estos puede no funcionar o tener problemas para desarrollarlo.

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
Esto te habrira el proyecto en VSCode si lo tienes instalado.

## Estructura
La estructura del proyecto se divide en 3:
- **public**: Carpeta del frontend.
- **src**: Carpeta del backend (servidor).
- **tests**: Carpeta para los tests.

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

- **config**: Carpeta de configuraciones para el servidor.
  - database.js: Se encarga de conectarse a la BD, en caso de no poder hacerlo salta un error.
- **contollers**: Carpeta para los controladores, estos se encargan de la lógica del servidor. Aquí estaran las operaciones que acceden a la BD.
- **models**: Carpeta de modelos de mongoose para MongoDB. Puedes pensarlo como si fuese la definición de las tablas a construir en la BD.
- **routes**: Carpeta que contiene la api y la definición de las vistas.
  - api.js: Define el REST API. Se encarga de definir las peticiones que se pueden pedir desde el frontend, es decir, si se quiere hacer un cambio o pedior algo de la BD tendrá que ir por la API.
  - views.js: Similar a lo de la API, pero se encarga solo de definir las rutas de las vistas de la aplicación. Siempre se llamaran a funciones de los controladores que rendericen una vista.
- app.js: Se encarga de inicializar la aplicación, los middleware (estos se encargan de intercomunicar las distintas herramientas que usamos con express) y la api y vistas.
- server.js: Inicializa el servidor en el puerto especificado en .env, además de usar el archivo "_databse.js_" para conectarse ala BD.

#### TEST
<img width="238" height="155" alt="image" src="https://github.com/user-attachments/assets/5706df49-897d-4027-990c-3010800daaf9" />

- **integración**: estan los test de integración, se encargan de testear si las distintas funciones funcionan en conjunto bien.
  - db-handler.js: tiene las funciones necesarias para que los test de integración se conecten a la BD y puedan hacer las pruebas.
- **unit**: test unitarios que prueban funcionalidades aisladas.

#### Otros archivos importantes
<img width="254" height="535" alt="image" src="https://github.com/user-attachments/assets/df674559-6b1c-427b-b1fc-0c6d558093c8" />

- .dockerignore: archivos que ignora docker para construir la aplicación y enviarlo al repositorio de docker
- .env: archivo con la configuración del proyecto. Siendo el puerto, la url de la BD y el modo de Node.js. (No se sube a github)
- .gitignore: archivos que git deve ignorar, estos archivos no se subiran a github.
- Dockerfile: archivo docker con las instrucciones que debe seguir Docker para llevar los cambios al repositorio de Docker e inicializar la aplicación en el contenedor de Docker.
- eslint.config.msj: configuración para EsLint, define que archivos va a revisar, cuales ignora...
- jest.config.js: configuración de jest que indica que carpeta y archivos pertenecen a los test, además de cual es el minimo que debe cubrir los test.
- package-lock.json: archivo con las referencias de todas las dependecias que hay en el proyecto, se genera tras hacer `npm install`, es necesario para poder ejecutar la aplicación.
- package.json: archivo que define que dependencias o paquetes tiene la aplicación, estas se instalarán con `npm install`.
- seed.js: Archivo para poblar la BD con datos, se necesita actualizar cuando haya cambios en la BD.

## Comandos
Esta sección se va a dedicar a enseñar los comandos disponibles y como iniciar el proyecto

#### Setup para la aplicación
Una vez se haya [clonado el repositorio](#clonado) e instalado las [herramientas](herramientas), se deberá instalar las dependencias para ello ejecuta lo siguiente:
- Instalar dependencias: `npm install`, puede tardar un rato dependiendo de la conexión wifi
- Si te sale alguna vulnerabilidad ejecuta `npm audit fix`, en caso de que persista alguna ejecuta `npm audit fix --force`, si persiste mientras no sea alta o critica no pasa nada.
- Una vez esten instaldas las dependencias, deberás crear el archivo "_.env_" que contendra:
````dotenv
PORT=3000   # Puerto donde se ejecuta la aplicación
MONGODB_URI=mongodb://localhost:27017/sprintpilot   # Donde se encuentra la BD, "sprintpilot" es el schema al que hace referencia
NODE_ENV=development   # variable de entorno de node.js
````
- Luego si quieres puedes poblar la BD con `npm run seed`
- Finalmente con `npm start` inicializas el servidor.
- Para desarrollar es más comodo usar `npm run dev`, ya que inicializa Nodemon y cada vez que haga un cambio en el Backend se reinicia el servidor automaticamente.

#### Resumen de comandos
| Comando | Descripción |
|---------|-------------|
| `npm install` | Intala dependencias |
| `npm audit fix` | Arregla vulnerabilidades de las dependencias |
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia con Nodemon (recarga automática) |
| `npm run seed` | Puebla la BD |
| `npm run test` | Ejecuta los test |
| `npm run test:watch` | Ejecuta test con más detalle |
| `npm run lint:js` | Ejecuta ESLint en archivos JavaScript |
| `npm run lint:ejs` | Ejecuta linting en plantillas EJS |
| `npm run format` | Ejecuta prettier formateando el texto |

## Otros detalles

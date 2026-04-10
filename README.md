# SprintPilot

Aplicación web que ayuda al PO a poder realizar el Product Backlog y saber realizar Scrum correctamente, dándole indicaciones y sugerencia para perfeccionar su visión y dar valor al usuario. Proyecto de GPS de la carrera de Ingeniería del Software de la UCM 2026.

## Sobre el proyecto
El proyecto usa las siguientes tecnologías:
- **[Node.js](https://nodejs.org/es)** usando el framework [Express 5](https://expressjs.com/)
- **[MongoDB](https://www.mongodb.com/)** con la biblioteca de [Mongoose](https://mongoosejs.com/)
- **[EJS](https://ejs.co/)** como motor de plantillas
- **[Jest](https://jestjs.io/es-ES/)** para hacer las pruebas
- **[Helmet.js](https://helmetjs.github.io/)**: Seguridad de la aplicación

Herramientas que facilitan el uso de la aplicación:
- **[Nodemon](https://nodemon.io/)**: permite reiniciar la aplicación al detectar cambios en el código.
- **[ESLint](https://eslint.org/)**: ayuda a identificar problemas en el código y arreglarlos
- **[Morgan](https://www.npmjs.com/package/morgan)**: middleware que facilita el manejo de peticiones y repuestas HTTP

## Comandos utiles para manejar el entorno
Si quieres saber más sobre el entorno de desarrollo accede al archivo [CONTRIBUTING.md]()

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia con Nodemon (recarga automática) |
| `npm run seed` | Carga datos de ejemplo en MongoDB |
| `npm run lint:js` | Ejecuta ESLint en archivos JavaScript |
| `npm run lint:ejs` | Ejecuta linting en plantillas EJS |

# Data-Warehouse-Server

Este es el repositorio backend del Data Warehouse, que se encarga de gestionar y proporcionar datos para nuestro sistema.  
Este proyecto utiliza una base de datos para almacenar y gestionar datos. Puedes configurar la base de datos utilizando un archivo "self-contained" (incluido en este repositorio) que contiene toda la información necesaria para crear y poblar la base de datos.   
Tienes dos opciones para probarlo:
* Utilizar [Postman](https://www.postman.com/) u otra herramienta para testear APIs que permita enviar peticiones y recibir las respuestas.
* Utilizar el front diseñado para utilizar esta aplicacion, para hacerlo puedes seguir las instrucciones del [Repositorio Data Warehouse](https://github.com/juparefe/Data-Warehouse)

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- Node.js: [Descargar Node.js](https://nodejs.org/)
- npm (administrador de paquetes de Node.js): Viene incluido con Node.js

**Lenguajes utilizados:** TypeScript, SQL  
**Frameworks, herramientas o librerias utilizados:** Express.js, JSON Web Token, Node.js, Nodemailer, Resend, Sequelize

## Scripts Disponibles
* Instalar Dependencias: `npm install`
* Construir la Aplicación: `npm run build`
* Iniciar la Aplicación: `npm start`

## Paso a paso para ejecutar el repositorio
* Clonar el repositorio en el entorno local utilizando el comando 
```
git clone https://github.com/juparefe/Data-Warehouse-Server.git
```
* Abrir la carpeta clonada utilizando algun editor de codigo
* Instala las dependencias:
```
npm install
```
### Configuración de la Base de Datos:
- El archivo "self-contained" se encuentra en la ruta: ```./data/DumpDB.sql```
- Generar la base de datos a partir del archivo ```DumpDB.sql```, esto varia segun el workbench utilizado pero por defecto se uso [MySQL Workbench](https://www.mysql.com/products/workbench/)
- El archivo donde se debe configurar la base de datos en el repositorio se encuentra en la ruta: ```./src/database/actions.js```
- En este archivo se encuentra la siguiente linea de codigo:
```
const database = new Sequelize('mysql://root:1234@localhost:3306/data_warehouse');
```
- Deben reemplazarse los datos contenidos en el parentesis, con los propios segun el workbench utilizado (Nombre de usuario:contraseña).
  
* Ejecuta el siguiente comando para iniciar el servidor:
```
npm start
```
- Para saber que el servidor se inicio correctamente en la consola debe aparecer el mensaje "Servidor corriendo en el puerto 3001"

### Ejecutar los endpoints:
- Si se siguieron los pasos anteriores, la API se esta ejecutando en la direccion: ```http://localhost:3001 ``` y debe observarse el mensaje "Bienvenido"


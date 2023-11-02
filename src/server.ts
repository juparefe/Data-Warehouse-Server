import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';

import CompaniesController from './controllers/CompaniesController';
import ContactsController from './controllers/ContactsController';
import LoginController from './controllers/LoginController';
import RegionController from './controllers/RegionController';
import ReportController from './controllers/ReportController';
import UserController from './controllers/UsersController';

var corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:4200'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

const port = 3001;

const server = express();
server.use(bodyparser.json());
server.use(cors(corsOptions));

server.use('/', CompaniesController);
server.use('/', ContactsController);
server.use('/', LoginController);
server.use('/', RegionController);
server.use('/', ReportController);
server.use('/', UserController);

server.get('/', (req, res)=> {
    res.send('Bienvenido');
});

server.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
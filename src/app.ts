import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import { initService } from './config/services/init.service';

import ErrorHandler from './config/models/error/error-handler.model';

import MasterRouter from './config/routers/master.router';

import MonitoringService from './config/services/monitoring/monitoring.service';
import { ELogType } from './config/models/log/log.model';

(async () => {
  // load the environment variables from the .env file
  dotenv.config({
    path: '.env'
  });
  
  /**
   * Express server application class.
   * @description Will later contain the routing system.
   */
  class Server {
    public app = express();
    public master = <MasterRouter>{};

    private _monitor = new MonitoringService(this.constructor.name);

    get monitor() {
      return this._monitor;
    }

    async configureRouter() {
      await initService.start();
      this.master = new MasterRouter(initService.controllerService);
    }
  }

  // initialize server app
  const server = new Server();

  if (process.env.APP_ENV === 'production') {
    // make server use static front-end files
    server.app.use(express.static('public'));
  }
  
  // configurate server app body parser
  server.app.use(express.json());
  server.app.use(express.urlencoded({
    extended: true
  }));

  // make server app use cors
  server.app.use(cors());
  
  // make server app use morgan logging system with custom tokens
  morgan.token('angle-bracket', () => '>');
  morgan.token('timestamp', () => new Date().toISOString());
  server.app.use(
    morgan(':angle-bracket :timestamp :method :url :status :res[content-length] - :response-time ms')
  );
  
  // make server app handle any route starting with '/api'
  await server.configureRouter();
  server.app.use('/api', server.master.router);

  // make server app handle any error
  server.app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) {
      server.monitor.log(ELogType.fail, `↱ [NOT HANDLED] : ${err.stack as string}`);
    }
    else server.monitor.log(ELogType.fail, `↱ ${err.message}`);

    res.status(statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  });

  // make server listen on some port
  (async (port = process.env.APP_PORT || 5000) => {
    server.app.listen(
      port,
      async () => {// here we go baby, let them now!!
        console.log(' ▄▄ •  ▄▄▄· ▄▄▄  ▄▄▄  ▪  .▄▄ ·        ▐ ▄ ');
        console.log('▐█ ▀ ▪▐█ ▀█ ▀▄ █·▀▄ █·██ ▐█ ▀. ▪     •█▌▐█');
        console.log('▄█ ▀█▄▄█▀▀█ ▐▀▀▄ ▐▀▀▄ ▐█·▄▀▀▀█▄ ▄█▀▄ ▐█▐▐▌');
        console.log('▐█▄▪▐█▐█ ▪▐▌▐█•█▌▐█•█▌▐█▌▐█▄▪▐█▐█▌.▐▌██▐█▌');
        console.log('·▀▀▀▀  ▀  ▀ .▀  ▀.▀  ▀▀▀▀ ▀▀▀▀  ▀█▄▀▪▀▀ █▪');
        console.log(`> Version: v${require('../package')?.version}`);
        console.log(`> Port: ${port}`);
        console.log('> Ready to handle requests!');
    });
  })();
})();
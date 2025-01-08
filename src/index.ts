import 'reflect-metadata';
import Server from '@/server/server';
import colorTxt from 'ansi-colors'; // Importing ansi-colors for colored console output
import Container from 'typedi';
import { log } from 'console';

const server = Container.get(Server);
const silent = false;
server
  .bootstrap(silent)
  .then(async () => {
    await server.checkDatabase(silent);
  })
  .catch((err) => {
    log(colorTxt.red(`${(err as Error).message}'`));
  });

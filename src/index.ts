import startApp from './core/startApp';
import logEvent from './event/logEvent';
import setupEvents from './event/setupEvents';
import update from './update/update';

startApp(setupEvents, update, logEvent);

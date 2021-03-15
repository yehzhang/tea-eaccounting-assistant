import createDispatchView from './core/createDispatchView';
import startApp from './core/startApp';
import DispatchEvent from './data/DispatchEvent';
import startDiscordBot from './discord/startDiscordBot';
import syncMessages from './discord/syncMessages';
import Event from './Event';
import ExternalDependency from './ExternalDependency';
import startTesseract from './update/itemDetection/startTesseract';
import update from './update/update';
import renderDiscordView from './view/discord/renderDiscordView';
import renderWebServerView from './view/webServer/renderWebServerView';
import sendHttpResponse from './webServer/sendHttpResponse';
import startWebServer from './webServer/startWebServer';

async function startExternalDependencies(
  dispatchEvent: DispatchEvent<Event>
): Promise<ExternalDependency> {
  const schedulers = await startTesseract();
  const discordBot = await startDiscordBot(dispatchEvent);
  startWebServer(dispatchEvent);
  return {
    schedulers,
    discordBot,
  };
}

const ignored = startApp(startExternalDependencies, update, {
  discord: createDispatchView(renderDiscordView, syncMessages),
  webServer: createDispatchView(renderWebServerView, sendHttpResponse),
});

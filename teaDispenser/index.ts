import createDispatchView from './core/createDispatchView';
import startApp from './core/startApp';
import DispatchEvent from './data/DispatchEvent';
import startDiscordBot from './event/discord/startDiscordBot';
import Event from './event/Event';
import startWebServer from './event/webServer/startWebServer';
import ExternalDependency from './ExternalDependency';
import startTesseract from './update/itemDetection/startTesseract';
import update from './update/update';
import syncMessages from './view/discord/syncMessages';
import viewDiscord from './view/discord/viewDiscord';
import sendHttpResponse from './view/webServer/sendHttpResponse';
import viewWebServer from './view/webServer/viewWebServer';

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
  discord: createDispatchView(viewDiscord, syncMessages),
  webServer: createDispatchView(viewWebServer, sendHttpResponse),
});

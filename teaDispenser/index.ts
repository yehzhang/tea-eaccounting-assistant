import createDispatchView from './core/createDispatchView';
import startApp from './core/startApp';
import DispatchEvent from './data/DispatchEvent';
import buildMessageBasedServicesRouter from './event/buildMessageBasedServicesRouter';
import startDiscordBot from './event/discord/startDiscordBot';
import Event from './event/Event';
import buildWebhookRouter from './event/kaiheila/buildWebhookRouter';
import buildWebsiteRouter from './event/webServer/buildWebsiteRouter';
import startWebServer from './event/webServer/startWebServer';
import ExternalDependency from './ExternalDependency';
import buildDiscordApi from './update/buildDiscordApi';
import buildKaiheilaApi from './update/buildKaiheilaApi';
import startTesseract from './update/itemDetection/startTesseract';
import update from './update/update';
import viewMessage from './view/message/viewMessage';
import sendHttpResponse from './view/sendHttpResponse';
import syncRenderedMessage from './view/syncRenderedMessage';
import viewWebPage from './view/webPage/viewWebPage';

async function startExternalDependencies(
  dispatchEvent: DispatchEvent<Event>
): Promise<ExternalDependency> {
  const [schedulers, discordBot] = await Promise.all([
    startTesseract(),
    startDiscordBot(dispatchEvent),
  ]);
  const kaiheilaApi = buildKaiheilaApi();
  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildMessageBasedServicesRouter('discord', dispatchEvent),
    buildMessageBasedServicesRouter('kaiheila', dispatchEvent),
    buildWebhookRouter(dispatchEvent, kaiheilaApi),
  ]);
  return {
    schedulers,
    discordApi: buildDiscordApi(discordBot),
    kaiheilaApi,
    discordBot,
  };
}

const ignored = startApp(startExternalDependencies, update, {
  message: createDispatchView(viewMessage, syncRenderedMessage),
  webPage: createDispatchView(viewWebPage, sendHttpResponse),
});

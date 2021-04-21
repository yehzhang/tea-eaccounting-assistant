import createDispatchView from './core/createDispatchView';
import startApp from './core/startApp';
import DispatchEvent from './data/DispatchEvent';
import buildChatServiceRouter from './event/buildChatServiceRouter';
import startDiscordBot from './event/discord/startDiscordBot';
import Event from './event/Event';
import buildWebhookRouter from './event/kaiheila/buildWebhookRouter';
import buildWebsiteRouter from './event/webServer/buildWebsiteRouter';
import startWebServer from './event/webServer/startWebServer';
import buildDiscordApi from './external/buildDiscordApi';
import getEnvironmentVariable from './external/getEnvironmentVariable';
import buildKaiheilaApi from './external/kaiheila/buildKaiheilaApi';
import startTesseract from './external/startTesseract';
import { setExternalContext } from './external/useExternalContext';
import update from './update/update';
import viewMessage from './view/message/viewMessage';
import sendHttpResponse from './view/sendHttpResponse';
import syncRenderedMessage from './view/syncRenderedMessage';
import viewWebPage from './view/webPage/viewWebPage';

async function startExternalDependencies(dispatchEvent: DispatchEvent<Event>): Promise<void> {
  const [schedulers, discordBot] = await Promise.all([
    startTesseract(),
    startDiscordBot(dispatchEvent),
  ]);

  const kaiheilaBotToken = getEnvironmentVariable('KAIHEILA_BOT_TOKEN');
  const kaiheilaApi = buildKaiheilaApi(kaiheilaBotToken);

  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildChatServiceRouter('discord', dispatchEvent),
    buildChatServiceRouter('kaiheila', dispatchEvent),
    buildWebhookRouter(dispatchEvent, kaiheilaApi),
  ]);

  setExternalContext({
    schedulers,
    discord: {
      api: buildDiscordApi(discordBot),
    },
    kaiheila: {
      api: kaiheilaApi,
    },
  });
}

const ignored = startApp(startExternalDependencies, update, {
  message: createDispatchView(viewMessage, syncRenderedMessage),
  webPage: createDispatchView(viewWebPage, sendHttpResponse),
});

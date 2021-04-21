import createDispatchView from './core/createDispatchView';
import startApp from './core/startApp';
import DispatchEvent from './data/DispatchEvent';
import buildChatServiceRouter from './event/buildChatServiceRouter';
import startDiscordBot from './event/discord/startDiscordBot';
import Event from './event/Event';
import buildWebhookRouter from './event/kaiheila/buildWebhookRouter';
import parseDmvEvent from './event/kaiheila/parseDmvEvent';
import parseTeaDispenserEvent from './event/kaiheila/parseTeaDispenserEvent';
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
  const [discordBot, kaiheilaTeaDispenserApi, kaiheilaDmvApi, schedulers] = await Promise.all([
    startDiscordBot(dispatchEvent),
    buildKaiheilaApi(getEnvironmentVariable('KAIHEILA_TEA_DISPENSER_TOKEN')),
    buildKaiheilaApi(getEnvironmentVariable('KAIHEILA_DMV_TOKEN')),
    startTesseract(),
  ]);

  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildChatServiceRouter('discordTeaDispenser', dispatchEvent),
    buildChatServiceRouter('kaiheilaTeaDispenser', dispatchEvent),
    buildWebhookRouter(dispatchEvent, {
      [getEnvironmentVariable('KAIHEILA_TEA_DISPENSER_VERIFY_TOKENS')]: (event) =>
        parseTeaDispenserEvent(event, kaiheilaTeaDispenserApi.botUserId),
      [getEnvironmentVariable('KAIHEILA_DMV_VERIFY_TOKENS')]: (event) =>
        parseDmvEvent(event, kaiheilaDmvApi.botUserId),
    }),
  ]);

  setExternalContext({
    schedulers,
    discordTeaDispenser: {
      api: buildDiscordApi(discordBot),
    },
    kaiheilaTeaDispenser: {
      api: kaiheilaTeaDispenserApi,
    },
    kaiheilaDmv: {
      api: kaiheilaDmvApi,
    },
  });
}

const ignored = startApp(startExternalDependencies, update, {
  message: createDispatchView(viewMessage, syncRenderedMessage),
  webPage: createDispatchView(viewWebPage, sendHttpResponse),
});

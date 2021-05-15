import DispatchEvent from './core/DispatchEvent';
import startApp from './core/startApp';
import setupDiscordBotEvents from './event/discord/setupDiscordBotEvents';
import Event from './event/Event';
import buildWebhookRouter from './event/kaiheila/buildWebhookRouter';
import parseDmvEvent from './event/kaiheila/parseDmvEvent';
import parseTeaDispenserEvent from './event/kaiheila/parseTeaDispenserEvent';
import logEvent from './event/logEvent';
import buildChatServiceRouter from './event/webServer/buildChatServiceRouter';
import buildWebsiteRouter from './event/webServer/buildWebsiteRouter';
import startDiscordBot from './external/chatService/discord/startDiscordBot';
import fetchBotUserId from './external/chatService/kaiheila/fetchBotUserId';
import ExternalContext from './external/ExternalContext';
import getEnvironmentVariable from './external/getEnvironmentVariable';
import startTesseract from './external/startTesseract';
import startWebServer from './external/webServer/startWebServer';
import update from './update/update';

async function startExternalDependencies(): Promise<ExternalContext> {
  const kaiheilaTeaDispenserBotToken = getEnvironmentVariable('KAIHEILA_TEA_DISPENSER_TOKEN');
  const kaiheilaDmvBotToken = getEnvironmentVariable('KAIHEILA_DMV_TOKEN');
  const [discordBot, kaiheilaTeaDispenserBotUserId, kaiheilaDmvBotUserId, schedulers] = await Promise.all([
    startDiscordBot(),
    fetchBotUserId(kaiheilaTeaDispenserBotToken),
    fetchBotUserId(kaiheilaDmvBotToken),
    startTesseract(),
  ]);
  return {
    schedulers,
    discordBot,
    discordTeaDispenser: {
      botUserId: discordBot.user!.id,
    },
    kaiheilaTeaDispenser: {
      botUserId: kaiheilaTeaDispenserBotUserId,
      botToken: kaiheilaTeaDispenserBotToken,
    },
    kaiheilaDmv: {
      botUserId: kaiheilaDmvBotUserId,
      botToken: kaiheilaDmvBotToken,
    },
  };
}

function setupEvents(dispatchEvent: DispatchEvent<Event>, externalContext: ExternalContext) {
  setupDiscordBotEvents(dispatchEvent, externalContext.discordBot);
  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildChatServiceRouter('discordTeaDispenser', dispatchEvent),
    buildChatServiceRouter('kaiheilaTeaDispenser', dispatchEvent),
    buildWebhookRouter(dispatchEvent, {
      [getEnvironmentVariable('KAIHEILA_TEA_DISPENSER_VERIFY_TOKENS')]: (event) =>
        parseTeaDispenserEvent(event, externalContext.kaiheilaTeaDispenser.botUserId),
      [getEnvironmentVariable('KAIHEILA_DMV_VERIFY_TOKENS')]: (event) =>
        parseDmvEvent(event, externalContext.kaiheilaDmv.botUserId),
    }),
  ]);
}

void startApp(startExternalDependencies, setupEvents, update, logEvent);

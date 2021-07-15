import DispatchEvent from '../core/DispatchEvent';
import getOptionalEnvironmentVariable from '../external/getOptionalEnvironmentVariable';
import startWebServer from '../external/webServer/startWebServer';
import setupTeaDispenserEvents from './discord/setupTeaDispenserEvents';
import Event from './Event';
import buildWebhookRouter from './kaiheila/buildWebhookRouter';
import parseDmvEvent from './kaiheila/parseDmvEvent';
import parseTeaDispenserEvent from './kaiheila/parseTeaDispenserEvent';
import WebhookEvent from './kaiheila/WebhookEvent';
import buildChatServiceRouter from './webServer/buildChatServiceRouter';
import buildWebsiteRouter from './webServer/buildWebsiteRouter';

function setupEvents(dispatchEvent: DispatchEvent<Event>) {
  setupTeaDispenserEvents(dispatchEvent);

  const eventParsers: {
    [verifyToken: string]: (event: WebhookEvent) => Event | null;
  } = {};
  const kaiheilaTeaDispenserVerifyToken = getOptionalEnvironmentVariable(
    'KAIHEILA_TEA_DISPENSER_VERIFY_TOKEN'
  );
  if (kaiheilaTeaDispenserVerifyToken) {
    eventParsers[kaiheilaTeaDispenserVerifyToken] = parseTeaDispenserEvent;
    console.log('Using Kaiheila Tea Dispenser');
  }
  const kaiheilaDmvVerifyToken = getOptionalEnvironmentVariable('KAIHEILA_DMV_VERIFY_TOKEN');
  if (kaiheilaDmvVerifyToken) {
    eventParsers[kaiheilaDmvVerifyToken] = parseDmvEvent;
    console.log('Using Kaiheila DMV');
  }
  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildChatServiceRouter('discordTeaDispenser', dispatchEvent),
    buildChatServiceRouter('kaiheilaTeaDispenser', dispatchEvent),
    buildWebhookRouter(dispatchEvent, eventParsers),
  ]);
}

export default setupEvents;

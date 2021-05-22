import DispatchEvent from '../core/DispatchEvent';
import getEnvironmentVariable from '../external/getEnvironmentVariable';
import startWebServer from '../external/webServer/startWebServer';
import setupTeaDispenserEvents from './discord/setupTeaDispenserEvents';
import Event from './Event';
import buildWebhookRouter from './kaiheila/buildWebhookRouter';
import parseDmvEvent from './kaiheila/parseDmvEvent';
import parseTeaDispenserEvent from './kaiheila/parseTeaDispenserEvent';
import buildChatServiceRouter from './webServer/buildChatServiceRouter';
import buildWebsiteRouter from './webServer/buildWebsiteRouter';

function setupEvents(dispatchEvent: DispatchEvent<Event>) {
  setupTeaDispenserEvents(dispatchEvent);
  startWebServer([
    buildWebsiteRouter(dispatchEvent),
    buildChatServiceRouter('discordTeaDispenser', dispatchEvent),
    buildChatServiceRouter('kaiheilaTeaDispenser', dispatchEvent),
    buildWebhookRouter(dispatchEvent, {
      [getEnvironmentVariable('KAIHEILA_TEA_DISPENSER_VERIFY_TOKENS')]: (event) =>
        parseTeaDispenserEvent(event),
      [getEnvironmentVariable('KAIHEILA_DMV_VERIFY_TOKENS')]: (event) => parseDmvEvent(event),
    }),
  ]);
}

export default setupEvents;

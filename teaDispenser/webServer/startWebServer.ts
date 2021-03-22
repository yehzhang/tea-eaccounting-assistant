import bodyParser from 'body-parser';
import express from 'express';
import { URL } from 'url';
import DispatchEvent from '../data/DispatchEvent';
import webServerBaseUrl from '../data/webServerBaseUrl';
import WebServerEventContext from '../data/WebServerEventContext';
import Event from '../Event';
import parseFleetLootEditorForm from './parseFleetLootEditorForm';
import parseNeedsEditorForm from './parseNeedsEditorForm';

function startWebServer(dispatchEvent: DispatchEvent<Event>) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/', (request, response, next) => {
    dispatchEvent({
      type: '[Web] IndexRequested',
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });

  app.get('/editor/discord/:channelId/:messageId', (request, response, next) => {
    const { channelId, messageId } = request.params;
    dispatchEvent({
      type: '[Web] DiscordFleetLootEditorRequested',
      channelId,
      messageId,
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });
  app.post('/editor/discord/:channelId/:messageId', (request, response, next) => {
    const { channelId, messageId } = request.params;
    dispatchEvent({
      type: '[Web] DiscordFleetLootEditorPosted',
      channelId,
      messageId,
      fleetLoot: parseFleetLootEditorForm(request.body),
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });

  app.get('/needs-editor/discord/:channelId/:messageId', (request, response, next) => {
    const { channelId, messageId } = request.params;
    dispatchEvent({
      type: '[Web] DiscordNeederChooserRequested',
      channelId,
      messageId,
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });
  app.get('/needs-editor/discord/:channelId/:messageId/:needer', (request, response, next) => {
    const { channelId, messageId, needer } = request.params;
    dispatchEvent({
      type: '[Web] DiscordNeedsEditorRequested',
      channelId,
      messageId,
      needer,
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });
  app.post('/needs-editor/discord/:channelId/:messageId/:needer', (request, response, next) => {
    const { channelId, messageId, needer } = request.params;
    dispatchEvent({
      type: '[Web] DiscordNeedsEditorPosted',
      channelId,
      messageId,
      needer,
      itemStacks: parseNeedsEditorForm(request.body),
      context: {
        type: 'WebServerEventContext',
        response,
      },
    }).catch(next);
  });

  const url = new URL(webServerBaseUrl);
  const port = url.port ? Number(url.port) : 80;
  app.listen(port, () => {
    console.info(`Web server listening at ${webServerBaseUrl}`);
  });
}

export default startWebServer;

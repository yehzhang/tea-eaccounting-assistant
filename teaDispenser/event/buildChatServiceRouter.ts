import Router from 'koa-router';
import ChatService from '../data/ChatService';
import DispatchEvent from '../data/DispatchEvent';
import Event from './Event';
import parseFleetLootEditorForm from './parseFleetLootEditorForm';
import parseNeedsEditorForm from './parseNeedsEditorForm';
import useTranscodingMiddlewares from './useTranscodingMiddlewares';

function buildChatServiceRouter(
  serviceProvider: ChatService,
  dispatchEvent: DispatchEvent<Event>
) {
  const router = new Router();

  useTranscodingMiddlewares(router);

  router.get(`/editor/${serviceProvider}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: `[Web] FleetLootEditorRequested`,
      ie10OrBelow: !!(context.headers['user-agent'] || '').match(/\bMSIE\b/),
      chatService: serviceProvider,
      channelId,
      messageId,
      context: {
        context,
      },
    });
  });
  router.post(`/editor/${serviceProvider}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: `[Web] FleetLootEditorPosted`,
      chatService: serviceProvider,
      channelId,
      messageId,
      fleetLoot: parseFleetLootEditorForm(context.request.body),
      context: {
        context,
      },
    });
  });

  router.get(`/needs-editor/${serviceProvider}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: `[Web] NeederChooserRequested`,
      chatService: serviceProvider,
      channelId,
      messageId,
      context: {
        context,
      },
    });
  });
  router.get(`/needs-editor/${serviceProvider}/:channelId/:messageId/:needer`, async (context) => {
    const { channelId, messageId, needer } = context.params;
    await dispatchEvent({
      type: `[Web] NeedsEditorRequested`,
      chatService: serviceProvider,
      channelId,
      messageId,
      needer,
      context: {
        context,
      },
    });
  });
  router.post(`/needs-editor/${serviceProvider}/:channelId/:messageId/:needer`, async (context) => {
    const { channelId, messageId, needer } = context.params;
    await dispatchEvent({
      type: `[Web] NeedsEditorPosted`,
      chatService: serviceProvider,
      channelId,
      messageId,
      needer,
      itemStacks: parseNeedsEditorForm(context.request.body),
      context: {
        context,
      },
    });
  });

  return router;
}

export default buildChatServiceRouter;

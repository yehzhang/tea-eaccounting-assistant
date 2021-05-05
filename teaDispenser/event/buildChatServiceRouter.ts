import Router from 'koa-router';
import { TeaDispenserService } from '../data/ChatService';
import DispatchEvent from '../data/DispatchEvent';
import toUrlFriendlyChatService from '../data/toUrlFriendlyChatService';
import Event, { TeaDispenserEventCommon } from './Event';
import parseFleetLootEditorForm from './parseFleetLootEditorForm';
import parseNeedsEditorForm from './parseNeedsEditorForm';
import useTranscodingMiddlewares from './useTranscodingMiddlewares';

function buildChatServiceRouter(
  chatService: TeaDispenserService,
  dispatchEvent: DispatchEvent<Event & TeaDispenserEventCommon>
): Router {
  const router = new Router();

  useTranscodingMiddlewares(router);

  const urlFriendlyChatService = toUrlFriendlyChatService(chatService);
  router.get(`/editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] FleetLootEditorRequested',
      ie10OrBelow: !!(context.headers['user-agent'] || '').match(/\bMSIE\b/),
      chatService: chatService,
      channelId,
      messageId,
      context: {
        context,
      },
    });
  });
  router.post(`/editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] FleetLootEditorPosted',
      chatService: chatService,
      channelId,
      messageId,
      fleetLoot: parseFleetLootEditorForm(context.request.body),
      context: {
        context,
      },
    });
  });

  router.get(`/needs-editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] NeederChooserRequested',
      chatService: chatService,
      channelId,
      messageId,
      context: {
        context,
      },
    });
  });
  router.get(
    `/needs-editor/${urlFriendlyChatService}/:channelId/:messageId/:needer`,
    async (context) => {
      const { channelId, messageId, needer } = context.params;
      await dispatchEvent({
        type: '[Web] NeedsEditorRequested',
        chatService: chatService,
        channelId,
        messageId,
        needer,
        context: {
          context,
        },
      });
    }
  );
  router.post(
    `/needs-editor/${urlFriendlyChatService}/:channelId/:messageId/:needer`,
    async (context) => {
      const { channelId, messageId, needer } = context.params;
      await dispatchEvent({
        type: '[Web] NeedsEditorPosted',
        chatService: chatService,
        channelId,
        messageId,
        needer,
        itemStacks: parseNeedsEditorForm(context.request.body),
        context: {
          context,
        },
      });
    }
  );

  return router;
}

export default buildChatServiceRouter;

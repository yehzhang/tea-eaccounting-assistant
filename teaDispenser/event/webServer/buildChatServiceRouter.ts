import Router from 'koa-router';
import DispatchEvent from '../../core/DispatchEvent';
import { TeaDispenserService } from '../../data/ChatService';
import toUrlFriendlyChatService from '../../data/toUrlFriendlyChatService';
import Event, { TeaDispenserChatServiceEventCommon } from '../Event';
import parseFleetLootEditorForm from './parseFleetLootEditorForm';
import parseNeedsEditorForm from './parseNeedsEditorForm';
import useTranscodingMiddlewares from './useTranscodingMiddlewares';

function buildChatServiceRouter(
  chatService: TeaDispenserService,
  dispatchEvent: DispatchEvent<Event & TeaDispenserChatServiceEventCommon>
): Router {
  const router = new Router();

  useTranscodingMiddlewares(router);

  const urlFriendlyChatService = toUrlFriendlyChatService(chatService);
  router.get(`/editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] FleetLootEditorRequested',
      ie10OrBelow: !!(context.headers['user-agent'] || '').match(/\bMSIE\b/),
      chatService,
      channelId,
      messageId,
      koaContext: context,
    });
  });
  router.post(`/editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] FleetLootEditorPosted',
      chatService,
      channelId,
      messageId,
      fleetLoot: parseFleetLootEditorForm(context.request.body),
      koaContext: context,
    });
  });

  router.get(`/needs-editor/${urlFriendlyChatService}/:channelId/:messageId`, async (context) => {
    const { channelId, messageId } = context.params;
    await dispatchEvent({
      type: '[Web] NeederChooserRequested',
      chatService,
      channelId,
      messageId,
      koaContext: context,
    });
  });
  router.get(
    `/needs-editor/${urlFriendlyChatService}/:channelId/:messageId/:needer`,
    async (context) => {
      const { channelId, messageId, needer } = context.params;
      await dispatchEvent({
        type: '[Web] NeedsEditorRequested',
        chatService,
        channelId,
        messageId,
        needer,
        koaContext: context,
      });
    }
  );
  router.post(
    `/needs-editor/${urlFriendlyChatService}/:channelId/:messageId/:needer`,
    async (context) => {
      const { channelId, messageId, needer } = context.params;
      await dispatchEvent({
        type: '[Web] NeedsEditorPosted',
        chatService,
        channelId,
        messageId,
        needer,
        itemStacks: parseNeedsEditorForm(context.request.body),
        koaContext: context,
      });
    }
  );

  return router;
}

export default buildChatServiceRouter;

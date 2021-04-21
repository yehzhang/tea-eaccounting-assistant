import ChatService from '../data/ChatService';
import FleetLootRecord from '../data/FleetLootRecord';
import parseFleetLootRecord from '../event/parseFleetLootRecord';
import useChatServiceContext from '../external/useChatServiceContext';

async function fetchFleetLootRecord(
  chatService: ChatService,
  channelId: string,
  messageId: string
): Promise<FleetLootRecord | null> {
  const { api } = useChatServiceContext(chatService);
  const message = await api.fetchMessage(channelId, messageId);
  if (!message) {
    return null;
  }

  if (message.externalUserId !== api.botUserId) {
    console.warn('Unexpected access to an unauthorized message:', {
      channelId,
      messageId,
      message,
    });
    return null;
  }

  return parseFleetLootRecord(message);
}

export default fetchFleetLootRecord;

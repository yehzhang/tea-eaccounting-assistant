import FleetLootRecord from '../data/FleetLootRecord';
import parseFleetLootRecord from '../event/discord/parseFleetLootRecord';
import { MessageApi } from '../ExternalDependency';

async function fetchFleetLootRecord(
  messageApi: MessageApi,
  channelId: string,
  messageId: string
): Promise<FleetLootRecord | null> {
  const message = await messageApi.fetchMessage(channelId, messageId);
  if (!message) {
    return null;
  }

  if (message.externalUserId !== messageApi.userId) {
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

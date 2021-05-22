import { MessageReaction, NewsChannel } from 'discord.js';
import handsUpIcon from '../../data/handsUpIcon';
import kiwiIcon from '../../data/kiwiIcon';
import Event, { TeaDispenserChatServiceEventCommon } from '../Event';

function parseTeaDispenserEventFromReaction(
  messageReaction: MessageReaction,
  userId: string,
  clientUserId: string
): Event | null {
  if (
    !messageReaction.message.channel.isText() ||
    messageReaction.message.channel instanceof NewsChannel
  ) {
    return null;
  }
  // TODO Remove this once update logic is updated.
  if (userId === clientUserId) {
    return null;
  }
  if (messageReaction.message.author.id !== clientUserId) {
    return null;
  }

  const eventCommon: TeaDispenserChatServiceEventCommon = {
    chatService: 'discordTeaDispenser',
    channelId: messageReaction.message.channel.id,
  };
  if (messageReaction.emoji.name === handsUpIcon) {
    return {
      type: '[TeaDispenser] HandsUpButtonPressed',
      ...eventCommon,
      messageId: messageReaction.message.id,
    };
  }
  if (messageReaction.emoji.name === kiwiIcon) {
    return {
      type: '[TeaDispenser] KiwiButtonPressed',
      ...eventCommon,
      messageId: messageReaction.message.id,
      triggeringUserId: userId,
    };
  }
  return null;
}

export default parseTeaDispenserEventFromReaction;

import { Message, Snowflake } from 'discord.js';
import _ from 'lodash';
import Event, { TeaDispenserChatServiceEventCommon } from '../Event';
import parseCommand from './parseCommand';

function parseTeaDispenserEventFromMessage(
  message: Message,
  clientUserId: Snowflake
): Event | null {
  const { author, content, attachments, channel } = message;
  if (author.id === clientUserId || !(channel.type === 'text' || channel.type === 'dm')) {
    return null;
  }

  const eventCommon: TeaDispenserChatServiceEventCommon = {
    chatService: 'discordTeaDispenser',
    channelId: message.channel.id,
  };
  const imageUrls = _.compact(
    [...attachments.values()].map((attachment) => {
      if (attachment.width === null) {
        // The attachment is not an image, probably a file.
        return null;
      }
      return attachment.url;
    })
  );
  if (imageUrls.length) {
    return {
      type: '[TeaDispenser] ImagePosted',
      ...eventCommon,
      urls: imageUrls,
      username: author.username,
    };
  }

  if (content.toLocaleLowerCase() === 'ping') {
    return {
      type: '[Chat] Pinged',
      ...eventCommon,
    };
  }

  const command = parseCommand(content);
  if (command) {
    return {
      type: '[TeaDispenser] CommandIssued',
      ...eventCommon,
      command,
      triggeringUserId: message.author.id,
    };
  }

  return null;
}

export default parseTeaDispenserEventFromMessage;

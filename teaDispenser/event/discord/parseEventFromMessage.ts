import { Message, Snowflake } from 'discord.js';
import _ from 'lodash';
import Event, { ChatServiceEventCommon } from '../Event';
import parseCommand from '../parseCommand';

function parseEventFromMessage(message: Message, clientUserId: Snowflake): Event | null {
  const { id, author, content, attachments, channel } = message;
  if (author.id === clientUserId || !(channel.type === 'text' || channel.type === 'dm')) {
    return null;
  }

  const eventCommon: ChatServiceEventCommon = {
    chatService: 'discord',
    channelId: message.channel.id,
    triggeringUserId: message.author.id,
  };
  const imageUrls = _.compact(
    [...attachments.values()].map((attachment) => {
      if (attachment.width === null) {
        console.warn('Received an attachment that is not an image', {
          messageId: id,
          attachment,
        });
        return null;
      }
      return attachment.url;
    })
  );
  if (imageUrls.length) {
    return {
      type: '[Chat] ImagePosted',
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
      type: '[Chat] CommandIssued',
      ...eventCommon,
      command,
    };
  }

  return null;
}

export default parseEventFromMessage;

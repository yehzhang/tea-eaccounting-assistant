import { Message, Snowflake } from 'discord.js';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import MessageEventContext from '../../data/MessageEventContext';
import Event from '../Event';
import parseCommand from './parseCommand';

function parseEventFromMessage(message: Message, clientUserId: Snowflake): Event | null {
  const { id, author, content, attachments, channel } = message;
  if (author.id === clientUserId || !(channel.type === 'text' || channel.type === 'dm')) {
    return null;
  }

  const context: MessageEventContext = {
    eventId: nanoid(),
    serviceProvider: 'discord',
    channelId: message.channel.id,
    triggeringUserId: message.author.id,
    messageIdToEdit: null,
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
      type: '[Discord] ImagePosted',
      urls: imageUrls,
      username: author.username,
      context,
    };
  }

  if (content.toLocaleLowerCase() === 'ping') {
    return {
      type: '[Discord] Pinged',
      context,
    };
  }

  const command = parseCommand(content);
  if (command) {
    return {
      type: '[Discord] CommandIssued',
      command,
      context,
    };
  }

  return null;
}

export default parseEventFromMessage;

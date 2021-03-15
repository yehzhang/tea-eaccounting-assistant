import { Message, Snowflake } from 'discord.js';
import _ from 'lodash';
import DiscordEventContext from '../data/DiscordEventContext';
import Event from '../Event';
import parseCommand from '../view/discord/parseCommand';

function parseEventFromMessage(
  message: Message,
  clientUserId: Snowflake,
  context: DiscordEventContext
): readonly Event[] {
  const events: Event[] = [];

  const { id, author, content, attachments, channel } = message;
  if (author.id === clientUserId || !(channel.type === 'text' || channel.type === 'dm')) {
    return events;
  }

  console.debug(`${author.username}: ${content}`);

  if (content.toLocaleLowerCase() === 'ping') {
    events.push({
      type: '[Discord] Pinged',
      context,
    });
  }

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
    events.push({
      type: '[Discord] ImagePosted',
      urls: imageUrls,
      username: author.username,
      context,
    });
  }

  const command = parseCommand(content);
  if (command) {
    events.push({
      type: '[Discord] CommandIssued',
      command,
      context,
    });
  }

  return events;
}

export default parseEventFromMessage;

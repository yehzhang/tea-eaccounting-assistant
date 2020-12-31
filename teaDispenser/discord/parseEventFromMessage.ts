import { Message, Snowflake } from 'discord.js';
import _ from 'lodash';
import Event from '../Event';
import parseCommand from '../view/parseCommand';

function parseEventFromMessage(message: Message, clientUserId: Snowflake): readonly Event[] {
  const events: Event[] = [];

  const { id, author, content, attachments } = message;
  if (author.id === clientUserId) {
    return events;
  }

  console.debug(`${author.username}: ${content}`);

  if (content.toLocaleLowerCase() === 'ping') {
    events.push({
      type: 'Pinged',
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
      type: 'ImagePosted',
      urls: imageUrls,
      userName: author.username,
    });
  }

  const command = parseCommand(content);
  if (command) {
    events.push({
      type: 'CommandIssued',
      command,
    });
  }

  return events;
}

export default parseEventFromMessage;

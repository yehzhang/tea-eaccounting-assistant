import _ from 'lodash';
import Reader from '../../../core/Reader/Reader';
import Message from '../../../data/Message';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import fromKaiheilaMessage from './fromKaiheilaMessage';
import KaiheilaEventContext from './KaiheilaEventContext';

function fetchMessage(
  channelId: string,
  messageId: string
): Reader<KaiheilaEventContext, Message | null> {
  return new Reader(async (context) => {
    const latestMessages = await fetchMessages(channelId).run(context);
    const messageInLatest = latestMessages.find(({ id }) => id === messageId);
    if (messageInLatest) {
      return fromKaiheilaMessage(messageInLatest);
    }

    // Hack to find the message by listing.
    // TODO Use single query API if any.
    const afterMessages = await fetchMessages(channelId, messageId, 'after').run(context);
    const nextMessageId = afterMessages[0]?.id;
    if (typeof nextMessageId !== 'string') {
      return null;
    }
    const beforeMessages = await fetchMessages(channelId, nextMessageId, 'before').run(context);
    const message = beforeMessages[beforeMessages.length - 1];
    if (!message) {
      return null;
    }
    return fromKaiheilaMessage(message);
  });
}

function fetchMessages(
  channelId: string,
  messageId?: string,
  flag?: 'before' | 'after'
): Reader<KaiheilaEventContext, readonly { readonly [key: string]: any }[]> {
  return fetchKaiheilaReader('GET', '/api/v3/message/list', {
    target_id: channelId,
    msg_id: messageId,
    flag,
  }).bind((response) => {
    if (!response) {
      return [];
    }
    if (!_.isArray(response.items)) {
      console.error('Expected items in response, got', response);
      return [];
    }

    const items = _.compact(
      response.items.map((item) => (typeof item === 'object' && item ? item : null))
    );
    if (items.length !== response.items.length) {
      console.error('Expected message items in response, got', response);
      return [];
    }

    return items;
  });
}

export default fetchMessage;

import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
import KaiheilaMessageType from '../../../event/kaiheila/KaiheilaMessageType';
import buildMessageContent from './buildMessageContent';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function sendMessage(
  channelId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<KaiheilaEventContext, string | null> {
  return fetchKaiheilaReader('POST', '/api/v3/message/create', {
    type: KaiheilaMessageType.MARKDOWN,
    target_id: channelId,
    content: buildMessageContent(content, replyToUserId),
  }).bind((response) => {
    if (!response) {
      return null;
    }
    const { msg_id: messageId } = response;
    if (typeof messageId !== 'string') {
      console.error('Expected string msg_id from Kaiheila, got', response);
      return null;
    }
    return messageId;
  });
}

export default sendMessage;

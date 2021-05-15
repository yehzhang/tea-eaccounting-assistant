import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
import buildMessageContent from './buildMessageContent';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function editMessage(
  messageId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<KaiheilaEventContext, boolean> {
  return fetchKaiheilaReader('POST', '/api/v3/message/update', {
    msg_id: messageId,
    content: buildMessageContent(content, replyToUserId),
  }).bind(Boolean);
}

export default editMessage;

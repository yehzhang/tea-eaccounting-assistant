import Reader from '../../../core/Reader/Reader';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function reactMessage(
  channelId: string,
  messageId: string,
  content: string
): Reader<KaiheilaEventContext, boolean> {
  return fetchKaiheilaReader('POST', '/api/v3/message/add-reaction', {
    msg_id: messageId,
    emoji: content,
  }).bind(Boolean);
}

export default reactMessage;

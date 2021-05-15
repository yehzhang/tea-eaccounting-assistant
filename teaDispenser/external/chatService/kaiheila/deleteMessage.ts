import Reader from '../../../core/Reader/Reader';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function deleteMessage(
  channelId: string,
  messageId: string
): Reader<KaiheilaEventContext, boolean> {
  return fetchKaiheilaReader('POST', '/api/v3/message/delete', {
    msg_id: messageId,
  }).bind(Boolean);
}

export default deleteMessage;

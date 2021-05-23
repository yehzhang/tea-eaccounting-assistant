import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';
import log from './log';

function logErrorWithContext(message: string, data?: any): Reader<Partial<EventContext>, void> {
  return new Reader(() => {
    if (data?.data?.message === '你已经点过该表情') {
      return;
    }
    return log({
      type: 'error',
      message,
      data,
    });
  });
}

export default logErrorWithContext;

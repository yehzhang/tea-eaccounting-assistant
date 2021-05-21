import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';
import log from './log';

function logErrorWithContext(message: string, data?: unknown): Reader<Partial<EventContext>, void> {
  return log({
    type: 'error',
    message,
    data,
  });
}

export default logErrorWithContext;

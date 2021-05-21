import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';
import log from '../external/log';
import Event from './Event';

function logEvent(event: Event): Reader<EventContext, void> {
  return new Reader(() => {
    if (event.type === '[Web] IndexRequested') {
      return;
    }

    const { koaContext, ...data } = event as any;
    const { params: queryParams, request = {} } = koaContext || {};
    return log({
      type: 'event',
      data: {
        ...data,
        queryParams,
        requestBody: request.body,
      },
    });
  });
}

export default logEvent;

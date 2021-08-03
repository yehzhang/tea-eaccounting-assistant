import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';
import WebServerContext from '../data/WebServerContext';

function log(entry: LogEntry): Reader<Partial<EventContext & WebServerContext>, void> {
  return new Reader((context) => {
    const { koaContext: ignored, ...trimmedContext } = context;
    const newEntry = {
      ...entry,
      context: trimmedContext,
    };
    console.log(JSON.stringify(newEntry));
  });
}

type LogEntry =
  | {
      readonly type: 'event' | 'view' | 'rendering';
      readonly data: unknown;
    }
  | {
      readonly type: 'error';
      readonly message: string;
      readonly data: unknown;
    };

export default log;

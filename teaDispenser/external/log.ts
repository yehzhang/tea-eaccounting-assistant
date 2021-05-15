import { createLogger, transports } from 'winston';
import Reader from '../core/Reader/Reader';
import EventContext from '../external/EventContext';

function log(entry: LogEntry): Reader<EventContext, void> {
  return new Reader((context) => {
    const { externalContext, ...trimmedContext } = context;
    const newEntry = {
      ...entry,
      context: trimmedContext,
    };
    global.console.log(newEntry);
    logger.info(newEntry);
  });
}

interface LogEntry {
  readonly type: 'event' | 'view' | 'rendering' | 'error';
  readonly data: unknown;
}

const logger = createLogger({
  transports: [new transports.File({ filename: 'tea_dispenser.log' })],
});

export default log;

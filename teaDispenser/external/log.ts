import winston from 'winston';
import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';

function log(entry: LogEntry): Reader<EventContext, void> {
  return new Reader((context) => {
    const newEntry = {
      ...entry,
      context,
    };
    global.console.log(newEntry);
    logger.info(newEntry);
  });
}

interface LogEntry {
  readonly type: 'event' | 'view' | 'rendering' | 'error';
  readonly data: unknown;
}

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'tea_dispenser.log' })],
});

export default log;

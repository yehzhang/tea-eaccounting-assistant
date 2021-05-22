import { nanoid } from 'nanoid';
import DispatchEvent from './DispatchEvent';
import EventContext from './EventContext';
import Reader from './Reader/Reader';
import Update from './Update';

function startApp<E>(
  setupEvents: (dispatchEvent: DispatchEvent<E>) => void,
  update: Update<E, EventContext>,
  logEvent: (event: E) => Reader<EventContext, void>
): void {
  setupEvents(async (event) => {
    await logEvent(event).sequence(update(event)).run({
      eventId: nanoid(),
    });
  });
}

export default startApp;

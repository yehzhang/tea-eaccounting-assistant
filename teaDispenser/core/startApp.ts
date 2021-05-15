import { nanoid } from 'nanoid';
import EventContext from './EventContext';
import Reader from './Reader/Reader';
import Update from './Update';

async function startApp<E, EC>(
  initialize: () => Promise<EC>,
  setupEvents: (dispatchEvent: (event: E) => Promise<void>, externalContext: EC) => void,
  update: Update<E, EventContext<EC>>,
  logEvent: (event: E) => Reader<EventContext<EC>, void>
): Promise<void> {
  const externalContext = await initialize();
  setupEvents(async (event) => {
    await logEvent(event).sequence(update(event)).run({
      eventId: nanoid(),
      externalContext,
    });
  }, externalContext);
}

export default startApp;

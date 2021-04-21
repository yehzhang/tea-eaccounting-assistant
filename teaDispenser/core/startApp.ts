import logInfo from './logInfo';

function startApp<E, V>(
  initialize: (dispatchEvent: (event: E) => Promise<void>) => Promise<void>,
  update: (event: E, dispatchViews: V) => Promise<unknown>,
  dispatchViews: V
): Promise<void> {
  return initialize(async (event) => {
    logInfo('[Core] event', event, /* depth= */ 4);
    await update(event, dispatchViews);
  });
}

export default startApp;

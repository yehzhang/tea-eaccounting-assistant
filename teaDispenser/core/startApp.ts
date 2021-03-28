import logInfo from './logInfo';

async function startApp<E, V, D>(
  initialize: (dispatchEvent: (event: E) => Promise<void>) => Promise<D>,
  update: (event: E, dispatchViews: V, externalDependency: D) => Promise<unknown>,
  dispatchViews: V
): Promise<void> {
  const externalDependency = await initialize(async (event) => {
    if (!externalDependency) {
      throw new TypeError('Unexpected event dispatched during initialization');
    }

    logInfo('[Core] event', event, /* depth= */ 4);

    await update(event, dispatchViews, externalDependency);
  });
}

export default startApp;

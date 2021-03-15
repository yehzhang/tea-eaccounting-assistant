async function startApp<E, S, V, D>(
  initialize: (dispatchEvent: (event: E) => Promise<void>) => Promise<D>,
  update: (event: E, dispatchViews: V, externalDependency: D) => Promise<void>,
  dispatchViews: V
): Promise<void> {
  const externalDependency = await initialize(async (event) => {
    if (!externalDependency) {
      throw new TypeError('Unexpected event dispatched during initialization');
    }
    await update(event, dispatchViews, externalDependency);
  });
}

export default startApp;

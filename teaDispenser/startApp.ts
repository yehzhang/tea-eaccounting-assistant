async function startApp<E, S, R, C, D extends object>(
    initialize: (dispatchEvent: (event: E, context: C) => Promise<void>) => Promise<D>,
    update: (event: E, setState: (state: S) => void, externalDependency: D) => Promise<void>,
    render: (state: S) => R,
    dispatchRendering: (rendering: R, context: C) => Promise<void>,
): Promise<void> {
  const externalDependency = await initialize(async (event, context) => {
    if (!externalDependency) {
      throw new TypeError('Unexpected event dispatched during initialization');
    }

    let renderingDispatchingPromise: Promise<void> | null = null;
    let nextState: S | null = null;
    const setState = async (state: S) => {
      if (renderingDispatchingPromise) {
        nextState = state;
        return;
      }

      while (true) {
        const renderings = render(state);
        renderingDispatchingPromise = dispatchRendering(renderings, context);
        await renderingDispatchingPromise;
        renderingDispatchingPromise = null;

        if (!nextState) {
          break;
        }
        state = nextState;
        nextState = null;
      }
    };

    await update(event, setState, externalDependency);
    await renderingDispatchingPromise;
  });
}

export default startApp;

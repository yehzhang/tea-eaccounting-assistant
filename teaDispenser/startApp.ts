function startApp<E, S, R, C>(
    initialize: (dispatchEvent: (event: E, context: C) => Promise<void>) => void,
    update: (event: E, setState: (state: S) => void) => Promise<void>,
    render: (state: S) => R,
    dispatchRendering: (rendering: R, context: C) => Promise<void>,
): void {
  initialize(async (event, context) => {
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

    await update(event, setState);
    await renderingDispatchingPromise;
  });
}

export default startApp;

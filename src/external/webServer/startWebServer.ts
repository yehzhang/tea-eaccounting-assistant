import Koa from 'koa';
import Router from 'koa-router';
import webServerBaseUrl from './webServerBaseUrl';

function startWebServer(routers: readonly Router[]) {
  const koa = new Koa();

  for (const router of routers) {
    koa.use(router.routes());
    koa.use(router.allowedMethods());
  }

  // Listen to 0.0.0.0 to work inside of Docker.
  koa.listen(80, '0.0.0.0', () => {
    console.info(`Web server listening at ${webServerBaseUrl}`);
  });
}

export default startWebServer;

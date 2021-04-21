import Koa from 'koa';
import Router from 'koa-router';
import { URL } from 'url';
import webServerBaseUrl from '../../external/webServerBaseUrl';

function startWebServer(routers: readonly Router[]) {
  const koa = new Koa();

  for (const router of routers) {
    koa.use(router.routes());
    koa.use(router.allowedMethods());
  }

  const url = new URL(webServerBaseUrl);
  const port = url.port ? Number(url.port) : 80;
  koa.listen(port, () => {
    console.info(`Web server listening at ${webServerBaseUrl}`);
  });
}

export default startWebServer;

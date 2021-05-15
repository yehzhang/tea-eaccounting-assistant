import Router from 'koa-router';
import DispatchEvent from '../../core/DispatchEvent';
import Event from '../Event';
import useTranscodingMiddlewares from './useTranscodingMiddlewares';

function buildWebsiteRouter(dispatchEvent: DispatchEvent<Event>): Router {
  const router = new Router();

  useTranscodingMiddlewares(router);

  router.get('/', async (context) => {
    await dispatchEvent({
      type: '[Web] IndexRequested',
      koaContext: context,
    });
  });

  return router;
}

export default buildWebsiteRouter;

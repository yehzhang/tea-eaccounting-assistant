import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import DispatchEvent from '../../data/DispatchEvent';
import KaiheilaMessageType from '../../data/KaiheilaMessageType';
import MessageApi from '../../data/MessageApi';
import Event from '../Event';
import parseEventsFromWebhookEvent from './parseEventsFromWebhookEvent';

function buildWebhookRouter(dispatchEvent: DispatchEvent<Event>, messageApi: MessageApi): Router {
  const router = new Router();

  router.post(
    '/webhook/kaiheila',
    (context, next) => {
      // Kaiheila forgets the header which results in parsing failures.
      context.req.headers['content-encoding'] = 'deflate';
      return next();
    },
    bodyParser(),
    (context) => {
      if (context.request.body?.s !== 0) {
        console.warn('Expected Kaiheila webhook event, got', context.request.body);
        context.status = 400;
        return;
      }

      const { d: data = {}, sn } = context.request.body;
      const { type, challenge, verify_token } = data;
      if (verify_token !== verifyToken) {
        console.warn('Unexpected verify token in webhook call', data);
        context.status = 400;
        return;
      }

      context.status = 200;

      if (cachedSns.includes(sn)) {
        console.warn('Unexpected repeated webhook call', context.request.body);
        return;
      }
      cachedSns.push(sn);
      if (1000 < cachedSns.length) {
        cachedSns.splice(0, 200);
      }

      if (type === KaiheilaMessageType.SYSTEM && typeof challenge === 'string') {
        context.body = { challenge };
        return;
      }

      // Do not await here in order to unblock the response.
      parseEventsFromWebhookEvent(data, messageApi).then(
        (event) => void (event && dispatchEvent(event))
      );
    }
  );
  const cachedSns: unknown[] = [];

  return router;
}

if (!process.env.KAIHEILA_VERIFY_TOKEN) {
  throw new TypeError('Expected environment variable `KAIHEILA_VERIFY_TOKEN`');
}
const verifyToken: string = process.env.KAIHEILA_VERIFY_TOKEN;

export default buildWebhookRouter;

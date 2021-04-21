import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import ChatServiceApi from '../../data/ChatServiceApi';
import DispatchEvent from '../../data/DispatchEvent';
import KaiheilaMessageType from '../../data/KaiheilaMessageType';
import getEnvironmentVariable from '../../external/getEnvironmentVariable';
import Event from '../Event';
import parseEventFromWebhookEvent from './parseEventFromWebhookEvent';

function buildWebhookRouter(dispatchEvent: DispatchEvent<Event>, chatServiceApi: ChatServiceApi): Router {
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
      parseEventFromWebhookEvent(data, chatServiceApi).then(
        (event) => void (event && dispatchEvent(event))
      );
    }
  );
  const cachedSns: unknown[] = [];

  return router;
}

const verifyToken = getEnvironmentVariable('KAIHEILA_VERIFY_TOKEN');

export default buildWebhookRouter;

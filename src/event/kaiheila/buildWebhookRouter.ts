import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import DispatchEvent from '../../core/DispatchEvent';
import logErrorWithoutContext from '../../external/logError';
import Event from '../Event';
import KaiheilaMessageType from './KaiheilaMessageType';
import parseWebhookEvent from './parseWebhookEvent';
import WebhookEvent from './WebhookEvent';

/** The webhook router must be a singleton in order to handle callbacks correctly. */
function buildWebhookRouter(
  dispatchEvent: DispatchEvent<Event>,
  eventParsers: {
    readonly [verifyToken: string]: (event: WebhookEvent) => Event | null;
  }
): Router {
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
        logErrorWithoutContext('Expected Kaiheila webhook event', context.request.body);
        context.status = 400;
        return;
      }

      const { d: data = {}, sn } = context.request.body;
      const { type, challenge, verify_token: verifyToken } = data;
      const parseEvent = eventParsers[verifyToken];
      if (!parseEvent) {
        logErrorWithoutContext('Unexpected verify token in webhook call', data);
        context.status = 400;
        return;
      }

      context.status = 200;

      if (typeof sn === 'string' && sn) {
        if (cachedSns.includes(sn)) {
          logErrorWithoutContext('Unexpected repeated webhook call', context.request.body);
          return;
        }
        cachedSns.push(sn);
        if (50 < cachedSns.length) {
          cachedSns.splice(0, 25);
        }
      }

      if (type === KaiheilaMessageType.SYSTEM && typeof challenge === 'string') {
        context.body = { challenge };
        return;
      }

      const webhookEvent = parseWebhookEvent(data);
      const event = webhookEvent && parseEvent(webhookEvent);
      if (event) {
        // Do not await here in order to unblock the response.
        void dispatchEvent(event);
      }
    }
  );
  const cachedSns: string[] = [];

  return router;
}

export default buildWebhookRouter;

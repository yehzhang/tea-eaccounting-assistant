import { Context } from 'koa';

interface WebServerEventContext {
  readonly context: Context;
}

export default WebServerEventContext;

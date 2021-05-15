import { Context } from 'koa';

interface WebServerContext {
  readonly koaContext: Context;
}

export default WebServerContext;

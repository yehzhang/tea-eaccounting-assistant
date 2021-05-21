import { Context } from 'koa';
import EventContext from '../../core/EventContext';

interface WebServerRenderingContext extends EventContext {
  readonly koaContext: Context;
}

export default WebServerRenderingContext;

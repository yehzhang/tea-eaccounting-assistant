import { Context } from 'koa';
import EventContext from '../../external/EventContext';

interface WebServerRenderingContext extends EventContext {
  readonly koaContext: Context;
}

export default WebServerRenderingContext;

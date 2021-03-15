import { Response } from 'express';

interface WebServerEventContext {
  readonly type: 'WebServerEventContext';
  readonly response: Response;
}

export default WebServerEventContext;

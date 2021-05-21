import logErrorWithContext from './logErrorWithContext';

function logError(message: string, data?: unknown) {
  void logErrorWithContext(message, data).run({});
}

export default logError;

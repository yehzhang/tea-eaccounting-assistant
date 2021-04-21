import ExternalContext from './ExternalContext';

function useExternalContext(): ExternalContext {
  if (!externalContext) {
    throw new TypeError('Unexpected access to external context before setup');
  }
  return externalContext;
}

export function setExternalContext(context: ExternalContext) {
  externalContext = context;
}

let externalContext: ExternalContext | null = null;

export default useExternalContext;

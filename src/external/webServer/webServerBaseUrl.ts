import _ from 'lodash';
import { URL } from 'url';
import getEnvironmentVariable from '../getEnvironmentVariable';

const webServerBaseUrl: string = getEnvironmentVariable('WEB_SERVER_SCHEME_HOSTNAME', (value) => {
  const url = new URL(value);
  if (!url.protocol.startsWith('http') || url.port) {
    return null;
  }

  url.port = getEnvironmentVariable('WEB_SERVER_PUBLISHED_PORT', (value) => {
    const port = Number(value);
    if (isNaN(port)) {
      return null;
    }
    if (port === 80) {
      return '';
    }
    return port.toString();
  });

  return _.trimEnd(url.toString(), '/');
});

export default webServerBaseUrl;

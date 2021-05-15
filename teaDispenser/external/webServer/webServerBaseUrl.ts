import getEnvironmentVariable from '../getEnvironmentVariable';

const webServerBaseUrl = getEnvironmentVariable('WEB_SERVER_BASE_URL', (value) =>
  value.startsWith('http') ? value : null
);

export default webServerBaseUrl;

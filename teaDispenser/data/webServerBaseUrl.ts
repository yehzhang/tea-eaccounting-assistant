if (!process.env.WEB_SERVER_BASE_URL) {
  throw new TypeError('Expected valid WEB_SERVER_BASE_URL environment variable');
}
if (!process.env.WEB_SERVER_BASE_URL.startsWith('http')) {
  throw new TypeError('Expected WEB_SERVER_BASE_URL environment variable to start with a scheme');
}

const webServerBaseUrl = process.env.WEB_SERVER_BASE_URL;

export default webServerBaseUrl;

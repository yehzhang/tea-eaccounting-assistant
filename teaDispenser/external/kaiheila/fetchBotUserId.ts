import fetchKaiheila from './fetchKaiheila';

async function fetchBotUserId(botToken: string): Promise<string> {
  const data = await fetchKaiheila(botToken, 'GET', '/api/v3/user/me');
  const { id } = data || {};
  if (typeof id !== 'string') {
    throw new TypeError(`Expected valid bot user ID, got ${data}`);
  }
  return id;
}

export default fetchBotUserId;

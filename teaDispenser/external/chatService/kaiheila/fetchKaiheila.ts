import axios from 'axios';

/** Returns the `data` object of the API response. */
async function fetchKaiheila(
  botToken: string,
  method: 'GET' | 'POST',
  path: string,
  payload?: object
): Promise<{ readonly [key: string]: any } | null> {
    await waitForRateLimit();

    let response;
    try {
      response = await axios({
        url: `https://www.kaiheila.cn${path}`,
        method,
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        params: method === 'GET' ? payload : undefined,
        data: method === 'POST' ? payload : undefined,
      });
    } catch (e) {
      console.error('Unexpected error when fetching Kaiheila', e, response);
      return null;
    }

    let { data } = response;
    if (typeof data !== 'object' || !data) {
      console.error('Unexpected invalid Kaiheila fetch data', data);
      return null;
    }

    if (data.code !== 0) {
      console.error('Unexpected Kaiheila error response', data, path, payload);
      return null;
    }

    const kaiheilaResponse = data.data;
    if (typeof kaiheilaResponse !== 'object' || !kaiheilaResponse) {
      console.error('Unexpected invalid Kaiheila response', data);
      return null;
    }

    return kaiheilaResponse;
}

// TODO Rate limit per bot.
async function waitForRateLimit(): Promise<void> {
  while (!rateLimitRemainingQuota) {
    const now = new Date();
    if (rateLimitUntil < now) {
      now.setSeconds(now.getSeconds() + 120);
      rateLimitUntil = now;
      rateLimitRemainingQuota = 119;
    } else {
      await waitUntil(rateLimitUntil);
    }
  }
  rateLimitRemainingQuota--;
}

async function waitUntil(date: Date): Promise<void> {
  return new Promise((resolve) => void setTimeout(resolve, date.getTime() - Date.now()));
}

let rateLimitRemainingQuota = 0;
let rateLimitUntil = new Date();

export default fetchKaiheila;

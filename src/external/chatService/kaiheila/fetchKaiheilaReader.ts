import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
import { dmvBotToken, teaDispenserBotToken } from './botTokens';
import fetchKaiheila from './fetchKaiheila';
import KaiheilaEventContext from './KaiheilaEventContext';

/** Returns the `data` object of the API response. */
function fetchKaiheilaReader(
  method: 'GET' | 'POST',
  path: string,
  payload?: object
): Reader<KaiheilaEventContext, { readonly [key: string]: any } | null> {
  return new Reader(({ chatService }) => {
    const botToken = getBotToken(chatService);
    if (!botToken) {
      return logErrorWithContext('Kaiheila service used without a bot token').replaceBy(null);
    }
    return fetchKaiheila(botToken, method, path, payload);
  });
}

function getBotToken(chatService: 'kaiheilaTeaDispenser' | 'kaiheilaDmv'): string | null {
  switch (chatService) {
    case 'kaiheilaTeaDispenser':
      return teaDispenserBotToken;
    case 'kaiheilaDmv':
      return dmvBotToken;
  }
}

export default fetchKaiheilaReader;

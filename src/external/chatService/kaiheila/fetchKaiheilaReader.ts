import Reader from '../../../core/Reader/Reader';
import { dmvBotToken, teaDispenserBotToken } from './botTokens';
import fetchKaiheila from './fetchKaiheila';
import KaiheilaEventContext from './KaiheilaEventContext';

/** Returns the `data` object of the API response. */
function fetchKaiheilaReader(
  method: 'GET' | 'POST',
  path: string,
  payload?: object
): Reader<KaiheilaEventContext, { readonly [key: string]: any } | null> {
  return new Reader(({ chatService }) =>
    fetchKaiheila(getBotToken(chatService), method, path, payload)
  );
}

function getBotToken(chatService: 'kaiheilaTeaDispense' | 'kaiheilaDmv'): string {
  switch (chatService) {
    case 'kaiheilaTeaDispense':
      return teaDispenserBotToken;
    case 'kaiheilaDmv':
      return dmvBotToken;
  }
}

export default fetchKaiheilaReader;

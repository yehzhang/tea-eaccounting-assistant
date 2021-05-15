import Reader from '../../../core/Reader/Reader';
import ExternalContext from '../../ExternalContext';
import fetchKaiheila from './fetchKaiheila';
import KaiheilaEventContext from './KaiheilaEventContext';

/** Returns the `data` object of the API response. */
function fetchKaiheilaReader(
  method: 'GET' | 'POST',
  path: string,
  payload?: object
): Reader<KaiheilaEventContext, { readonly [key: string]: any } | null> {
  return new Reader(async ({ externalContext, chatService }) =>
    fetchKaiheila(getBotToken(externalContext, chatService), method, path, payload)
  );
}

function getBotToken(
  externalContext: ExternalContext,
  chatService: 'kaiheilaTeaDispense' | 'kaiheilaDmv'
): string {
  switch (chatService) {
    case 'kaiheilaTeaDispense':
      return externalContext.kaiheilaTeaDispenser.botToken;
    case 'kaiheilaDmv':
      return externalContext.kaiheilaDmv.botToken;
  }
}

export default fetchKaiheilaReader;

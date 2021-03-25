import { MessageApi } from './ExternalDependency';

function chooseMessageApi(
  messageServiceProvider: 'discord' | 'kaiheila',
  { discordApi, kaiheilaApi }: { readonly discordApi: MessageApi; readonly kaiheilaApi: MessageApi }
): MessageApi {
  switch (messageServiceProvider) {
    case 'discord':
      return discordApi;
    case 'kaiheila':
      return kaiheilaApi;
  }
}

export default chooseMessageApi;

import webServerBaseUrl from '../data/webServerBaseUrl';

function getNeederChooserUrl(
  serviceProvider: 'discord' | 'kaiheila',
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/needs-editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;

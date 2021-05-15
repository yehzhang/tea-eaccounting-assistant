import ChatService from './ChatService';

function toUrlFriendlyChatService(chatService: ChatService): string {
  switch (chatService) {
    case 'discordTeaDispenser':
      return 'discord';
    case 'kaiheilaTeaDispenser':
    case 'kaiheilaDmv':
      return 'kaiheila';
  }
}

export default toUrlFriendlyChatService;

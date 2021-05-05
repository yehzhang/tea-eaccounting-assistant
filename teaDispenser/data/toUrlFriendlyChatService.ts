import { TeaDispenserService } from './ChatService';

function toUrlFriendlyChatService(chatService: TeaDispenserService): string {
  switch (chatService) {
    case 'discordTeaDispenser':
      return 'discord';
    case 'kaiheilaTeaDispenser':
      return 'kaiheila';
  }
}

export default toUrlFriendlyChatService;

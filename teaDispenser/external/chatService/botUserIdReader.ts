import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import teaDispenserClient from './discord/teaDispenserClient';
import { dmvBotUserId, teaDispenserBotUserId } from './kaiheila/botUserIds';

const botUserIdReader = new Reader<ChatServiceContext, string>(({ chatService }) => {
  switch (chatService) {
    case 'discordTeaDispenser':
      return teaDispenserClient.user!.id;
    case 'kaiheilaTeaDispenser':
      return teaDispenserBotUserId;
    case 'kaiheilaDmv':
      return dmvBotUserId;
  }
});

export default botUserIdReader;

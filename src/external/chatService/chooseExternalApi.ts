import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';

function chooseExternalApi<C extends EventContext & ChatServiceContext, R>(
  config: ExternalApiConfig<C, R>
): Reader<C, R> {
  return new Reader((context) => {
    switch (context.chatService) {
      case 'discordTeaDispenser':
        return config.discord;
      case 'kaiheilaTeaDispenser':
      case 'kaiheilaDmv':
        return config.kaiheila as Reader<C, R>;
    }
  });
}

interface ExternalApiConfig<C, R> {
  readonly discord: Reader<C, R>;
  readonly kaiheila: Reader<C & { chatService: 'kaiheilaTeaDispenser' | 'kaiheilaDmv' }, R>;
}

export default chooseExternalApi;

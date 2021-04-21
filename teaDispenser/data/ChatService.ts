type ChatService = TeaDispenserService | DmvService;

export type TeaDispenserService = 'discordTeaDispenser' | 'kaiheilaTeaDispenser';

export type DmvService = 'kaiheilaDmv';

export default ChatService;

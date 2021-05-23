import EventContext from '../../../core/EventContext';

type KaiheilaEventContext = EventContext & { chatService: 'kaiheilaTeaDispenser' | 'kaiheilaDmv' };

export default KaiheilaEventContext;

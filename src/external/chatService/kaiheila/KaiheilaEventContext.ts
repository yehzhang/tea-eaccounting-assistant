import EventContext from '../../../core/EventContext';

type KaiheilaEventContext = EventContext & { chatService: 'kaiheilaTeaDispense' | 'kaiheilaDmv' };

export default KaiheilaEventContext;

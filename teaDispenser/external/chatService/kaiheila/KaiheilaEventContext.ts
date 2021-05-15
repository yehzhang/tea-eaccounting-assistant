import EventContext from '../../EventContext';

type KaiheilaEventContext = EventContext & { chatService: 'kaiheilaTeaDispense' | 'kaiheilaDmv' };

export default KaiheilaEventContext;

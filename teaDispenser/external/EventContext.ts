import CoreEventContext from '../core/EventContext';
import ExternalContext from './ExternalContext';

type EventContext = CoreEventContext<ExternalContext>;

export default EventContext;

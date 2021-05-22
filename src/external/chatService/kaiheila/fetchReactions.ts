import Reader from '../../../core/Reader/Reader';
import Reaction from '../../../data/Reaction';

function fetchReactions(): Reader<{}, readonly Reaction[]> {
  // TODO Remove. Force reactions to be passed from the message event.
  return new Reader(() => []);
}

export default fetchReactions;

import { MessageOptions } from 'discord.js';

type RenderedMessageContent = string | (MessageOptions & { split?: false });

export default RenderedMessageContent;

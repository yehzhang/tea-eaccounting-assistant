import Command from '../../data/Command';
import InvalidCommand from '../../data/InvalidCommand';
import { commandPrefix, queryPriceCommandView } from '../../view/message/commandViews';

function parseCommand(text: string): Command | InvalidCommand | null {
  const cleanText = text.trim();
  if (!cleanText.startsWith(commandPrefix) && !cleanText.startsWith('！')) {
    return null;
  }

  const segments = cleanText.slice(commandPrefix.length).split(' ');
  const commandName = segments[0];
  switch (commandName) {
    case queryPriceCommandView: {
      const itemNames = parseCommaSeparatedList(segments.slice(1).join(' ') || '');
      if (!itemNames.length) {
        return {
          type: 'InvalidUsage',
          commandType: 'QueryPrice',
          reason: 'ArgsRequired',
        };
      }
      return {
        type: 'QueryPrice',
        itemNames,
      };
    }
    default: {
      return {
        type: 'UnknownCommand',
      };
    }
  }
}

function parseCommaSeparatedList(text: string): string[] {
  return text
    .split(/[,，]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export default parseCommand;

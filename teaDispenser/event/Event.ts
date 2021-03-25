import Command from '../data/Command';
import FleetLoot from '../data/FleetLoot';
import FleetLootRecord from '../data/FleetLootRecord';
import InvalidCommand from '../data/InvalidCommand';
import ItemStack from '../data/ItemStack';
import MessageEventContext from '../data/MessageEventContext';
import Needs from '../data/Needs';
import WebServerEventContext from '../data/WebServerEventContext';

type Event =
  | MessageEvent<'discord'>
  | MessageEvent<'kaiheila'>
  | {
      readonly type: '[Web] IndexRequested';
      readonly context: WebServerEventContext;
    };

type MessageEvent<T extends string> =
  | {
      readonly type: `[${Capitalize<T>}] Pinged`;
      readonly context: MessageEventContext;
    }
  | {
      readonly type: `[${Capitalize<T>}] ImagePosted`;
      readonly urls: readonly string[];
      readonly username: string;
      readonly context: MessageEventContext;
    }
  | {
      readonly type: `[${Capitalize<T>}] HandsUpButtonPressed`;
      readonly fleetLoot: FleetLoot;
      readonly fleetLootRecordTitle: string;
      readonly needs: Needs;
      readonly context: MessageEventContext;
    }
  | {
      readonly type: `[${Capitalize<T>}] CommandIssued`;
      readonly command: Command | InvalidCommand;
      readonly context: MessageEventContext;
    }
  | {
      readonly type: `[${Capitalize<T>}] KiwiButtonPressed`;
      readonly fleetLootRecord: FleetLootRecord;
      readonly userId: string;
      readonly context: MessageEventContext;
    }
  | {
      readonly type: '[Web] FleetLootEditorRequested';
      readonly messageServiceProvider: T;
      readonly channelId: string;
      readonly messageId: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] FleetLootEditorPosted';
      readonly messageServiceProvider: T;
      readonly channelId: string;
      readonly messageId: string;
      readonly fleetLoot: FleetLoot | null;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] NeederChooserRequested';
      readonly messageServiceProvider: T;
      readonly channelId: string;
      readonly messageId: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] NeedsEditorRequested';
      readonly messageServiceProvider: T;
      readonly channelId: string;
      readonly messageId: string;
      readonly needer: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] NeedsEditorPosted';
      readonly messageServiceProvider: T;
      readonly channelId: string;
      readonly messageId: string;
      readonly needer: string;
      readonly itemStacks: readonly ItemStack[];
      readonly context: WebServerEventContext;
    };

export default Event;

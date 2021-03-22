import Command from './data/Command';
import DiscordEventContext from './data/DiscordEventContext';
import FleetLoot from './data/FleetLoot';
import FleetLootRecord from './data/FleetLootRecord';
import InvalidCommand from './data/InvalidCommand';
import ItemStack from './data/ItemStack';
import Needs from './data/Needs';
import WebServerEventContext from './data/WebServerEventContext';

type Event =
  | {
      readonly type: '[Discord] Pinged';
      readonly context: DiscordEventContext;
    }
  | {
      readonly type: '[Discord] ImagePosted';
      readonly urls: readonly string[];
      readonly username: string;
      readonly context: DiscordEventContext;
    }
  | {
      readonly type: '[Discord] HandsUpButtonPressed';
      readonly fleetLoot: FleetLoot;
      readonly fleetLootRecordTitle: string;
      readonly needs: Needs;
      readonly context: DiscordEventContext;
    }
  | {
      readonly type: '[Discord] CommandIssued';
      readonly command: Command | InvalidCommand;
      readonly context: DiscordEventContext;
    }
  | {
      readonly type: '[Discord] KiwiButtonPressed';
      readonly fleetLootRecord: FleetLootRecord;
      readonly userId: string;
      readonly context: DiscordEventContext;
    }
  | {
      readonly type: '[Web] IndexRequested';
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] DiscordFleetLootEditorRequested';
      readonly channelId: string;
      readonly messageId: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] DiscordFleetLootEditorPosted';
      readonly channelId: string;
      readonly messageId: string;
      readonly fleetLoot: FleetLoot | null;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] DiscordNeederChooserRequested';
      readonly channelId: string;
      readonly messageId: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] DiscordNeedsEditorRequested';
      readonly channelId: string;
      readonly messageId: string;
      readonly needer: string;
      readonly context: WebServerEventContext;
    }
  | {
      readonly type: '[Web] DiscordNeedsEditorPosted';
      readonly channelId: string;
      readonly messageId: string;
      readonly needer: string;
      readonly itemStacks: readonly ItemStack[];
      readonly context: WebServerEventContext;
    };

export default Event;

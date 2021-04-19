import Command from '../data/Command';
import FleetLoot from '../data/FleetLoot';
import FleetLootRecord from '../data/FleetLootRecord';
import InvalidCommand from '../data/InvalidCommand';
import ItemStack from '../data/ItemStack';
import MessageServiceProvider from '../data/MessageServiceProvider';
import Needs from '../data/Needs';
import WebServerEventContext from '../data/WebServerEventContext';

type Event =
  | PingedEvent
  | ImagePostedEvent
  | HandsUpButtonPressedEvent
  | CommandIssuedEvent
  | KiwiButtonPressedEvent
  | WebFleetLootEditorRequestedEvent
  | WebFleetLootEditorPostedEvent
  | WebNeederChooserRequestedEvent
  | WebNeedsEditorRequestedEvent
  | WebNeedsEditorPostedEvent
  | WebIndexRequested;

export interface MessageAssociatedEventCommon {
  readonly messageServiceProvider: MessageServiceProvider;
  readonly channelId: string;
}

export interface MessageServiceEventCommon extends MessageAssociatedEventCommon {
  readonly triggeringUserId: string;
}

export interface PingedEvent extends MessageServiceEventCommon {
  readonly type: '[Message] Pinged';
}

export interface ImagePostedEvent extends MessageServiceEventCommon {
  readonly type: '[Message] ImagePosted';
  readonly urls: readonly string[];
  readonly username: string;
}

export interface HandsUpButtonPressedEvent extends MessageServiceEventCommon {
  readonly type: '[Message] HandsUpButtonPressed';
  readonly fleetLoot: FleetLoot;
  readonly fleetLootRecordTitle: string;
  readonly needs: Needs;
}

export interface CommandIssuedEvent extends MessageServiceEventCommon {
  readonly type: '[Message] CommandIssued';
  readonly command: Command | InvalidCommand;
}

export interface KiwiButtonPressedEvent extends MessageServiceEventCommon {
  readonly type: '[Message] KiwiButtonPressed';
  readonly fleetLootRecord: FleetLootRecord;
  readonly userId: string;
  readonly buttonAssociatedMessageId: string;
}

export interface WebFleetLootEditorRequestedEvent extends MessageAssociatedEventCommon {
  readonly type: '[Web] FleetLootEditorRequested';
  readonly ie10OrBelow: boolean;
  readonly messageId: string;
  readonly context: WebServerEventContext;
}

export interface WebFleetLootEditorPostedEvent extends MessageAssociatedEventCommon {
  readonly type: '[Web] FleetLootEditorPosted';
  readonly messageId: string;
  readonly fleetLoot: FleetLoot | null;
  readonly context: WebServerEventContext;
}

export interface WebNeederChooserRequestedEvent extends MessageAssociatedEventCommon {
  readonly type: '[Web] NeederChooserRequested';
  readonly messageId: string;
  readonly context: WebServerEventContext;
}

export interface WebNeedsEditorRequestedEvent extends MessageAssociatedEventCommon {
  readonly type: '[Web] NeedsEditorRequested';
  readonly messageId: string;
  readonly needer: string;
  readonly context: WebServerEventContext;
}

export interface WebNeedsEditorPostedEvent extends MessageAssociatedEventCommon {
  readonly type: '[Web] NeedsEditorPosted';
  readonly messageId: string;
  readonly needer: string;
  readonly itemStacks: readonly ItemStack[];
  readonly context: WebServerEventContext;
}

export interface WebIndexRequested {
  readonly type: '[Web] IndexRequested';
  readonly context: WebServerEventContext;
}

export default Event;

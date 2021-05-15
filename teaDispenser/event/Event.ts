import { DmvService, TeaDispenserService } from '../data/ChatService';
import ChatServiceContext from '../data/ChatServiceContext';
import Command from '../data/Command';
import FleetLoot from '../data/FleetLoot';
import InvalidCommand from '../data/InvalidCommand';
import ItemStack from '../data/ItemStack';
import MessageContext from '../data/MessageContext';
import WebServerContext from '../data/WebServerContext';

type Event =
  | PingedEvent
  | TeaDispenserImagePostedEvent
  | TeaDispenserHandsUpButtonPressedEvent
  | TeaDispenserCommandIssuedEvent
  | TeaDispenserKiwiButtonPressedEvent
  | DmvInstallCommandIssuedEvent
  | DmvCryButtonPressedEvent
  | WebFleetLootEditorRequestedEvent
  | WebFleetLootEditorPostedEvent
  | WebNeederChooserRequestedEvent
  | WebNeedsEditorRequestedEvent
  | WebNeedsEditorPostedEvent
  | WebIndexRequested;

export interface PingedEvent extends ChatServiceContext {
  readonly type: '[Chat] Pinged';
}

export interface TeaDispenserChatServiceEventCommon extends ChatServiceContext {
  readonly chatService: TeaDispenserService;
}

export interface TeaDispenserImagePostedEvent extends TeaDispenserChatServiceEventCommon {
  readonly type: '[TeaDispenser] ImagePosted';
  readonly urls: readonly string[];
  readonly username: string;
}

export interface TeaDispenserHandsUpButtonPressedEvent extends TeaDispenserChatServiceEventCommon {
  readonly type: '[TeaDispenser] HandsUpButtonPressed';
  readonly messageId: string;
}

export interface TeaDispenserCommandIssuedEvent extends TeaDispenserChatServiceEventCommon {
  readonly type: '[TeaDispenser] CommandIssued';
  readonly command: Command | InvalidCommand;
  readonly triggeringUserId: string;
}

export interface TeaDispenserKiwiButtonPressedEvent extends TeaDispenserChatServiceEventCommon {
  readonly type: '[TeaDispenser] KiwiButtonPressed';
  readonly messageId: string;
  readonly triggeringUserId: string;
}

export interface DmvChatServiceEventCommon extends ChatServiceContext {
  readonly chatService: DmvService;
}

export interface DmvInstallCommandIssuedEvent extends DmvChatServiceEventCommon {
  readonly type: '[Dmv] InstallCommandIssued';
  readonly mentionedRoles: readonly number[];
}

export interface DmvCryButtonPressedEvent extends DmvChatServiceEventCommon {
  readonly type: '[Dmv] CryButtonPressed';
  readonly messageId: string;
  readonly emojiId: string;
  readonly triggeringUserId: string;
}

interface TeaDispenserWebEventCommon extends MessageContext, WebServerContext {
  readonly chatService: TeaDispenserService;
}

export interface WebFleetLootEditorRequestedEvent extends TeaDispenserWebEventCommon {
  readonly type: '[Web] FleetLootEditorRequested';
  readonly ie10OrBelow: boolean;
}

export interface WebFleetLootEditorPostedEvent extends TeaDispenserWebEventCommon {
  readonly type: '[Web] FleetLootEditorPosted';
  readonly fleetLoot: FleetLoot | null;
}

export interface WebNeederChooserRequestedEvent extends TeaDispenserWebEventCommon {
  readonly type: '[Web] NeederChooserRequested';
}

export interface WebNeedsEditorRequestedEvent extends TeaDispenserWebEventCommon {
  readonly type: '[Web] NeedsEditorRequested';
  readonly needer: string;
}

export interface WebNeedsEditorPostedEvent extends TeaDispenserWebEventCommon {
  readonly type: '[Web] NeedsEditorPosted';
  readonly needer: string;
  readonly itemStacks: readonly ItemStack[];
}

export interface WebIndexRequested extends WebServerContext {
  readonly type: '[Web] IndexRequested';
}

export default Event;

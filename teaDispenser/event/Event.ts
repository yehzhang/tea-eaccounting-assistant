import ChatService, { DmvService, TeaDispenserService } from '../data/ChatService';
import Command from '../data/Command';
import FleetLoot from '../data/FleetLoot';
import InvalidCommand from '../data/InvalidCommand';
import ItemStack from '../data/ItemStack';
import WebServerEventContext from '../data/WebServerEventContext';

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

export interface ChatServiceEventCommon {
  readonly chatService: ChatService;
}

export interface PingedEvent extends ChatServiceEventCommon {
  readonly type: '[Chat] Pinged';
  readonly channelId: string;
}

export interface TeaDispenserEventCommon extends ChatServiceEventCommon {
  readonly chatService: TeaDispenserService;
  readonly channelId: string;
}

export interface TeaDispenserImagePostedEvent extends TeaDispenserEventCommon {
  readonly type: '[TeaDispenser] ImagePosted';
  readonly urls: readonly string[];
  readonly username: string;
}

export interface TeaDispenserHandsUpButtonPressedEvent extends TeaDispenserEventCommon {
  readonly type: '[TeaDispenser] HandsUpButtonPressed';
  readonly buttonAssociatedMessageId: string;
}

export interface TeaDispenserCommandIssuedEvent extends TeaDispenserEventCommon {
  readonly type: '[TeaDispenser] CommandIssued';
  readonly command: Command | InvalidCommand;
  readonly triggeringUserId: string;
}

export interface TeaDispenserKiwiButtonPressedEvent extends TeaDispenserEventCommon {
  readonly type: '[TeaDispenser] KiwiButtonPressed';
  readonly userId: string;
  readonly buttonAssociatedMessageId: string;
  readonly triggeringUserId: string;
}

export interface DmvChatServiceEventCommon extends ChatServiceEventCommon {
  readonly chatService: DmvService;
}

export interface DmvInstallCommandIssuedEvent extends DmvChatServiceEventCommon {
  readonly type: '[Dmv] InstallCommandIssued';
  readonly channelId: string;
  readonly mentionedRoles: readonly number[];
}

export interface DmvCryButtonPressedEvent extends DmvChatServiceEventCommon {
  readonly type: '[Dmv] CryButtonPressed';
  readonly messageId: string;
  readonly emojiId: string;
  readonly channelId: string;
  readonly triggeringUserId: string;
}

export interface WebFleetLootEditorRequestedEvent extends TeaDispenserEventCommon {
  readonly type: '[Web] FleetLootEditorRequested';
  readonly ie10OrBelow: boolean;
  readonly messageId: string;
  readonly context: WebServerEventContext;
}

export interface WebFleetLootEditorPostedEvent extends TeaDispenserEventCommon {
  readonly type: '[Web] FleetLootEditorPosted';
  readonly messageId: string;
  readonly fleetLoot: FleetLoot | null;
  readonly context: WebServerEventContext;
}

export interface WebNeederChooserRequestedEvent extends TeaDispenserEventCommon {
  readonly type: '[Web] NeederChooserRequested';
  readonly messageId: string;
  readonly context: WebServerEventContext;
}

export interface WebNeedsEditorRequestedEvent extends TeaDispenserEventCommon {
  readonly type: '[Web] NeedsEditorRequested';
  readonly messageId: string;
  readonly needer: string;
  readonly context: WebServerEventContext;
}

export interface WebNeedsEditorPostedEvent extends TeaDispenserEventCommon {
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

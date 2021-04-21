import { nanoid } from 'nanoid';
import DispatchView from '../data/DispatchView';
import MessageEventContext from '../data/MessageEventContext';
import WebServerEventContext from '../data/WebServerEventContext';
import Event, { ChatServiceEventCommon } from '../event/Event';
import MessageView from '../view/message/MessageView';
import WebPageView from '../view/webPage/WebPageView';
import updateOnDmvCryButtonPressed from './dmv/updateOnDmvCryButtonPressed';
import updateOnDmvInstallCommandIssued from './dmv/updateOnDmvInstallCommandIssued';
import updateOnTeaDispenserCommandIssued from './teaDispenser/updateOnTeaDispenserCommandIssued';
import updateOnTeaDispenserHandsUpButtonPressed
  from './teaDispenser/updateOnTeaDispenserHandsUpButtonPressed';
import updateOnTeaDispenserImagePosted from './teaDispenser/updateOnTeaDispenserImagePosted';
import updateOnTeaDispenserKiwiButtonPressed
  from './teaDispenser/updateOnTeaDispenserKiwiButtonPressed';
import updateOnPinged from './updateOnPinged';
import updateOnWebFleetLootEditorPosted from './web/updateOnWebFleetLootEditorPosted';
import updateOnWebFleetLootEditorRequested from './web/updateOnWebFleetLootEditorRequested';
import updateOnWebIndexRequested from './web/updateOnWebIndexRequested';
import updateOnWebNeederChooserRequested from './web/updateOnWebNeederChooserRequested';
import updateOnWebNeedsEditorPosted from './web/updateOnWebNeedsEditorPosted';
import updateOnWebNeedsEditorRequested from './web/updateOnWebNeedsEditorRequested';

async function update(
  event: Event,
  dispatchViews: {
    readonly message: DispatchView<MessageView, [MessageEventContext]>;
    readonly webPage: DispatchView<WebPageView, [WebServerEventContext]>;
  }
): Promise<boolean> {
  switch (event.type) {
    case '[Chat] Pinged':
    case '[TeaDispenser] ImagePosted':
    case '[TeaDispenser] HandsUpButtonPressed':
    case '[TeaDispenser] KiwiButtonPressed':
    case '[TeaDispenser] CommandIssued':
    case '[Dmv] InstallCommandIssued': {
      const context = buildMessageEventContext(event, event.channelId);
      const dispatchMessageView: DispatchView<MessageView> = (view) =>
        dispatchViews.message(view, context);
      switch (event.type) {
        case '[Chat] Pinged':
          return updateOnPinged(dispatchMessageView);
        case '[TeaDispenser] ImagePosted':
          return updateOnTeaDispenserImagePosted(event, context, dispatchMessageView);
        case '[TeaDispenser] HandsUpButtonPressed':
          return updateOnTeaDispenserHandsUpButtonPressed(event, dispatchMessageView);
        case '[TeaDispenser] KiwiButtonPressed':
          return updateOnTeaDispenserKiwiButtonPressed(event, dispatchMessageView);
        case '[TeaDispenser] CommandIssued':
          return updateOnTeaDispenserCommandIssued(event, dispatchMessageView);
        case '[Dmv] InstallCommandIssued':
          return updateOnDmvInstallCommandIssued(event, dispatchMessageView);
      }
    }
    case '[Dmv] CryButtonPressed': {
      const dispatchMessageView: DispatchView<MessageView, [channelId: string]> = (
        view,
        channelId
      ) => dispatchViews.message(view, buildMessageEventContext(event, channelId));
      return updateOnDmvCryButtonPressed(event, dispatchMessageView);
    }
    case '[Web] IndexRequested':
    case '[Web] FleetLootEditorRequested':
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
    case '[Web] NeedsEditorPosted': {
      const dispatchWebView: DispatchView<WebPageView> = (view) =>
        dispatchViews.webPage(view, event.context);
      if (event.type === '[Web] IndexRequested') {
        return updateOnWebIndexRequested(dispatchWebView);
      }

      const dispatchMessageView: DispatchView<MessageView> = (view) =>
        dispatchViews.message(view, buildMessageEventContext(event, event.channelId));
      switch (event.type) {
        case '[Web] FleetLootEditorRequested':
          return updateOnWebFleetLootEditorRequested(event, dispatchWebView);
        case '[Web] FleetLootEditorPosted':
          return updateOnWebFleetLootEditorPosted(event, dispatchWebView, dispatchMessageView);
        case '[Web] NeederChooserRequested':
          return updateOnWebNeederChooserRequested(event, dispatchWebView);
        case '[Web] NeedsEditorRequested':
          return updateOnWebNeedsEditorRequested(event, dispatchWebView);
        case '[Web] NeedsEditorPosted':
          return updateOnWebNeedsEditorPosted(event, dispatchWebView, dispatchMessageView);
      }
    }
  }
}

function buildMessageEventContext(event: ChatServiceEvent, channelId: string): MessageEventContext {
  const { chatService } = event;
  return {
    eventId: nanoid(),
    channelId,
    replyToUserId: getReplyToUserId(event),
    chatService: chatService,
    messageIdToEdit: getMessageIdToEdit(event),
  };
}

type ChatServiceEvent = Extract<Event, ChatServiceEventCommon>;

function getReplyToUserId(event: ChatServiceEvent): string | null {
  switch (event.type) {
    case '[TeaDispenser] CommandIssued':
    case '[Dmv] CryButtonPressed':
      return event.triggeringUserId;
    case '[Chat] Pinged':
    case '[TeaDispenser] ImagePosted':
    case '[TeaDispenser] KiwiButtonPressed':
    case '[TeaDispenser] HandsUpButtonPressed':
    case '[Dmv] InstallCommandIssued':
    case '[Web] FleetLootEditorRequested':
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
    case '[Web] NeedsEditorPosted':
      return null;
  }
}

function getMessageIdToEdit(event: ChatServiceEvent): string | null {
  switch (event.type) {
    case '[TeaDispenser] KiwiButtonPressed':
      return event.buttonAssociatedMessageId;
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeedsEditorPosted':
      return event.messageId;
    case '[Chat] Pinged':
    case '[TeaDispenser] HandsUpButtonPressed':
    case '[TeaDispenser] ImagePosted':
    case '[TeaDispenser] CommandIssued':
    case '[Dmv] CryButtonPressed':
    case '[Dmv] InstallCommandIssued':
    case '[Web] FleetLootEditorRequested':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
      return null;
  }
}

export default update;

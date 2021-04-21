import { nanoid } from 'nanoid';
import DispatchView from '../data/DispatchView';
import MessageEventContext from '../data/MessageEventContext';
import WebServerEventContext from '../data/WebServerEventContext';
import Event, { MessageAssociatedEventCommon } from '../event/Event';
import MessageView from '../view/message/MessageView';
import WebPageView from '../view/webPage/WebPageView';
import updateOnCommandIssued from './updateOnCommandIssued';
import updateOnHandsUpButtonPressed from './updateOnHandsUpButtonPressed';
import updateOnImagePosted from './updateOnImagePosted';
import updateOnKiwiButtonPressed from './updateOnKiwiButtonPressed';
import updateOnPinged from './updateOnPinged';
import updateOnWebFleetLootEditorPosted from './updateOnWebFleetLootEditorPosted';
import updateOnWebFleetLootEditorRequested from './updateOnWebFleetLootEditorRequested';
import updateOnWebIndexRequested from './updateOnWebIndexRequested';
import updateOnWebNeederChooserRequested from './updateOnWebNeederChooserRequested';
import updateOnWebNeedsEditorPosted from './updateOnWebNeedsEditorPosted';
import updateOnWebNeedsEditorRequested from './updateOnWebNeedsEditorRequested';

async function update(
  event: Event,
  dispatchViews: {
    readonly message: DispatchView<MessageView, [MessageEventContext]>;
    readonly webPage: DispatchView<WebPageView, [WebServerEventContext]>;
  }
): Promise<boolean> {
  switch (event.type) {
    case '[Chat] Pinged':
    case '[Chat] ImagePosted':
    case '[Chat] HandsUpButtonPressed':
    case '[Chat] KiwiButtonPressed':
    case '[Chat] CommandIssued': {
      const context = buildMessageEventContext(event);
      const dispatchMessageView: DispatchView<MessageView> = (view) =>
        dispatchViews.message(view, context);
      switch (event.type) {
        case '[Chat] Pinged':
          return updateOnPinged(dispatchMessageView);
        case '[Chat] ImagePosted':
          return updateOnImagePosted(event, context, dispatchMessageView);
        case '[Chat] HandsUpButtonPressed':
          return updateOnHandsUpButtonPressed(event, dispatchMessageView);
        case '[Chat] KiwiButtonPressed':
          return updateOnKiwiButtonPressed(event, dispatchMessageView);
        case '[Chat] CommandIssued':
          return updateOnCommandIssued(event, dispatchMessageView);
      }
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
        dispatchViews.message(view, buildMessageEventContext(event));
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

function buildMessageEventContext(event: MessageAssociatedEvent): MessageEventContext {
  const { channelId, chatService } = event;
  return {
    eventId: nanoid(),
    channelId,
    replyToUserId: getReplyToUserId(event),
    chatService: chatService,
    messageIdToEdit: getMessageIdToEdit(event),
  };
}

type MessageAssociatedEvent = Extract<Event, MessageAssociatedEventCommon>;

function getReplyToUserId(event: MessageAssociatedEvent): string | null {
  switch (event.type) {
    case '[Chat] KiwiButtonPressed':
    case '[Chat] HandsUpButtonPressed':
    case '[Chat] Pinged':
    case '[Chat] ImagePosted':
    case '[Chat] CommandIssued':
      return event.triggeringUserId;
    case '[Web] FleetLootEditorRequested':
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
    case '[Web] NeedsEditorPosted':
      return null;
  }
}

function getMessageIdToEdit(event: MessageAssociatedEvent): string | null {
  switch (event.type) {
    case '[Chat] KiwiButtonPressed':
      return event.buttonAssociatedMessageId;
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeedsEditorPosted':
      return event.messageId;
    case '[Chat] HandsUpButtonPressed':
    case '[Chat] Pinged':
    case '[Chat] ImagePosted':
    case '[Chat] CommandIssued':
    case '[Web] FleetLootEditorRequested':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
      return null;
  }
}

export default update;

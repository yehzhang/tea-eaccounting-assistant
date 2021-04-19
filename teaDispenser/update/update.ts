import { nanoid } from 'nanoid';
import DispatchView from '../data/DispatchView';
import MessageApi from '../data/MessageApi';
import MessageEventContext from '../data/MessageEventContext';
import MessageServiceProvider from '../data/MessageServiceProvider';
import WebServerEventContext from '../data/WebServerEventContext';
import Event, { MessageAssociatedEventCommon } from '../event/Event';
import ExternalDependency from '../externalDependency/ExternalDependency';
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
  },
  externalDependency: ExternalDependency
): Promise<boolean> {
  const { schedulers } = externalDependency;
  switch (event.type) {
    case '[Message] Pinged':
    case '[Message] ImagePosted':
    case '[Message] HandsUpButtonPressed':
    case '[Message] KiwiButtonPressed':
    case '[Message] CommandIssued': {
      const messageApi = chooseMessageApi(event.messageServiceProvider, externalDependency);
      const context = getMessageEventContext(event, messageApi);
      const dispatchMessageView: DispatchView<MessageView> = (view) =>
        dispatchViews.message(view, context);
      switch (event.type) {
        case '[Message] Pinged':
          return updateOnPinged(dispatchMessageView);
        case '[Message] ImagePosted':
          return updateOnImagePosted(event, context, dispatchMessageView, schedulers);
        case '[Message] HandsUpButtonPressed':
          return updateOnHandsUpButtonPressed(event, dispatchMessageView);
        case '[Message] KiwiButtonPressed':
          return updateOnKiwiButtonPressed(event, dispatchMessageView);
        case '[Message] CommandIssued':
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

      const messageApi = chooseMessageApi(event.messageServiceProvider, externalDependency);
      const dispatchMessageView: DispatchView<MessageView> = (view) =>
        dispatchViews.message(view, getMessageEventContext(event, messageApi));
      switch (event.type) {
        case '[Web] FleetLootEditorRequested':
          return updateOnWebFleetLootEditorRequested(event, dispatchWebView, messageApi);
        case '[Web] FleetLootEditorPosted':
          return updateOnWebFleetLootEditorPosted(
            event,
            dispatchWebView,
            dispatchMessageView,
            messageApi
          );
        case '[Web] NeederChooserRequested':
          return updateOnWebNeederChooserRequested(event, dispatchWebView, messageApi);
        case '[Web] NeedsEditorRequested':
          return updateOnWebNeedsEditorRequested(event, dispatchWebView, messageApi);
        case '[Web] NeedsEditorPosted':
          return updateOnWebNeedsEditorPosted(
            event,
            dispatchWebView,
            dispatchMessageView,
            messageApi
          );
      }
    }
  }
}

function getMessageEventContext(
  event: MessageAssociatedEvent,
  messageApi: MessageApi
): MessageEventContext {
  return {
    eventId: nanoid(),
    channelId: event.channelId,
    replyToUserId: getReplyToUserId(event),
    messageApi,
    messageIdToEdit: getMessageIdToEdit(event),
  };
}

type MessageAssociatedEvent = Extract<Event, MessageAssociatedEventCommon>;

function getReplyToUserId(event: MessageAssociatedEvent): string | null {
  switch (event.type) {
    case '[Message] KiwiButtonPressed':
    case '[Message] HandsUpButtonPressed':
    case '[Message] Pinged':
    case '[Message] ImagePosted':
    case '[Message] CommandIssued':
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
    case '[Message] KiwiButtonPressed':
      return event.buttonAssociatedMessageId;
    case '[Web] FleetLootEditorPosted':
    case '[Web] NeedsEditorPosted':
      return event.messageId;
    case '[Message] HandsUpButtonPressed':
    case '[Message] Pinged':
    case '[Message] ImagePosted':
    case '[Message] CommandIssued':
    case '[Web] FleetLootEditorRequested':
    case '[Web] NeederChooserRequested':
    case '[Web] NeedsEditorRequested':
      return null;
  }
}

function chooseMessageApi(
  messageServiceProvider: MessageServiceProvider,
  { discordApi, kaiheilaApi }: { readonly discordApi: MessageApi; readonly kaiheilaApi: MessageApi }
): MessageApi {
  switch (messageServiceProvider) {
    case 'discord':
      return discordApi;
    case 'kaiheila':
      return kaiheilaApi;
  }
}

export default update;

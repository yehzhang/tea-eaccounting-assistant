import axios from 'axios';
import { createWriteStream } from 'fs';
import _ from 'lodash';
import { basename } from 'path';
import Reader from '../../core/Reader/Reader';
import MessageContext from '../../data/MessageContext';
import RecognizedItem from '../../data/RecognizedItem';
import Ref from '../../data/Ref';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';
import { TeaDispenserImagePostedEvent } from '../../event/Event';
import logErrorWithContext from '../../external/logErrorWithContext';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';
import MessageView from '../../render/message/view/MessageView';
import normalizeItemName from './fuzzySearch/normalizeItemName';
import getFleetLootEditorUrl from './getFleetLootEditorUrl';
import getItemTypeIdByName from './getItemTypeIdByName';
import getNeederChooserUrl from './getNeederChooserUrl';
import getTempPath from './getTempPath';
import recognizeItems from './itemDetection/recognizeItems';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';

function updateOnTeaDispenserImagePosted(
  event: TeaDispenserImagePostedEvent
): Reader<MessageRenderingContext, boolean> {
  return new Reader<MessageRenderingContext, MessageView>(async (context) => {
    let detectingItems = true;
    void (async () => {
      let magnifierDirection = true;
      while (detectingItems) {
        const timeoutPromise = waitForTimeoutMs(1260);

        const success = await dispatchView({
          type: 'DetectingItemsView',
          magnifierDirection,
        }).run(context);
        if (success) {
          magnifierDirection = !magnifierDirection;
        }

        await timeoutPromise;
      }
    })();

    const { urls, username } = event;
    const itemStacksList = await Promise.all(
      urls.map(async (url) => {
        const path = await fetchTempFile(url);
        const recognizedItemPromises = await recognizeItems(path);
        return Promise.all(
          recognizedItemPromises.map((recognizedItemPromise) =>
            recognizedItemPromise.then(
              (recognizedItem) => recognizedItem && populateItemStack(recognizedItem)
            )
          )
        );
      })
    );
    const itemStacks = _.compact(itemStacksList.flat());

    detectingItems = false;
    if (!itemStacks.length) {
      return {
        type: 'NoItemsDetectedView',
      };
    }

    const messageIdToEdit = await waitForMessageIdRef(context.messageIdToEditRef);
    if (!messageIdToEdit) {
      return logErrorWithContext('Expected a sent message from reference').replaceBy({
        type: 'InternalErrorView',
      });
    }

    const messageContext: MessageContext = {
      ...context,
      messageId: messageIdToEdit,
    };
    return {
      type: 'ItemsRecognizedView',
      itemStacks,
      username,
      fleetLootEditorUrl: getFleetLootEditorUrl(messageContext),
      neederChooserUrl: getNeederChooserUrl(messageContext),
    };
  }).bind(dispatchView);
}

async function fetchTempFile(url: string): Promise<string> {
  const response = await axios({
    url,
    responseType: 'stream',
  });

  const filename = basename(url);
  const filePath = await getTempPath(filename);
  await new Promise(
    (resolve, reject) =>
      void response.data.pipe(createWriteStream(filePath)).on('finish', resolve).on('error', reject)
  );

  return filePath;
}

async function populateItemStack({
  name,
  amount,
  findIcon,
}: RecognizedItem): Promise<UserInputPricedItemStack> {
  const normalizationResult = await normalizeItemName(name, findIcon);
  if (normalizationResult.type !== 'ExactMatch') {
    return {
      name:
        normalizationResult.type === 'NormalizationOnly'
          ? normalizationResult.normalizedText
          : name,
      amount,
      price: null,
    };
  }

  const itemTypeId = getItemTypeIdByName(normalizationResult.text);
  const itemPrice = itemTypeId !== null && (await fetchPriceByItemTypeId(itemTypeId));
  return {
    name: normalizationResult.text,
    amount,
    price: itemPrice ? itemPrice.lowestSell : null,
  };
}

function waitForTimeoutMs(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => void setTimeout(resolve, timeoutMs));
}

async function waitForMessageIdRef(messageIdRef: Readonly<Ref<string>>): Promise<string | null> {
  // Wait for 10 seconds.
  let retryCount = 0;
  while (messageIdRef.current === null && retryCount < 20) {
    await waitForTimeoutMs(500);
    retryCount++;
  }
  return messageIdRef.current;
}

export default updateOnTeaDispenserImagePosted;

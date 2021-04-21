import axios from 'axios';
import { createWriteStream } from 'fs';
import _ from 'lodash';
import { basename } from 'path';
import DispatchView from '../../data/DispatchView';
import MessageEventContext from '../../data/MessageEventContext';
import RecognizedItem from '../../data/RecognizedItem';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';
import { TeaDispenserImagePostedEvent } from '../../event/Event';
import useExternalContext from '../../external/useExternalContext';
import MessageView from '../../view/message/MessageView';
import normalizeItemName from '../fuzzySearch/normalizeItemName';
import getFleetLootEditorUrl from '../getFleetLootEditorUrl';
import getNeederChooserUrl from '../getNeederChooserUrl';
import getTempPath from '../getTempPath';
import recognizeItems from '../itemDetection/recognizeItems';
import fetchPriceByItemTypeId from '../market/fetchPriceByItemTypeId';
import getItemTypeIdByName from './getItemTypeIdByName';

async function updateOnTeaDispenserImagePosted(
  event: TeaDispenserImagePostedEvent,
  context: MessageEventContext,
  dispatchView: DispatchView<MessageView>,
): Promise<boolean> {
  const { urls, username, channelId, chatService } = event;
  let detectingItems = true;
  const ignored = (async () => {
    let magnifierDirection = true;
    while (detectingItems) {
      const timeoutPromise = new Promise((resolve) => void setTimeout(resolve, 1260));

      const success = await dispatchView({
        type: 'DetectingItemsView',
        magnifierDirection,
      });
      if (success) {
        magnifierDirection = !magnifierDirection;
      }

      await timeoutPromise;
    }
  })();

  const { schedulers } = useExternalContext();
  const itemStacksList = await Promise.all(
    urls.map(async (url) => {
      const path = await fetchTempFile(url);
      const recognizedItemPromises = await recognizeItems(path, schedulers);
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
    return dispatchView({
      type: 'NoItemsDetectedView',
    });
  }

  const { messageIdToEdit } = context;
  if (!messageIdToEdit) {
    console.error('Expected a sent message from context:', context);
    return dispatchView({
      type: 'InternalErrorView',
    });
  }

  return dispatchView({
    type: 'ItemsRecognizedView',
    itemStacks,
    username,
    fleetLootEditorUrl: getFleetLootEditorUrl(chatService, channelId, messageIdToEdit),
    neederChooserUrl: getNeederChooserUrl(chatService, channelId, messageIdToEdit),
  });
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

export default updateOnTeaDispenserImagePosted;

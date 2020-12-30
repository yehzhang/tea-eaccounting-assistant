import DiscordEventContext from './data/DiscordEventContext';
import setupBot from './discord/setupBot';
import syncRenderings from './discord/syncRenderings';
import { Event } from './event';
import startApp from './startApp';
import executeEvent from './update/executeEvent';
import { setupTesseract } from './update/itemDetection/recognizeItems';
import render from './view/render';

async function setup(dispatchEvent: (event: Event, context: DiscordEventContext) => Promise<void>) {
  await setupTesseract();
  await setupBot(dispatchEvent);
}

startApp(setup, executeEvent, render, syncRenderings);

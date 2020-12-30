import DiscordEventContext from './data/DiscordEventContext';
import setupBot from './discord/setupBot';
import syncRenderings from './discord/syncRenderings';
import Event from './Event';
import ExternalDependency from './ExternalDependency';
import startApp from './startApp';
import executeEvent from './update/executeEvent';
import setupTesseract from './update/itemDetection/setupTesseract';
import render from './view/render';

async function setup(dispatchEvent: (event: Event, context: DiscordEventContext) => Promise<void>): Promise<ExternalDependency> {
  const schedulers = await setupTesseract();
  await setupBot(dispatchEvent);
  return {
    schedulers,
  };
}

const ignored = startApp(setup, executeEvent, render, syncRenderings);

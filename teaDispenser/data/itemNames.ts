import texts from './textPacks.json';

export const itemNames: string[] = texts.flatMap(({ zh, en }) => [zh, en]);

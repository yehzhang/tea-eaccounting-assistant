import texts from '../../build/texts.json';

export const itemNames: string[] = texts.flatMap(({ zh, en }) => [zh, en]);

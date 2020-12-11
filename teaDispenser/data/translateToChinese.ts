import texts from './textPacks.json';

export function translateToChinese(text: string): string {
    const textPack = texts.find(({ en }) => en === text);
    return textPack ? textPack.zh : text;
}

import texts from './textPacks.json';

export function translateToChinese(text: string): string {
    const textPack = texts.find(({ en }) => en === name);
    return textPack ? textPack.zh : name;
}

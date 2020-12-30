import texts from '../../generated/textPacks.json';

function translateToChinese(text: string): string {
  const textPack = texts.find(({ en }) => en === text);
  return textPack ? textPack.zh : text;
}

export default translateToChinese;

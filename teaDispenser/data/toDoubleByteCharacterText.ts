function toDoubleByteCharacterText(text: string): string {
  return [...text]
    .map((character) => String.fromCharCode(toDoubleByteCharacterCode(character.charCodeAt(0))))
    .join('');
}

function toDoubleByteCharacterCode(charCode: number): number {
  if (charCode === 32) {
    return 12288;
  }
  if (charCode < 127) {
    return charCode + 65248;
  }
  return charCode;
}

export default toDoubleByteCharacterText;

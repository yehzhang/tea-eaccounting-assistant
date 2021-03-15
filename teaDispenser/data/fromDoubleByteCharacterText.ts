function fromDoubleByteCharacterText(text: string): string {
  return [...text]
    .map((character) => String.fromCharCode(fromDoubleByteCharacterCode(character.charCodeAt(0))))
    .join('');
}

function fromDoubleByteCharacterCode(charCode: number): number {
  if (charCode === 12288) {
    return 32;
  }
  if (65281 <= charCode && charCode < 65375) {
    return charCode - 65248;
  }
  return charCode;
}

export default fromDoubleByteCharacterText;

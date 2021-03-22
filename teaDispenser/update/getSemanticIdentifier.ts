function getSemanticIdentifier(text: string): string {
  return text.replace(/[ -]/g, '').toLocaleLowerCase();
}

export default getSemanticIdentifier;

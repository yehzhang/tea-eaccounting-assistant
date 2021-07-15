function getOptionalEnvironmentVariable(key: string): string | null {
  const text = process.env[key];
  if (text == null) {
    return null;
  }

  if (!text) {
    throw new TypeError(`Expected valid \`${key}\` environment variable`);
  }

  return text;
}

export default getOptionalEnvironmentVariable;

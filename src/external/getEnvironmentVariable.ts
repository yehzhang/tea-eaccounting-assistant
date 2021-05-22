import _ from 'lodash';

function getEnvironmentVariable(key: string): string;
function getEnvironmentVariable<T>(
  key: string,
  validator: (text: string) => T | null | undefined
): T;
function getEnvironmentVariable<T>(
  key: string,
  validator: (text: string) => T | null = _.identity
): T {
  const text = process.env[key];
  if (!text) {
    throw new TypeError(`Expected the \`${key}\` environment variable`);
  }

  const validatedValue = validator(text);
  if (validatedValue == null) {
    throw new TypeError(`Unexpected \`${key}\` environment variable value`);
  }

  return validatedValue;
}

export default getEnvironmentVariable;

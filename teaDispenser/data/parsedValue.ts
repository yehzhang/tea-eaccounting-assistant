export type ParsedValue<T> = {
  readonly text: string;
  readonly parsedValue: T | null;
};

function assertExhaustive(value: never): never {
  throw new TypeError(`Expected exhaustive, got ${value}`);
}

export default assertExhaustive;

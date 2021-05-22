type Command = QueryPrice;

interface QueryPrice {
  readonly type: 'QueryPrice';
  readonly itemNames: string[];
}

export default Command;

function logInfo(message: string, params: unknown, depth: number | null) {
  console.dir(
    {
      message,
      params,
    },
    { depth }
  );
}

export default logInfo;

class Duplex<T> {
  connections = new Map<string, (payload: T) => T>();

  async connect(key: string, payload: T, timeoutMs: number): Promise<T | null> {
    const resolve = this.connections.get(key);
    if (resolve) {
      return resolve(payload);
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.connections.delete(key);
        resolve(null);
      }, timeoutMs);
      this.connections.set(key, (otherPayload) => {
        this.connections.delete(key);

        clearTimeout(timeoutId);

        resolve(otherPayload);

        return payload;
      });
    });
  }
}

export default Duplex;

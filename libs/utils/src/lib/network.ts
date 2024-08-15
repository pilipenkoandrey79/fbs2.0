export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = async (predicate: () => boolean, pollInterval = 50) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await predicate();

    if (result) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
};

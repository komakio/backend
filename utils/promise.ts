export const resolveIfOneResolves = async (promises: Promise<any>[]) => {
  await Promise.all(promises.map(p => p.catch(() => null)));
  await new Promise((resolve, reject) => {
    promises.filter(p => p).length ? resolve() : reject();
  });
};

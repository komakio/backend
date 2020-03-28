export const resolveIfOneResolves = async (promises: Promise<any>[]) => {
  const res = await Promise.all(promises.map(p => p.catch(() => '__rejected')));
  await new Promise((resolve, reject) => {
    res.filter(p => p !== '__rejected').length ? resolve() : reject();
  });
};

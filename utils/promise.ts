export const resolveIfOneResolves = async (promises: Promise<any>[]) => {
  const res = await Promise.all(promises.map(p => p.catch(() => '__rejected')));
  const resolved = res.filter(p => p !== '__rejected');
  await new Promise((resolve, reject) => {
    resolved.length ? resolve() : reject();
  });
  return resolved;
};

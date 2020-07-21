
export const allSeries = async (items: any[], promiseFn: (arg: any) => Promise<any>, chunkSize: number, catchCallback: (error) => any) => {
  return series(false, items, promiseFn, chunkSize, catchCallback);
}

export const allSettledSeries = async (items: any[], promiseFn: (arg: any) => Promise<any>, chunkSize: number, catchCallback: (error) => any) => {
  return series(true, items, promiseFn, chunkSize, catchCallback);
}

export const allSettled = (promises: Promise<any>[]) =>
  Promise.all(promises.map((promise) =>
    promise
      .then((value) => ({ state: 'fulfilled', value }))
      .catch((value) => ({ state: 'rejected', value }))
  ));

export const firstFulfilled = async (promises: Promise<any>[]) => {
  const all = await allSettled(promises);
  const succesList = all.filter(result => result.state === 'fulfilled');
  if (succesList.length > 0) {
    return succesList[0].value;
  }
}

export const first = async (promises: Promise<any>[]) => {
  for (const promise of promises) {
    try {
      return await promise
    } catch (err) { }
  }
}

const series = async (isSettled: boolean, items: any[], promiseFn: (arg: any) => Promise<any>, chunkSize: number, catchCallback: (error) => any) => {
  let result = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const promises = items.slice(i, i + chunkSize).map((iterItem) => {
      try {
        return promiseFn(iterItem);
      } catch (err) {
        if (!!catchCallback) {
          catchCallback(err);
        }
      }
    });
    try {
      const chunkResult = isSettled ? await allSettled(promises) : await Promise.all(promises);
      result = [...result, ...chunkResult];
    } catch (err) {
      if (!!catchCallback) {
        catchCallback(err);
      }
    }
  }
  return result;
}


// FIXME: пример в комменты здесь
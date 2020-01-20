export default class PromiseUtils {

  public static runInSequence<T, U> (collection: T[], callback: (item: T) => Promise<U>): Promise<U[]> {
    const results: U[] = [];
    return collection.reduce((promise, item) => {
      return promise.then(() => {
        return callback(item);
      }).then((result) => {
        results.push(result);
      });
    }, Promise.resolve()).then(() => {
      return results;
    });
  }
}

// Example
// export async function createConnections(options?: ConnectionOptions[]): Promise<Connection[]> {
//   if (!options)
//       options = await new ConnectionOptionsReader().all();
//   const connections = options.map(options => getConnectionManager().create(options));
//   return PromiseUtils.runInSequence(connections, connection => connection.connect());
// }

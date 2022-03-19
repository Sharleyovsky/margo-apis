export const safeCallFactory = (prefix: string) => {
  return <T extends (...args: any) => any>(fn: T, ...args: Parameters<T>): NonNullable<ReturnType<T>> => {
    const ret = fn(...args);
    if (ret === null || ret === undefined) {
      throw new Error(`${prefix} ${args.map(String).join(',')}`);
    }
    return ret;
  };
};

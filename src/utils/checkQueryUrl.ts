export const checkQueryUrl = (
  value: undefined | string | string[],
): string[] | undefined => {
  if (value) {
    if (typeof value === 'string') {
      return [value];
    } else {
      return value;
    }
  } else {
    return undefined;
  }
};

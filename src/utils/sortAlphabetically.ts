export const sortAlphabetically = <TItem>(
  projection: (item: TItem) => string,
  mode: 'asc' | 'desc' = 'asc'
) => (a: TItem, b: TItem) => {
  const textA = projection(a).toLowerCase();
  const textB = projection(b).toLowerCase();
  const factor = mode === 'asc' ? 1 : -1;
  return textA < textB ? -1 * factor : textA > textB ? 1 * factor : 0;
};

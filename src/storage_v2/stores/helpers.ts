export function upsertById<T extends Record<string, unknown>, K extends keyof T>(
  records: T[],
  key: K,
  record: T
): T[] {
  const index = records.findIndex((candidate) => candidate[key] === record[key]);
  if (index === -1) {
    return [...records, record];
  }

  return records.map((candidate, candidateIndex) => (candidateIndex === index ? record : candidate));
}

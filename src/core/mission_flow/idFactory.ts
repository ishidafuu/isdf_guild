export function formatSequenceId(prefix: string, sequence: number): `${string}_${string}` {
  return `${prefix}_${String(sequence).padStart(4, "0")}`;
}

import type { Character, LingerFlag } from "../../domain";

function decayFlag(flag: LingerFlag, character: Character): LingerFlag | null {
  const neuroticism = character.big5?.neuroticism ?? 0;
  const agreeableness = character.big5?.agreeableness ?? 0;
  const baseDecay =
    flag.flag === "friction" || flag.flag === "client_distrust"
      ? neuroticism > 0
        ? 0
        : 1
      : flag.flag === "protective_instinct" || flag.flag === "owed_favor"
        ? agreeableness > 0
          ? 0
          : 1
        : 1;

  const remainingCycles = Math.max(0, flag.remaining_cycles - baseDecay);
  if (remainingCycles <= 0) {
    return null;
  }

  return {
    ...flag,
    remaining_cycles: remainingCycles,
  };
}

export function decayLingerFlags(characters: Character[]): Character[] {
  return characters.map((character) => {
    const lingerState = character.linger_state;
    if (!lingerState) {
      return character;
    }

    return {
      ...character,
      linger_state: {
        personal_flags: lingerState.personal_flags
          ?.map((flag) => decayFlag(flag, character))
          .filter((flag): flag is LingerFlag => flag !== null),
        relationship_flags: lingerState.relationship_flags
          ?.map((entry) => ({
            ...entry,
            flags: entry.flags
              .map((flag) => decayFlag(flag, character))
              .filter((flag): flag is LingerFlag => flag !== null),
          }))
          .filter((entry) => entry.flags.length > 0),
      },
    };
  });
}

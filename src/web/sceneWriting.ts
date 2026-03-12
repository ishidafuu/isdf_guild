import type { Character, Dispatch, Mission, Report, StaffCharacter } from "../domain";

export type CharacterDialogueLine = {
  character_id?: Character["character_id"];
  speaker: string;
  text: string;
};

type PreparedCycleLike = {
  mission: Mission;
  dispatch: Dispatch;
  report: Report;
  characters_after_report: Character[];
};

export function getMissionLead(mission: Mission): string {
  if (mission.category === "delivery") {
    return "夜明け前までに荷を通す仕事。派手じゃないけど、止まると一気に面倒になる。";
  }
  if (mission.category === "negotiation") {
    return "揉めてる連中をなだめる仕事。誰を前に出すかで、話が早く済むか長引くかが変わる。";
  }
  return "企業区画でログを抜く仕事。うまくやっても、だいたい何かしら面倒は残る。";
}

export function getMissionShadow(mission: Mission): string {
  if (mission.category === "delivery") {
    return "締切が短い。もたつくほど検問が増えて笑えなくなる。";
  }
  if (mission.category === "negotiation") {
    return "片方の顔を立てすぎると、もう片方があとでへそを曲げる。";
  }
  return "依頼人も全部は話していない。報酬だけ見て飛びつくと、あとで嫌な顔をすることになる。";
}

export function getMissionEntryMode(mission: Mission): "staff_report" | "adventurer_pitch" | "client_visit" {
  if (mission.category === "delivery") {
    return "staff_report";
  }
  if (mission.category === "recovery") {
    return "adventurer_pitch";
  }
  return "client_visit";
}

export function summarizeBriefingIntent(intent: string): string {
  const normalized = intent.trim();
  if (!normalized) {
    return "主はまだ返事を急がず、相手の出方を見ている。";
  }
  if (/(危|慎重|様子|急が)/.test(normalized)) {
    return "主は即答を避け、危ない筋がないか先に洗いたい顔をしている。";
  }
  if (/(金|報酬|割|見合)/.test(normalized)) {
    return "主は条件が見合うかを先に量り、安売りする気はない。";
  }
  if (/(信用|怪|胡散臭|疑)/.test(normalized)) {
    return "主は相手を丸ごと信じず、言葉の継ぎ目を確かめるつもりでいる。";
  }
  if (/(受け|やる|進め)/.test(normalized)) {
    return "主は受ける方向で考えているが、誰を出すかまではまだ決め切っていない。";
  }
  return "主は返答の角度を探っている。言い方ひとつで、場の空気が変わると知っている。";
}

export function summarizeCastingIntent(intent: string): string {
  const normalized = intent.trim();
  if (!normalized) {
    return "顔ぶれの決め手はまだない。誰に声をかけるかで、空気も結果も変わる。";
  }
  if (/(休|無理|温存|疲)/.test(normalized)) {
    return "主は無理をさせない編成を考えている。足りないぶんは、別の誰かに背負わせることになる。";
  }
  if (/(速|急|押し|強引)/.test(normalized)) {
    return "主は多少荒くても、話を前へ動かす顔ぶれを探している。";
  }
  if (/(相性|組|噛み合|一緒)/.test(normalized)) {
    return "主は能力だけでなく、並べた時の空気を重く見ている。";
  }
  return "主は今回の運び方に筋を通したいと思っている。誰を前に出すかで、その筋が決まる。";
}

export function getCharacterReaction(character: Character, mission: Mission): string {
  if (character.character_id === "char_shion") {
    if (mission.category === "delivery") {
      return "短くうなずく。危ない運びでも、前に立つ役なら自分だと思っている顔だ。";
    }
    if (mission.category === "recovery") {
      return "表情は薄いが、企業区画と聞いた時だけ少しだけ目つきが固くなる。";
    }
    return "相変わらず口数は少ない。ただ、断る時の空気ではない。";
  }
  if (character.character_id === "char_mina") {
    if (mission.category === "recovery") {
      return "端末を閉じる指先が少し強い。企業絡みだと、だいたい機嫌がよくない。";
    }
    if (mission.category === "delivery") {
      return "荷より先に経路の雑さを気にしている。受けるなら準備はちゃんとやりたいらしい。";
    }
    return "依頼人の名前を聞いた時だけ視線が冷える。わかりやすいと言えばわかりやすい。";
  }
  if (character.character_id === "char_gai") {
    if (mission.category === "negotiation") {
      return "口元だけで笑う。面倒な仲裁ほど、自分の出番だとわかっている顔だ。";
    }
    return "軽口を挟む。余裕があるというより、そうやって場を軽くする癖だ。";
  }
  if (character.character_id === "char_nora") {
    if (mission.category === "recovery") {
      return "先に退路を気にしている。まだ現場も見ていないのに、もう出口の心配をしている。";
    }
    return "返事は小さい。でも嫌な予感がある時ほど、逆に静かになる。";
  }
  if (character.character_id === "char_iza") {
    return "すぐには断らない。誰かの穴埋めだと、なおさら引き受けがちだ。";
  }
  return character.public_digest;
}

export function getBriefingCharacterLine(character: Character, mission: Mission): string {
  if (character.character_id === "char_gai") {
    return mission.category === "negotiation"
      ? "椅子の背に寄りかかる。『話をまとめるだけなら軽い。軽く済めば、だけど』"
      : "肩をすくめる。『金の匂いはする。ついでに面倒の匂いもするけどな』";
  }
  if (character.character_id === "char_mina") {
    return mission.category === "recovery"
      ? "端末から目を上げる。『企業絡みなら、雑な説明を真に受けない方がいい』"
      : "資料を見て眉をひそめる。『準備不足で押すなら、誰かが後で泣く』";
  }
  if (character.character_id === "char_shion") {
    return "壁際から一度だけうなずく。『受けるなら、引き方だけ先に決めておけ』";
  }
  if (character.character_id === "char_nora") {
    return "目線は低いままだ。『嫌な感じはある。たぶん、入口より出口で困る』";
  }
  return "短く息を吐く。仕事の匂いだけは、もう十分に伝わっている。";
}

export function getSelectedCharacterBanter(character: Character, mission: Mission): string {
  if (character.character_id === "char_shion") {
    return mission.category === "delivery"
      ? "腕を組んで立つ。『運ぶだけなら運ぶ。ただ、止められた時の方が面倒だ』"
      : "視線だけで返す。『前に出る役が要るならやる。無茶はさせるな』";
  }
  if (character.character_id === "char_mina") {
    return mission.category === "recovery"
      ? "端末を叩きながら言う。『抜くなら抜くでいい。雑に入るなら私は行かない』"
      : "肩越しに言葉を投げる。『準備に時間をくれるなら動ける。根性論なら却下』";
  }
  if (character.character_id === "char_gai") {
    return "笑っているが目は仕事の方を向いている。『揉めたらしゃべる。しゃべって駄目なら、その時考える』";
  }
  if (character.character_id === "char_nora") {
    return "小さく首を振る。『退路だけは先にほしい。あとで探すのは遅い』";
  }
  return "少し間を置いてから返す。『足りない穴埋めならやる。雑に投げるなら考える』";
}

export function getAftermathCharacterBanter(character: Character, result: string): string {
  if (character.character_id === "char_gai") {
    return result === "failure"
      ? "乾いた笑いだけが先に出る。『笑えない方の外し方だな。次はもう少しマシにやる』"
      : "片手を上げる。『ほらな、面倒は面倒でも片づかない面倒じゃなかった』";
  }
  if (character.character_id === "char_mina") {
    return result === "failure"
      ? "額を押さえる。『言った通り、雑に入るとこうなる』"
      : "端末を閉じる。『終わった。気持ちよくはないけど、終わっただけ上等』";
  }
  if (character.character_id === "char_shion") {
    return result === "failure"
      ? "短く言う。『押し切れなかった。次は押し方を変える』"
      : "壁にもたれる。『戻った。それで十分だろ』";
  }
  if (character.character_id === "char_nora") {
    return result === "failure"
      ? "声が小さい。『やっぱり出口が狭かった』"
      : "ようやく肩を落とす。『帰れた。今日はそれでいい』";
  }
  return result === "failure" ? "疲れを隠しきれない。『次はもう少し、うまくやる』" : "息をつく。『片づいたなら、それでいい』";
}

export function getBriefingCrossTalk(
  mission: Mission,
  advisor: StaffCharacter | null,
  featuredCharacters: Character[]
): CharacterDialogueLine[] {
  const lines: CharacterDialogueLine[] = [];

  if (advisor) {
    lines.push({
      character_id: advisor.character_id,
      speaker: advisor.name,
      text:
        mission.category === "delivery"
          ? "急ぎの返事を欲しがってる。急いで受けるのと、雑に受けるのは別だからね。"
          : mission.category === "negotiation"
            ? "話は丸い。でも持ってきた顔が丸い時ほど、後ろで角が立ってる。"
            : "大きい額が出てる。大きい額を出す時は、向こうも急いでると思って。"
    });
  }

  for (const character of featuredCharacters.slice(0, 2)) {
    lines.push({
      character_id: character.character_id,
      speaker: character.name,
      text: getBriefingCharacterLine(character, mission),
    });
  }

  return lines.slice(0, 3);
}

export function getMorningClaimPitch(mission: Mission, character: Character): string {
  if (character.character_id === "char_gai") {
    return `「${mission.display_name}、手触りは悪くない。揉めるなら揉めるで、口を挟む余地はある」`;
  }
  if (character.character_id === "char_mina") {
    return `「${mission.display_name} は気になる。雑に受けるなら反対、段取りを詰めるなら話は別」`;
  }
  if (character.character_id === "char_shion") {
    return `「${mission.display_name}、受けるなら早めに決めろ。半端に引き延ばす方が危ない」`;
  }
  if (character.character_id === "char_nora") {
    return `「${mission.display_name}、出口が見えるならやれる。見えないなら嫌だ」`;
  }
  return `「${mission.display_name} は回せる。足りない穴埋めならこちらでやる」`;
}

export function getStaffClaimReply(mission: Mission, advisor: StaffCharacter | null): string {
  if (!advisor) {
    return "誰も止めない。だから余計に、止める理由を自分で拾う必要がある。";
  }
  if (mission.category === "delivery") {
    return `${advisor.name}は帳面を閉じる。『急ぎたがる声が大きい。だからこそ、急ぐ理由は分けて考える』`;
  }
  if (mission.category === "negotiation") {
    return `${advisor.name}は肩をすくめる。『口のうまい話は多い。片づける人間まで口がうまいとは限らない』`;
  }
  return `${advisor.name}は視線を上げない。『高い額には高い理由がある。たいがい嬉しくない方の理由だけど』`;
}

export function getCastingCrossTalk(
  mission: Mission,
  selectedCharacters: Character[],
  featuredCharacters: Character[]
): CharacterDialogueLine[] {
  const speakers = selectedCharacters.length > 0 ? selectedCharacters : featuredCharacters;
  return speakers.slice(0, 3).map((character) => ({
    character_id: character.character_id,
    speaker: character.name,
    text: getSelectedCharacterBanter(character, mission),
  }));
}

export function getAftermathCrossTalk(
  preparedCycle: PreparedCycleLike,
  getConditionText: (character: Character) => string
): CharacterDialogueLine[] {
  const result = preparedCycle.report.state_updates?.mission_result ?? "unknown";
  return preparedCycle.characters_after_report
    .filter((character) => preparedCycle.dispatch.assigned_character_ids.includes(character.character_id))
    .slice(0, 3)
    .map((character) => ({
      character_id: character.character_id,
      speaker: character.name,
      text: `${getConditionText(character)} ${getAftermathCharacterBanter(character, result)}`,
    }));
}

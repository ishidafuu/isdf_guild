# ギルドスタッフデータ JSON 叩き台

最終更新: 2026-03-10

この文書は、冒険者とは別にギルド内で運営補助や意見提示を行う
`staff` データの扱いを整理する。

補足:
スタッフは人物データの一種として扱えるため、厳密には `04_人物データ_JSON叩き台.md` の拡張でもよい。
ただし役割が少し異なるため、ここではスタッフ用途に寄せた叩き台を独立して置く。

## 1. 方針

- スタッフは依頼へ直接出なくてもよい
- 数値上の補助より、会話、所感、提案、口出しの発生源として使う
- ギルド主の独白を減らし、複数視点のある運営感を出す
- 最小実装では 1 人を基本にしてよい
- ただし、スタッフ 0 人で始める選択肢も残す
- 発言頻度、介入力、提案内容は固定ではなく、スタッフの性格や方針で変化してよい

## 2. 最小スタッフデータ

```json
{
  "character_id": "char_staff_0001",
  "member_kind": "staff",
  "name": "ミレイ",
  "world_pack_id": "world_pack_cyberpunk_base",
  "staff_role": "advisor",
  "sub_staff_roles": ["clerk"],
  "public_digest": "依頼の人選や依頼人対応に口を出してくる相談役。",
  "visibility_phase": ["pre_mission", "post_report"]
}
```

## 3. 推奨スタッフデータ

```json
{
  "character_id": "char_staff_0001",
  "member_kind": "staff",
  "name": "ミレイ",
  "world_pack_id": "world_pack_cyberpunk_base",
  "staff_role": "advisor",
  "sub_staff_roles": ["clerk", "caretaker"],
  "advice_domains": ["assignment", "fatigue", "client_trust", "policy"],
  "conversation_stance": "dry_but_caring",
  "visibility_phase": ["pre_mission", "post_report", "rest_phase"],
  "public_digest": "依頼の人選や依頼人対応に口を出してくる相談役。",
  "volatile_hook": "最近は前衛の無理を止めきれないことを気にしている。",
  "private_dossier": {
    "core_identity": "元交渉屋の中年女性。表情は薄いが、観察眼は鋭い。",
    "background": "企業下請けの調整役を長く務めていたが、切り捨てに耐えきれず現ギルドへ流れ着いた。",
    "daily_texture": "帳面と端末を常に持ち歩く。食事より先に報告書を片付ける。",
    "values": "無理で回す組織を嫌う。結果より『誰を削ったか』を気にする。",
    "social": "不用意に甘やかさないが、放ってもおけない。",
    "work_view": "派手な成功より継続可能性を重視する。",
    "history_hook": "以前、無茶な配置を止められず一人を壊した記憶がある。",
    "speech_rule": "短く断定する。気遣うときほど言葉は辛辣になる。",
    "guild_view": "このギルドを大きくするより、潰れないようにしたい。"
  },
  "opinion_patterns": [
    "無理な編成に反対する",
    "依頼人の態度から不信感を拾う",
    "休養や交代を提案する"
  ],
  "assertiveness": "variable_by_personality",
  "status": {
    "injury": 0,
    "stress": 1,
    "availability": "active"
  },
  "tags": ["staff", "advisor", "commentary_source"]
}
```

## 4. キーごとの役割

- `member_kind`
  - `staff` 固定
- `staff_role`
  - 相談役、記録係、世話役など
- `sub_staff_roles`
  - 少人数運用で兼任している補助役割
- `advice_domains`
  - どの話題に意見しやすいか
- `conversation_stance`
  - 口調や介入姿勢
- `visibility_phase`
  - どの場面で登場しやすいか
- `opinion_patterns`
  - よく言いそうな提案や指摘の傾向
- `assertiveness`
  - 意見の強さ。補助的か、強く口を出すか

## 5. 使いどころ

- 依頼前
  - 人選への口出し
  - 危険や無理への指摘
- 依頼後
  - 冒険者への人物評
  - 次回方針への提案
- 休養時
  - 誰を休ませるべきか
  - だれが限界に近いか
- 平時
  - ギルド方針の提案
  - 対外勢力への印象

## 6. 最小実装での扱い

- 基本は 1 人でよい
- ただし 0 人で始める選択肢も残す
- 固定配置の会話差し込み役として置くだけでも機能する
- 直接ゲーム進行を決める存在ではなく、提案と所感の出力源として扱う
- 発言は毎回必須ではなく、性格や場面に応じて出たり出なかったりしてよい
- 少人数前提なので、複数の役回りを兼ねてよい
- 提案領域は、人選、人物評、平時方針のすべてを扱えてよい

## 7. 後から足してよい要素

- スタッフ同士の関係
- スタッフ専用イベント
- 冒険者ごとの評価メモ
- スタッフ発の依頼推薦

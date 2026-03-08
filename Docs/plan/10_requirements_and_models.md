## 10. 潜在要件（ヒアリング一次）

注記: 同じ論点は、より後ろのヒアリング節（番号が大きい節）の内容を優先する。

### 方向性（確定）

- 体験優先度は「人材采配の快感」>「経営の快感」>「世界への影響」
- 作業感は避ける（ただし運要素・理不尽さは世界のリアリティとして許容）
- 依頼失敗は許容し、失敗結果は数字だけでなく冒険者個人の経験として蓄積させる
- 冒険者は「愛着を持つ個人」として扱う
- 冒険者の死亡/引退は実装対象
- 戦闘は完全自動解決（プレイヤー介入は出発前準備のみ）
- 慌てさせない進行設計（プレイヤーの操作起点で進むテンポ）
- ゴールは置かず、エンドレス運営型
- ペルソナは経営シム層 + TRPG/小説嗜好層

### 重要な示唆

- 依頼を大量処理させるゲームにはしない（案件把握ストレスを抑える）
- 依頼主/冒険者とのやりとり自体を主要コンテンツにする
- 高難度案件への誤配属が、死亡リスクとギルド評価悪化につながる緊張感を作る

### 未確定（次ラウンドで決める）

- 死亡の重さ: 永久ロスト中心 / 高コスト蘇生あり
- 進行方式: ターン制 / 一時停止可能な常時進行
- 1サイクルの案件量: 少数濃密 / 中量フィルタ運用
- 人間関係ドラマの実装粒度: テキスト中心 / イベント分岐中心

## 11. 潜在要件（ヒアリング二次）

### 確定

- 冒険者の死亡/重傷は「長期離脱」扱いを基本とする
- プレイヤーへの直接コストは小さく、主に評判低下で効かせる
- 長期離脱後に復帰しない（退団）可能性を持たせる
- 冒険者個性は「能力値」「性格・価値観」「依頼主との相性」を同等重視
- 戦闘は完全自動解決。介入は出発前準備（編成・助言・持ち物）に限定
- 進行は慌てない設計。後のヒアリングで「放置前提にしない」方針へ更新
- 依頼件数は少なすぎない設計（比較検討できる母数を確保）
- AI生成テキストは依頼・冒険者・周辺会話ログ全般に活用
- 人間関係ドラマは分岐イベントより、ログの蓄積で自然発生させる
- ギルド拡張は「大きさの最大化」ではなく「心地よい運営規模への調整」を目的化
- MVPの感情フックは「冒険者がコマではなく人格ある存在だと感じられること」

### 設計原則

- 失敗は排除せず、物語と運用履歴に変換する
- 儲け特化プレイと冒険者重視プレイのどちらも成立させる
- 操作量ではなく判断の質で面白さを作る

## 12. 潜在要件（ヒアリング三次）

### 確定

- 依頼件数は固定日次ではなく、状況に応じて流動的に発生/撤回する
- 依頼更新は定時更新ではなくイベント駆動（持ち込み、取り下げ、営業獲得）
- 冒険者の離脱期間・退団は固定値でなく事由に応じて変動
- 評判は単一値でなく、依頼主側/冒険者側を分けた多軸評価にする
- 評価軸は「適切性」「倫理性」「収益性」など複数指標で管理する
- 失敗ペナルティは固定でなく、失敗理由と文脈によって変動
- 依頼情報は依頼主の自己申告を基本とし、真実とのズレを許容する
- 冒険者能力は数値を直接見せず、経歴・資格・評判・自己評価で判断させる
- 日報UIは「要約3行 + 詳細ログ展開」を基本形にする
- 放置前提の進行はMVPから外す
- AI生成テキストは依頼主/冒険者/日報ログ全体で活用する

### 設計原則（更新）

- プレイヤーが扱うのは「真実」ではなく「観測された情報」
- 管理量の多さではなく、解釈と判断の面白さを主軸にする
- 正解固定の最適化ではなく、価値観ごとの運営スタイルを許容する

## 13. 潜在要件（ヒアリング四次）

### 確定

- `次の日` 押下時の標準順序は「日報確認 -> 日付更新 -> 依頼終了解決 -> 出発待ち処理 -> 帰還処理 -> 新規依頼流入」
- 同時進行案件数の上限は設けない
- 依頼の放置結果は案件ごとの終了条件に依存する
- 掲示板に出す/出さないはプレイヤー裁量で決める
- 依頼主への追加ヒアリングを実装する
- 情報を一部伏せて冒険者へ提案する運用を許可する
- 冒険者からの応募導線を実装する
- 受諾可否はプレイヤーではなく冒険者側の判断で決まる
- 面談ログは要約保存を基本にする
- パーティ編成は冒険者側が最終決定し、ギルドは提案と助言を行う
- 出発後の介入は完全不可
- 結果分類は4段階（成功 / 部分成功 / 失敗 / 惨敗）
- 長期離脱者への見舞い等のフォロー行動を入れる方向
- 評判回復は地道な積み上げを基本とし、一気に回復する手段は置かない
- 評判は数値表示せず、会話・来訪依頼・応募傾向で間接的に表現する
- AI文体は「読みやすさ優先、軽すぎない」トーンを採用する
- MVP必須3画面は「日中運用ハブ / 個別面談 / 帰還日報」とする
- 面談で提示できる依頼件数に実質上限は設けない
- 面談は冒険者側の「もういい」で打ち切り終了する

## 14. 潜在要件（ヒアリング五次）

### 確定

- `次の日` は未読日報がある場合、先に日報要約の確認を必須とする
- 追加ヒアリングは明示コストなしで実行可能
- 追加ヒアリングを重ねすぎると、依頼主の心証悪化や回答品質低下が起きる
- 情報を伏せた提案は、露見かつ失敗に因果がある場合に悪印象を強く発生させる
- 受諾可否は最終的に冒険者が判断し、結果は受諾/保留/辞退で返る
- 出発する/しないの最終決定は冒険者側にある
- 結果4分類の判定は「目的達成度 x 被害度」の2軸で行う
- 長期離脱者への見舞いは、主に冒険者側の心象へ反映する
- 依頼終了理由の代表パターンは「期限切れ / 他ギルド達成 / 依頼主都合」
- AI失敗時は固定テンプレへ置換せず、直近キャッシュ暫定表示 + 再試行キューで復旧する
- 面談の長さはギルド側で固定せず、冒険者側の打ち切りで終わる
- 冒険者応募は日次で発生する

### 判定モデル（v0.2）

#### 評判の内部モデル

- 評判は内部で複数軸の隠し値を持つ（表示は非数値）
- 各軸のレンジは `0-100`、中心値は `50`
- 依頼主側軸: `適切性 / 倫理性 / 収益性`
- 冒険者側軸: `安全配慮 / 公正配分 / 成長機会`

#### キャラ間心象モデル（v0.8 / 確定）

- 目的:
- 冒険者同士/冒険者-依頼主の関係を、受諾判断・パーティ提案・会話文へ反映する
- 「組ませたい相棒」「避けたい犬猿」「燃えるライバル」を自然に発生させる

- 関係エッジ（有向）:
- `source -> target` ごとに保持（双方向は別レコード）
- 対象組み合わせ:
- `adventurer -> adventurer`
- `adventurer -> client`

- 関係軸（0-100, 初期50）:
- `affinity`（好意・親近感）
- `mission_trust`（任務上の信頼）
- `rivalry`（競争意識）
- `resentment`（遺恨・不満）

- 派生指標:
- `pair_synergy = clamp(0.35*affinity + 0.45*mission_trust + 0.20*rivalry - 0.50*resentment, 0, 100)`
- `pair_tension = clamp(0.55*resentment + 0.35*rivalry - 0.20*affinity, 0, 100)`
- `client_confidence = clamp(0.65*mission_trust + 0.25*affinity - 0.40*resentment, 0, 100)`

- 関係タグ（表示用）:
- `相棒候補`: `affinity>=72 && mission_trust>=68 && resentment<=35`
- `健全ライバル`: `rivalry>=65 && resentment<55`
- `険悪ライバル`: `rivalry>=70 && resentment>=60`
- `不信`: `mission_trust<=35 || resentment>=70`

- パーティ提案への反映（冒険者最終判断を維持）:
- 冒険者Aが候補メンバーBをどう見るか:
- `mate_score(A->B) = clamp(0.50*mission_trust + 0.25*affinity + 0.15*rivalry - 0.35*resentment, 0, 100)`
- 候補パーティ全体:
- `team_synergy = mean(pair_synergy(A<->B))`
- `team_tension = max(pair_tension(A<->B))`
- 出発判定の補正（受諾後の `D_day` へ加算）:
- `team_bonus = clamp(0.20*(team_synergy-50) - 0.18*max(0, team_tension-55), -10, +10)`
- `D_day = D_day + team_bonus`

- ミッション結果後の関係更新（同パーティのペア）:
- `成功`: `affinity +4`, `mission_trust +6`, `rivalry +1`, `resentment -3`
- `部分成功`: `affinity +2`, `mission_trust +2`, `rivalry +1`, `resentment -1`
- `失敗`: `affinity -3`, `mission_trust -6`, `rivalry +2`, `resentment +4`
- `惨敗`: `affinity -6`, `mission_trust -10`, `rivalry +3`, `resentment +8`
- すべて `0-100` にクランプ

- イベント補正（シーン由来）:
- クリティカル支援がログ上で確認されたペア: `mission_trust +6`, `affinity +3`
- ファンブル起点で被害拡大が示唆されたペア: `mission_trust -4`, `resentment +6`
- 情報伏せ露見で因果あり時（冒険者->依頼主）: `mission_trust -8`, `resentment +10`

#### 冒険者性格（BIG5ランダムプロファイル）

- 冒険者はテンプレ型を持たず、BIG5をランダム割当して生成する
- BIG5軸（各 `0-100`）:
- `開放性 O`
- `誠実性 C`
- `外向性 E`
- `協調性 A`
- `神経症傾向 N`
- 生成時は `50` を中心に分布させ、個体差としてばらつかせる
- 生成時の値は `big5_base` として保持する
- 個性補正:
- 受諾/保留/辞退の閾値を `±10` で個別補正
- 面談打ち切り閾値を `±20` で個別補正
- 判定に使う実効値は `big5_effective = clamp(big5_base + big5_drift, 0, 100)` とする
- `big5_drift` は経験蓄積による長期変化で、各軸 `-12〜+12` に制限する
- BIG5は判定ロジック用の骨格とし、短期変化は原則 `experience_state` 側で吸収する
- これとは別に、会話・描写の一貫性用として `キャラ調査書` を持つ
- `キャラ調査書` は数値判定に直接使わず、文面生成・関係ログ・プロフィール表示に使う

#### 人物年表と経験反映（v0.9 / 確定）

- 目的:
- 推し冒険者の履歴を「ただの結果一覧」でなく、連続した人物史として読めるようにする
- 失敗・負傷・成功・対人トラブルを、次回判断や口調の変化へつなげる
- 性格を毎回ぶらさず、`芯の性格` と `経験で変わる判断癖` を分離する

- 人物状態の3層:
- `core_identity`: `big5_base` と `private_dossier`。人物の芯であり、急変させない
- `experience_state`: 経験で変化する学習値。受諾判断・面談反応・最近の悩みに反映する
- `career_eval`: 周囲から見た実務評価。依頼の来やすさ、会話での扱われ方に反映する

- `character_journal` の記録単位:
- 影響のある出来事ごとに1件保存する
- 1件は `事実 / 感情 / 学習 / 状態変化` を持つ
- 「面談の全発言」を残すのではなく、人物の転機になる要約だけを残す
- 想定イベント種別:
- `MISSION_RESULT`
- `INJURY_OR_LEAVE`
- `INTERVIEW_SUMMARY`
- `CLIENT_FEEDBACK`
- `RELATION_SHIFT`
- `GUILD_CARE`

- `delta_event` テーブル（v0.9.1 / 確定）:
- `character_journal.event_kind` ごとに、まずベース差分を引き、その後条件修正を加える
- `experience_state` の通常軸は `memory_next = clamp(50 + 0.88*(prev-50) + delta_event, 0, 100)` で更新
- `category_confidence[category]` は `category_next = clamp(50 + 0.82*(prev-50) + delta_event, 0, 100)` で更新
- `trait_pressure` は `pressure_next = clamp(0.94*prev + trait_vector_event*(0.6 + importance/100), -100, 100)` で更新
- `career_eval` は当面、`prev + delta_event` の加算更新とする

| event_kind | ベース分類 | importance | experience_state delta_event | career_eval delta_event | trait_vector_event | 備考 |
| --- | --- | ---: | --- | --- | --- | --- |
| `MISSION_RESULT` | `成功` | 64 | `self_efficacy +8`, `glory_drive +2`, `injury_caution -2`, `category_confidence +8` | `reliability +6`, `growth +4` | `E +8`, `C +4`, `N -5` | 役割一致 `+2` / 不一致 `-2` |
| `MISSION_RESULT` | `部分成功` | 56 | `self_efficacy +3`, `glory_drive +1`, `category_confidence +3` | `reliability +2`, `growth +2` | `C +2`, `E +1`, `N -1` | 役割一致 `+2` / 不一致 `-2` |
| `MISSION_RESULT` | `失敗` | 74 | `self_efficacy -6`, `injury_caution +6`, `principle_rigidity +2`, `category_confidence -6` | `reliability -5`, `growth +1` | `C +2`, `N +5` | 役割一致 `+2` / 不一致 `-2` |
| `MISSION_RESULT` | `惨敗` | 88 | `self_efficacy -12`, `injury_caution +12`, `glory_drive -4`, `principle_rigidity +4`, `category_confidence -12` | `reliability -10`, `safety -8`, `growth -2` | `O -6`, `E -5`, `N +12` | 役割一致 `+2` / 不一致 `-2` |
| `INJURY_OR_LEAVE` | `minor` | 60 | `injury_caution +10`, `self_efficacy -4`, `glory_drive -1` | `safety -2` | `N +4` | 軽傷 |
| `INJURY_OR_LEAVE` | `major` | 76 | `injury_caution +18`, `self_efficacy -8`, `glory_drive -4` | `safety -6`, `growth -1` | `E -2`, `N +8` | 重傷 |
| `INJURY_OR_LEAVE` | `long_leave` | 90 | `injury_caution +22`, `self_efficacy -12`, `glory_drive -6`, `principle_rigidity +2` | `safety -10`, `growth -2` | `O -6`, `E -5`, `N +12` | 長期離脱 |
| `INTERVIEW_SUMMARY` | `accept` | 34 | `guild_bond +4`, `self_efficacy +2` | なし | `A +1`, `C +1` | 面談結果のベース |
| `INTERVIEW_SUMMARY` | `hold` | 28 | `principle_rigidity +1` | なし | なし | 面談結果のベース |
| `INTERVIEW_SUMMARY` | `decline` | 38 | `guild_bond -2`, `principle_rigidity +2`, `self_efficacy -1` | なし | `A -1`, `N +1` | 面談結果のベース |
| `INTERVIEW_SUMMARY` | `cutoff` | 48 | `guild_bond -5`, `principle_rigidity +4`, `self_efficacy -2` | なし | `A -3`, `N +3` | 「もういい」で終了 |
| `CLIENT_FEEDBACK` | `praise` | 42 | `self_efficacy +4` | `reliability +4`, `growth +2` | なし | 高可視性なら `flashiness +6` |
| `CLIENT_FEEDBACK` | `neutral` | 24 | なし | なし | なし | 現状維持寄り |
| `CLIENT_FEEDBACK` | `complaint` | 46 | `self_efficacy -3` | `reliability -4` | なし | 不当苦情なら `reliability -2` 相当まで緩和 |
| `CLIENT_FEEDBACK` | `reoffer` | 52 | `self_efficacy +3` | `reliability +5`, `growth +2` | なし | 高可視性なら `flashiness +6` |
| `RELATION_SHIFT` | `partner_gain` | 50 | `guild_bond +2`, `self_efficacy +3` | なし | `A +4`, `E +2`, `N -2` | 強度 `small/medium/large = 0.7/1.0/1.3倍` |
| `RELATION_SHIFT` | `healthy_rivalry` | 44 | `glory_drive +4`, `self_efficacy +2` | なし | `E +2`, `C +1` | 同上 |
| `RELATION_SHIFT` | `distrust` | 58 | `guild_bond -1`, `self_efficacy -2`, `principle_rigidity +4` | なし | `A -3`, `N +4` | 同上 |
| `RELATION_SHIFT` | `resentment` | 54 | `injury_caution +2`, `self_efficacy -2`, `principle_rigidity +2` | なし | `A -2`, `N +3` | 同上 |
| `GUILD_CARE` | `small` | 34 | `guild_bond +4`, `self_efficacy +2`, `injury_caution -1` | なし | `A +1`, `N -1` | 見舞い・一言 |
| `GUILD_CARE` | `medium` | 46 | `guild_bond +7`, `self_efficacy +4`, `injury_caution -3` | なし | `A +2`, `N -2` | 丁寧な見舞い・再説明 |
| `GUILD_CARE` | `large` | 58 | `guild_bond +10`, `self_efficacy +6`, `injury_caution -4` | なし | `A +3`, `N -3` | 復帰方針提示まで含む |

- 条件修正（確定）:
- `MISSION_RESULT` で `long_leave=true`: `category_confidence -8`, `injury_caution +8`, `self_efficacy -6`, `career_eval.safety -4`, `trait_vector N +6, E -2`, `importance +10`
- `MISSION_RESULT` で `public_visibility >= 70`:
- `成功`: `glory_drive +4`, `career_eval.flashiness +8`, `importance +4`
- `部分成功`: `glory_drive +2`, `career_eval.flashiness +4`, `importance +2`
- `MISSION_RESULT` で `information_betrayal=true`: `principle_rigidity +8`, `injury_caution +4`, `trait_vector A -8, C +5, N +9`, `importance +8`
- `MISSION_RESULT` で `contract_violation_complicity=true`: `career_eval.ethics -8`, `importance +6`
- `INJURY_OR_LEAVE` で仲間の支援が明確: `guild_bond +1`, `trait_vector A +6, E +3, N -4`, `importance +4`
- `INTERVIEW_SUMMARY` の説明品質:
- `good`: `guild_bond +3`
- `mixed`: 追加なし
- `poor`: `guild_bond -3`, `principle_rigidity +2`, `self_efficacy -1`
- `INTERVIEW_SUMMARY` の圧力:
- `supportive`: `guild_bond +2`, `self_efficacy +1`
- `neutral`: 追加なし
- `pushy`: `guild_bond -4`, `principle_rigidity +3`, `self_efficacy -1`, `trait_vector A -2, N +2`, `importance +4`
- `INTERVIEW_SUMMARY` の透明性:
- `honest`: `guild_bond +2`
- `evasive`: `principle_rigidity +2`, `trait_vector N +2`, `importance +2`
- `hidden`: `guild_bond -5`, `principle_rigidity +5`, `trait_vector A -3, N +4`, `importance +10`
- `CLIENT_FEEDBACK` の `fairness=unfair`: `principle_rigidity +4`, `trait_vector A -1, N +3`, `importance +6`
- `GUILD_CARE` の `care_type=fair_reassignment`: `guild_bond +2`
- `GUILD_CARE` の `care_type=wait`: `self_efficacy +1`

- `experience_state` の内部軸（各 `0-100`, 初期 `50`）:
- `category_confidence[6]`: 依頼カテゴリごとの手応え。成功体験/苦手意識を蓄積する
- `injury_caution`: 負傷や惨敗由来の慎重さ。高いほど危険案件に及び腰になる
- `glory_drive`: 見せ場/名誉への引力。高いほど派手さや注目度を好む
- `guild_bond`: ギルドへの帰属感と信頼。見舞い・納得感ある面談・公正配分で上がる
- `self_efficacy`: 「自分ならやれる」という自己効力感。成功や称賛で上がり、惨敗で下がる
- `principle_rigidity`: 倫理観の硬さ。裏切りや情報伏せの露見で上がりやすい

- 中期学習値の更新式（共通）:
- `memory_next = clamp(50 + 0.88*(memory_prev - 50) + delta_event, 0, 100)`
- 中心 `50` へゆっくり戻るが、連続体験で偏りが定着する
- カテゴリ別経験値は依頼カテゴリごとに独立保持する
- `category_confidence_next = clamp(50 + 0.82*(category_confidence_prev - 50) + result_delta + role_match_bonus, 0, 100)`
- `result_delta`: `成功 +8 / 部分成功 +3 / 失敗 -6 / 惨敗 -12`
- `role_match_bonus`: 本人の得意領域と一致 `+2`、不一致 `-2`
- 長期離脱が発生した場合、そのカテゴリへ追加で `-8`

- BIG5長期ドリフト:
- 内部で `trait_pressure[O/C/E/A/N]` を `-100〜+100` で保持する
- 更新式: `pressure_next = clamp(0.94*pressure_prev + trait_vector_event * impact_scale, -100, 100)`
- `impact_scale = 0.6 + importance/100`
- 実効反映: `big5_drift = clamp(round(0.12 * pressure), -12, +12)`
- 高頻度の小イベントではなく、中〜高重要度イベントの累積で少しずつ変わる

- 代表的な `trait_vector_event`:
- 大成功し称賛された: `E +8, C +4, N -5`
- 慎重な準備で危機回避した: `C +7, N -3`
- 情報伏せ露見で被害を受けた: `A -8, C +5, N +9`
- 惨敗して長期離脱した: `O -6, E -5, N +12`
- 仲間に救われた/支えられた: `A +6, E +3, N -4`

- `career_eval` の内部軸（各 `0-100`, 初期 `50`）:
- `reliability`: 任せた仕事を無難に通す期待
- `safety`: 生還率・無茶の少なさ
- `flashiness`: 派手さ、話題性、見栄え
- `ethics`: 誠実さ、約束を守る印象
- `growth`: 今後伸びそうか、経験を糧にしているか
- UIでは原則非数値。`堅実`, `危なっかしい`, `華がある`, `筋を通す`, `伸び盛り` のようなラベルで出す

- `career_eval` 更新の基準:
- `成功`: `reliability +6`, `growth +4`
- `部分成功`: `reliability +2`, `growth +2`
- `失敗`: `reliability -5`, `growth +1`
- `惨敗`: `reliability -10`, `safety -8`, `growth -2`
- 長期離脱から復帰した初回成功: `growth +6`, `safety +2`
- 派手な功績や公的注目が高い案件成功時: `flashiness +8`
- 情報伏せ露見や契約違反に加担した場合: `ethics -8`
- すべて `0-100` にクランプ

- 受諾判断への反映:
- BIG5由来の `o/c/e/a/n` は `big5_effective` から算出する
- `危険適合度` は `danger_tolerance = clamp(50 + 0.35*(glory_drive-50) - 0.55*(injury_caution-50) + 0.25*(self_efficacy-50), 0, 100)` を基準値として使う
- `ギルドへの信頼` は `guild_trust_signal = clamp(trust_guild_base + 0.60*(guild_bond-50), 0, 100)` を使う
- `過去実績との適合` は `record_fit = clamp(0.45*category_confidence[request_category] + 0.25*self_efficacy + 0.20*career_eval.reliability + 0.10*career_eval.safety, 0, 100)` とする
- `名誉見通し適合度` は既存の `honor_outlook` に加え、`flashiness` が高い人物ほど高可視性案件を前向きに受け取りやすい

- 更新タイミング:
- 面談終了時: `INTERVIEW_SUMMARY` を追加し、`guild_bond` と `principle_rigidity` を更新しうる
- 日報確定時: `MISSION_RESULT` を追加し、カテゴリ経験・自己効力感・実務評価を更新する
- 負傷/長期離脱確定時: `INJURY_OR_LEAVE` を追加し、`injury_caution` と `trait_pressure[N]` を強く更新する
- 関係値の大きな変化時: `RELATION_SHIFT` を追加し、相棒化/不信/遺恨を人物史に残す
- 見舞い・励ましなど回復支援時: `GUILD_CARE` を追加し、`guild_bond` と `volatile_hook` を更新する

- `volatile_hook` の更新原則:
- 直近30日の `character_journal` から、未消化の感情が最も強いものを優先する
- 例: `依頼主不信`, `復帰後の焦り`, `相棒への恩`, `名を上げたい焦燥`

#### 冒険者の受諾/保留/辞退判定

- 計算では `o=(O_effective-50)/50, c=(C_effective-50)/50, e=(E_effective-50)/50, a=(A_effective-50)/50, n=(N_effective-50)/50` を使う（各 `-1.0〜+1.0`）
- 各冒険者はBIG5から評価要素重みを導出し、最終的に合計100へ正規化する
- 評価要素（MVP）:
- `報酬魅力度`
- `危険適合度`（本人の危険嗜好と申告危険度の一致度）
- `依頼主への信頼`
- `依頼内容の明確さ`
- `本人の疲労/気分`
- `ギルドへの信頼`
- `倫理観との一致`
- `過去実績との適合`
- `任務スタイル適合度`（地味/派手嗜好の一致度）
- `名誉見通し適合度`（名誉期待と不名誉リスクの適合度）
- 追加要素値の算出（MVP初期式）:
- `style_pref = clamp(50 + 20o + 15e - 10c, 0, 100)`
- `style_signal = clamp(request_style_level_disclosed + hearing_delta_style, 0, 100)`
- `style_fit = clamp(100 - abs(style_pref - style_signal), 0, 100)`
- `honor_pref = clamp(50 + 20e + 20a + 10c + 10n, 0, 100)`
- `expected_honor_signal = clamp(expected_honor_disclosed + hearing_delta_honor, 0, 100)`
- `dishonor_signal = clamp(dishonor_risk_disclosed + hearing_delta_dishonor, 0, 100)`
- `visibility_signal = clamp(public_visibility_disclosed + hearing_delta_visibility, 0, 100)`
- `mission_honor_profile = clamp(50 + 0.7*expected_honor_signal - 0.9*dishonor_signal + 0.3*visibility_signal, 0, 100)`
- `honor_outlook = clamp(100 - abs(honor_pref - mission_honor_profile), 0, 100)`
- 依頼メタ4値の生成（確定）:
- `request_style_level`, `expected_honor`, `dishonor_risk`, `public_visibility` は依頼カテゴリ基準値 + 案件揺らぎで生成する
- `value = clamp(category_base + rand(-jitter, +jitter), 0, 100)`
- MVP初期値はカテゴリ別テーブルで管理し、後でバランス調整可能にする
- MVP依頼カテゴリ（固定）:
- `討伐`
- `護衛`
- `調査`
- `採取`
- `運搬`
- `交渉（仲裁/説得）`
- カテゴリ基準テーブル（実値ベース・MVP初期）:

| 依頼カテゴリ | request_style_level | expected_honor | dishonor_risk | public_visibility | jitter |
| --- | ---: | ---: | ---: | ---: | ---: |
| 討伐 | 75 | 68 | 46 | 72 | 12 |
| 護衛 | 50 | 56 | 34 | 60 | 10 |
| 調査 | 40 | 44 | 30 | 32 | 12 |
| 採取 | 30 | 36 | 18 | 22 | 10 |
| 運搬 | 25 | 34 | 26 | 38 | 10 |
| 交渉（仲裁/説得） | 55 | 66 | 52 | 76 | 14 |

- 実値生成式（確定）:
- `actual_value = clamp(base_value + rand(-jitter, +jitter), 0, 100)`
- 同一依頼内では4値を固定し、日次で再抽選しない
- 受諾判定は `actual_value` ではなく `disclosed_value + hearing_delta` の観測値で行う
- 生重み（MVP初期係数）:
- `w_reward_raw = 1.00 + 0.35e - 0.20a - 0.15c`
- `w_riskfit_raw = 1.00 + 0.40o + 0.30e - 0.45n`
- `w_client_raw = 1.00 + 0.45a + 0.20c - 0.25n`
- `w_clarity_raw = 1.00 + 0.55c - 0.25o + 0.15n`
- `w_condition_raw = 1.00 + 0.60n - 0.20c`
- `w_guild_raw = 1.00 + 0.35a + 0.25c - 0.20n`
- `w_ethics_raw = 1.00 + 0.55a + 0.20c - 0.15e`
- `w_record_raw = 1.00 + 0.50c - 0.20o + 0.15n`
- `w_style_raw = 1.00 + 0.35o + 0.30e - 0.25c - 0.20a`
- `w_honor_raw = 1.00 + 0.30e + 0.30a + 0.20c + 0.15n`
- 各生重みは `0.20〜3.00` にクランプ後、合計100に正規化
- 基本スコア:
- `S_base = Σ(重み_i × 要素値_i) / 100`
- `S` は `S_base` に説得補正を加算して求める
- 説得補正（MVP初期係数）:
- 性格ベース補正:
- `base_delta(おだてる) = clamp(2 + 3e - 2c - 1n, -8, +8)`
- `base_delta(応援する) = clamp(2 + 2a + 1c - 2n, -6, +8)`
- `base_delta(たきつける) = clamp(1 + 3o + 2e - 3c - 2a, -10, +10)`
- 不満要因重み（行動 × blocking_factor 係数）:

| blocking_factor | おだてる | 応援する | たきつける |
| --- | ---: | ---: | ---: |
| `risk_fit` | `-1.0` | `+2.0` | `-2.0` |
| `clarity` | `-0.5` | `+1.2` | `-1.2` |
| `client_trust` | `-1.2` | `+1.8` | `-1.5` |
| `reward_balance` | `+1.4` | `+0.6` | `+1.0` |
| `fatigue` | `-0.8` | `+2.2` | `-2.4` |
| `ethics` | `-1.0` | `+1.0` | `-2.2` |
| `style_fit` | `+0.8` | `+0.4` | `+2.3` |
| `honor_outlook` | `+2.0` | `+0.8` | `+1.8` |

- 追い風要因重み（行動 × positive_factor 係数）:

| positive_factor | おだてる | 応援する | たきつける |
| --- | ---: | ---: | ---: |
| `reward` | `+1.2` | `+0.4` | `+0.8` |
| `guild_trust` | `+0.6` | `+1.0` | `+0.2` |
| `record_fit` | `+0.3` | `+0.8` | `+0.4` |
| `style_fit` | `+0.5` | `+0.2` | `+1.0` |
| `honor_outlook` | `+0.9` | `+0.3` | `+0.8` |

- 説得補正式（1往復基礎式）:
- `sev_block = clamp((-gap) / 20, 0, 1.5)`（`gap` は負値ほど不満が強い）
- `sev_pos = clamp(gap / 20, 0, 1.0)`（`gap` は正値ほど追い風が強い）
- `factor_delta = Σ_top2( coef_block[action,f] * sev_block[f] ) + Σ_top1( coef_pos[action,p] * sev_pos[p] )`
- `repeat_penalty = 0 / -2 / -5`（同一行動の連続回数 `1 / 2 / 3回以上`）
- `resistance_penalty = -round(persuasion_resistance / 18)`（`0〜-5`）
- `timing_penalty = -2`（`interview_load >= 0.8*T_stop` のとき、それ以外は `0`）
- `persuasion_delta_turn = clamp(base_delta(action) + factor_delta + repeat_penalty + resistance_penalty + timing_penalty, -12, +12)`
- 1面談で説得行動を複数回行った場合:
- `persuasion_window`（最新2件）に毎往復1件積む（説得でない往復は `0` を積む）
- `persuasion_effective = clamp(latest + 0.6*prev, -12, +12)`
- `S = clamp(S_base + persuasion_effective, 0, 100)`
- 出発する/しないの最終決定は冒険者側が行う（受諾後の見送りあり）
- 受諾後の出発判定（MVP）:
- `D = S - 0.6 × 当日疲労増分 + 気分変動`
- `気分変動` は `-8〜+8`
- `D >= 65` で出発、未満は見送り

#### 受諾/保留/辞退の閾値判定（最終式 v0.6 / 確定）

- 入力:
- `S_final`（最新面談往復で再計算済み）
- `theta_accept`（個体補正 `-10〜+10`）
- `interview_load`, `T_stop`
- `persuasion_resistance`, `persuasion_locked`
- `clarity_now - clarity_base`
- `guild_trust_now - guild_trust_base`
- `prev_decision`（直前往復の判定。初回は `null`）

- 補助量:
- `load_ratio = clamp(interview_load / T_stop, 0, 1.2)`
- `load_penalty_accept = (load_ratio >= 0.8 ? 4 : load_ratio >= 0.6 ? 2 : 0)`
- `load_penalty_hold = (load_ratio >= 0.8 ? 2 : load_ratio >= 0.6 ? 1 : 0)`
- `resist_penalty_accept = floor(persuasion_resistance / 25)`（`0〜4`）
- `resist_penalty_hold = floor(persuasion_resistance / 40)`（`0〜2`）
- `lock_penalty_accept = persuasion_locked ? 3 : 0`
- `lock_penalty_hold = persuasion_locked ? 1 : 0`
- `info_relief = clamp((clarity_now - clarity_base) / 15, -3, +3)`
- `trust_relief = clamp((guild_trust_now - guild_trust_base) / 20, -2, +2)`

- 閾値計算:
- `threshold_accept_raw = 70 + theta_accept + load_penalty_accept + resist_penalty_accept + lock_penalty_accept - info_relief - trust_relief`
- `threshold_hold_raw = 40 + theta_accept + load_penalty_hold + resist_penalty_hold + lock_penalty_hold - 0.5*info_relief - 0.5*trust_relief`
- `threshold_accept = clamp(round(threshold_accept_raw), 52, 92)`
- `threshold_hold = clamp(round(threshold_hold_raw), 25, 78)`
- ガード:
- `threshold_hold = min(threshold_hold, threshold_accept - 12)`

- 生判定:
- `S_final >= threshold_accept`: 受諾
- `threshold_hold <= S_final < threshold_accept`: 保留
- `S_final < threshold_hold`: 辞退

- 境界ヒステリシス（判定ブレ防止）:
- `h = 2`
- `prev_decision = 受諾` かつ `S_final >= threshold_accept - h` なら `受諾` を維持
- `prev_decision = 辞退` かつ `S_final < threshold_hold + h` なら `辞退` を維持
- それ以外は生判定を採用
- `保留` は固定維持せず、その時点の生判定を優先

- 出力（毎往復更新）:
- `decision_result`（受諾/保留/辞退）
- `threshold_accept`, `threshold_hold`
- `decision_margin = S_final - threshold_accept`
- `persuasion_headroom = max(0, threshold_accept - S_final)`

#### 出発予約と次の日キュー（v0.7 / 確定）

- 案件-冒険者ペアの内部状態（`assignment_state`）:
- `INTERVIEWING`（面談中）
- `HOLD`（保留継続）
- `DECLINED`（辞退確定）
- `ACCEPT_PENDING`（受諾済み・出発待ち）
- `IN_MISSION`（出発中）
- `RETURNED_UNREAD`（帰還済み・日報未読）
- `CLOSED`（終了）

- キュー（件数上限なし）:
- `departure_queue`: 出発判定待ち（`assignment_id, due_day, pending_days, retry_count`）
- `mission_queue`: 出発済み案件（概念キュー。保存実体は `mission_runs(state=RUNNING)`）
- `report_queue`: 未読日報（概念キュー。保存実体は `reports(unread=true)`）

- 面談結果の反映:
- `decision_result=受諾` かつ `D>=65`:
- `assignment_state = ACCEPT_PENDING`
- `departure_queue` に `due_day=current_day` で投入
- `decision_result=受諾` かつ `D<65`（本人見送り）:
- `assignment_state = ACCEPT_PENDING`
- `departure_queue` に `due_day=current_day+1` で投入
- `decision_result=保留`: `assignment_state = HOLD`
- `decision_result=辞退`: `assignment_state = DECLINED`（即 `CLOSED` 可）

- `次の日` 押下時の処理順（固定）:
- 1. 未読日報要約がある場合は進行ブロック（確認必須）
- 2. `day += 1`
- 3. 依頼終了条件を先に評価（期限切れ/他ギルド達成/依頼主都合）
- 4. `departure_queue` の `due_day <= day` を処理
- 5. 出発成立分を `mission_queue` に登録
- 6. `mission_queue` の `return_due_day <= day` を `report_queue` へ移動
- 7. 新規依頼流入
- 8. 日次応募発生

- 出発待ち再判定（`departure_queue`）:
- `D_day = clamp(S_final + mood_daily_noise - 0.6*fatigue_today - 0.15*pending_days + rand(-6,+6), 0, 100)`
- `D_day >= 65` で出発確定
- 未満なら `pending_days += 1`, `retry_count += 1`, `due_day = day+1`
- `pending_days >= 7` で自動 `HOLD` へ戻す（理由: 自主見送り継続）
- 冒険者が `離脱中/退団/別任務中` なら当該エントリは `CLOSED`（不成立終了）

- 出発確定時:
- ミッションは出発時に1回だけ内部実行（`runMission`）し `result_snapshot` を保存
- `return_due_day = depart_day + duration_days`
- `duration_days = 0` は同日帰還扱い
- 同一 `次の日` 処理内で `return_due_day <= day` なら即 `report_queue` へ積む

- `HOLD` 継続と解消:
- `HOLD` はプレイヤー再提案まで維持
- ただし依頼終了条件成立時は自動 `CLOSED`
- `HOLD` は `departure_queue` に載せない（自動再出発判定しない）

#### 面談1往復の内部更新（v0.4 / 確定）

- 1往復の定義:
- プレイヤー1操作（`質問 / 追加ヒアリング / 提案 / 説得`）に対して、冒険者が1回返答する単位
- 返答直後に内部値を更新し、次の操作へ進む

- 面談セッション状態（開始時）:
- `interview_turn = 0`
- `interview_load = 0`（`0〜120`）
- `same_action_streak = 0`
- `same_topic_streak = 0`
- `persuasion_window = []`（最新2件の `persuasion_delta_turn`）
- `persuasion_resistance = 0`（`0〜100`）
- `persuasion_try_count = 0`
- `ineffective_streak = 0`
- `persuasion_locked = false`
- `hearing_delta_* = 0`（`difficulty / hazard / reward / style / honor / dishonor / visibility`）
- `hearing_count_* = 0`
- `last_hearing_signal_* = null`
- `mood_shift_talk = 0`（`-20〜+20`）
- `trust_shift_talk = 0`（`-20〜+20`）
- `fatigue_delta_talk = 0`（`0〜20`）
- `stop_flag = false`

- 1往復の更新順序（固定）:
- `interview_turn += 1`
- ヒアリング対象がある場合は `hearing_delta_*` を先に更新
- `load_delta` を算出し `interview_load` を更新
- 説得行動なら `persuasion_delta_turn` と `persuasion_resistance` を更新して `persuasion_window` へ積む
- `mood_shift_talk / trust_shift_talk / fatigue_delta_talk` を更新
- 要素値を再計算し `S_base`, `S_final`, `decision_result` を更新
- `interview_load >= T_stop` なら `stop_flag = true`（「もういい」終了）

- ヒアリング更新式（対象項目ごと）:
- `signal_before = clamp(disclosed_value + hearing_delta, 0, 100)`
- `gap_now = actual_value - signal_before`
- `response_quality = clamp(1 - interview_load/140 - 0.06*hearing_count, 0.35, 1.00)`
- `delta = round(gap_now * r_client * response_quality + rand(-2, +2))`
- `hearing_delta = clamp(hearing_delta + delta, -25, +25)`
- `hearing_count += 1`
- `signal_after = clamp(disclosed_value + hearing_delta, 0, 100)`
- `unknown` 項目の開示確率:
- `p_reveal = clamp(0.75*response_quality - 0.10*(hearing_count-1), 0.20, 0.80)`
- `rand(0,1) <= p_reveal` で `known` 化

- 面談負荷（1往復）:
- `base_load`: `質問=6 / 追加ヒアリング=12 / 提案=5 / 説得=8`
- `repeat_topic_penalty = 10`（同一topic連続時）
- `repeat_action_penalty = min(8, 4*(same_action_streak-1))`（同一行動2連続目以降）
- `ambiguous_penalty = 8`（ヒアリング後に `|signal_after - signal_before| <= 2`）
- `contradiction_penalty = 15`（同一項目で `|signal_after - last_hearing_signal| >= 12`）
- `load_delta = base_load + repeat_topic_penalty + repeat_action_penalty + ambiguous_penalty + contradiction_penalty`
- `interview_load = clamp(interview_load + load_delta, 0, 120)`

- 説得反映（1往復）:
- `persuasion_delta_turn` は前節の基礎式で算出する
- `persuasion_window` は最新2件のみ保持（`[latest, prev]`、非説得往復は `0` をpush）
- 面談時点の説得寄与は `persuasion_effective = clamp(latest + 0.6*prev, -12, +12)` を使用

- 感情・関係・疲労の更新:
- `info_gain_avg = mean(abs(delta_f))`（ヒアリングなしなら `0`）
- `mood_delta_turn = clamp(0.30*persuasion_delta_turn + 0.05*info_gain_avg - 0.18*load_delta + rand(-1,+1), -5, +5)`
- `trust_delta_turn = clamp(0.24*persuasion_delta_turn + 0.06*info_gain_avg - 0.12*load_delta, -4, +4)`
- `fatigue_delta_turn = clamp(ceil(load_delta / 8), 0, 4)`
- `mood_shift_talk = clamp(mood_shift_talk + mood_delta_turn, -20, +20)`
- `trust_shift_talk = clamp(trust_shift_talk + trust_delta_turn, -20, +20)`
- `fatigue_delta_talk = clamp(fatigue_delta_talk + fatigue_delta_turn, 0, 20)`

- 要素値再計算への反映:
- `本人の疲労/気分` は `condition_now = clamp(condition_base - fatigue_delta_talk + mood_shift_talk, 0, 100)` を使用
- `ギルドへの信頼` は `guild_trust_now = clamp(guild_trust_base + trust_shift_talk, 0, 100)` を使用
- `依頼内容の明確さ` や `危険適合度` は更新済み `signal_after` で再計算
- `S_base_now = Σ(重み_i × 要素値_i_now) / 100`
- `S_final = clamp(S_base_now + persuasion_effective, 0, 100)`
- 判定は既定閾値（受諾/保留/辞退）をそのまま適用

- AI向け診断値（毎往復更新）:
- `decision_score = S_final`
- `decision_margin = S_final - threshold_accept`
- `persuasion_headroom = max(0, threshold_accept - S_final)`
- `blocking_factors`: `gap_i = value_i_now - 50` の下位2件（`gap_i < -8`）
- `positive_factors`: `gap_i` の上位1件（`gap_i > +8`）
- `persuasion_state`: `resistance / ineffective_streak / locked`

#### 説得行動の累積・減衰・打ち切り（v0.5 / 確定）

- 累積:
- 説得行動を実行した往復では `persuasion_delta_turn` を `persuasion_window` へpush
- `persuasion_effective = latest + 0.6*prev` で累積（上限 `-12〜+12`）
- 同一行動の連打は `repeat_penalty` と `resistance_penalty` が重なって効きにくくなる

- 減衰:
- 説得以外（質問/ヒアリング/提案）の往復では `persuasion_window` に `0` をpush
- これにより前回説得効果は次往復で `60%`、2往復後に `0` まで自然減衰する
- 非説得往復では `persuasion_resistance = clamp(persuasion_resistance - 8, 0, 100)` として反発も緩和する

- 反発（resistance）更新:
- 説得往復ごとに `persuasion_try_count += 1`
- `decision_margin_prev` は当該往復の更新前値（初回は `decision_margin_now` と同値扱い）
- `decision_margin_now` は `S_final` 更新後の値
- `margin_gain = decision_margin_now - decision_margin_prev`
- `ineffective = (persuasion_delta_turn <= 1) && (margin_gain <= 2)`
- `ineffective` なら `ineffective_streak += 1`、それ以外は `0`
- `resistance_gain = 8 + (same_action_streak>=3 ? 6 : 0) + (info_gain_avg<3 ? 4 : 0)`
- `persuasion_resistance = clamp(persuasion_resistance + resistance_gain - (info_gain_avg>=8 ? 5 : 0), 0, 100)`

- 説得打ち切り（説得のみ禁止）:
- 次の条件をすべて満たすと `persuasion_locked = true`
- `persuasion_try_count >= 3`
- `ineffective_streak >= 2`
- `persuasion_resistance >= 60`
- `persuasion_locked = true` の間、説得行動は受け付けるが効果 `0`（`persuasion_delta_turn=0`）
- ロック中に説得を続けると `load_delta += 6`, `mood_delta_turn -= 2`, `trust_delta_turn -= 1`

- 面談打ち切り（会話終了）との関係:
- 説得打ち切りは「説得だけ不可」で、質問/ヒアリング/提案は継続可能
- 面談全体の終了は従来どおり `interview_load >= T_stop` で判定する

#### 「もういい」打ち切り判定

- 面談中に `面談負荷` を内部加算する
- `面談負荷` の1往復計算は前節 `面談1往復の内部更新（v0.4）` の `load_delta` を正本とする
- 直感対応（再掲）:
- `質問=6 / 追加ヒアリング=12 / 提案=5 / 説得=8`
- 同系反復 `+10`、曖昧 `+8`、矛盾 `+15`、同一行動連打ペナルティあり
- 打ち切り閾値:
- `T_stop = clamp(70 + 8c + 6a - 10n + bias_stop, 35, 95)`
- `bias_stop` は個体補正（`-20〜+20`）
- `面談負荷 >= T_stop` で「もういい」で終了
- 追加ヒアリングの心証悪化も同じ負荷モデルで発生する

#### 情報伏せ露見と悪印象

- 露見判定は帰還報告や第三者情報で申告との差分が確認された時に発生
- 悪印象の強化条件: `露見` かつ `失敗に因果あり`
- 事前同意があった場合は悪印象を1段階緩和
- 因果スコア（0-100）:
- `K = 0.5 × 情報伏せ度 + 0.3 × 失敗関連度 + 0.2 × 警告無視度`
- 強度判定:
- `0-34`: 小
- `35-69`: 中
- `70-100`: 大
- 悪印象強度（内部）:
- 小: `冒険者側評判 -5`
- 中: `冒険者側評判 -12`
- 大: `冒険者側評判 -20`
- BIG5傾向:
- `A` と `C` が高いほど悪印象が強くなりやすい
- `N` が高いほど感情的反応が増幅しやすい
- `E` が高く報酬満足が高い場合は軽減されやすい
- 最終悪印象量:
- `P = round(P_base × m × q)`
- `m = clamp(1 + 0.25a + 0.20c + 0.15n - 0.10e, 0.70, 1.40)`
- `q = 0.70`（事前同意あり） / `1.00`（同意なし）
- 評判軸への配分: `安全配慮 50% / 公正配分 30% / 成長機会 20%`

#### 結果4分類（固定マトリクス）

- 判定軸は `目的達成度(0-100)` と `被害度(0-100)` を使用
- `成功`: 達成度 >= 80 かつ 被害度 < 40
- `部分成功`: 達成度 >= 50 かつ 被害度 < 70（成功/惨敗条件に該当しない）
- `失敗`: 達成度 < 50 かつ 被害度 < 70
- `惨敗`: 被害度 >= 70 または（達成度 < 30 かつ 被害度 >= 50）

#### ミッション自動展開ロジック（v0.3 / 主採用）

- 目的: 単発確率ではなく、内部のオート展開（TRPG風シーン進行）で結果と理由を確定する
- 方針:
- 出発後の操作は不可
- ただし内部では「複数シーン + 乱数ロール + 能力差」で展開を進める
- 成否と同時に `failure_causes`（失敗理由タグ）を必ず生成する
- v0.3チューニング適用:
- 失敗理由タグ発火を閾値スコア方式へ更新
- `achievement/damage` 係数を再調整
- 負傷・離脱・退団を段階化して重み再調整

1. 入力値（内部）
- 依頼側:
- `actual_difficulty`（実難易度 0-100）
- `hazard`（環境危険度 0-100）
- `uncertainty`（情報不確実性 0-100）
- `distance`（移動負荷 0-100）
- `disclosed_*` と `actual_*` の差分（説明食い違い判定用）
- 冒険者側:
- `party_fit`（案件適合 0-100）
- `fatigue_avg`（平均疲労 0-100）
- `morale`（士気 0-100）
- `trust_guild`（ギルド信頼 0-100）
- `prep_bonus`（出発前助言効果 0-20）
- `style_fit`, `honor_outlook`（面談由来の適合）

2. パーティ派生値
- `power = clamp(0.48*party_fit + 0.16*morale + 0.14*trust_guild + 0.14*prep_bonus + 0.08*style_fit, 0, 100)`
- `guard = clamp(0.42*party_fit + 0.20*prep_bonus + 0.18*morale + 0.12*trust_guild - 0.22*fatigue_avg, 0, 100)`
- `focus = clamp(0.45*party_fit + 0.20*honor_outlook + 0.20*morale - 0.15*uncertainty, 0, 100)`

3. シーン生成（内部）
- 固定シーン:
- `travel`（移動）
- `approach`（接触・探索）
- `objective`（本目的）
- `return`（撤収）
- 追加シーン:
- `incident` を `0〜2` 個追加（`hazard` と `uncertainty` が高いほど発生）
- `incident_count = floor((hazard + uncertainty) / 120) + rand(0,1)` を `0〜2` にクランプ
- `scene_count = 4 + incident_count`

4. シーン解決（TRPG風ロール）
- 各シーンで `進捗ロール` と `危機ロール` を実行
- ロールは `d100`
- シーン難易度:
- `tn_prog(scene) = clamp(actual_difficulty + prog_mod(scene) + rand(-6, +6), 20, 95)`
- `tn_risk(scene) = clamp(0.65*hazard + 0.35*uncertainty + risk_mod(scene) + rand(-6, +6), 15, 98)`
- `prog_mod / risk_mod`（MVP初期）:
- `travel: +4 / +10`
- `approach: +0 / +6`
- `objective: +12 / +12`
- `return: -6 / +8`
- `incident: +8 / +10`（追加シーン）
- 成功率（進捗）:
- `p_prog = clamp(50 + (power - tn_prog), 5, 95)`
- 成功率（危機回避）:
- `p_safe = clamp(50 + (guard - tn_risk), 5, 95)`
- 判定:
- `roll_prog <= p_prog` で進捗成功
- `roll_safe <= p_safe` で危機回避成功
- クリティカル閾値（固定）:
- `roll <= 5`: クリティカル成功（追加効果）
- `roll >= 96`: ファンブル（合併症付与）

5. トークン集計
- `progress_token`:
- 進捗成功 `+1`
- 進捗クリティカル `+2`
- 進捗ファンブル `0` + `setback_token +1`
- `damage_token`:
- 危機回避失敗 `+1`
- 危機ファンブル `+2`
- 危機クリティカル成功は `damage_token -1`（下限0）
- `stress_token`:
- 危機失敗時 `+1`、`uncertainty > 60` なら追加 `+1`
- カウンタ（v0.3）:
- `prog_fail_count`（進捗失敗回数）
- `risk_fail_count`（危機回避失敗回数）
- `critical_count`（クリティカル総数）
- `fumble_count`（ファンブル総数）

6. 食い違い・失敗理由の確定（v0.3）
- 依頼情報差分:
- `diff_risk = actual_hazard - disclosed_hazard`
- `diff_difficulty = actual_difficulty - disclosed_difficulty`
- `diff_honor = actual_expected_honor - disclosed_expected_honor`
- 理由タグ（複数可）:
- MVPでは以下6種で固定（追加はv1以降）
- `UNDERSTATED_RISK` 発火:
- `score = 0.5*clamp(diff_risk,0,40) + 12*risk_fail_count + 0.2*damage`
- `diff_risk >= 8` かつ `score >= 40` で付与
- `INFO_GAP` 発火:
- `score = 0.6*uncertainty + 10*prog_fail_count + 4*setback_token`
- `score >= 62` で付与
- `BAD_MATCH` 発火:
- `score = 0.7*max(0,50-party_fit) + 8*max(0,ceil(scene_count*0.5)-progress_token) + 0.2*max(0,50-focus)`
- `score >= 35` で付与
- `FATIGUE_OVERLOAD` 発火:
- `score = 0.7*max(0,fatigue_avg-50) + 9*stress_token + 5*risk_fail_count`
- `score >= 42` で付与
- `BAD_LUCK` 発火:
- `score = 22*fumble_count - 6*critical_count`
- `score >= 40` で付与
- `HONOR_MISREAD` 発火:
- `score = 0.8*max(0,-diff_honor) + 0.5*max(0,55-honor_outlook) + 0.2*public_visibility`
- `diff_honor <= -8` かつ `score >= 38` で付与
- 失敗理由の重大度（MVP初期）:
- `UNDERSTATED_RISK = 95`
- `BAD_MATCH = 88`
- `FATIGUE_OVERLOAD = 82`
- `INFO_GAP = 74`
- `HONOR_MISREAD = 62`
- `BAD_LUCK = 56`
- 結果画面には `failure_causes` を自然文で全件表示する（上限省略）
- 表示順は `重大度降順` で固定
- 同順位の並びは `初回発生シーン順`（早い順）で固定
- `failure_causes` が0件の場合は原因欄に `特筆すべき問題なし` を1行表示する

7. 達成度 / 被害度の算出（v0.3）
- 補助値:
- `objective_success = 1`（objectiveシーン進捗成功時）/ `0`（失敗時）
- `incident_penalty = 3 * incident_count`
- `achievement = clamp(18 + 10*progress_token - 5*setback_token + 0.12*focus + 0.08*power + 8*objective_success - 0.08*uncertainty + rand(-5,5), 0, 100)`
- `damage = clamp(6 + 10*damage_token + 6*stress_token + 0.16*hazard + 0.10*max(0,actual_difficulty-power) - 0.14*prep_bonus - 0.08*guard + incident_penalty + rand(-4,4), 0, 100)`
- この `achievement/damage` を結果4分類マトリクスへ入力する

8. 帰還日（同日帰還あり）
- `duration_days = clamp(round(0.55*scene_count + 0.018*distance + 0.012*actual_difficulty - 0.025*prep_bonus + rand(-1,1)), 0, 7)`
- `0` の場合は同日帰還

9. 報酬支払い率
- `成功: 100%`
- `部分成功: 55〜90%`（`achievement` に比例）
- `失敗: 5〜30%`（回収物や途中成果に応じる）
- `惨敗: 0〜10%`

10. 負傷・離脱・退団（v0.3）
- `damage < 30`: 離脱なし
- `30 <= damage < 50`: 軽傷（離脱 1〜3日）
- `50 <= damage < 70`: 重傷（離脱 3〜8日）
- `70 <= damage < 85`: 深刻（離脱 8〜16日 + 退団判定）
- `damage >= 85`: 致命的重傷（離脱 14〜30日 + 強い退団判定）
- 長期離脱補正:
- `long_leave_bonus_days = floor(max(0, stress_token-2) / 2) + floor(max(0, damage-70) / 10)`
- 最終離脱日数:
- `leave_days = base_leave_days + long_leave_bonus_days`（上限30日）
- 退団確率:
- `cause_bonus = 8*I(UNDERSTATED_RISK) + 6*I(BAD_MATCH) + 5*I(FATIGUE_OVERLOAD) + 4*I(INFO_GAP) + 4*I(BAD_LUCK) + 3*I(HONOR_MISREAD)`
- `I(tag)` はタグ成立時 `1`、未成立時 `0`
- `band_base = 0 / 0 / 2 / 8 / 16`（無傷/軽傷/重傷/深刻/致命的）
- `p_leave_raw = clamp(band_base + 0.65*max(0,damage-70) + 0.35*stress_token + cause_bonus - 0.25*trust_guild + rand(-4,4), 0, 60)%`
- `leave_days == 0` の場合 `p_leave = 0`
- `damage < 50` の場合 `p_leave = clamp(p_leave_raw, 0, 20)%`
- それ以外は `p_leave = clamp(p_leave_raw, 2, 60)%`

11. 露見因果スコアK（再掲・実装式）
- `info_hide_degree = clamp(abs(actual_difficulty - disclosed_difficulty)*1.2, 0, 100)`
- `failure_relatedness = clamp(0.6*damage + 0.4*max(0, (hazard+uncertainty)/2 - power), 0, 100)`
- `warning_ignore_degree = clamp(ignored_warning_count*20, 0, 100)`
- `K = 0.5*info_hide_degree + 0.3*failure_relatedness + 0.2*warning_ignore_degree`

12. 日報反映
- 出力:
- `result_class`, `achievement`, `damage`, `duration_days`, `reward_rate`
- `scene_timeline`（内部展開ログ）
- `scene_highlights`（表示用の重要シーン、最大4件）
- `failure_causes`（理由タグ）
- `discrepancy_notes`（申告食い違いメモ）
- 重要シーン抽出（確定）:
- `importance_score(scene) = scene_base + roll_event + discrepancy_bonus + cause_link_bonus`
- `scene_base`: `objective=3`, `incident=2`, `approach=1`, `travel/return=0`
- `roll_event`: クリティカルまたはファンブル発生で `+2`
- `discrepancy_bonus`: 申告食い違いに関与したシーンで `+2`
- `cause_link_bonus`: `failure_causes` の根拠シーンで `+2`
- 表示は `importance_score` 降順、同点はシーン発生順
- 表示件数は最大4件（内部ログは全件保持）
- 各表示行は「事実 + 冒険者感情1フレーズ」で出力する
- 感情フレーズの強度は中程度（淡々すぎず、過剰演出なし）

13. 実装擬似コード（1ミッション実行）

```ts
type MissionInput = {
  requestId: string;
  day: number;
  request: {
    actualDifficulty: number;
    hazard: number;
    uncertainty: number;
    distance: number;
    disclosedDifficulty: number;
    disclosedHazard: number;
    disclosedExpectedHonor: number;
    actualExpectedHonor: number;
    publicVisibility: number;
  };
  party: {
    partyFit: number;
    fatigueAvg: number;
    morale: number;
    trustGuild: number;
    prepBonus: number;
    styleFit: number;
    honorOutlook: number;
  };
  ignoredWarningCount: number;
};

type SceneKind = "travel" | "approach" | "objective" | "return" | "incident";

type SceneResult = {
  kind: SceneKind;
  progSuccess: boolean;
  riskSuccess: boolean;
  progRoll: number;
  riskRoll: number;
  progCritical: boolean;
  riskCritical: boolean;
  progFumble: boolean;
  riskFumble: boolean;
  importanceScore: number;
  notes: string[];
};

type MissionOutput = {
  resultClass: "成功" | "部分成功" | "失敗" | "惨敗";
  achievement: number;
  damage: number;
  durationDays: number;
  rewardRate: number;
  leaveDays: number;
  pLeave: number;
  failureCauses: string[];
  discrepancyNotes: string[];
  sceneTimeline: SceneResult[];
  sceneHighlights: SceneResult[];
  causalScoreK: number;
};

function runMission(input: MissionInput): MissionOutput {
  const derived = calcDerivedStats(input.party, input.request);
  const scenes = buildScenes(input.request.hazard, input.request.uncertainty);
  const timeline: SceneResult[] = [];

  const counters = {
    progressToken: 0,
    setbackToken: 0,
    damageToken: 0,
    stressToken: 0,
    progFailCount: 0,
    riskFailCount: 0,
    criticalCount: 0,
    fumbleCount: 0,
    objectiveSuccess: 0,
    incidentCount: scenes.filter((s) => s === "incident").length,
  };

  for (const scene of scenes) {
    const r = resolveScene(scene, input.request, derived);
    timeline.push(r);

    if (r.progSuccess) counters.progressToken += r.progCritical ? 2 : 1;
    else {
      counters.progFailCount += 1;
      if (r.progFumble) counters.setbackToken += 1;
    }

    if (!r.riskSuccess) {
      counters.riskFailCount += 1;
      counters.damageToken += r.riskFumble ? 2 : 1;
      counters.stressToken += input.request.uncertainty > 60 ? 2 : 1;
    } else if (r.riskCritical) {
      counters.damageToken = Math.max(0, counters.damageToken - 1);
    }

    if (r.progCritical || r.riskCritical) counters.criticalCount += 1;
    if (r.progFumble || r.riskFumble) counters.fumbleCount += 1;
    if (scene === "objective" && r.progSuccess) counters.objectiveSuccess = 1;
  }

  const diff = calcDiscrepancies(input.request);
  const { failureCauses, causeFlags } = computeFailureCauses({
    ...input,
    ...derived,
    ...counters,
    ...diff,
  });

  const { achievement, damage } = calcAchievementDamage({
    ...input,
    ...derived,
    ...counters,
  });

  const resultClass = classifyResult(achievement, damage);
  const durationDays = calcDurationDays(input.request, counters.incidentCount, input.party.prepBonus);
  const rewardRate = calcRewardRate(resultClass, achievement);
  const { leaveDays, pLeave } = calcLeaveOutcome(
    damage,
    counters.stressToken,
    input.party.trustGuild,
    causeFlags
  );

  const causalScoreK = calcCausalScoreK({
    actualDifficulty: input.request.actualDifficulty,
    disclosedDifficulty: input.request.disclosedDifficulty,
    damage,
    power: derived.power,
    hazard: input.request.hazard,
    uncertainty: input.request.uncertainty,
    ignoredWarningCount: input.ignoredWarningCount,
  });

  const sceneHighlights = selectSceneHighlights(timeline, {
    maxItems: 4,
    failureCauses,
    discrepancies: diff,
  });

  return {
    resultClass,
    achievement,
    damage,
    durationDays,
    rewardRate,
    leaveDays,
    pLeave,
    failureCauses,
    discrepancyNotes: buildDiscrepancyNotes(diff),
    sceneTimeline: timeline,
    sceneHighlights,
    causalScoreK,
  };
}

function resolveScene(scene: SceneKind, req: MissionInput["request"], d: { power: number; guard: number }): SceneResult {
  const { progMod, riskMod } = sceneMods(scene);
  const tnProg = clamp(req.actualDifficulty + progMod + randInt(-6, 6), 20, 95);
  const tnRisk = clamp(0.65 * req.hazard + 0.35 * req.uncertainty + riskMod + randInt(-6, 6), 15, 98);
  const pProg = clamp(50 + (d.power - tnProg), 5, 95);
  const pSafe = clamp(50 + (d.guard - tnRisk), 5, 95);

  const progRoll = rollD100();
  const riskRoll = rollD100();

  const progCritical = progRoll <= 5;
  const riskCritical = riskRoll <= 5;
  const progFumble = progRoll >= 96;
  const riskFumble = riskRoll >= 96;

  const progSuccess = progRoll <= pProg;
  const riskSuccess = riskRoll <= pSafe;

  return {
    kind: scene,
    progSuccess,
    riskSuccess,
    progRoll,
    riskRoll,
    progCritical,
    riskCritical,
    progFumble,
    riskFumble,
    importanceScore: 0,
    notes: [],
  };
}
```

#### 依頼主キャラクターと申告誤差

- 依頼主にも性格タイプを持たせ、申告誤差傾向を変える
- 依頼主タイプ（MVP）:
- 誤差定義は `申告値 - 実値`
- `誠実型`:
- 危険誤差 `-8〜+8`
- 報酬誤差 `-5〜+10`
- 説明欠落率 `10%`
- 終了理由比率 `期限切れ45 / 他ギルド達成35 / 依頼主都合20`
- `誇張営業型`:
- 危険誤差 `-15〜+5`
- 報酬誤差 `+10〜+30`
- 説明欠落率 `20%`
- 終了理由比率 `期限切れ35 / 他ギルド達成20 / 依頼主都合45`
- `過小申告型`:
- 危険誤差 `-30〜-10`
- 報酬誤差 `-5〜+10`
- 説明欠落率 `30%`
- 終了理由比率 `期限切れ30 / 他ギルド達成25 / 依頼主都合45`
- `気分変動型`:
- 危険誤差 `-20〜+20`（日次再抽選）
- 報酬誤差 `-20〜+20`（日次再抽選）
- 説明欠落率 `15〜35%`（日次再抽選）
- 終了理由比率 `期限切れ25 / 他ギルド達成20 / 依頼主都合55`
- 依頼終了理由（期限切れ/他ギルド達成/依頼主都合）の発生傾向も依頼主タイプで変化させる
- style/honor系4値の申告誤差（MVP初期）:

| 依頼主タイプ | style誤差 | honor誤差 | dishonor誤差 | visibility誤差 |
| --- | --- | --- | --- | --- |
| 誠実型 | `-8〜+8` | `-10〜+8` | `-8〜+8` | `-10〜+10` |
| 誇張営業型 | `+5〜+20` | `+8〜+22` | `-12〜+5` | `+10〜+25` |
| 過小申告型 | `-8〜+6` | `-12〜+6` | `-25〜-8` | `-10〜+5` |
| 気分変動型 | `-20〜+20` | `-20〜+20` | `-20〜+20` | `-25〜+25` |

- 申告値生成式（確定）:
- `disclosed_value = clamp(actual_value + client_error, 0, 100)`
- 説明欠落時は該当項目を `unknown` とし、面談/追加ヒアリングで補完可能にする
- 追加ヒアリング補正（MVP初期）:
- 初期値 `hearing_delta_* = 0`
- 1回の関連ヒアリングごとに以下を加算:
- `hearing_delta += round((actual_value - disclosed_value) * r + rand(-2, +2))`
- `r`（依頼主タイプ別）: `誠実型 0.30 / 誇張営業型 0.18 / 過小申告型 0.15 / 気分変動型 0.20`
- `hearing_delta` は `[-25, +25]` にクランプ

#### 冒険者応募（日次発生式）

- 1日あたり応募件数はポアソン分布で生成する
- `応募件数 ~ Poisson(λ)`
- `λ = clamp(1.2 + 0.012 × (冒険者側総合評判 - 50) + 0.02 × (公開依頼件数 - 6), 0.2, 4.5)`

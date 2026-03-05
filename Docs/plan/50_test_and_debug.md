## 21. 初期バランス調整テストケース（v0.1）

### 使い方

- 各ケースで `受諾判定`, `打ち切り判定`, `日報4分類`, `悪印象反映` を確認する
- 期待挙動は「数値の正確一致」ではなく「方向性一致」をまず確認する
- 1ケースにつき最低3回まわして、気分変動や日次応募の揺らぎを見る

### 共通ログ項目（記録テンプレ）

- `case_id`, `seed`, `day`, `adventurer_id`, `request_id`
- `O,C,E,A,N`
- `w_reward,w_riskfit,w_client,w_clarity,w_condition,w_guild,w_ethics,w_record,w_style,w_honor`
- `style_fit,honor_outlook,decision_margin,persuasion_headroom`
- `request_style_actual,request_style_disclosed,expected_honor_actual,expected_honor_disclosed,dishonor_actual,dishonor_disclosed,visibility_actual,visibility_disclosed`
- `request_style_signal,expected_honor_signal,dishonor_signal,visibility_signal`
- `S_base`, `persuasion_delta_turn`, `persuasion_effective`, `S_final`, `theta_accept`, `threshold_accept`, `threshold_hold`, `decision(受諾/保留/辞退)`, `depart_flag`
- `selected_action,base_delta,factor_delta,repeat_penalty,resistance_penalty,timing_penalty`
- `load_delta`, `load_total`, `T_stop`, `stop_flag`
- `scene_count,incident_count,progress_token,setback_token,damage_token,stress_token`
- `prog_fail_count,risk_fail_count,critical_count,fumble_count,objective_success`
- `achievement`, `damage`, `result_class`, `failure_causes`
- `leave_days,p_leave`
- `exposure_flag`, `causal_score_K`, `consent_flag`, `penalty_P`
- `discrepancy_notes`
- `delta_rep_safety`, `delta_rep_fairness`, `delta_rep_growth`
- `lambda_applicants`, `applicant_count`
- `unread_summary_blocked`

### ケース一覧（16件）

1. 低危険・高報酬・高明確
- 条件: 申告危険低、報酬高、説明明確、依頼主は誠実型
- 期待: 受諾が多い、打ち切りは起きにくい、成功または部分成功が中心
- 見るログ: `decision`, `stop_flag`, `result_class`
- 合格目安（30試行）: 受諾率 `>= 55%`、打ち切り率 `<= 20%`、`成功+部分成功率 >= 70%`

2. 高危険・高報酬・説明明確
- 条件: 申告危険高、報酬高、説明明確
- 期待: BIG5差が出る（挑戦寄りは受諾、神経症傾向高めは保留/辞退）
- 見るログ: `O,N,S_final,decision`
- 合格目安（30試行）: 受諾率が `25%-70%` に収まり、`N高群の受諾率 < N低群の受諾率`

3. 低危険申告だが実危険高（過小申告）
- 条件: 依頼主は過小申告型、露見しやすい情報を仕込む
- 期待: 失敗時に露見 + 因果あり判定が発生し、悪印象が中〜大へ寄る
- 期待: `failure_causes` に `UNDERSTATED_RISK` が入りやすい
- 見るログ: `exposure_flag`, `causal_score_K`, `penalty_P`, `delta_rep_safety`, `failure_causes`, `discrepancy_notes`
- 合格目安（30試行）: `失敗時露見率 >= 60%`、露見+因果あり時の `中/大ペナルティ率 >= 70%`

4. 失敗理由の表示順確認（重大度順）
- 条件: 複数理由が同時発生するケースを作る
- 期待: `failure_causes` と `cause_lines` が重大度降順で一致する
- 見るログ: `failure_causes`, `scene_highlights`
- 合格目安（20試行）: 表示順違反が `0件`

5. 重要シーン表示数の上限確認
- 条件: `scene_count=6` 以上になるケースを作る
- 期待: 日報表示は `scene_lines` が最大4件に制限される
- 見るログ: `scene_timeline`, `scene_highlights`, `scene_lines`
- 合格目安（20試行）: `scene_lines.length <= 4` を常に満たす

6. 重要シーン文体確認（事実 + 感情）
- 条件: 成功系/失敗系を各10試行
- 期待: `scene_lines` 各行に出来事の事実と冒険者感情1フレーズが含まれる
- 見るログ: `scene_lines`, `intent_tags`
- 合格目安（20試行）: 文体不一致 `<= 2件`

7. 原因欄フォールバック確認（原因なし）
- 条件: `failure_causes=[]` となる成功寄りケースを作る
- 期待: `cause_lines` が `["特筆すべき問題なし"]` になる
- 見るログ: `failure_causes`, `cause_lines`
- 合格目安（20試行）: 期待文言一致率 `100%`

8. 失敗理由タグ発火閾値の妥当性
- 条件: 各タグの境界付近（スコア±5）を人為的に作る
- 期待: 境界をまたぐとタグ付与が切り替わる
- 見るログ: `failure_causes`, `diff_risk`, `diff_honor`, `prog_fail_count`, `risk_fail_count`, `fumble_count`
- 合格目安（各タグ20試行）: 閾値超え側の発火率 `>= 70%`、閾値未満側 `<= 30%`

9. 負傷・離脱・退団の段階性確認
- 条件: `damage` を 45 / 60 / 78 / 90 近傍で固定入力
- 期待: 離脱日数と退団確率が段階的に上昇する
- 見るログ: `damage`, `stress_token`, `leave_days`, `p_leave`, `failure_causes`
- 合格目安:
- `damage 45` の平均 `leave_days < 4`
- `damage 60` の平均 `leave_days >= 4`
- `damage 78` の平均 `p_leave >= 10%`
- `damage 90` の平均 `p_leave >= 20%`

10. 高頻度ヒアリング（同系質問反復）
- 条件: 同じ論点の質問を連続、追加ヒアリングを重ねる
- 期待: 面談負荷が蓄積し、「もういい」打ち切りが再現される
- 見るログ: `load_total`, `T_stop`, `stop_flag`
- 合格目安（30試行）: 反復質問3回 + 追加ヒアリング2回で `stop_flag発生率 >= 60%`

11. 説得行動の差分確認
- 条件: 同一案件で `おだてる/応援/たきつける` を個別実行
- 期待: 不満要因ごとに有効行動が変わる（係数テーブルの方向性が再現される）
- 見るログ: `persuasion_delta_turn`, `persuasion_effective`, `S_final`, `decision`
- 合格目安（同一冒険者5名比較）:
- 行動ごとの `persuasion_delta_turn` に差が出る（最大差 `>= 5`）
- `risk_fit` 主因時は `応援する` が他2行動以上になりやすい
- `honor_outlook` 主因時は `おだてる` または `たきつける` が相対優位になりやすい

12. 事前同意あり/なしの情報伏せ比較
- 条件: 同じ情報伏せを同意あり・同意なしで2パターン実施
- 期待: 露見時の悪印象が同意ありで1段階軽減される
- 見るログ: `consent_flag`, `penalty_P`
- 合格目安（同条件20組比較）: 同意ありの平均ペナルティが同意なしの `70% ± 10%`

13. 気分変動依頼主のブレ確認
- 条件: 依頼主を気分変動型に固定し、複数日観測
- 期待: 申告誤差と終了理由比率が日ごとに揺れる
- 見るログ: `申告危険`, `実危険`, `報酬申告`, `報酬実値`, `終了理由`
- 合格目安（30日観測）: 危険誤差と報酬誤差の標準偏差がそれぞれ `>= 8`

14. 日報4分類の境界値確認
- 条件: 達成度/被害度を閾値近傍（49/50, 69/70, 79/80）で作る
- 期待: 成功・部分成功・失敗・惨敗の遷移が仕様通りに切り替わる
- 見るログ: `achievement`, `damage`, `result_class`
- 合格目安（固定入力）:
- `(80,39)->成功`
- `(80,40)->部分成功`
- `(50,69)->部分成功`
- `(49,69)->失敗`
- `(29,50)->惨敗`
- `(50,70)->惨敗`

15. 未読日報要約ゲート確認
- 条件: 日報未確認の状態で `次の日` を押す
- 期待: 要約確認前は日付が進まない
- 見るログ: `unread_summary_blocked`, `day`
- 合格目安: 未確認時 `blocked=true` かつ `day不変`、要約確認後は `blocked=false` で進行

16. 日次応募発生量の健全性
- 条件: 低評判日と高評判日で複数日観測
- 期待: `λ` の差に応じて応募件数の平均傾向が変わる
- 見るログ: `lambda_applicants`, `applicant_count`
- 合格目安（各30日）: 高評判条件の平均応募数が低評判条件より `>= 0.3` 多い

## 22. 失敗時デバッグ手順（v0.2）

### A. 受諾が異常に低い / 高い

1. `S_base` 分布を確認（中央値が想定50前後か）
2. `重みセット` の極端値を確認（`0.20` クランプ貼り付きが多すぎないか）
3. `persuasion_delta_turn` と `persuasion_effective` の平均を確認（常時プラス/マイナスに偏っていないか）
4. `theta_accept` と `threshold_accept` 分布を確認（補正が閾値を壊していないか）
5. 必要調整:
- まず `説得補正合計クランプ` を `±12 -> ±8` に縮小
- 次に受諾閾値の基準値 `70` と動的補正量（負荷/反発/信頼）を `±5` 相当で調整

### B. 「もういい」が出すぎる / 出なさすぎる

1. `load_total` と `T_stop` の差分推移を確認
2. どの負荷要因が支配的か確認（反復+追加ヒアリングが過大になっていないか）
3. `N` 高群と低群で発生率差を確認
4. 必要調整:
- 出すぎる場合: `追加ヒアリング +12 -> +9`, `反復 +10 -> +8`
- 出なさすぎる場合: `曖昧回答 +8 -> +10`, `矛盾説明 +15 -> +18`

### C. 露見ペナルティが不自然

1. `causal_score_K` の内訳（情報伏せ度/失敗関連度/警告無視度）を確認
2. `penalty_P` が `P_base` と `m,q` でどの程度増減したか確認
3. `consent_flag=true` で軽減されているか確認
4. 必要調整:
- 強すぎる場合: `m` の上限 `1.40 -> 1.25`
- 弱すぎる場合: `P_base(小/中/大)` を `-5/-12/-20 -> -6/-14/-22`

### D. 4分類が偏る（成功ばかり/惨敗ばかり）

1. `achievement` と `damage` の分布を散布図で確認
2. 境界近傍（50/70/80）にサンプルがあるか確認
3. `result_class` 比率が極端でないか確認
4. 必要調整:
- 成功過多: `成功条件 被害度<40 -> <35`
- 惨敗過多: `惨敗条件 被害度>=70 -> >=75`

### E. 日次応募数が不安定

1. `lambda_applicants` の日次推移を確認
2. `applicant_count` がPoisson想定から大きく外れていないか確認
3. 評判変化に対する感度を確認（評判+10で応募平均が増えるか）
4. 必要調整:
- 変動大: `λ` 上限 `4.5 -> 3.5`
- 感度不足: 評判係数 `0.012 -> 0.016`

### F. デバッグ実行順（推奨）

1. まず `受諾` と `打ち切り` を安定化
2. 次に `露見ペナルティ` の納得感を調整
3. 最後に `4分類` と `日次応募` の全体バランスを調整

### G. 失敗理由タグが付きすぎる / 付かなすぎる

1. タグごとの境界スコア分布を確認（閾値近傍に偏っていないか）
2. 同一失敗でタグ過多なら、優先タグ以外の閾値を `+5` する
3. 期待よりタグが薄い場合は、主因タグの閾値を `-5` する
4. 調整優先順:
- `UNDERSTATED_RISK`, `BAD_MATCH` を先に合わせる
- その後 `INFO_GAP`, `FATIGUE_OVERLOAD`, `HONOR_MISREAD`, `BAD_LUCK` を追従

### H. 離脱日数 / 退団率が重すぎる or 軽すぎる

1. `damage` 帯ごとの `leave_days`, `p_leave` を箱ひげで確認
2. 重すぎる場合:
- `band_base` を `8/16 -> 6/12`（深刻/致命）
- `0.65*(damage-70)` を `0.55*(damage-70)` に緩和
3. 軽すぎる場合:
- `band_base` を `8/16 -> 10/20`
- `cause_bonus` の係数を各 `+1` ずつ増やす

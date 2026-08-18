/* ==UserStyle==
@name           ptosh.com
@namespace      github.com/openstyles/stylus
@version        1.0.0
@description    A new userstyle
@author         Me
==/UserStyle== */

@-moz-document domain("ptosh.com") {
  /* ここにコードを挿入... */
  /* 全体の色およびテーブル幅 */
html body {
  background: #0F1115; /* 深いメイン背景 */
  color: #f8f8f2; /* 明るいテキスト */
}

html body div#cover.container,
td {
  background: #0F1115; /* メイン背景 */
  color: #f8f8f2;
}

/* 症例一覧の背景 */
#cover {
  background: #11151C; /* やや明るめのダーク背景で階層化 */
}

/* 症例一覧メニュー */
#menu {
  background: #11151C; /* やや明るめのダーク背景 */
}

/* 入力フォームエリア */
#search_diagnosis_on,
#search_initial,
#disease_suggest,
#number,
#search_birth_date,
#search_dead_confirmed_on,
#search_card_number {
  background: #11151C; /* 入力欄もダーク化して統一感をアップ */
  color: #f8f8f2; /* 文字を白に変更して視認性を確保 */
  border: 1px solid #44475a; /* 枠線を追加して境界を明確に */
}

/* カレンダー背景 */
#ui-datepicker-div {
  background: #11151C; /* カレンダーのベースをダークに */
  color: #f8f8f2;
  border: 1px solid #44475a;
}

.ui-datepicker.ui-widget.ui-widget-content.ui-helper-clearfix.ui-corner-all div.ui-datepicker-header.ui-widget-header.ui-helper-clearfix.ui-corner-all {
  background: #0F1115; /* カレンダーヘッダーをメイン背景に */
  color: #bd93f9; /* ヘッダー文字にDraculaパープルをアクセントとして適用 */
}

/* 保存ボタン・データセンターに送信 */
input[name="commit"] {
  background: #ff79c6; /* Dracula pink */
  color: #0F1115; /* 文字色をダークにしてコントラストを確保 */
  font-weight: bold;
  border: none;
}

/* コメントカラー */
tr.comment td pre {
  background: #0F1115; /* メイン背景 */
  color: #6272a4; /* Dracula comment */
}

/* 一時保存ボタン */
input[name="save"] {
  background: #6272a4; /* Dracula comment */
  color: #f8f8f2;
  border: none;
}

.table th,
.table td {
  padding: 0.05rem;
  border-color: #11151C; /* 区切り線を2色目のダークカラーに */
}

/* 登録箇所のサイズ */
#new_registration_sheet.new_registration_sheet {
  font-size: 14px;
}

/* ヘッダーおよびフッター */
#header {
  padding: 0.005rem;
  background: #0F1115; /* メイン背景 */
  color: #f8f8f2;
}

#footer {
  display: none !important;
}

/* テーブル縦罫線消去 */
table tr td {
  border-right: none !important;
}


/* カレンダー設定 (変更なし) */
.ui-datepicker-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.ui-datepicker-title select.ui-datepicker-year {
  margin-right: 0.5em;
  background: #0F1115; /* セレクトボックス内の背景も調整 */
  color: #f8f8f2;
}

.ui-datepicker-title select.ui-datepicker-month {
  margin-left: 0.5em;
  background: #0F1115;
  color: #f8f8f2;
}


/* 通常の日付セル */
.ui-datepicker td a.ui-state-default {
  background-color: #0F1115 !important; /* 日付セルの背景 */
  color: #f8f8f2 !important;
  border-radius: 4px;
}

/* 今日 */
.ui-datepicker-today a {
  background-color: #bd93f9 !important; /* パープル強調 */
  color: #0F1115 !important;
  font-weight: bold !important;
}

/* 選択日 */
.ui-datepicker td a.ui-state-active {
  background-color: #ff79c6 !important; /* ピンクで選択感 */
  color: #0F1115 !important;
  font-weight: bold !important;
}

/* ホバー */
.ui-datepicker td a:hover {
  background-color: #6272a4 !important; /* Draculaブルー */
  color: #f8f8f2 !important;
}

/* 前月・次月の日付（無効） */
.ui-datepicker .ui-datepicker-other-month,
.ui-datepicker .ui-datepicker-unselectable {
  background-color: transparent !important;
  color: #6272a4 !important;
}

/* 前月・次月のナビゲーション矢印（< と >） */
.ui-datepicker .ui-datepicker-prev,
.ui-datepicker .ui-datepicker-next {
  color: #f8f8f2 !important;
  background-color: transparent !important;
}

/* ホバー時の強調 */
.ui-datepicker .ui-datepicker-prev:hover,
.ui-datepicker .ui-datepicker-next:hover {
  background-color: #6272a4 !important;
  border-radius: 4px;
  color: #f8f8f2 !important;
  cursor: pointer;
}
}

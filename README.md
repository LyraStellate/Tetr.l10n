# Tetr.l10n

[English](#english) | [日本語](#japanese)

---

<a id="english"></a>
## English

Tetr.l10n is an unofficial translation/localization patch tool for the TETR.IO Desktop client.
While the default `translations.csv` provided in this repository is for Japanese, you can edit this file to translate the game into **any language**. Note that the provided `translations.csv` only translates the main parts of the game, and many untranslated parts remain.

### Features

- Translates the TETR.IO UI into your preferred language.
- Highly customizable by simply editing `translations.csv`.

### Requirements

- Windows OS
- [TETR.IO Desktop Client](https://tetr.io/about/desktop/) installed.
  (The script assumes it is installed in the default location: `%LOCALAPPDATA%\Programs\tetrio-desktop\TETR.IO.exe`)

### How to Use

#### Installation

1. Completely close TETR.IO if it is running.
2. Download and extract the ZIP file from Releases, or clone this repository.
3. Double-click `patch.bat` to run it.
4. If it says "Patch completed successfully!", the patch was successful.
5. Open TETR.IO and the translation will be applied.

#### Uninstallation

1. Completely close TETR.IO if it is running.
2. Double-click `unpatch.bat` to run it.
3. If it says "Unpatch completed successfully!", the game has been restored.
4. Open TETR.IO and the original English UI will be back.

### Customizing the Translation (Any Language)

The translation dictionary is defined in `translations.csv`. You can open this file with any text editor and change the translations. To apply changes, either restart TETR.IO or press `Ctrl + R` while the game is running to reload.

The basic format of `translations.csv` is `Original Text|Translated Text`.
It also supports dynamic text replacement using regular expressions based on the following rules:

| Condition | Replacement Behavior | Example |
| :--- | :--- | :--- |
| **Normal Line** | Exact match replacement on text nodes | `START\|Start Game` |
| **Contains `^` or `\`** | Regex match (can use `$1`, `$2` in translated string) | `^LEVEL (\d+)$\|Lv. $1` |
| **Contains `[*]`** | Paragraph replacement<br>(`[*]` marks the formatted span position) | `prefix [*] suffix\|Before [*] After` |

**Paragraph Replacement Patterns using `[*]`:**
- `prefix [*]` → Replaces if the paragraph starts with `prefix`.
- `prefix [*] suffix` → Replaces if the paragraph starts with `prefix` and ends with `suffix`.
- `[*] suffix` → Replaces if the paragraph ends with `suffix`.

### Disclaimers

- **Unofficial Tool:** This tool is an unofficial patch and is not affiliated with TETR.IO or osk in any way.
- **Game Updates:** When TETR.IO updates, the patch might temporarily break or cause visual glitches. If you experience issues after an update, run `unpatch.bat` to revert to the vanilla state.
- **Liability:** The author is not responsible for any issues, data corruption, or account penalties caused by the use of this tool. Use at your own risk.

---

<a id="japanese"></a>
## 日本語

Tetr.l10n は、TETR.IO デスクトップクライアントを任意の言語にローカライズするための非公式パッチツールです。
初期状態で同梱されている `translations.csv` は日本語化のためのデータですが、このファイルを編集することでどの言語にも翻訳することが可能です。なお、`translations.csv`は主要部分のみを翻訳しており、未翻訳部分が多く存在します。

### 機能

- TETR.IO の UI を好みの言語に翻訳します。
- `translations.csv` を編集することで、翻訳内容や対象言語を自由にカスタマイズ可能です。

### 必要条件

- Windows OS
- [TETR.IO デスクトップクライアント](https://tetr.io/about/desktop/)がインストールされていること。
  デフォルトのインストール先 (`%LOCALAPPDATA%\Programs\tetrio-desktop\TETR.IO.exe`) にあることを前提としています。

### 使い方

#### インストールおよびパッチの適用

1. TETR.IO が起動している場合は、完全に終了してください。
2. リリースからZIPファイルをダウンロードして展開します。またはリポジトリをcloneしてください。
3. `patch.bat` をダブルクリックして実行します。
4. Patch completed successfully!が表示されれば成功です。
5. TETR.IO を起動すると、翻訳が適応されます。

#### アンインストール

1. TETR.IO が起動している場合は、完全に終了してください。
2. `unpatch.bat` をダブルクリックして実行します。
3. Unpatch completed successfully! が表示されれば成功です。
4. TETR.IO を起動すると、元の状態に戻ります。

### 翻訳のカスタマイズ方法

翻訳内容は `translations.csv` に定義されています。このファイルをテキストエディタ等で編集し、TETR.IO を再起動するか、起動した状態で `Ctrl + R` を押してリロードすることで翻訳を反映できます。

`translations.csv` の基本フォーマットは `原文|訳文` です。
さらに、以下のルールに従って正規表現を用いた動的なテキスト置換にも対応しています。

| 条件 | 置換の挙動 | 例 |
| :--- | :--- | :--- |
| **通常行** | テキストノードの完全一致で置換 | `START\|開始` |
| **`^` または `\` を含む** | 正規表現としてマッチ (訳文で `$1`, `$2` 等が使用可能) | `^LEVEL (\d+)$\|レベル $1` |
| **`[*]` を含む** | 段落全体の書き換え<br>(`[*]` がフォーマット維持位置を示す) | `prefix [*] suffix\|前置き [*] 後置き` |

**`[*]` を用いた段落書き換えのパターン例**
- `prefix [*]` → 段落テキストが `prefix` で始まる場合に置換
- `prefix [*] suffix` → 段落テキストが `prefix` で始まり、`suffix` で終わる場合に置換
- `[*] suffix` → 段落テキストが `suffix` で終わる場合に置換


### 注意事項

- **非公式ツール:** 本ツールは非公式のパッチであり、TETR.IO 公式（osk 氏等）とは一切関係ありません。
- **アップデート時の対応:** TETR.IO のアップデートにより、一時的にパッチが適用できなくなったり、表示が崩れる可能性があります。アップデート後に問題が発生した場合は、一度 `unpatch.bat` で元の状態に戻してください。
- **免責事項:** 本ツールの利用により生じたトラブルやデータ破損、アカウントの不利益等について、作者は一切の責任を負いません。自己責任でご使用ください。

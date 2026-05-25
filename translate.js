// translate.js — TETR.IO 日本語化 Mod
// 翻訳データは translations.csv から読み込み（main.js が _TETRIO_CSV として注入）

// ── CSVパーサー ───────────────────────────────────────────────────────────────
// exact        : {en: jp}          完全一致
// regexPatterns: [{pattern, tpl}]  正規表現（en が ^ で始まるか \ を含む行）
// cheekyPatterns: [{prefix, suffix, jp}]  段落書き換え（en に [*] を含む行）
const exact = {};
const regexPatterns = [];
const cheekyPatterns = [];

for (const line of _TETRIO_CSV.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sep = trimmed.indexOf('|');
    if (sep === -1) continue;
    const en = trimmed.slice(0, sep);
    const jp = trimmed.slice(sep + 1);

    if (en.includes('[*]')) {
        // 段落書き換えモード: [*] の前後を prefix / suffix に分解
        const parts = en.split('[*]');
        cheekyPatterns.push({ prefix: parts[0], suffix: parts[1], jp });
    } else if (en.startsWith('^') || en.includes('\\')) {
        // 正規表現モード: jp 内の $1,$2 は String#replace が自動展開
        regexPatterns.push({ pattern: new RegExp(en), tpl: jp });
    } else {
        // 完全一致モード
        exact[en] = jp;
    }
}

// ── 翻訳エンジン ─────────────────────────────────────────────────────────────

function translateTextNode(node) {
    const original = node.textContent;
    const trimmed = original.trim();
    if (!trimmed) return;

    // 1. 完全一致
    if (exact[trimmed] !== undefined) {
        const result = original.replace(trimmed, exact[trimmed]);
        if (result !== original) {
            node.textContent = result;
            // CJKフォールバックのline-height膨張による下方ずれを補正
            if (node.parentElement) node.parentElement.style.lineHeight = '1';
        }
        return;
    }

    // 2. 正規表現
    for (const { pattern, tpl } of regexPatterns) {
        if (pattern.test(trimmed)) {
            const result = original.replace(trimmed, trimmed.replace(pattern, tpl));
            if (result !== original) {
                node.textContent = result;
                if (node.parentElement) node.parentElement.style.lineHeight = '1';
            }
            return;
        }
    }
}

function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // cheeky スパンを含む段落を丸ごと置換
        // 全子ノードのテキストを結合して prefix/suffix パターンと照合する
        if (node.tagName === 'P') {
            const hasCheeky = Array.from(node.childNodes).some(
                k => k.nodeType === Node.ELEMENT_NODE && k.classList?.contains('cheeky')
            );
            if (hasCheeky) {
                // &nbsp; ( ) を通常スペースに正規化してから照合
                const fullText = Array.from(node.childNodes).map(k => k.textContent).join('').replace(/ /g, ' ');
                for (const { prefix, suffix, jp } of cheekyPatterns) {
                    const matchStart = prefix === '' || fullText.startsWith(prefix);
                    const matchEnd   = suffix === '' || fullText.endsWith(suffix);
                    if (matchStart && matchEnd) {
                        node.textContent = jp;
                        node.style.lineHeight = '1';
                        return;
                    }
                }
            }
        }
        // placeholder 属性（入力フィールドのヒント）も翻訳
        if (node.placeholder && exact[node.placeholder] !== undefined) {
            node.placeholder = exact[node.placeholder];
        }
        // title 属性（ホバーツールチップ）も翻訳
        if (node.title && exact[node.title] !== undefined) {
            node.title = exact[node.title];
        }
        node.childNodes.forEach(translateNode);
    }
}

// 初期実行
translateNode(document.body);

// SPA対応: DOM変更を監視して動的に追加されたノードも翻訳
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            translateNode(node);
        });
        // テキスト内容の直接変更にも対応
        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
            translateTextNode(mutation.target);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
});

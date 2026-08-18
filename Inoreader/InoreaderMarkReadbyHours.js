// ==UserScript==
// @name         Inoreader Mark Read by Hours (Custom Input Supported)
// @namespace    https://chat.openai.com/
// @version      0.9
// @description  Mark visible articles older than selected/custom hours as read securely.
// @match        https://www.inoreader.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    const PRESETS = [6, 12, 24, 36, 48, 72, 24 * 7, 24 * 30];

    function getArticleElements() {
        return [...document.querySelectorAll(".article_is_unread, .article_unread, div.ar[data-date_usec][data-read='0'], [id^='article_']")].filter(el => {
            if (el.dataset.scriptMarked === "true") return false;
            return el.offsetParent !== null && !el.classList.contains("article_read");
        });
    }

    function getArticleTimestamp(article) {
        const usec = article.getAttribute("data-date_usec") || article.dataset?.date_usec;
        if (usec) return Number(usec) / 1000;

        const timestamp = article.getAttribute("data-timestamp") || article.dataset?.timestamp;
        if (timestamp) return Number(timestamp) * 1000;

        const timeEl = article.querySelector(".article_sub_title, .article_date, .article_title_wrapper");
        if (timeEl) {
            const titleAttr = timeEl.getAttribute("title") || timeEl.textContent;
            const parsedDate = Date.parse(titleAttr);
            if (!isNaN(parsedDate)) return parsedDate;
        }

        return null;
    }

    function getTargetArticles(hours) {
        const now = Date.now();
        const limitMs = hours * 3600 * 1000;
        const articles = getArticleElements();

        return articles.filter(article => {
            const articleTime = getArticleTimestamp(article);
            if (!articleTime) return false;
            return (now - articleTime) >= limitMs;
        });
    }

    async function markArticles(hours) {
        const targets = getTargetArticles(hours);

        if (targets.length === 0) {
            alert(`${hours}時間より古い未読記事は見つかりませんでした。`);
            return;
        }

        if (document.activeElement) {
            document.activeElement.blur();
        }

        const globalWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        let count = 0;

        for (const article of targets) {
            article.dataset.scriptMarked = "true";

            const id = article.dataset.aid || article.id?.replace("article_", "");

            if (typeof globalWindow.mark_read === "function" && id) {
                try {
                    globalWindow.mark_read(id);
                    article.classList.add("article_read");
                    article.classList.remove("article_is_unread", "article_unread");
                    count++;
                } catch (e) {
                    console.warn("mark_read exec error:", e);
                }
            } else {
                const unreadToggle = article.querySelector(".article_unread_dot, .mark_as_read_button, .icon-check");

                if (unreadToggle) {
                    unreadToggle.click();
                    count++;
                } else {
                    article.click();
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "m", keyCode: 77, bubbles: true }));
                    count++;
                }
            }

            await new Promise(r => setTimeout(r, 180));
        }

        if (document.activeElement) {
            document.activeElement.blur();
        }

        alert(`${count} 件の記事を既読処理しました。`);
    }

    function openCustomModal() {
        if (document.getElementById("inoreader-modal-overlay")) return;

        const savedHours = GM_getValue("hours", 24);

        const overlay = document.createElement("div");
        overlay.id = "inoreader-modal-overlay";
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.5); z-index: 2147483647;
            display: flex; align-items: center; justify-content: center;
        `;

        const modal = document.createElement("div");
        modal.style.cssText = `
            background: #fff; color: #333; padding: 20px; border-radius: 8px;
            width: 330px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-family: sans-serif;
        `;

        let optionsHtml = PRESETS.map(h => {
            const label = h >= 24 ? `${h / 24} 日前` : `${h} 時間前`;
            const selected = h === savedHours ? "selected" : "";
            return `<option value="${h}" ${selected}>${label}より古い記事</option>`;
        }).join("");

        const isPresetSaved = PRESETS.includes(savedHours);
        const customSelected = !isPresetSaved ? "selected" : "";

        optionsHtml += `<option value="custom" ${customSelected}>カスタム指定 (直接入力)</option>`;

        modal.innerHTML = `
            <h3 style="margin-top:0;margin-bottom:12px;font-size:16px;">古い記事をまとめて既読</h3>

            <label style="font-size:13px;display:block;margin-bottom:6px;">プリセットから選択:</label>
            <select id="inoreader-select-hours" style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ccc;border-radius:4px;font-size:14px;">
                ${optionsHtml}
            </select>

            <label style="font-size:13px;display:block;margin-bottom:6px;">または自由入力 (単位: 時間):</label>
            <input type="number" id="inoreader-custom-hours" value="${savedHours}" min="0.1" step="any" placeholder="例: 10 (10時間まえ)" style="width:100%;padding:8px;margin-bottom:16px;border:1px solid #ccc;border-radius:4px;font-size:14px;box-sizing:border-box;">

            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button id="inoreader-btn-cancel" style="padding:8px 12px;border:1px solid #ccc;background:#f5f5f5;border-radius:4px;cursor:pointer;">キャンセル</button>
                <button id="inoreader-btn-exec" style="padding:8px 12px;border:none;background:#4285f4;color:#fff;border-radius:4px;cursor:pointer;">実行する</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const selectEl = document.getElementById("inoreader-select-hours");
        const customInputEl = document.getElementById("inoreader-custom-hours");

        // プリセット切替時に入力欄の数値を連動更新
        selectEl.addEventListener("change", () => {
            if (selectEl.value !== "custom") {
                customInputEl.value = selectEl.value;
            }
        });

        // 入力欄変更時にプリセットが一致しなくなったらカスタム選択へ変更
        customInputEl.addEventListener("input", () => {
            const val = Number(customInputEl.value);
            if (PRESETS.includes(val)) {
                selectEl.value = String(val);
            } else {
                selectEl.value = "custom";
            }
        });

        document.getElementById("inoreader-btn-cancel").onclick = () => {
            overlay.remove();
        };

        document.getElementById("inoreader-btn-exec").onclick = () => {
            let hours = Number(customInputEl.value);

            if (isNaN(hours) || hours <= 0) {
                alert("有効な時間を入力してください（例: 5 時間、36 時間 など）。");
                return;
            }

            GM_setValue("hours", hours);
            overlay.remove();
            markArticles(hours);
        };
    }

    function ensureButton() {
        if (document.getElementById("inoreader-mark-read-btn")) return;

        const button = document.createElement("div");
        button.id = "inoreader-mark-read-btn";
        button.textContent = "時間指定既読";

        button.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 20px !important;
            z-index: 2147483646 !important;
            padding: 10px 16px !important;
            border: 1px solid #999 !important;
            border-radius: 6px !important;
            background: #4285f4 !important;
            color: #fff !important;
            cursor: pointer !important;
            font-size: 14px !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
            user-select: none !important;
        `;

        button.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openCustomModal();
        };

        (document.body || document.documentElement).appendChild(button);
    }

    const observer = new MutationObserver(() => {
        ensureButton();
    });

    if (document.body) {
        ensureButton();
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            ensureButton();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    window.addEventListener("keydown", e => {
        if (e.altKey && e.key.toLowerCase() === "m") {
            openCustomModal();
        }
    }, true);

})();

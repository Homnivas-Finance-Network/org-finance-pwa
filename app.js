// ---------------------------------------------------------------------------
// Homnivas Finance Network — Partner PWA
// ---------------------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signOut,
    RecaptchaVerifier, signInWithPhoneNumber,
    GoogleAuthProvider, signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const BACKEND_API_URL = "https://org-finance-backend-1059108924249.us-central1.run.app";

const VERTICALS = [
    { code: "PL", icon: "person",           tKey: "pl" },
    { code: "BL", icon: "storefront",        tKey: "bl" },
    { code: "HL", icon: "home",              tKey: "hl" },
    { code: "LAP", icon: "real_estate_agent", tKey: "lap" },
];

const STAGES = [1, 2, 3, 4, 5];

// Greetings are looked up via t('greet.XX') at runtime so they translate.

// ---------------------------------------------------------------------------
// Firebase
// ---------------------------------------------------------------------------

const firebaseApp = initializeApp(window.HOMNIVAS_FIREBASE_CONFIG);
const auth = getAuth(firebaseApp);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// Translation helper — reads from window.HOMNIVAS_TRANSLATIONS
const t = (key, vars) => {
    const lang = state ? state.currentLanguage : "en";
    const dict = (window.HOMNIVAS_TRANSLATIONS || {})[lang] || {};
    const base = (window.HOMNIVAS_TRANSLATIONS || {}).en || {};
    let val = dict[key] !== undefined ? dict[key] : (base[key] || key);
    if (vars) Object.entries(vars).forEach(([k, v]) => { val = val.replaceAll("{" + k + "}", v); });
    return val;
};

function applyTranslations(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const dict = (window.HOMNIVAS_TRANSLATIONS || {})[lang] || {};
        const base = (window.HOMNIVAS_TRANSLATIONS || {}).en || {};
        const val = dict[key] !== undefined ? dict[key] : (base[key] || "");
        if (typeof val === "string" && val) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        const key = el.dataset.i18nPh;
        const dict = (window.HOMNIVAS_TRANSLATIONS || {})[lang] || {};
        const base = (window.HOMNIVAS_TRANSLATIONS || {}).en || {};
        const val = dict[key] !== undefined ? dict[key] : (base[key] || "");
        if (typeof val === "string" && val) el.placeholder = val;
    });
    // Re-render dynamic views so their JS-generated strings also update
    if (document.getElementById("view-vertical-select").classList.contains("active")) initVerticalGrid();
    const chatInput = document.getElementById("chat-input");
    if (chatInput) chatInput.placeholder = t("chat.input_ph");
}

const state = {
    currentCaseId: null,
    currentVertical: null,
    currentLanguage: localStorage.getItem("hfn_lang") || "en",
    schemaCache: {},
    confirmationResult: null,
    pendingPhoneE164: null,
    recaptchaVerifier: null,
    currentRole: "partner",
    staffCache: null,
    cachedProfile: null,
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiFetch(path, { method = "GET", body } = {}) {
    if (!auth.currentUser) throw new Error("Not signed in.");
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${BACKEND_API_URL}${path}`, {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* no body */ }
    if (!res.ok) {
        throw new Error((data && data.detail) || `Request failed (${res.status})`);
    }
    return data;
}

async function apiFetchBlob(path, { method = "GET" } = {}) {
    if (!auth.currentUser) throw new Error("Not signed in.");
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${BACKEND_API_URL}${path}`, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try { const j = await res.json(); detail = j.detail || detail; } catch (_) {}
        throw new Error(detail);
    }
    return res.blob();
}

// ---------------------------------------------------------------------------
// View routing
// ---------------------------------------------------------------------------

function showView(id) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function setActiveNav(key) {
    document.querySelectorAll(".nav-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.nav === key);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function showLoginStep(step) {
    ["phone", "otp", "profile"].forEach((s) => {
        document.getElementById(`login-step-${s}`).classList.toggle("hidden", s !== step);
    });
    document.getElementById("login-back-btn").classList.toggle("hidden", step !== "phone");
    document.getElementById("login-google-footer").classList.toggle("hidden", step !== "phone");
}

function ensureRecaptcha() {
    if (!state.recaptchaVerifier) {
        state.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
    return state.recaptchaVerifier;
}

function humanizePhoneError(code) {
    const map = {
        "auth/invalid-phone-number": "That mobile number doesn't look right.",
        "auth/too-many-requests": "Too many attempts. Please try again in a while.",
        "auth/code-expired": "This code has expired — request a new one.",
        "auth/invalid-verification-code": "That code didn't match. Please try again.",
        "auth/popup-closed-by-user": "Sign-in was cancelled.",
    };
    return map[code];
}

async function sendOtp() {
    const raw = document.getElementById("phone-input").value.trim();
    const errorEl = document.getElementById("phone-error");
    errorEl.classList.add("hidden");

    if (!/^[6-9]\d{9}$/.test(raw)) {
        errorEl.textContent = t("err.phone");
        errorEl.classList.remove("hidden");
        return;
    }

    const e164 = `+91${raw}`;
    const spinner = document.getElementById("phone-spinner");
    const btn = document.getElementById("phone-submit-btn");
    spinner.classList.remove("hidden");
    btn.disabled = true;

    try {
        const verifier = ensureRecaptcha();
        state.confirmationResult = await signInWithPhoneNumber(auth, e164, verifier);
        state.pendingPhoneE164 = e164;
        document.getElementById("otp-phone-display").textContent = e164;
        document.getElementById("otp-input").value = "";
        document.getElementById("otp-error").classList.add("hidden");
        showLoginStep("otp");
    } catch (err) {
        errorEl.textContent = humanizePhoneError(err.code) || err.message;
        errorEl.classList.remove("hidden");
        // Invisible reCAPTCHA tokens are single-use — reset so a retry can work.
        try { state.recaptchaVerifier && state.recaptchaVerifier.clear(); } catch (_) {}
        state.recaptchaVerifier = null;
    } finally {
        spinner.classList.add("hidden");
        btn.disabled = false;
    }
}

async function verifyOtp() {
    const code = document.getElementById("otp-input").value.trim();
    const errorEl = document.getElementById("otp-error");
    errorEl.classList.add("hidden");

    if (!/^\d{6}$/.test(code)) {
        errorEl.textContent = t("err.otp");
        errorEl.classList.remove("hidden");
        return;
    }
    if (!state.confirmationResult) {
        errorEl.textContent = "Session expired — please request a new OTP.";
        errorEl.classList.remove("hidden");
        showLoginStep("phone");
        return;
    }

    const spinner = document.getElementById("otp-spinner");
    const btn = document.getElementById("otp-submit-btn");
    spinner.classList.remove("hidden");
    btn.disabled = true;

    try {
        await state.confirmationResult.confirm(code);
        // onAuthStateChanged -> handleAuthState() takes over routing from here.
    } catch (err) {
        errorEl.textContent = humanizePhoneError(err.code) || "That code didn't match. Please try again.";
        errorEl.classList.remove("hidden");
    } finally {
        spinner.classList.add("hidden");
        btn.disabled = false;
    }
}

async function signInWithGoogleAdmin() {
    const errorEl = document.getElementById("google-error");
    errorEl.classList.add("hidden");
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        // onAuthStateChanged -> handleAuthState() upserts the profile and
        // enforces the ADMIN_EMAILS allowlist server-side.
    } catch (err) {
        errorEl.textContent = humanizePhoneError(err.code) || err.message;
        errorEl.classList.remove("hidden");
    }
}

async function submitProfileName() {
    const name = document.getElementById("profile-name-input").value.trim();
    const errorEl = document.getElementById("profile-error");
    errorEl.classList.add("hidden");

    if (!name) {
        errorEl.textContent = "Please enter your name.";
        errorEl.classList.remove("hidden");
        return;
    }

    const spinner = document.getElementById("profile-spinner");
    const btn = document.getElementById("profile-submit-btn");
    spinner.classList.remove("hidden");
    btn.disabled = true;

    try {
        const profile = await apiFetch("/api/profile", { method: "POST", body: { name } });
        state.cachedProfile = profile;
        enterApp(profile.role);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
    } finally {
        spinner.classList.add("hidden");
        btn.disabled = false;
    }
}

function enterApp(role) {
    state.currentRole = role || "partner";
    document.getElementById("bottom-nav").classList.remove("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");
    document.getElementById("profile-icon-btn").classList.remove("hidden");
    document.getElementById("nav-team-btn").classList.toggle("hidden", state.currentRole === "partner");
    // Sync language button visual state from saved preference
    document.querySelectorAll(".lang-btn").forEach(b => {
        const active = b.dataset.lang === state.currentLanguage;
        b.classList.toggle("bg-gold", active);
        b.classList.toggle("text-ink", active);
        b.classList.toggle("font-bold", active);
        b.classList.toggle("text-slate-400", !active);
    });
    applyTranslations(state.currentLanguage);
    showView("view-vertical-select");
    setActiveNav("ai");
}

function wireAuthUI() {
    document.getElementById("landing-cta-btn").addEventListener("click", () => {
        showView("view-login");
        showLoginStep("phone");
    });
    document.getElementById("login-back-btn").addEventListener("click", () => showView("view-landing"));

    document.getElementById("phone-submit-btn").addEventListener("click", sendOtp);
    document.getElementById("phone-input").addEventListener("keypress", (e) => { if (e.key === "Enter") sendOtp(); });

    document.getElementById("otp-submit-btn").addEventListener("click", verifyOtp);
    document.getElementById("otp-input").addEventListener("keypress", (e) => { if (e.key === "Enter") verifyOtp(); });
    document.getElementById("otp-change-number-btn").addEventListener("click", () => {
        state.confirmationResult = null;
        document.getElementById("otp-error").classList.add("hidden");
        showLoginStep("phone");
    });
    document.getElementById("otp-resend-btn").addEventListener("click", sendOtp);

    document.getElementById("profile-submit-btn").addEventListener("click", submitProfileName);
    document.getElementById("profile-name-input").addEventListener("keypress", (e) => { if (e.key === "Enter") submitProfileName(); });

    document.getElementById("google-admin-btn").addEventListener("click", signInWithGoogleAdmin);

    document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));
}

async function handleAuthState(user) {
    if (!user) {
        document.getElementById("bottom-nav").classList.add("hidden");
        document.getElementById("logout-btn").classList.add("hidden");
        document.getElementById("profile-icon-btn").classList.add("hidden");
        showView("view-landing");
        return;
    }

    document.getElementById("logout-btn").classList.remove("hidden");

    const provider = (user.providerData[0] && user.providerData[0].providerId) || "";

    if (provider === "google.com") {
        // Always upsert on Google sign-in — this is also where the backend
        // enforces the ADMIN_EMAILS allowlist. A non-allowlisted Google
        // account gets rejected and signed back out.
        try {
            const profile = await apiFetch("/api/profile", {
                method: "POST",
                body: { name: user.displayName || user.email || "Homnivas Team" },
            });
            state.cachedProfile = profile;
            enterApp(profile.role);
        } catch (err) {
            await signOut(auth);
            // signOut() triggers handleAuthState(null), which always lands on
            // the landing page — re-assert the login screen afterwards so the
            // person actually sees why their sign-in was rejected, instead of
            // being silently bounced back to the marketing page.
            showView("view-login");
            showLoginStep("phone");
            const errorEl = document.getElementById("google-error");
            if (errorEl) {
                errorEl.textContent = err.message;
                errorEl.classList.remove("hidden");
            }
        }
        return;
    }

    // Phone-auth partner: check whether their profile (display name) exists yet.
    try {
        const profile = await apiFetch("/api/profile");
        if (profile.exists) {
            state.cachedProfile = profile;
            enterApp(profile.role);
        } else {
            showView("view-login");
            showLoginStep("profile");
        }
    } catch (err) {
        console.error("Couldn't load profile:", err);
        // Don't block the user — try entering the app anyway
        enterApp("partner");
    }
}

onAuthStateChanged(auth, (user) => { handleAuthState(user); });

// ---------------------------------------------------------------------------
// Vertical picker
// ---------------------------------------------------------------------------

function initVerticalGrid() {
    const grid = document.getElementById("vertical-grid");
    grid.innerHTML = VERTICALS.map((v) => `
        <button data-vertical="${v.code}" class="vertical-card text-left glass-card rounded-2xl overflow-hidden hover:border-gold/40 transition-all active:scale-[0.98]">
            <div class="tab-${v.code} h-1.5 w-full"></div>
            <div class="p-3.5">
                <div class="flex items-center justify-between mb-2">
                    <span class="material-symbols-rounded text-${v.code} text-[22px]">${v.icon}</span>
                    <span class="font-data text-[10px] text-slate-600">${v.code}</span>
                </div>
                <p class="font-display text-sm text-slate-100 leading-tight">${t("vertical." + v.tKey + ".label")}</p>
                <p class="text-[10.5px] text-slate-500 mt-1 leading-snug">${t("vertical." + v.tKey + ".desc")}</p>
            </div>
        </button>
    `).join("");

    grid.querySelectorAll(".vertical-card").forEach((btn) => {
        btn.addEventListener("click", () => createCase(btn.dataset.vertical));
    });
}

async function createCase(vertical) {
    try {
        const res = await apiFetch("/api/cases", { method: "POST", body: { vertical } });
        state.currentCaseId = res.case_id;
        state.currentVertical = vertical;
        openChatForCurrentCase({ resetGreeting: true });
        showView("view-chat");
        setActiveNav("ai");
    } catch (err) {
        alert(`Couldn't start a new file: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

function updateChatHeader(vertical, clientName, prog) {
    const v = VERTICALS.find((x) => x.code === vertical);
    const dot = document.getElementById("chat-vertical-dot");
    dot.className = `w-2.5 h-2.5 rounded-full shrink-0 tab-${vertical}`;
    document.getElementById("chat-vertical-label").textContent = v ? v.label : vertical;
    document.getElementById("chat-client-label").textContent = clientName || "New Lead";

    if (prog) {
        document.getElementById("chat-progress-bar").style.width = `${prog.percent}%`;
        document.getElementById("chat-progress-bar").className = `h-full rounded-full transition-all duration-500 tab-${vertical}`;
        document.getElementById("chat-progress-text").textContent = t("chat.fields", {f: prog.filled, t: prog.total, p: prog.percent});
        const pdfBtn = document.getElementById("chat-pdf-btn");
        if (prog.filled > 0) {
            pdfBtn.disabled = false;
            pdfBtn.classList.remove("text-slate-700");
            pdfBtn.classList.add("text-gold");
        } else {
            pdfBtn.disabled = true;
            pdfBtn.classList.add("text-slate-700");
            pdfBtn.classList.remove("text-gold");
        }
    }
}

function openChatForCurrentCase({ resetGreeting }) {
    const chatLog = document.getElementById("chat-log");
    if (resetGreeting) {
        chatLog.innerHTML = "";
        appendMessage(t("greet." + (state.currentVertical || "PL")), "ai", { trustedHtml: true });
    }
    updateChatHeader(state.currentVertical, null, { filled: 0, total: 1, percent: 0 });
}

async function resumeCase(caseId) {
    try {
        const res = await apiFetch(`/api/cases/${caseId}`);
        state.currentCaseId = caseId;
        state.currentVertical = res.vertical;

        const chatLog = document.getElementById("chat-log");
        chatLog.innerHTML = "";
        if (res.messages && res.messages.length) {
            res.messages.forEach((m) => appendMessage(m.text, m.role === "user" ? "user" : "ai"));
        } else {
            appendMessage(t("greet." + (res.vertical || "PL")), "ai", { trustedHtml: true });
        }
        updateChatHeader(res.vertical, res.data && res.data.name, res.progress);
        showView("view-chat");
        setActiveNav("ai");
    } catch (err) {
        alert(`Couldn't open this file: ${err.message}`);
    }
}

function appendMessage(text, sender, { trustedHtml = false } = {}) {
    const chatLog = document.getElementById("chat-log");
    const msgId = "msg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const wrapper = document.createElement("div");
    wrapper.id = msgId;
    wrapper.className = "flex gap-2 fade-in " + (sender === "user" ? "justify-end" : "justify-start");

    let bubbleStyle = "glass-card text-slate-300 rounded-2xl rounded-tl-none p-3 text-xs max-w-[85%] leading-relaxed";
    if (sender === "user") {
        bubbleStyle = "bg-gold text-ink font-medium rounded-2xl rounded-tr-none p-3 text-xs max-w-[85%] shadow-md leading-relaxed";
    } else if (sender === "ai-loading") {
        bubbleStyle = "glass-card text-slate-500 rounded-2xl rounded-tl-none p-3 text-xs animate-pulse";
    }

    // Greeting strings are hardcoded by us (trusted) and may contain simple markup
    // like <strong>. Everything else (AI replies, user input) is always escaped —
    // never render raw HTML from the backend or from what someone typed.
    const content = sender === "ai-loading"
        ? text
        : trustedHtml
            ? text
            : escapeHtml(text).replace(/\n/g, "<br>");

    wrapper.innerHTML = `<div class="${bubbleStyle}">${content}</div>`;
    chatLog.appendChild(wrapper);
    chatLog.scrollTop = chatLog.scrollHeight;
    return msgId;
}

async function sendMessageToBackend() {
    const inputField = document.getElementById("chat-input");
    const messageText = inputField.value.trim();
    if (!messageText || !state.currentCaseId) return;

    appendMessage(messageText, "user");
    inputField.value = "";
    const loadingId = appendMessage(t("chat.thinking"), "ai-loading");

    try {
        const res = await apiFetch("/api/chat", {
            method: "POST",
            body: { case_id: state.currentCaseId, user_message: messageText, language: state.currentLanguage },
        });
        document.getElementById(loadingId).remove();
        appendMessage(res.reply, "ai");
        updateChatHeader(state.currentVertical, null, res.progress);
    } catch (err) {
        document.getElementById(loadingId).remove();
        appendMessage(text: `${t("chat.error")} (${err.message})`, "ai");
    }
}

function wireChatUI() {
    document.getElementById("chat-send-btn").addEventListener("click", sendMessageToBackend);
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageToBackend();
        }
    });
    document.getElementById("chat-details-btn").addEventListener("click", () => {
        if (state.currentCaseId) openCaseDetail(state.currentCaseId);
    });
    document.getElementById("chat-pdf-btn").addEventListener("click", () => {
        if (state.currentCaseId && !document.getElementById("chat-pdf-btn").disabled) {
            triggerPdfDownload(state.currentCaseId);
        }
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const lang = btn.dataset.lang;
            state.currentLanguage = lang;
            localStorage.setItem("hfn_lang", lang);
            document.querySelectorAll(".lang-btn").forEach((b) => {
                b.classList.remove("bg-gold", "text-ink", "font-bold");
                b.classList.add("text-slate-400");
            });
            btn.classList.add("bg-gold", "text-ink", "font-bold");
            btn.classList.remove("text-slate-400");
            applyTranslations(lang);
            showLangToast(lang);
        });
    });
}

// ---------------------------------------------------------------------------
// Clients list
// ---------------------------------------------------------------------------

async function loadClients() {
    const listEl = document.getElementById("clients-list");
    const emptyEl = document.getElementById("clients-empty");
    const countEl = document.getElementById("clients-count");
    listEl.innerHTML = `<p class="text-xs text-slate-600 font-data">Loading...</p>`;

    try {
        const res = await apiFetch("/api/cases");
        const cases = res.cases || [];
        countEl.textContent = cases.length === 1 ? t("clients.files", {n: 1}) : t("clients.files_pl", {n: cases.length});

        if (cases.length === 0) {
            listEl.innerHTML = "";
            emptyEl.classList.remove("hidden");
            return;
        }
        emptyEl.classList.add("hidden");

        listEl.innerHTML = cases.map((c) => `
            <button data-case-id="${c.case_id}" class="client-row w-full text-left glass-card rounded-xl overflow-hidden flex hover:border-gold/40 transition-all active:scale-[0.99]">
                <div class="tab-${c.vertical} w-1.5 shrink-0"></div>
                <div class="flex-1 p-3 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <p class="font-display text-sm text-slate-100 truncate">${escapeHtml(c.client_name)}</p>
                        <span class="text-[9px] uppercase tracking-wider font-data text-${c.vertical} shrink-0">${c.vertical}</span>
                    </div>
                    <div class="flex items-center justify-between mt-1.5">
                        <span class="text-[10px] text-slate-500">${c.stage_label}</span>
                        <span class="text-[10px] font-data text-slate-600">${c.progress.percent}%</span>
                    </div>
                    <div class="w-full bg-slate-900/70 rounded-full h-1 mt-1 overflow-hidden">
                        <div class="h-full rounded-full tab-${c.vertical}" style="width:${c.progress.percent}%"></div>
                    </div>
                </div>
            </button>
        `).join("");

        listEl.querySelectorAll(".client-row").forEach((btn) => {
            btn.addEventListener("click", () => openCaseDetail(btn.dataset.caseId));
        });
    } catch (err) {
        listEl.innerHTML = `<p class="text-xs text-red-400">Couldn't load clients: ${escapeHtml(err.message)}</p>`;
    }

    document.querySelectorAll(".goto-vertical-select").forEach((btn) => {
        btn.addEventListener("click", () => {
            showView("view-vertical-select");
            setActiveNav("ai");
        });
    });
}

// ---------------------------------------------------------------------------
// Case detail
// ---------------------------------------------------------------------------

async function getSchema(vertical) {
    if (state.schemaCache[vertical]) return state.schemaCache[vertical];
    const res = await apiFetch(`/api/schema/${vertical}`);
    state.schemaCache[vertical] = res.sections;
    return res.sections;
}

async function openCaseDetail(caseId) {
    try {
        const caseRes = await apiFetch(`/api/cases/${caseId}`);
        const sections = await getSchema(caseRes.vertical);

        state.currentCaseId = caseId;
        state.currentVertical = caseRes.vertical;

        document.getElementById("detail-vertical-label").textContent = caseRes.vertical_label;
        document.getElementById("detail-client-label").textContent = caseRes.data.name || "New Lead";

        renderStageTracker(caseRes.vertical, caseRes.status);
        renderDetailSections(sections, caseRes.data, caseRes.vertical);

        showView("view-case-detail");
        setActiveNav("clients");
    } catch (err) {
        alert(`Couldn't open this file: ${err.message}`);
    }
}

function renderStageTracker(vertical, currentStatus) {
    const el = document.getElementById("stage-tracker");
    el.innerHTML = STAGES.map((n) => {
        const filled = n <= currentStatus;
        return `
            <button data-stage="${n}" class="stage-dot relative z-10 flex flex-col items-center gap-1.5 flex-1">
                <span class="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-data border-2
                    ${filled ? `tab-${vertical} border-transparent text-ink font-bold` : "bg-ink border-slate-700 text-slate-600"}">
                    ${filled ? "✓" : n}
                </span>
                <span class="text-[8.5px] uppercase tracking-wide ${filled ? `text-${vertical}` : "text-slate-600"} text-center leading-tight">${t("stage." + n)}</span>
            </button>
        `;
    }).join("");

    el.querySelectorAll(".stage-dot").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const newStatus = parseInt(btn.dataset.stage, 10);
            try {
                await apiFetch(`/api/cases/${state.currentCaseId}/status`, { method: "PATCH", body: { status: newStatus } });
                renderStageTracker(vertical, newStatus);
            } catch (err) {
                alert(`Couldn't update stage: ${err.message}`);
            }
        });
    });
}

function renderDetailSections(sections, data, vertical) {
    const container = document.getElementById("detail-sections");
    container.innerHTML = sections.map((section) => `
        <div class="glass-card rounded-2xl p-4">
            <p class="text-[10px] uppercase tracking-widest text-${vertical} mb-3">${section.section}</p>
            <div class="space-y-3">
                ${section.fields.map((f) => `
                    <div>
                        <label class="text-[10px] text-slate-500">${f.label}</label>
                        <input type="text" data-field="${f.key}" value="${escapeHtml(data[f.key] || "")}"
                            class="field-input w-full rounded-lg px-3 py-2 text-xs mt-1 text-slate-200 font-data placeholder:text-slate-700"
                            placeholder="Not captured yet">
                    </div>
                `).join("")}
            </div>
        </div>
    `).join("");
}

async function saveDetailChanges() {
    const inputs = document.querySelectorAll("#detail-sections input[data-field]");
    const fields = {};
    inputs.forEach((input) => {
        if (input.value.trim()) fields[input.dataset.field] = input.value.trim();
    });

    const btn = document.getElementById("detail-save-btn");
    const originalText = t("detail.save");
    btn.textContent = t("detail.saving");
    btn.disabled = true;

    try {
        await apiFetch(`/api/cases/${state.currentCaseId}/data`, { method: "PATCH", body: { fields } });
        btn.textContent = t("detail.saved");
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1200);
    } catch (err) {
        alert(`Couldn't save changes: ${err.message}`);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function triggerPdfDownload(caseId) {
    try {
        const blob = await apiFetchBlob(`/api/cases/${caseId}/pdf`, { method: "POST" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Homnivas-${state.currentVertical || "infosheet"}-${caseId.slice(0, 6)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert(`Couldn't generate PDF: ${err.message}`);
    }
}

function wireCaseDetailUI() {
    document.getElementById("detail-back-btn").addEventListener("click", () => {
        showView("view-clients");
        setActiveNav("clients");
        loadClients();
    });
    document.getElementById("detail-save-btn").addEventListener("click", saveDetailChanges);
    document.getElementById("detail-save-btn").textContent = t("detail.save");
    document.getElementById("detail-pdf-btn").textContent = t("detail.pdf");
    document.getElementById("detail-chat-btn").textContent = t("detail.chat");
    document.getElementById("detail-pdf-btn").addEventListener("click", () => triggerPdfDownload(state.currentCaseId));
    document.getElementById("detail-chat-btn").addEventListener("click", () => resumeCase(state.currentCaseId));
}

// ---------------------------------------------------------------------------
// Team (staff/admin only)
// ---------------------------------------------------------------------------

function renderReassignSelect(p) {
    const options = [`<option value="">— Unassigned —</option>`].concat(
        (state.staffCache || []).map((s) => `<option value="${s.uid}" ${s.uid === p.tagged_to ? "selected" : ""}>${escapeHtml(s.name)} (${s.role})</option>`)
    );
    return `<select data-partner="${p.uid}" class="reassign-select field-input text-[11px] rounded-lg px-2 py-1.5 text-slate-300 max-w-[160px]">${options.join("")}</select>`;
}

async function loadTeamPartners() {
    const listEl = document.getElementById("team-partners-list");
    const emptyEl = document.getElementById("team-empty");
    const countEl = document.getElementById("team-count");
    listEl.innerHTML = `<p class="text-xs text-slate-600 font-data">Loading...</p>`;

    try {
        const isAdmin = state.currentRole === "admin";
        if (isAdmin && !state.staffCache) {
            const staffRes = await apiFetch("/api/team/staff");
            state.staffCache = staffRes.staff || [];
        }

        const res = await apiFetch("/api/team/partners");
        const partners = res.partners || [];
        countEl.textContent = `${partners.length} partner${partners.length === 1 ? "" : "s"}`;

        if (partners.length === 0) {
            listEl.innerHTML = "";
            emptyEl.classList.remove("hidden");
            return;
        }
        emptyEl.classList.add("hidden");

        const myUid = auth.currentUser ? auth.currentUser.uid : null;

        listEl.innerHTML = partners.map((p) => {
            const joined = p.created_at
                ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "";
            const isUnassigned = !p.tagged_to;
            const isMine = p.tagged_to === myUid;

            let rightContent;
            if (isAdmin) {
                rightContent = renderReassignSelect(p);
            } else if (isUnassigned) {
                rightContent = `<button data-claim="${p.uid}" class="claim-btn text-[11px] font-semibold text-gold border border-gold/30 rounded-lg px-3 py-1.5 hover:bg-gold/10 transition-colors">${t("team.claim")}</button>`;
            } else {
                const label = isMine ? t("team.tagged_you") : t("team.tagged_to", {name: escapeHtml(p.tagged_to_name || "someone")});
                rightContent = `<span class="text-[11px] ${isMine ? "text-gold" : "text-slate-500"} font-data">${label}</span>`;
            }

            return `
                <div class="glass-card rounded-xl p-3.5 fade-in">
                    <div class="flex items-center justify-between gap-2">
                        <div class="min-w-0">
                            <p class="font-display text-sm text-slate-100 truncate">${escapeHtml(p.name || "Unnamed")}</p>
                            <p class="text-[11px] text-slate-500 font-data mt-0.5">${escapeHtml(p.phone || "")}</p>
                        </div>
                        <p class="text-[9px] text-slate-700 shrink-0">${joined}</p>
                    </div>
                    <div class="mt-2.5 flex justify-end">${rightContent}</div>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll(".claim-btn").forEach((btn) => {
            btn.addEventListener("click", () => tagPartner(btn.dataset.claim, myUid));
        });
        listEl.querySelectorAll(".reassign-select").forEach((sel) => {
            sel.addEventListener("change", () => tagPartner(sel.dataset.partner, sel.value || null));
        });
    } catch (err) {
        listEl.innerHTML = `<p class="text-xs text-red-400">Couldn't load partners: ${escapeHtml(err.message)}</p>`;
    }
}

async function tagPartner(partnerUid, staffUid) {
    try {
        await apiFetch(`/api/team/partners/${partnerUid}/tag`, { method: "POST", body: { staff_uid: staffUid || null } });
        loadTeamPartners();
    } catch (err) {
        alert(`Couldn't update tag: ${err.message}`);
        loadTeamPartners(); // re-render to revert any optimistic UI drift (e.g. a <select> the user changed)
    }
}

// ---------------------------------------------------------------------------
// Bottom nav
// ---------------------------------------------------------------------------

function wireBottomNav() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.nav;
            setActiveNav(key);
            if (key === "ai") {
                showView("view-vertical-select");
            } else if (key === "clients") {
                showView("view-clients");
                loadClients();
            } else if (key === "wallet") {
                showView("view-wallet");
            } else if (key === "team") {
                showView("view-team");
                loadTeamPartners();
            }
        });
    });
}

// ---------------------------------------------------------------------------
// Profile view
// ---------------------------------------------------------------------------

function _renderProfileData(profile) {
    if (!profile) return;
    const nameInput = document.getElementById("profile-display-name");
    const contactDiv = document.getElementById("profile-contact-info");
    const badgeEl = document.getElementById("profile-role-badge");
    const taggingCard = document.getElementById("profile-tagging-card");
    const taggedToEl = document.getElementById("profile-tagged-to");

    nameInput.value = profile.name || "";

    const roleColors = { partner: "border-pl/40 text-pl bg-pl/10", staff: "border-hl/40 text-hl bg-hl/10", admin: "border-gold/40 text-gold bg-gold/10" };
    const role = profile.role || "partner";
    badgeEl.className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6 fade-in border ${roleColors[role] || roleColors.partner}`;
    badgeEl.textContent = t("profile.role." + role);

    if (profile.phone) {
        contactDiv.innerHTML = `
            <p class="text-[10px] text-slate-500">${t("nav.clients") !== "क्लाइंट्स" ? "Mobile" : "Mobile"}</p>
            <p class="text-sm text-slate-200 font-data">${escapeHtml(profile.phone)}</p>`;
    } else if (profile.email) {
        contactDiv.innerHTML = `
            <p class="text-[10px] text-slate-500">Email</p>
            <p class="text-sm text-slate-200 font-data">${escapeHtml(profile.email)}</p>`;
    } else {
        contactDiv.innerHTML = `<p class="text-xs text-slate-600">${t("profile.no_contact")}</p>`;
    }

    if (role === "partner") {
        taggingCard.classList.remove("hidden");
        const tagName = profile.tagged_to_name || "";
        taggedToEl.textContent = tagName || t("profile.unassigned");
        taggedToEl.className = tagName
            ? "text-sm text-gold font-data mt-1"
            : "text-sm text-slate-500 font-data mt-1 italic";
    } else {
        taggingCard.classList.add("hidden");
    }
}

async function openProfileView() {
    showView("view-profile");
    const contactDiv = document.getElementById("profile-contact-info");
    contactDiv.innerHTML = `<p class="text-xs text-slate-600 font-data">${t("profile.loading")}</p>`;

    // Show cached data immediately for a snappy feel
    if (state.cachedProfile) _renderProfileData(state.cachedProfile);

    try {
        const profile = await apiFetch("/api/profile");
        if (!profile || !profile.exists) {
            contactDiv.innerHTML = `<p class="text-xs text-red-400">${t("profile.no_profile")}</p>`;
            return;
        }
        state.cachedProfile = profile;
        _renderProfileData(profile);
    } catch (err) {
        // If cached data is already showing, just log the refresh failure silently
        if (!state.cachedProfile) {
            contactDiv.innerHTML = `<p class="text-xs text-red-400">${escapeHtml(err.message)}</p>`;
        }
        console.warn("Profile refresh failed:", err.message);
    }
}

async function saveProfileName() {
    const name = document.getElementById("profile-display-name").value.trim();
    if (!name) return;

    const btn = document.getElementById("profile-save-name-btn");
    const label = document.getElementById("profile-save-label");
    const spinner = document.getElementById("profile-save-spinner");
    const feedback = document.getElementById("profile-save-feedback");

    btn.disabled = true;
    spinner.classList.remove("hidden");
    feedback.classList.add("hidden");

    try {
        await apiFetch("/api/profile", { method: "POST", body: { name } });
        feedback.classList.remove("hidden");
        setTimeout(() => feedback.classList.add("hidden"), 2000);
    } catch (err) {
        alert(`Couldn't save name: ${err.message}`);
    } finally {
        btn.disabled = false;
        spinner.classList.add("hidden");
    }
}

function wireProfileUI() {
    document.getElementById("profile-icon-btn").addEventListener("click", openProfileView);
    document.getElementById("profile-back-btn").addEventListener("click", () => {
        // Return to wherever they were — vertical select is the safe default
        showView("view-vertical-select");
        setActiveNav("ai");
    });
    document.getElementById("profile-save-name-btn").textContent = t("profile.save");
    document.getElementById("profile-save-name-btn").addEventListener("click", saveProfileName);
    document.getElementById("profile-display-name").addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveProfileName();
    });
}

// ---------------------------------------------------------------------------
// Language toast
// ---------------------------------------------------------------------------

function showLangToast(langCode) {
    const existing = document.getElementById("lang-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "lang-toast";
    toast.className = "fixed top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-gold text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gold/30 z-50 transition-opacity";
    toast.textContent = t("toast." + langCode);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 1800);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

wireAuthUI();
initVerticalGrid();
wireChatUI();
wireCaseDetailUI();
wireBottomNav();
wireProfileUI();

// Apply saved language on page load (before auth state resolves)
const _bootLang = localStorage.getItem("hfn_lang") || "en";
state.currentLanguage = _bootLang;
document.querySelectorAll(".lang-btn").forEach(b => {
    const active = b.dataset.lang === _bootLang;
    b.classList.toggle("bg-gold", active);
    b.classList.toggle("text-ink", active);
    b.classList.toggle("font-bold", active);
    b.classList.toggle("text-slate-400", !active);
});
applyTranslations(_bootLang);

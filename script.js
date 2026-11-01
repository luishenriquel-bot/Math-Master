// ============================
// MATH MASTER EVOLUTION
// ============================

const app = document.getElementById("app");

const PRACTICE_MODE_NO_LIFE_LOSS = true;

const AUDIO_FILES = {
    correct: "Efeitos sonoros/1.mp3",
    wrong: "Efeitos sonoros/2.mp3",
    victory: "Efeitos sonoros/3.mp3"
};

const SOUND_STORAGE_KEY = "mathmaster_sound_enabled";
const PROFILE_VERSION = 2;
const audioCache = {};
let soundEnabled = true;
let speechEnabled = false;

function getStoredSoundState() {
    try {
        const stored = localStorage.getItem(SOUND_STORAGE_KEY);
        if (stored === null) return true;
        return stored === "true";
    } catch (error) {
        return true;
    }

}

function buyPowerup(type) {
    if (!requireProfile()) return;
    const powerup = POWERUPS[type];
    if (!powerup) return;
    const gems = get(LS.gems, 0);
    if (gems < powerup.price) {
        showToast("Você não tem gemas suficientes.", "error");
        return;
    }
    if (type === "doubleXP" && hasDoubleXP()) {
        showToast("A poção de XP em dobro já está ativa.", "error");
        return;
    }
    set(LS.gems, gems - powerup.price);
    if (type === "freezeStreak") {
        set(LS.freezeStreak, get(LS.freezeStreak, 0) + 1);
        showToast("🧊 Congelador adicionado ao seu inventário!", "success");
    } else {
        set(LS.doubleXP, Date.now() + 15 * 60 * 1000);
        showToast("🧪 XP em dobro ativado por 15 minutos!", "success");
    }
    shop();
}

function persistSoundState() {
    try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch (error) {
        // Ignora falhas de armazenamento.
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    persistSoundState();

    const btn = document.getElementById("sound-toggle");
    if (btn) {
        btn.textContent = soundEnabled ? "🔊 Efeitos sonoros: ligados" : "🔇 Efeitos sonoros: desligados";
        btn.setAttribute("aria-pressed", String(soundEnabled));
    }
}

function updateSpeechButtons() {
    const homeButton = document.getElementById("speech-toggle");
    const gameButton = document.getElementById("speech-auto-toggle");
    const label = `🗣️ Leitura automática: ${speechEnabled ? "ligada" : "desligada"}`;

    [homeButton, gameButton].forEach(button => {
        if (!button) return;
        button.textContent = label;
        button.setAttribute("aria-pressed", String(speechEnabled));
    });
}

function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speakQuestion() {
    if (state.screen !== "game" || !state.currentQ) return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        showToast("Este navegador não oferece síntese de fala.", "error");
        return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(state.currentQ.q);
    utterance.lang = "pt-BR";
    const portugueseVoice = window.speechSynthesis.getVoices()
        .find(voice => voice.lang.toLowerCase() === "pt-br")
        || window.speechSynthesis.getVoices()
            .find(voice => voice.lang.toLowerCase().startsWith("pt"));
    if (portugueseVoice) utterance.voice = portugueseVoice;
    window.speechSynthesis.speak(utterance);
}

function toggleSpeech() {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        showToast("Este navegador não oferece síntese de fala.", "error");
        return;
    }

    speechEnabled = !speechEnabled;
    set(LS.speechEnabled, speechEnabled);
    updateSpeechButtons();
    if (speechEnabled && state.screen === "game") speakQuestion();
    else stopSpeech();
}

function getAudio(url) {
    if (!url) return null;

    if (!audioCache[url]) {
        try {
            const audio = new Audio(url);
            audio.preload = "auto";
            audio.volume = 0.15;
            audioCache[url] = audio;
        } catch (error) {
            return null;
        }
    }

    return audioCache[url];
}

function playAudio(src, volume = 0.15) {
    const audio = getAudio(src);
    if (!audio) return;

    try {
        audio.volume = Math.min(1, Math.max(0, Number(volume) || 0.15));
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => { });
        }
    } catch (error) {
        // Ignora falhas de autoplay ou de navegador sem interromper o jogo.
    }
}

function playEffectSound(type) {
    if (!soundEnabled) return;
    const sounds = {
        1: { file: AUDIO_FILES.correct, volume: 0.5 },
        2: { file: AUDIO_FILES.wrong, volume: 0.5 },
        3: { file: AUDIO_FILES.victory, volume: 0.7 }
    };

    const sound = sounds[type];
    if (!sound) return;

    playAudio(sound.file, sound.volume * (soundVolume / 0.15));
}

function playSound(type) {
    if (type === undefined || type === null || type === "") return;
    playEffectSound(type);
}

const LS = {
    profileName: "mm_profileName",
    profileClass: "mm_profileClass",
    profileAge: "mm_profileAge",
    profilePhoto: "mm_profilePhoto",
    profileCompleted: "mm_profileCompleted",
    xp: "mm_xp",
    level: "mm_level",
    lives: "mm_lives",
    streak: "mm_streak",
    lastLogin: "mm_lastLogin",
    ranking: "mm_ranking",
    totalAttempts: "mm_totalAttempts",
    totalCorrect: "mm_totalCorrect",
    totalWrong: "mm_totalWrong",
    practiceSessions: "mm_practiceSessions",
    gems: "mm_gems",
    dailyChallengeDate: "mm_dailyChallengeDate",
    bestCombo: "mm_bestCombo",
    totalXP: "mm_totalXP",
    soundVolume: "mm_soundVolume",
    theme: "mm_theme",
    reducedMotion: "mm_reducedMotion",
    speechEnabled: "mm_speechEnabled",
    hintsUsed: "mm_hintsUsed",
    achievements: "mm_achievements",
    lastLesson: "mm_lastLesson",
    freezeStreak: "mm_powerup_freezeStreak",
    doubleXP: "mm_powerup_doubleXP",
    profileVersion: "mm_profileVersion"
};

const POWERUPS = {
    freezeStreak: { price: 80, name: "Congelador de ofensiva", icon: "🧊" },
    doubleXP: { price: 100, name: "Poção de XP em dobro", icon: "🧪" }
};

let state = {
    screen: "home",
    lesson: null,
    questions: [],
    index: 0,
    currentQ: null,
    practiceMistakes: 0,
    wrongQuestions: [],
    combo: 0,
    bestCombo: 0,
    timerId: null,
    timeLeft: 300
    , answerLocked: false,
    sessionXP: 0,
    hintsUsed: 0,
    startedAt: 0,
    feedbackTimeout: null
};

let audioContext = null;
let toastTimeout = null;
let soundVolume = 0.15;
let reducedMotion = false;

const ACHIEVEMENTS = {
    firstCorrect: { title: "Primeiro passo", icon: "🌱", text: "Acertou sua primeira questão." },
    combo5: { title: "Combo de fogo", icon: "🔥", text: "Alcançou combo x5." },
    perfectLesson: { title: "Perfeição", icon: "🏆", text: "Concluiu uma lição sem erros." },
    dailyHero: { title: "Herói diário", icon: "🛡️", text: "Concluiu um desafio diário perfeito." },
    hundredXP: { title: "Centenário", icon: "💯", text: "Acumulou 100 XP." },
    explorer: { title: "Explorador", icon: "🧭", text: "Experimentou todas as lições." }
};

function showToast(message, type = "info") {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.remove(), 2800);
}

function applyPreferences() {
    document.documentElement.dataset.theme = get(LS.theme, "dark");
    reducedMotion = get(LS.reducedMotion, false) === true;
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
}

function toggleTheme() {
    const nextTheme = get(LS.theme, "dark") === "dark" ? "light" : "dark";
    set(LS.theme, nextTheme);
    applyPreferences();
    home();
}

function toggleReducedMotion() {
    set(LS.reducedMotion, !reducedMotion);
    applyPreferences();
    showToast(reducedMotion ? "Animações reduzidas." : "Animações ativadas.", "success");
}

function changeVolume(delta) {
    soundVolume = Math.min(1, Math.max(0.05, Math.round((soundVolume + delta) * 100) / 100));
    set(LS.soundVolume, soundVolume);
    showToast(`Volume: ${Math.round(soundVolume * 100)}%`);
}

function getAchievements() {
    return get(LS.achievements, []);
}

function unlockAchievement(id) {
    const unlocked = getAchievements();
    if (unlocked.includes(id)) return;
    unlocked.push(id);
    set(LS.achievements, unlocked);
    const achievement = ACHIEVEMENTS[id];
    if (achievement) {
        showToast(`${achievement.icon} Conquista: ${achievement.title}`, "success");
        addXP(5, false);
    }
}

function trackLesson(key) {
    const lessonsPlayed = get(LS.lastLesson, []);
    if (!lessonsPlayed.includes(key)) {
        lessonsPlayed.push(key);
        set(LS.lastLesson, lessonsPlayed);
    }
    if (lessonsPlayed.length >= Object.keys(lessons).length) unlockAchievement("explorer");
}

function getAccuracy() {
    const attempts = get(LS.totalAttempts, 0);
    return attempts ? Math.round((get(LS.totalCorrect, 0) / attempts) * 100) : 0;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[character]));
}

function hasLocalProfile() {
    return get(LS.profileCompleted, false) === true && get(LS.profileName, "").trim().length > 0;
}

function requireProfile() {
    if (hasLocalProfile()) return true;
    renderProfileScreen();
    showToast("Faça login criando seu perfil local para jogar.", "error");
    return false;
}

function getDoubleXPRemaining() {
    return Math.max(0, get(LS.doubleXP, 0) - Date.now());
}

function hasDoubleXP() {
    return getDoubleXPRemaining() > 0;
}

function getPowerupStatus() {
    const remaining = getDoubleXPRemaining();
    return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
}

function getProfile() {
    return {
        name: get(LS.profileName, ""),
        className: get(LS.profileClass, ""),
        age: get(LS.profileAge, ""),
        photo: get(LS.profilePhoto, "")
    };
}

function profileAvatar(profile, size = "large") {
    return profile.photo
        ? `<img class="profile-avatar ${size}" src="${escapeHtml(profile.photo)}" alt="Foto de perfil de ${escapeHtml(profile.name)}">`
        : `<div class="profile-avatar ${size} profile-avatar-placeholder" aria-label="Sem foto de perfil">👤</div>`;
}

function renderProfileScreen(editing = false) {
    clearQuestionTimer();
    const profile = getProfile();
    state.screen = "profile";
    app.innerHTML = `
        <div class="game profile-screen">
            <h2>${editing ? "✏️ Editar perfil" : "🔐 Login local obrigatório"}</h2>
            <p>${editing ? "Atualize seus dados. Eles ficam salvos somente neste dispositivo." : "Faça login criando seu perfil local para jogar. Não é preciso e-mail, senha ou conta online."}</p>
            <div class="profile-preview">${profileAvatar(profile)}</div>
            <form class="profile-form" onsubmit="saveProfile(event)">
                <label for="profile-name">Nome ou apelido *</label>
                <input id="profile-name" name="name" maxlength="40" required value="${escapeHtml(profile.name)}" placeholder="Como devemos chamar você?" autocomplete="name">
                <label for="profile-class">Turma (opcional)</label>
                <input id="profile-class" name="className" maxlength="30" value="${escapeHtml(profile.className)}" placeholder="Ex.: 7º ano A">
                <label for="profile-age">Idade (opcional)</label>
                <input id="profile-age" name="age" type="number" min="4" max="120" value="${escapeHtml(profile.age)}" placeholder="Sua idade">
                <label for="profile-photo">Foto de perfil (opcional)</label>
                <input id="profile-photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp">
                <small class="profile-note">A imagem será reduzida e salva apenas no armazenamento local do navegador.</small>
                <button type="submit">💾 Salvar perfil</button>
            </form>
            ${editing ? '<button class="secondary" onclick="home()">Cancelar</button>' : ""}
        </div>
    `;
    const photoInput = document.getElementById("profile-photo");
    if (photoInput) photoInput.addEventListener("change", previewProfilePhoto);
}

function previewProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        showToast("Escolha um arquivo de imagem válido.", "error");
        event.target.value = "";
        return;
    }
    if (file.size > 8 * 1024 * 1024) {
        showToast("A foto deve ter no máximo 8 MB.", "error");
        event.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const preview = document.querySelector(".profile-preview");
        if (preview) preview.innerHTML = `<img class="profile-avatar large" src="${reader.result}" alt="Prévia da foto de perfil">`;
    };
    reader.readAsDataURL(file);
}

function resizeProfilePhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Não foi possível ler a foto."));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("A foto não pôde ser carregada."));
            image.onload = () => {
                const maxSize = 320;
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

async function saveProfile(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.elements.name.value.trim();
    const className = form.elements.className.value.trim();
    const age = form.elements.age.value.trim();
    const photoFile = form.elements.photo.files[0];
    if (!name) {
        showToast("Digite um nome ou apelido para continuar.", "error");
        return;
    }
    if (age && (!Number.isInteger(Number(age)) || Number(age) < 4 || Number(age) > 120)) {
        showToast("Informe uma idade entre 4 e 120 anos.", "error");
        return;
    }
    try {
        set(LS.profileName, name);
        set(LS.profileClass, className);
        set(LS.profileAge, age);
        if (photoFile) set(LS.profilePhoto, await resizeProfilePhoto(photoFile));
        set(LS.profileCompleted, true);
        showToast("Perfil salvo neste dispositivo!", "success");
        home();
    } catch (error) {
        showToast("Não foi possível salvar essa foto. Tente outra imagem.", "error");
    }
}

function getAudioContext() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        audioContext = new AudioCtx();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => { });
    }

    return audioContext;
}

// ----------------------------
// STORAGE HELPERS
// ----------------------------
function get(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored === null ? fallback : JSON.parse(stored) ?? fallback;
    } catch (error) {
        return fallback;
    }
}
function set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // O jogo continua funcionando durante uma sessão sem armazenamento.
    }
}

// ----------------------------
// PLAYER SYSTEM
// ----------------------------
function initPlayer() {
    if (get(LS.xp, null) === null) set(LS.xp, 0);
    if (get(LS.level, null) === null) set(LS.level, 1);
    if (get(LS.lives, null) === null) set(LS.lives, 5);
    if (get(LS.profileVersion, null) === null) set(LS.profileVersion, PROFILE_VERSION);
    initStreak();
    initStats();
}
function addXP(amount, notify = true) {
    const multiplier = hasDoubleXP() ? 2 : 1;
    const awardedAmount = amount * multiplier;
    let xp = get(LS.xp, 0);
    xp += awardedAmount;
    set(LS.xp, xp);
    set(LS.totalXP, xp);
    updateLevel();
    if (notify) state.sessionXP += awardedAmount;
    if (multiplier > 1) showToast(`🧪 +${awardedAmount} XP (dobrado)`, "success");
    if (xp >= 100) unlockAchievement("hundredXP");
}
function updateLevel() {
    let xp = get(LS.xp, 0);
    let oldLevel = get(LS.level, 1);
    let newLevel = Math.floor(xp / 100) + 1;
    set(LS.level, newLevel);

    if (newLevel > oldLevel) {
        showLevelUpNotification(newLevel);
    }
}

function showLevelUpNotification(level) {
    const notification = document.createElement("div");
    notification.className = "level-up-notification";
    notification.textContent = `⭐ NÍVEL ${level}!`;
    notification.style.position = "fixed";
    notification.style.top = "20%";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 800);
}
function getLevelProgress() {
    let xp = get(LS.xp, 0);
    let currentLevel = Math.floor(xp / 100) + 1;
    let xpInLevel = xp % 100;
    let xpToNext = 100;
    let percent = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
    return { level: currentLevel, xpInLevel, xpToNext, percent };
}

function loseLife() {
    let lives = get(LS.lives, 5);
    lives = Math.max(0, lives - 1);
    set(LS.lives, lives);
}

function formatTime(seconds) {
    const minutes = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, "0");
    const remainingSeconds = (Math.max(0, seconds) % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

function clearQuestionTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function clearFeedbackTimeout() {
    if (state.feedbackTimeout) {
        clearTimeout(state.feedbackTimeout);
        state.feedbackTimeout = null;
    }
}

function startQuestionTimer() {
    clearQuestionTimer();
    state.timeLeft = 300;

    const timerEl = document.getElementById("question-timer");
    if (timerEl) {
        timerEl.textContent = `⏱️ ${formatTime(state.timeLeft)}`;
    }

    state.timerId = setInterval(() => {
        state.timeLeft -= 1;
        const timerEl = document.getElementById("question-timer");
        if (timerEl) {
            timerEl.textContent = `⏱️ ${formatTime(state.timeLeft)}`;
            timerEl.classList.toggle("warning", state.timeLeft <= 30);
        }

        if (state.timeLeft <= 0) {
            clearQuestionTimer();
            resolveAnswer(false, true);
        }
    }, 1000);
}

// ----------------------------
// STREAK SYSTEM
// ----------------------------
function initStreak() {
    let last = get(LS.lastLogin, null);
    let streak = get(LS.streak, 0);
    let today = new Date().toDateString();
    if (last !== today) {
        if (last !== null) {
            let lastDate = new Date(last);
            const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            const todayDay = new Date();
            const diff = Math.round((todayDay.setHours(0, 0, 0, 0) - lastDay.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                streak++;
            } else if (diff > 1 && get(LS.freezeStreak, 0) > 0) {
                set(LS.freezeStreak, get(LS.freezeStreak, 0) - 1);
                showToast("🧊 Seu congelador protegeu a ofensiva!", "success");
            } else {
                streak = 1;
            }
        } else {
            streak = 1;
        }
        set(LS.streak, streak);
        set(LS.lastLogin, today);
    }
}

function initStats() {
    if (get(LS.profileCompleted, null) === null) set(LS.profileCompleted, false);
    if (get(LS.profileName, null) === null) set(LS.profileName, "");
    if (get(LS.profileClass, null) === null) set(LS.profileClass, "");
    if (get(LS.profileAge, null) === null) set(LS.profileAge, "");
    if (get(LS.profilePhoto, null) === null) set(LS.profilePhoto, "");
    if (get(LS.totalAttempts, null) === null) set(LS.totalAttempts, 0);
    if (get(LS.totalCorrect, null) === null) set(LS.totalCorrect, 0);
    if (get(LS.totalWrong, null) === null) set(LS.totalWrong, 0);
    if (get(LS.practiceSessions, null) === null) set(LS.practiceSessions, 0);
    if (get(LS.gems, null) === null) set(LS.gems, 0);
    if (get(LS.dailyChallengeDate, null) === null) set(LS.dailyChallengeDate, "");
    if (get(LS.bestCombo, null) === null) set(LS.bestCombo, 0);
    if (get(LS.totalXP, null) === null) set(LS.totalXP, get(LS.xp, 0));
    if (get(LS.soundVolume, null) === null) set(LS.soundVolume, 0.15);
    if (get(LS.theme, null) === null) set(LS.theme, "dark");
    if (get(LS.reducedMotion, null) === null) set(LS.reducedMotion, false);
    if (get(LS.speechEnabled, null) === null) set(LS.speechEnabled, false);
    if (get(LS.hintsUsed, null) === null) set(LS.hintsUsed, 0);
    if (get(LS.achievements, null) === null) set(LS.achievements, []);
    if (get(LS.lastLesson, null) === null) set(LS.lastLesson, []);
    if (get(LS.freezeStreak, null) === null) set(LS.freezeStreak, 0);
    if (get(LS.doubleXP, null) === null) set(LS.doubleXP, 0);
}

function normalizeAnswer(value) {
    return String(value).trim().toLowerCase().replace(/,/g, ".").replace(/\s+/g, "");
}

function fractionValue(value) {
    const parts = normalizeAnswer(value).split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1] || Number(parts[1]) === 0) return null;
    const numerator = Number(parts[0]);
    const denominator = Number(parts[1]);
    return Number.isFinite(numerator) && Number.isFinite(denominator) ? numerator / denominator : null;
}

function answersMatch(value, expected) {
    const normalizedValue = normalizeAnswer(value);
    const normalizedExpected = normalizeAnswer(expected);
    if (normalizedValue === normalizedExpected) return true;
    const valueFraction = fractionValue(value);
    const expectedFraction = fractionValue(expected);
    if (valueFraction !== null && expectedFraction !== null) return Math.abs(valueFraction - expectedFraction) < 0.000001;
    const numericValue = Number(normalizedValue);
    const numericExpected = Number(normalizedExpected);
    return Number.isFinite(numericValue) && Number.isFinite(numericExpected) && numericValue === numericExpected;
}

function recordAnswer(correct) {
    let attempts = get(LS.totalAttempts, 0) + 1;
    let correctCount = get(LS.totalCorrect, 0);
    let wrongCount = get(LS.totalWrong, 0);

    if (correct) correctCount++;
    else wrongCount++;

    set(LS.totalAttempts, attempts);
    set(LS.totalCorrect, correctCount);
    set(LS.totalWrong, wrongCount);
}

function recordPracticeSession() {
    let sessions = get(LS.practiceSessions, 0) + 1;
    set(LS.practiceSessions, sessions);
}

function showStats() {
    if (!requireProfile()) return;
    let attempts = get(LS.totalAttempts, 0);
    let correct = get(LS.totalCorrect, 0);
    let wrong = get(LS.totalWrong, 0);
    let sessions = get(LS.practiceSessions, 0);
    let gems = get(LS.gems, 0);
    let accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const achievements = getAchievements();
    const profile = getProfile();

    const progress = getLevelProgress();
    app.innerHTML = `
        <div class="game stats">
            <div class="profile-card">
                ${profileAvatar(profile, "small")}
                <div><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.className || "Estudante")}</span></div>
                <button class="secondary compact-button" onclick="renderProfileScreen(true)">✏️ Editar perfil</button>
            </div>
            <h2>📊 Estatísticas</h2>
            <div class="progress-bar" title="${progress.xpInLevel}/${progress.xpToNext} XP para o próximo nível">
                <div class="progress-fill" style="width: ${progress.percent}%;"></div>
            </div>
            <p class="progress-text">Progresso para o nível ${progress.level + 1}: ${progress.percent}%</p>
            <div class="stat-row"><span>XP acumulado</span><span>${get(LS.xp, 0)}</span></div>
            <div class="stat-row"><span>Nível atual</span><span>${get(LS.level, 1)}</span></div>
            <div class="stat-row"><span>Gemas</span><span>💎 ${gems}</span></div>
            <div class="stat-row"><span>Vidas</span><span>${get(LS.lives, 5)}</span></div>
            <div class="stat-row"><span>Sequência diária</span><span>${get(LS.streak, 1)}</span></div>
            <div class="stat-row"><span>Questões tentadas</span><span>${attempts}</span></div>
            <div class="stat-row"><span>Acertos</span><span>${correct}</span></div>
            <div class="stat-row"><span>Erros</span><span>${wrong}</span></div>
            <div class="stat-row"><span>Precisão</span><span>${accuracy}%</span></div>
            <div class="stat-row"><span>Sessões de prática</span><span>${sessions}</span></div>
            <div class="stat-row"><span>Melhor combo</span><span>🔥 x${get(LS.bestCombo, 0)}</span></div>
            <div class="stat-row"><span>Dicas usadas</span><span>💡 ${get(LS.hintsUsed, 0)}</span></div>
            <div class="stat-row"><span>Congeladores</span><span>🧊 ${get(LS.freezeStreak, 0)}</span></div>
            <div class="stat-row"><span>Poção de XP</span><span>${getPowerupStatus() ? `🧪 ${getPowerupStatus()} min` : "Desativada"}</span></div>
            <h3 class="section-title">Conquistas (${achievements.length}/${Object.keys(ACHIEVEMENTS).length})</h3>
            <div class="achievement-grid">
                ${Object.entries(ACHIEVEMENTS).map(([id, achievement]) => `
                    <div class="achievement ${achievements.includes(id) ? "unlocked" : ""}" title="${achievement.text}">
                        <span>${achievements.includes(id) ? achievement.icon : "🔒"}</span>
                        <strong>${achievement.title}</strong>
                    </div>
                `).join("")}
            </div>
            <div class="profile-actions">
                <button onclick="exportProfile()">⬇️ Exportar progresso</button>
                <button onclick="document.getElementById('profile-file').click()">⬆️ Importar progresso</button>
                <input id="profile-file" type="file" accept="application/json" hidden onchange="importProfile(event)">
            </div>
            <button onclick="home()">Voltar ao Início</button>
            <button onclick="resetStats()">Redefinir estatísticas</button>
        </div>
    `;
}

function resetStats() {
    if (!requireProfile()) return;
    if (!confirm("Deseja redefinir as estatísticas do jogador?")) return;
    set(LS.totalAttempts, 0);
    set(LS.totalCorrect, 0);
    set(LS.totalWrong, 0);
    set(LS.practiceSessions, 0);
    set(LS.gems, 0);
    set(LS.dailyChallengeDate, "");
    set(LS.bestCombo, 0);
    set(LS.totalXP, 0);
    set(LS.hintsUsed, 0);
    set(LS.achievements, []);
    set(LS.lastLesson, []);
    set(LS.freezeStreak, 0);
    set(LS.doubleXP, 0);
    set(LS.xp, 0);
    set(LS.level, 1);
    set(LS.lives, 5);
    set(LS.streak, 1);
    set(LS.profileVersion, PROFILE_VERSION);
    home();
}

function exportProfile() {
    const profile = { version: PROFILE_VERSION, exportedAt: new Date().toISOString(), data: {} };
    Object.values(LS).forEach(key => profile.data[key] = get(key, null));
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mathmaster-progresso.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

function importProfile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const profile = JSON.parse(reader.result);
            if (!profile.data || typeof profile.data !== "object") throw new Error("Perfil inválido");
            Object.values(LS).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(profile.data, key)) set(key, profile.data[key]);
            });
            speechEnabled = get(LS.speechEnabled, false);
            alert("Progresso importado com sucesso.");
            home();
        } catch (error) {
            alert("Não foi possível importar esse arquivo de progresso.");
        }
    };
    reader.readAsText(file);
}

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

function hasDoneDailyChallenge() {
    return get(LS.dailyChallengeDate, "") === getTodayString();
}

function markDailyChallengeDone() {
    set(LS.dailyChallengeDate, getTodayString());
}

function dailyChallenge() {
    if (!requireProfile()) return;
    if (hasDoneDailyChallenge()) {
        alert("Você já completou o desafio diário hoje. Volte amanhã para tentar novamente.");
        return;
    }

    state.screen = "game";
    state.lesson = "daily";
    state.index = 0;
    state.practiceMistakes = 0;
    state.dailyMistakes = 0;
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.sessionXP = 0;
    state.startedAt = Date.now();

    let pool = [].concat(
        lessons.subtracao.q,
        lessons.multiplicacao.q,
        lessons.divisao.q,
        lessons.adicao.q,
        lessons.decimal.q,
        lessons.frac.q,
        lessons.geo.q,
        lessons.equacoes.q,
    );

    state.questions = shuffle(pool).slice(0, 6);
    next();
}

function finishDailyChallenge() {
    playSound(3);
    if (state.dailyMistakes === 0) unlockAchievement("dailyHero");

    let lives = get(LS.lives, 0);
    let gems = get(LS.gems, 0);
    let rewardXP = state.dailyMistakes === 0 ? 30 : 10;
    let rewardLives = state.dailyMistakes === 0 ? 2 : 1;
    let rewardGems = 5;
    set(LS.lives, lives + rewardLives);
    addXP(rewardXP);
    set(LS.gems, gems + rewardGems);
    markDailyChallengeDone();

    app.innerHTML = `
        <div class="game">
            <h2>Desafio diário concluído</h2>
            <p>✅ Você ganhou +${rewardLives} vida(s) e +${rewardXP} XP.</p>
            <p>💎 Você ganhou +${rewardGems} gemas por completar o desafio diário.</p>
            ${state.dailyMistakes === 0
            ? "<p>🌟 Parabéns! Você respondeu corretamente a todas as questões do desafio diário.</p>"
            : `<p>📝 Você teve ${state.dailyMistakes} erro(s). Tente novamente amanhã para ganhar o prêmio perfeito.</p>`}
            <button onclick="home()">Voltar ao Início</button>
        </div>
    `;
}

function validateQuestion(question) {
    return question && typeof question.q === "string" && question.q.trim() && question.a !== undefined;
}

function finishLesson() {
    playSound(3);
    if (state.wrongQuestions.length === 0) unlockAchievement("perfectLesson");

    const totalXPGained = state.combo * 3 + 10;

    // Dá 50 gemas ao concluir a lição
    let gems = get(LS.gems, 0);
    set(LS.gems, gems + 50);

    app.innerHTML = `
        <div class="game">
            <h2>🎉 Lição Concluída!</h2>
            <div class="stat-row"><span>Melhor Combo</span><span>🔥 x${state.bestCombo}</span></div>
            <div class="stat-row"><span>XP Total</span><span>${totalXPGained}</span></div>
            <div class="stat-row"><span>💎 Gemas Ganhas</span><span>+50</span></div>
            <div class="stat-row"><span>Gemas Totais</span><span>💎 ${get(LS.gems, 0)}</span></div>
            <div class="stat-row"><span>Vidas Restantes</span><span>❤️ ${get(LS.lives, 5)}</span></div>
            <p>Continue praticando e melhorando seu combo!</p>
            <button onclick="home()">Voltar ao Início</button>
        </div>
    `;

    state.combo = 0;
    state.bestCombo = 0;
}

// ----------------------------
// LESSONS
// ----------------------------
const lessons = {
    geo: {
        title: "Sólidos Geométricos", q: [
            { q: "Quantas faces tem um cubo?", a: "6", img: "assets/cubo-face-aresta-vertice.webp" },
            { q: "Quantas arestas tem um cubo?", a: "12", img: "assets/cubo-face-aresta-vertice.webp" },
            { q: "Um tetraedro possui 6 arestas e 4 faces. Usando a Relação de Euler, quantos vértices ele possui?", a: "4", img: "https://www.shutterstock.com/image-vector/geometry-net-tetrahedron-3d-solid-260nw-2171588313.jpg" },
            { q: "Um octaedro possui 12 arestas e 8 faces. Usando a Relação de Euler, quantos vértices ele possui?", a: "6", img: "https://thumbs.dreamstime.com/b/ilustra%C3%A7%C3%A3o-vintage-de-octaedro-163311004.jpg" },
            { q: "Quantas faces tem um dodecaedro?", a: "12", img: "https://sabermatematica.com.br/wp-content/uploads/2019/06/planificacao-do-dodecaedro-regular.png" }
        ]

    },

    divisao: {
        title: "Divisão", q: [
            { q: "Quanto é 144 ÷ 12?", a: "12" },
            { q: "Quanto é 100 ÷ 4?", a: "25" },
            { q: "Quanto é 81 ÷ 9?", a: "9" },
            { q: "Quanto é 1000 ÷ 25?", a: "40" },
            { q: "Quanto é 500 ÷ 5?", a: "100" },
            { q: "Quanto é 72 ÷ 8?", a: "9" },
            { q: "Quanto é 90 ÷ 3?", a: "30" },
            { q: "Quanto é 120 ÷ 15?", a: "8" },
            { q: "Quanto é 200 ÷ 4?", a: "50" },
            { q: "Quanto é 10000 ÷ 100?", a: "100" }
        ]
    },
    adicao: {
        title: "Adição", q: [
            { q: "Quanto é 123 + 456?", a: "579" },
            { q: "Quanto é 789 + 321?", a: "1110" },
            { q: "Quanto é 1000 + 250?", a: "1250" },
            { q: "Quanto é 500 + 750?", a: "1250" },
            { q: "Quanto é 2000 + 3000?", a: "5000" },
            { q: "Quanto é 1500 + 2500?", a: "4000" },
            { q: "Quanto é 10000 + 5000?", a: "15000" },
            { q: "Quanto é 750 + 1250?", a: "2000" },
            { q: "Quanto é 600 + 400?", a: "1000" },
            { q: "Quanto é 800 + 1200?", a: "2000" }
        ]
    },
    multiplicacao: {
        title: "Multiplicação", q: [
            { q: "Quanto é 12 x 15?", a: "180" },
            { q: "Quanto é 25 x 4?", a: "100" },
            { q: "Quanto é 33 x 3?", a: "99" },
            { q: "Quanto é 50 x 20?", a: "1000" },
            { q: "Quanto é 100 x 25?", a: "2500" },
            { q: "Quanto é 75 x 8?", a: "600" },
            { q: "Quanto é 60 x 12?", a: "720" },
            { q: "Quanto é 45 x 9?", a: "405" },
            { q: "Quanto é 80 x 15?", a: "1200" },
            { q: "Quanto é 100 x 100?", a: "10000" }
        ]
    },
    subtracao: {
        title: "Subtração", q: [
            { q: "Quanto é 1512 - 415?", a: "1097" },
            { q: "Quanto é 1555 - 777?", a: "778" },
            { q: "Quanto é 1000 - 1?", a: "999" },
            { q: "Quanto é 5000 - 2500?", a: "2500" },
            { q: "Quanto é 15226 - 5255?", a: "9971" },
            { q: "Quanto é 10000 - 452?", a: "9548" },
            { q: "Quanto é 2000 - 1456?", a: "544" },
            { q: "Quanto é 3000 - 1356?", a: "1644" },
            { q: "Quanto é 4000 - 1588?", a: "2412" },
            { q: "Quanto é 5000 - 1578?", a: "3422" }
        ]
    },
    decimal: {
        title: "Sistema Decimal", q: [
            { q: "No número 14582, qual é o valor do algarismo 4?", a: "4000" },
            { q: "No número 15756, qual é o valor do algarismo 7?", a: "700" },
            { q: "No número 15268, qual é o valor do algarismo 1?", a: "10000" },
            { q: "No número 5894, qual é o valor do algarismo 5?", a: "5000" },
            { q: "Qual número decimal equivale a fração 1/4?", a: "0,25" },
            { q: "Qual número decimal equivale a fração 3/5?", a: "0,6" },
            { q: "Qual número decimal equivale a fração 7/8?", a: "0,875" },
        ]
    },

    frac: {
        title: "Frações", q: [
            { q: "Complete a fração: 2/3 = __/12", a: "8/12" },
            { q: "Qual fração é equivalente a 4/5? (escolha: 8/10, 8/9, 6/10)", a: "8/10" },
            { q: "Escreva uma fração equivalente a 7/9.", a: "14/18" },
            { q: "3/8 + 2/8 = ?", a: "5/8" },
            { q: "5/6 + 1/6 = ?", a: "1" },
            { q: "1/2 + 1/4 = ?", a: "3/4" },
            { q: "2/3 + 5/6 = ? (use fração imprópria)", a: "6/9" },
            { q: "7/10 - 3/10 = ?", a: "4/10" },
            { q: "5/6 - 1/3 = ?", a: "3/6" },
            { q: "7/8 - 1/4 = ?", a: "5/8" }

        ]

    },
    equacoes: {
        title: "Equações", q: [
            { q: "Resolva a equação: x mais 5 é igual a 12.", a: "7" },
            { q: "Resolva a equação: x menos 8 é igual a 3.", a: "11" },
            { q: "Resolva a equação: 2 vezes x é igual a 18.", a: "9" },
            { q: "Resolva a equação: 3 vezes x mais 2 é igual a 14.", a: "4" },
            { q: "Resolva a equação: x dividido por 4 é igual a 6.", a: "24" },
            { q: "Resolva a equação: 5 vezes x menos 10 é igual a 20.", a: "6" },
            { q: "Resolva a equação: 2 vezes x mais 7 é igual a 19.", a: "6" },
            { q: "Resolva a equação: 4 vezes x menos 5 é igual a 15.", a: "5" }
        ]
    }
};

// ----------------------------
// HOME SCREEN
// ----------------------------
function home() {
    clearQuestionTimer();
    clearFeedbackTimeout();
    stopSpeech();
    state.screen = "home";
    const progress = getLevelProgress();
    const dailyDone = hasDoneDailyChallenge();
    const profile = getProfile();
    app.innerHTML = `
        <div class="home">
            <h1>🧮 MathMaster</h1>
            <div class="home-profile">
                ${profileAvatar(profile, "small")}
                <div><strong>Olá, ${escapeHtml(profile.name)}!</strong><span>${escapeHtml(profile.className || "Pronto para aprender?")}</span></div>
                <button class="secondary compact-button" onclick="renderProfileScreen(true)">✏️ Editar</button>
            </div>
            <p class="welcome">Escolha um desafio e evolua um pouco a cada rodada.</p>
            <div class="quick-settings" aria-label="Preferências rápidas">
                <button class="secondary compact-button" onclick="toggleTheme()">🌓 Tema ${get(LS.theme, "dark") === "dark" ? "claro" : "escuro"}</button>
                <button class="secondary compact-button" onclick="toggleReducedMotion()">✨ ${reducedMotion ? "Animações" : "Movimento"} ${reducedMotion ? "ativadas" : "reduzido"}</button>
                <button id="speech-toggle" class="secondary compact-button" onclick="toggleSpeech()" aria-pressed="${speechEnabled}">🗣️ Leitura automática: ${speechEnabled ? "ligada" : "desligada"}</button>
                <button class="secondary compact-button" onclick="changeVolume(0.05)">🔊 Volume +</button>
                <button class="secondary compact-button" onclick="changeVolume(-0.05)">🔉 Volume −</button>
            </div>
            <button id="sound-toggle" onclick="toggleSound()" aria-pressed="${soundEnabled}">${soundEnabled ? "🔊 Efeitos sonoros: ligados" : "🔇 Efeitos sonoros: desligados"}</button>
            <div class="dashboard-cards" aria-label="Resumo do jogador">
                <span>⭐ Nível ${get(LS.level, 1)}</span>
                <span>⚡ ${get(LS.xp, 0)} XP</span>
                <span>❤️ ${get(LS.lives, 5)} vidas</span>
                <span>🔥 ${get(LS.streak, 1)} dias</span>
                <span>💎 ${get(LS.gems, 0)} gemas</span>
                <span>🎯 ${getAccuracy()}% precisão</span>
            </div>
            ${hasDoubleXP() ? `<div class="powerup-active">🧪 XP em dobro ativo por mais ${getPowerupStatus()} minuto(s)</div>` : ""}
            <div class="progress-bar" title="${progress.xpInLevel}/${progress.xpToNext} XP para o próximo nível">
                <div class="progress-fill" style="width: ${progress.percent}%;"></div>
            </div>
            <p class="progress-text">Progresso para o nível ${progress.level + 1}: ${progress.percent}%</p>
            <h3>Escolha uma lição</h3>
            ${Object.keys(lessons).map(k => `<button onclick="start('${k}')">${lessons[k].title}</button>`).join("")}
            <hr>
            <button onclick="practice()">💡 Praticar (ganhar vidas)</button>
            <button ${dailyDone ? "disabled" : ""} onclick="dailyChallenge()">🛡️ Desafio Diário</button>
            <button onclick="shop()">🏪 Loja de Vidas</button>
            <button class="secondary" onclick="showStats()">📊 Ver estatísticas</button>
            <p class="daily-status">${dailyDone ? "✅ Desafio diário concluído. Volte amanhã para manter sua sequência!" : "🎯 Desafio diário disponível: tente uma vez por dia."}</p>
            <div class="achievement-summary">🏅 ${getAchievements().length}/${Object.keys(ACHIEVEMENTS).length} conquistas desbloqueadas</div>
        </div>
    `;
}

function shop() {
    if (!requireProfile()) return;
    let gems = get(LS.gems, 0);
    const freezeCount = get(LS.freezeStreak, 0);
    const xpRemaining = getPowerupStatus();
    app.innerHTML = `
        <div class="game shop">
            <h2>🏪 Loja e Power-ups</h2>
            <p>Você tem 💎 ${gems} gemas.</p>
            <div class="shop-item">
                <div>
                    <h3>Recarga de 5 vidas</h3>
                    <p>Preço: 50 gemas</p>
                </div>
                <button onclick="buyLives()" ${gems < 50 ? "disabled" : ""}>Comprar</button>
            </div>
            <div class="shop-item">
                <div>
                    <h3>🧊 Congelador de ofensiva</h3>
                    <p>Protege sua sequência contra um dia sem jogar. Você tem: ${freezeCount}.</p>
                    <small>Preço: 80 gemas</small>
                </div>
                <button onclick="buyPowerup('freezeStreak')" ${gems < POWERUPS.freezeStreak.price ? "disabled" : ""}>Comprar</button>
            </div>
            <div class="shop-item">
                <div>
                    <h3>🧪 Poção de XP em dobro</h3>
                    <p>${xpRemaining ? `Ativa por mais ${xpRemaining} minuto(s).` : "Dobra todo XP ganho por 15 minutos."}</p>
                    <small>Preço: 100 gemas</small>
                </div>
                <button onclick="buyPowerup('doubleXP')" ${gems < POWERUPS.doubleXP.price || xpRemaining ? "disabled" : ""}>Comprar</button>
            </div>
            <div class="shop-help">
                <p>Os power-ups e o progresso ficam salvos somente neste dispositivo.</p>
            </div>
            <button onclick="home()">Voltar ao Início</button>
        </div>
    `;
}

function buyLives() {
    let gems = get(LS.gems, 0);
    if (gems < 50) {
        alert("Você não tem gemas suficientes.");
        return;
    }
    let lives = get(LS.lives, 0);
    set(LS.gems, gems - 50);
    set(LS.lives, lives + 5);
    alert("Compra realizada! Você recebeu 5 vidas.");
    home();
}


// ----------------------------
// START LESSON
// ----------------------------
function start(key) {
    if (!requireProfile()) return;
    if (get(LS.lives, 0) <= 0) {
        alert("⚠ Você não tem mais vidas! Use o modo Prática para recuperar.");
        return;
    }
    state.screen = "game";
    state.lesson = key;
    state.index = 0;
    state.questions = shuffle([...lessons[key].q]).filter(validateQuestion);
    if (!state.questions.length) return home();
    state.wrongQuestions = [];
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.sessionXP = 0;
    state.startedAt = Date.now();
    trackLesson(key);
    next();
}

// ----------------------------
// QUESTION ENGINE
// ----------------------------
function next() {
    stopSpeech();
    let q = state.questions[state.index];
    if (!q) return home();
    state.currentQ = q;
    state.answerLocked = false;

    const title = state.lesson === "practice"
        ? "Prática"
        : state.lesson === "daily"
            ? "Desafio Diário"
            : lessons[state.lesson]?.title || "Lição";

    const progressPercent = Math.round((state.index / state.questions.length) * 100);
    app.innerHTML = `
        <div class="game">
            <h2>${title}</h2>
            <div class="lesson-progress" aria-label="Progresso da lição">
                <div class="lesson-progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="question-meta-row">
                <span id="question-timer" class="question-meta" aria-live="off">⏱️ ${formatTime(300)}</span>
                <span class="question-meta">Questão ${state.index + 1} de ${state.questions.length}</span>
                <span class="question-meta">🔥 Combo x${state.combo}</span>
            </div>
            ${q.img ? `<img src="${q.img}" width="160" alt="Imagem relacionada à questão" onerror="this.hidden=true; document.getElementById('image-note').hidden=false;"> <p id="image-note" class="image-note" hidden>Imagem indisponível.</p>` : ""}
            <p id="question-text" class="question-text">${q.q}</p>
            <div class="speech-controls" aria-label="Controles de síntese de fala">
                <button class="secondary" onclick="speakQuestion()" type="button">🔊 Ouvir pergunta</button>
                <button id="speech-auto-toggle" class="secondary" onclick="toggleSpeech()" type="button" aria-pressed="${speechEnabled}">🗣️ Leitura automática: ${speechEnabled ? "ligada" : "desligada"}</button>
            </div>
            <label for="ans">Sua resposta</label>
            <input id="ans" aria-describedby="question-text" placeholder="Digite sua resposta" autocomplete="off">
            <div class="answer-actions">
                <button id="answer-button" onclick="check()">Responder</button>
                <button class="secondary hint-button" onclick="showHint()" type="button">💡 Dica</button>
            </div>
            <p id="hint-text" class="hint-text" hidden></p>
            <div id="fb" role="status" aria-live="polite"></div>
            <button class="secondary compact-button lesson-home-button" onclick="home()" type="button">🏠 Início</button>
        </div>
    `;
    document.getElementById("ans").addEventListener("keydown", e => {
        if (e.key === "Enter") check();
    });
    startQuestionTimer();
    if (speechEnabled) speakQuestion();
    document.getElementById("ans").focus();
}

function showHint() {
    if (state.answerLocked || !state.currentQ) return;
    const hint = document.getElementById("hint-text");
    if (!hint) return;
    const answer = String(state.currentQ.a);
    const hintValue = answer.length > 2 ? `${answer[0]}${"•".repeat(Math.max(1, answer.length - 2))}${answer[answer.length - 1]}` : "Pense com calma e revise a operação.";
    hint.textContent = `💡 Dica: ${hintValue}`;
    hint.hidden = false;
    state.hintsUsed++;
    set(LS.hintsUsed, get(LS.hintsUsed, 0) + 1);
}

// ----------------------------
// CHECK ANSWER
// ----------------------------
function resolveAnswer(correct, timedOut = false) {
    if (state.answerLocked) return;
    state.answerLocked = true;
    stopSpeech();
    clearQuestionTimer();
    let fb = document.getElementById("fb");
    const answerButton = document.getElementById("answer-button");
    const answerInput = document.getElementById("ans");
    if (answerButton) answerButton.disabled = true;
    if (answerInput) answerInput.disabled = true;

    if (correct) {
        playSound(1);
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        set(LS.bestCombo, Math.max(get(LS.bestCombo, 0), state.bestCombo));
        unlockAchievement("firstCorrect");
        if (state.combo >= 5) unlockAchievement("combo5");
        addXP(10 + (state.combo - 1) * 3);
        recordAnswer(true);
        fb.innerText = state.combo > 1 ? `✔ Correto! Combo x${state.combo}` : "✔ Correto!";
        fb.className = "correct";
        state.feedbackTimeout = setTimeout(() => {
            state.feedbackTimeout = null;
            const isLastQuestion = state.index + 1 >= state.questions.length;
            state.index++;
            if (isLastQuestion) {
                if (state.lesson === "practice") {
                    finishPracticeSession();
                } else if (state.lesson === "daily") {
                    finishDailyChallenge();
                } else {
                    finishLesson();
                }
            } else {
                next();
            }
        }, 800);
        return;
    }

    state.wrongQuestions.push(state.currentQ);
    playSound(2);
    state.combo = 0;
    recordAnswer(false);
    if (state.lesson === "practice") {
        state.practiceMistakes++;
        if (!PRACTICE_MODE_NO_LIFE_LOSS) {
            loseLife();
        }
    } else if (state.lesson === "daily") {
        state.dailyMistakes++;
    } else {
        loseLife();
    }

    fb.innerText = timedOut ? "⏰ Tempo esgotado!" : "✖ Errado!";
    fb.className = "wrong";

    let livesNow = get(LS.lives, 0);
    if (livesNow <= 0) {
        fb.innerHTML = `
            <div class="fb-message">⚠ Você não tem mais vidas! O Math Master encerrou a lição.</div>
            <div class="fb-actions">
                <button class="fb-btn-back" onclick="home()">Voltar ao Início</button>
                <button class="fb-btn-practice" onclick="practice()">Ir para Prática (ganhar vidas)</button>
            </div>
        `;
        fb.className = "wrong";
        return;
    }

    state.feedbackTimeout = setTimeout(() => {
        state.feedbackTimeout = null;
        const isLastQuestion = state.index + 1 >= state.questions.length;
        state.index++;
        if (isLastQuestion) {
            if (state.lesson === "practice") {
                finishPracticeSession();
            } else if (state.lesson === "daily") {
                finishDailyChallenge();
            } else {
                finishLesson();
            }
        } else {
            next();
        }
    }, 800);
}

function check() {
    if (state.answerLocked) return;
    let val = document.getElementById("ans").value.trim();
    let q = state.currentQ;
    if (!val) {
        const fb = document.getElementById("fb");
        fb.innerText = "Digite uma resposta antes de continuar.";
        fb.className = "wrong";
        return;
    }
    resolveAnswer(answersMatch(val, q.a), false);
}

// ----------------------------
// PRACTICE MODE
// ----------------------------
function finishPracticeSession() {
    let lives = get(LS.lives, 0);
    set(LS.lives, lives + 1);
    recordPracticeSession();

    app.innerHTML = `
        <div class="game">
            <h2>Prática concluída</h2>
            <p>✅ Você ganhou +1 vida por concluir a sessão de prática.</p>
            ${state.practiceMistakes > 0
            ? `<p>📝 Você errou ${state.practiceMistakes} questão(ões). Revise abaixo:</p><div class="review-list">${state.wrongQuestions.map(question => `<div class="review-item"><strong>${question.q}</strong><span>Resposta: ${question.a}</span></div>`).join("")}</div>`
            : "<p>🌟 Excelente! Você respondeu bem a todas as questões da prática.</p>"}
            <button onclick="home()">Voltar ao Início</button>
        </div>
    `;
}

function practice() {
    if (!requireProfile()) return;
    state.screen = "game";
    state.lesson = "practice";
    state.index = 0;
    state.practiceMistakes = 0;
    state.wrongQuestions = [];
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    let pool = [].concat(
        lessons.subtracao.q,
        lessons.multiplicacao.q,
        lessons.divisao.q,
        lessons.adicao.q,
        lessons.decimal.q,
        lessons.frac.q,
        lessons.geo.q,
        lessons.equacoes.q
    );

    state.questions = shuffle(pool.filter(validateQuestion)).slice(0, 5);

    next();
}

// ----------------------------
// UTILS
// ----------------------------
function shuffle(arr) {
    for (let index = arr.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
    }
    return arr;
}

// Inicialização do jogo
soundEnabled = getStoredSoundState();
soundVolume = get(LS.soundVolume, 0.15);
speechEnabled = get(LS.speechEnabled, false);
applyPreferences();
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state.screen !== "home") {
        home();
        return;
    }
    if (event.key.toLowerCase() === "h" && state.currentQ && document.activeElement && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        showHint();
    }
});
initPlayer();
if (hasLocalProfile()) home();
else renderProfileScreen();
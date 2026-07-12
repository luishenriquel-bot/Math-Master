// ============================
// MATHMASTER EVOLUTION
// ============================

const app = document.getElementById("app");

const PRACTICE_MODE_NO_LIFE_LOSS = true;

const LS = {
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
    dailyChallengeDate: "mm_dailyChallengeDate"
};

let state = {
    screen: "home",
    lesson: null,
    questions: [],
    index: 0,
    currentQ: null,
    practiceMistakes: 0,
    combo: 0,
    bestCombo: 0,
    timerId: null,
    timeLeft: 300
};

// ----------------------------
// STORAGE HELPERS
// ----------------------------
function get(key, fallback) {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
}
function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ----------------------------
// PLAYER SYSTEM
// ----------------------------
function initPlayer() {
    if (get(LS.xp, null) === null) set(LS.xp, 0);
    if (get(LS.level, null) === null) set(LS.level, 1);
    if (get(LS.lives, null) === null) set(LS.lives, 5);
    initStreak();
    initStats();
}
function addXP(amount) {
    let xp = get(LS.xp, 0);
    xp += amount;
    set(LS.xp, xp);
    updateLevel();
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
    lives--;
    set(LS.lives, lives);
}

function clearQuestionTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function startQuestionTimer() {
    clearQuestionTimer();
    state.timeLeft = 300;

    const timerEl = document.getElementById("question-timer");
    if (timerEl) {
        timerEl.textContent = `⏱️ ${state.timeLeft}s`;
    }

    state.timerId = setInterval(() => {
        state.timeLeft -= 1;
        const timerEl = document.getElementById("question-timer");
        if (timerEl) {
            timerEl.textContent = `⏱️ ${state.timeLeft}s`;
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
            let diff = (new Date(today) - lastDate) / (1000 * 60 * 60 * 24);
            if (diff === 1) streak++;
            else streak = 1;
        } else {
            streak = 1;
        }
        set(LS.streak, streak);
        set(LS.lastLogin, today);
    }
}

function initStats() {
    if (get(LS.totalAttempts, null) === null) set(LS.totalAttempts, 0);
    if (get(LS.totalCorrect, null) === null) set(LS.totalCorrect, 0);
    if (get(LS.totalWrong, null) === null) set(LS.totalWrong, 0);
    if (get(LS.practiceSessions, null) === null) set(LS.practiceSessions, 0);
    if (get(LS.gems, null) === null) set(LS.gems, 0);
    if (get(LS.dailyChallengeDate, null) === null) set(LS.dailyChallengeDate, "");
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
    let attempts = get(LS.totalAttempts, 0);
    let correct = get(LS.totalCorrect, 0);
    let wrong = get(LS.totalWrong, 0);
    let sessions = get(LS.practiceSessions, 0);
    let gems = get(LS.gems, 0);
    let accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;

    const progress = getLevelProgress();
    app.innerHTML = `
        <div class="game stats">
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
            <button onclick="home()">Voltar ao Início</button>
            <button onclick="resetStats()">Redefinir estatísticas</button>
        </div>
    `;
}

function resetStats() {
    if (!confirm("Deseja redefinir as estatísticas do jogador?")) return;
    set(LS.totalAttempts, 0);
    set(LS.totalCorrect, 0);
    set(LS.totalWrong, 0);
    set(LS.practiceSessions, 0);
    set(LS.gems, 0);
    set(LS.dailyChallengeDate, "");
    home();
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
    if (hasDoneDailyChallenge()) {
        alert("Você já completou o desafio diário hoje. Volte amanhã para tentar novamente.");
        return;
    }

    state.lesson = "daily";
    state.index = 0;
    state.practiceMistakes = 0;
    state.dailyMistakes = 0;
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    let pool = [].concat(
        lessons.subtracao.q,
        lessons.multiplicacao.q,
        lessons.divisao.q,
        lessons.adicao.q,
        lessons.decimal.q,
        lessons.frac.q,
        lessons.geo.q
    );

    state.questions = shuffle(pool).slice(0, 6);
    next();
}

function finishDailyChallenge() {
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

function finishLesson() {
    const totalXPGained = state.combo * 3 + 10;
    app.innerHTML = `
        <div class="game">
            <h2>🎉 Lição Concluída!</h2>
            <div class="stat-row"><span>Melhor Combo</span><span>🔥 x${state.bestCombo}</span></div>
            <div class="stat-row"><span>XP Total</span><span>${totalXPGained}</span></div>
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
            { q: "Quantas faces tem um cubo?", a: "6", img: "https://static.vecteezy.com/ti/vetor-gratis/p1/22761516-icone-de-de-cubo-3d-vetor.jpg" },
            { q: "Quantas arestas tem um cubo?", a: "12", img: "https://static.vecteezy.com/ti/vetor-gratis/p1/22761516-icone-de-de-cubo-3d-vetor.jpg" },
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
            { q: "No número 15756, qual é o valor do algarismo 7?", a: "7000" },
            { q: "No número 15268, qual é o valor do algarismo 1?", a: "10000" },
            { q: "No número 5894, qual é o valor do algarismo 5?", a: "5000" },
            { q: "Qual número decimal equivale a fração 1/4?", a: "0,25" },
            { q: "Qual número decimal equivale a fração 3/5?", a: "0,6" },
            { q: "Qual número decimal equivale a fração 7/8?", a: "0,875" },
            { q: "O que é uma dízima periódica?", a: "É um número decimal que possui um ou mais algarismos que se repetem infinitamente." }
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
            { q: "2/3 + 5/6 = ? (use fração imprópria)", a: "3/2" },
            { q: "7/10 - 3/10 = ?", a: "4/10" },
            { q: "5/6 - 1/3 = ?", a: "1/2" },
            { q: "7/8 - 1/4 = ?", a: "5/8" }

        ]

    }
};

// ----------------------------
// HOME SCREEN
// ----------------------------
function home() {
    state.screen = "home";
    const progress = getLevelProgress();
    const dailyDone = hasDoneDailyChallenge();
    app.innerHTML = `
        <div class="home">
            <h1>🧮 MathMaster</h1>
            <p>XP: ${get(LS.xp, 0)} | Level: ${get(LS.level, 1)} | ❤️ ${get(LS.lives, 5)} | 🔥 ${get(LS.streak, 1)} | 💎 ${get(LS.gems, 0)}</p>
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
            <p class="daily-status">${dailyDone ? "Você já completou o desafio diário hoje." : "Desafio diário disponível: tente uma vez por dia."}</p>
        </div>
    `;
}

function shop() {
    let gems = get(LS.gems, 0);
    let lives = get(LS.lives, 0);
    app.innerHTML = `
        <div class="game shop">
            <h2>🏪 Loja de Vidas</h2>
            <p>Você tem 💎 ${gems} gemas.</p>
            <div class="shop-item">
                <div>
                    <h3>Recarga de 5 vidas</h3>
                    <p>Preço: 50 gemas</p>
                </div>
                <button onclick="buyLives()" ${gems < 50 ? "disabled" : ""}>Comprar</button>
            </div>
            <div class="shop-help">
                <p>Se preferir, use o modo Prática para recuperar vidas grátis.</p>
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
    if (get(LS.lives, 0) <= 0) {
        alert("⚠ Você não tem mais vidas! Use o modo Prática para recuperar.");
        return;
    }
    state.lesson = key;
    state.index = 0;
    state.questions = shuffle([...lessons[key].q]);
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    next();
}

// ----------------------------
// QUESTION ENGINE
// ----------------------------
function next() {
    let q = state.questions[state.index];
    if (!q) return home();
    state.currentQ = q;

    let title = state.lesson === "practice" ? "Prática" : lessons[state.lesson].title;

    app.innerHTML = `
        <div class="game">
            <h2>${title}</h2>
            <div class="question-meta-row">
                <span id="question-timer" class="question-meta">⏱️ 5m</span>
                <span class="question-meta">🔥 Combo x${state.combo}</span>
            </div>
            ${q.img ? `<img src="${q.img}" width="160">` : ""}
            <p>${q.q}</p>
            <input id="ans" placeholder="Digite sua resposta">
            <button onclick="check()">Responder</button>
            <div id="fb"></div>
        </div>
    `;
    document.getElementById("ans").addEventListener("keydown", e => {
        if (e.key === "Enter") check();
    });
    startQuestionTimer();
}

// ----------------------------
// CHECK ANSWER
// ----------------------------
function resolveAnswer(correct, timedOut = false) {
    clearQuestionTimer();
    let fb = document.getElementById("fb");

    if (correct) {
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        addXP(10 + (state.combo - 1) * 3);
        recordAnswer(true);
        fb.innerText = state.combo > 1 ? `✔ Correto! Combo x${state.combo}` : "✔ Correto!";
        fb.className = "correct";
        setTimeout(() => {
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

    setTimeout(() => {
        const isLastQuestion = state.index + 1 >= state.questions.length;
        state.index++;
        if (isLastQuestion) {
            if (state.lesson === "practice") {
                finishPracticeSession();
            } else {
                finishLesson();
            }
        } else {
            next();
        }
    }, 800);
}

function check() {
    let val = document.getElementById("ans").value.trim();
    let q = state.currentQ;
    resolveAnswer(val === q.a, false);
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
            ? "<p>📝 Você errou algumas questões. No final da prática, revise os erros cometidos e tente novamente.</p>"
            : "<p>🌟 Excelente! Você respondeu bem a todas as questões da prática.</p>"}
            <button onclick="home()">Voltar ao Início</button>
        </div>
    `;
}

function practice() {
    state.lesson = "practice";
    state.index = 0;
    state.practiceMistakes = 0;
    state.combo = 0;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    let pool = [].concat(
        lessons.subtracao.q,
        lessons.multiplicacao.q,
        lessons.divisao.q,
        lessons.adicao.q,
        lessons.decimal.q,
        lessons.frac.q,
        lessons.geo.q
    );

    state.questions = shuffle(pool).slice(0, 5);

    next();
}

// ----------------------------
// UTILS
// ----------------------------
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// Inicialização do jogo
initPlayer();
home();
const players = [
    "邊荷律", "李丹妃", "金渡兒", "JJUBI", "李雅英", "李珠珢", "南珉貞", "廉世彬", 
    "禹洙漢", "河智媛", "安芝儇", "Mingo", "趙娟週", "文慧真", "安惠志", "李多慧", 
    "金娜妍", "權喜原", "李素泳", "朴恩惠", "金世星", "金佳垠", "朴昭映", "朴星垠", 
    "高佳彬", "金吉娜", "吳瑞律", "金裕娜", "李晧禎", "睦那京", "李素敏", 
    "崔洪邏", "朴淡備", "徐賢淑", "金賢姈", "海莉", "鄭熙靜", "李藝斌", "金海莉"
];

let scores = {};
let history = {};
let round = 1;
let currentRoundMatches = [];
let matchIndex = 0;
const MAX_ROUNDS = 6;

function init() {
    players.forEach(p => {
        scores[p] = 0;
        history[p] = [];
    });
    startRound();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startRound() {
    const groups = {};
    players.forEach(p => {
        const score = scores[p];
        if (!groups[score]) groups[score] = [];
        groups[score].push(p);
    });

    currentRoundMatches = [];
    Object.keys(groups).sort((a, b) => b - a).forEach(score => {
        let group = [...groups[score]];
        shuffle(group);
        for (let i = 0; i < group.length; i += 2) {
            if (i + 1 < group.length) {
                currentRoundMatches.push([group[i], group[i + 1]]);
            } else {
                scores[group[i]] += 1;
                history[group[i]].push('BYE');
            }
        }
    });

    matchIndex = 0;
    document.getElementById('round-num').textContent = round;
    updateProgress();
    nextMatch();
}

function nextMatch() {
    if (matchIndex >= currentRoundMatches.length) {
        round++;
        if (round > MAX_ROUNDS || currentRoundMatches.length === 0) {
            showResults();
            return;
        }
        startRound();
        return;
    }

    const match = currentRoundMatches[matchIndex];
    const display = document.getElementById('match-display');
    display.innerHTML = `
        <div class="player-name" onclick="selectWinner('${match[0]}', '${match[1]}')">${match[0]}</div>
        <div id="vs">VS</div>
        <div class="player-name" onclick="selectWinner('${match[1]}', '${match[0]}')">${match[1]}</div>
    `;
    updateProgress();
}

function selectWinner(winner, loser) {
    scores[winner]++;
    history[winner].push(loser);
    history[loser].push(winner);

    document.querySelectorAll('.player-name').forEach(btn => btn.style.pointerEvents = 'none');
    setTimeout(() => {
        matchIndex++;
        nextMatch();
    }, 500);
}

function updateProgress() {
    const left = currentRoundMatches.length - matchIndex;
    document.getElementById('matches-left').textContent = left;
}

function showResults() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('restart').style.display = 'block';

    const standings = players.map(p => ({
        name: p,
        wins: scores[p],
        buchholz: history[p].reduce((sum, opp) => sum + scores[opp], 0)
    })).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.buchholz - a.buchholz;
    });

    const top3Html = standings.slice(0, 3).map((p, i) => 
        `<li>${i+1}. ${p.name} (${p.wins}勝)`).join('');
    document.getElementById('top3').innerHTML = `<ol>${top3Html}</ol>`;

    const top10Html = standings.slice(0, 10).map((p, i) => 
        `<li>${i+1}. ${p.name} (${p.wins}勝)`).join('');
    document.getElementById('top10').innerHTML = top10Html;
}

function restart() {
    scores = {};
    history = {};
    round = 1;
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('progress').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    init();
}

init();

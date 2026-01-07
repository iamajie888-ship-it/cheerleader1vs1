const players = [
    "邊荷律", "李丹妃", "金渡兒", "JJUBI", "李雅英", "李珠珢", "南珉貞", "廉世彬", 
    "禹洙漢", "河智媛", "安芝儇", "Mingo", "趙娟週", "文慧真", "安惠志", "李多慧", 
    "金娜妍", "權喜原", "李素泳", "朴恩惠", "金世星", "金佳垠", "朴昭映", "朴星垠", 
    "高佳彬", "金吉娜", "吳瑞律", "金裕娜", "李晧禎", "睦那京", "李素敏", 
    "崔洪邏", "朴淡備", "徐賢淑", "金賢姈", "海莉", "鄭熙靜", "李藝斌", "金海莉"
];

let scores = {};
let history = {};
let currentStage = 'stage1';
let round = 1;
let currentRoundMatches = [];
let matchIndex = 0;
let top20Players = [];
let top10Players = [];

function init() {
    players.forEach(p => {
        scores[p] = 0;
        history[p] = [];
    });
    document.getElementById('stage-title').style.display = 'none';
    startRound();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCurrentPlayers() {
    switch(currentStage) {
        case 'stage1': return players;
        case 'stage2': return top20Players;
        case 'stage3': return top10Players;
        default: return players;
    }
}

function startRound() {
    const currentPlayers = getCurrentPlayers();
    const groups = {};
    
    currentPlayers.forEach(p => {
        const score = scores[p];
        if (!groups[score]) groups[score] = [];
        groups[score].push(p);
    });

    currentRoundMatches = [];
    Object.keys(groups).sort((a, b) => b - a).forEach(score => {
        let group = shuffle([...groups[score]]);
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
    updateDisplay(); // 確保新輪開始即更新
    requestAnimationFrame(() => showNextMatch()); // iPad 強制重繪
}

function updateDisplay() {
    const matchesLeft = currentRoundMatches.length - matchIndex;
    let roundNum, stageTitle = '';

    if (currentStage === 'stage1') {
        roundNum = round;
    } else if (currentStage === 'stage2') {
        roundNum = round - 6;
        stageTitle = `🎯 前20強 第${roundNum}輪`;
    } else {
        roundNum = round - 9;
        stageTitle = `🥇 前10強 第${roundNum}輪`;
    }

    document.getElementById('round-num').textContent = roundNum;
    document.getElementById('matches-left').textContent = matchesLeft;
    
    const titleEl = document.getElementById('stage-title');
    if (stageTitle) {
        titleEl.textContent = stageTitle;
        titleEl.style.display = 'block';
    } else {
        titleEl.style.display = 'none';
    }
    
    // iPad 強制 reflow
    titleEl.offsetHeight;
}

function showNextMatch() {
    if (matchIndex >= currentRoundMatches.length) {
        requestAnimationFrame(advanceStage);
        return;
    }

    const match = currentRoundMatches[matchIndex];
    const display = document.getElementById('match-display');
    display.innerHTML = `
        <div class="player-name" onclick="selectWinner('${match[0]}', '${match[1]}')">${match[0]}</div>
        <div id="vs">VS</div>
        <div class="player-name" onclick="selectWinner('${match[1]}', '${match[0]}')">${match[1]}</div>
    `;
    
    // 更新剩場數 + 視覺動畫
    updateDisplay();
    animateCounter();
}

function animateCounter() {
    const counter = document.getElementById('matches-left');
    counter.style.transform = 'scale(1.2)';
    counter.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 150);
}

function selectWinner(winner, loser) {
    scores[winner]++;
    history[winner].push(loser);
    history[loser].push(winner);

    // 禁用點擊 + 視覺反饋
    document.querySelectorAll('.player-name').forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    });

    setTimeout(() => {
        matchIndex++;
        requestAnimationFrame(showNextMatch); // iPad 確保順暢更新
    }, 500);
}

function advanceStage() {
    if (currentStage === 'stage1' && round < 6) {
        round++;
        startRound();
    } else if (currentStage === 'stage1') {
        // 進前20
        const standings = players.map(p => ({
            name: p,
            wins: scores[p],
            buchholz: history[p].reduce((sum, opp) => sum + (scores[opp] || 0), 0)
        })).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.buchholz - a.buchholz;
        });
        top20Players = standings.slice(0, 20).map(s => s.name);
        currentStage = 'stage2';
        round = 7;
        startRound();
    } else if (currentStage === 'stage2' && round < 9) {
        round++;
        startRound();
    } else if (currentStage === 'stage2') {
        // 進前10
        const standings = top20Players.map(p => ({
            name: p,
            wins: scores[p],
            buchholz: history[p].reduce((sum, opp) => sum + (scores[opp] || 0), 0)
        })).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.buchholz - a.buchholz;
        });
        top10Players = standings.slice(0, 10).map(s => s.name);
        currentStage = 'stage3';
        round = 10;
        startRound();
    } else if (currentStage === 'stage3' && round < 11) {
        round++;
        startRound();
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('progress').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('restart').style.display = 'block';

    const finalStandings = players.map(p => ({
        name: p,
        wins: scores[p],
        buchholz: history[p].reduce((sum, opp) => sum + (scores[opp] || 0), 0)
    })).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.buchholz - a.buchholz;
    });

    const top10Html = finalStandings.slice(0, 10).map((p, i) => 
        `<li>${i+1}. ${p.name} (${p.wins}勝)`).join('');
    document.getElementById('top10-final').innerHTML = `<ol>${top10Html}</ol>`;

    const top3Html = finalStandings.slice(0, 3).map((p, i) => 
        `<li>${i+1}. ${p.name} (${p.wins}勝)`).join('');
    document.getElementById('top3').innerHTML = `<ol>${top3Html}</ol>`;
}

function restart() {
    scores = {};
    history = {};
    currentStage = 'stage1';
    round = 1;
    top20Players = [];
    top10Players = [];
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('progress').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    init();
}

init();

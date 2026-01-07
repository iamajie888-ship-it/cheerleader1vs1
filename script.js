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
    console.log('🔥 初始化三階段瑞士輪');
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
}

function getCurrentPlayers() {
    switch(currentStage) {
        case 'stage1': return players;
        case 'stage2': return top20Players;
        case 'stage3

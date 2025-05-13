const human = 'X';
const ai = 'O';
let board = Array(9).fill(null);
const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const boardElm = document.getElementById('board');
const statusElm = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', init);
init();

function init() {
  board.fill(null);
  statusElm.textContent = "Your turn (X)";
  boardElm.innerHTML = '';
  boardElm.classList.remove('disabled');
  board.forEach((_, idx) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', () => makeMove(idx));
    boardElm.appendChild(cell);
  });
}

function makeMove(idx) {
  if (board[idx] || isTerminal(board)) return;
  updateBoard(idx, human);
  if (!handleEnd(human)) {
    statusElm.textContent = "Opponent's turn (O)...";
    boardElm.classList.add('disabled');
    setTimeout(() => {
      const best = getBestMove();
      updateBoard(best, ai);
      handleEnd(ai) || (() => {
        statusElm.textContent = "Your turn (X)";
        boardElm.classList.remove('disabled');
      })();
    }, 200);
  }
}

function updateBoard(idx, player) {
  board[idx] = player;
  boardElm.children[idx].textContent = player;
  boardElm.children[idx].classList.add('disabled');
}

function handleEnd(player) {
  const win = getWinner(board);
  if (win) {
    highlight(win.combo);
    statusElm.textContent = win.player === human ? "You won!" : "Opponent won!";
    boardElm.classList.add('disabled');
    return true;
  } else if (board.every(c => c)) {
    statusElm.textContent = "Draw!";
    return true;
  }
  return false;
}

function getWinner(bd) {
  for (let combo of winCombos) {
    const [a,b,c] = combo;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
      return { player: bd[a], combo };
    }
  }
  return null;
}

function highlight(combo) {
  combo.forEach(i => boardElm.children[i].style.background = '#a0e7a0');
}

function isTerminal(bd) {
  return !!getWinner(bd) || bd.every(c => c);
}

function getBestMove() {
  return minimax(board, ai).index;
}

function minimax(newBoard, player) {
  const avail = newBoard
    .map((v,i) => v ? null : i)
    .filter(i => i !== null);

  const winner = getWinner(newBoard);
  if (winner) {
    return { score: winner.player === ai ? +10 : -10 };
  } else if (avail.length === 0) {
    return { score: 0 };
  }

  const moves = [];
  for (let i of avail) {
    const move = { index: i };
    newBoard[i] = player;

    const result = minimax(newBoard, player === ai ? human : ai);
    move.score = result.score;
    newBoard[i] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === ai) {
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = +Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }
  return bestMove;
}

// ゲームの状態
let gameState = 'playerNameInput'; // playerNameInput, playing, gameOver
let player1Name = '';
let player2Name = '';
let moveHistory = [];
let woodCount = 3; // 木の数
let foxPiece = null; // 狐の駒
let foxPlayer = null; // 狐のプレイヤー

// ゲーム盤の初期状態
let board = [
  ['車v', '馬v', '槍v', '臣v', '王v', '官v', '弓v', '馬v', '車v'],
  ['兵v', '兵v', '兵v', '兵v', '盾v', '兵v', '兵v', '兵v', '兵v'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, '木', null, null, '木', null, null, '木', null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['兵^', '兵^', '兵^', '兵^', '盾^', '兵^', '兵^', '兵^', '兵^'],
  ['車^', '馬^', '弓^', '官^', '王^', '臣^', '槍^', '馬^', '車^']
];

// プレイヤー情報
let currentPlayer = Math.random() < 0.5 ? '^' : 'v'; // 先手後手ランダム
let selectedPiece = null;
let selectedPiecePosition = null;

// 駒の動きの定義
const pieceMoves = {
  '王': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  '兵': [[-1, 0]],
  '槍': [[-2, 0], [-1, -1], [-1, 1]],
  '弓': [[-2, 0], [-2, -1], [-2, 1]],
  '盾': [[-1, 0], [-1, -1], [-1, 1]],
  '臣': [[-1, -1], [-1, 1], [1, -1], [1, 1]], // 実際には制限なし
  '官': [[-1, 0], [0, -1], [0, 1], [1, 0]],
  '馬': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
  '車': [[-1, 0], [1, 0], [0, -1], [0, 1]], // 実際には制限なし
  '木': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  '狐': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]] // 実際には制限なし
};

// 駒の動きの検証
function isValidMove(piece, from, to) {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const move = [toRow - fromRow, toCol - fromCol];
  const moves = pieceMoves[piece.replace('v', '').replace('^', '')];

  if (!moves) return false;

  for (let m of moves) {
    if (piece === '車v' || piece === '車^' || piece === '狐v' || piece === '狐^' || piece === '臣v' || piece === '臣^') {
      //車,狐,臣の動きの検証（制限なし）
      if (move[0] === m[0] || move[1] === m[1]) {
        if (move[0] === 0 || move[1] === 0) {
          return true;
        } else if (move[0] === move[1] || move[0] === -move[1]) {
          return true;
        }
      }
    } else if (move[0] === m[0] && move[1] === m[1]) {
      return true;
    }
  }
  return false;
}

// 駒の選択
function selectPiece(row, col) {
  if (gameState !== 'playing') return;

  const piece = board[row][col];
  if (!piece || piece.indexOf(currentPlayer) === -1) return;

  selectedPiece = piece;
  selectedPiecePosition = [row, col];
}

// 駒の移動
function movePiece(toRow, toCol) {
  if (gameState !== 'playing' || !selectedPiece) return;

  const [fromRow, fromCol] = selectedPiecePosition;

  if (isValidMove(selectedPiece, selectedPiecePosition, [toRow, toCol])) {
    const targetPiece = board[toRow][toCol];

    // 木の処理
    if (targetPiece === '木') {
      removeWood(toRow, toCol);
    }

    // 駒の移動と相手の駒の除去
    board[toRow][toCol] = selectedPiece;
    board[fromRow][fromCol] = null;
    moveHistory.push(`<span class="math-inline">\{selectedPiece\}\: \(</span>{fromRow}, <span class="math-inline">\{fromCol\}\) \-\> \(</span>{toRow}, ${toCol})`);
    selectedPiece = null;
    selectedPiecePosition = null;
    currentPlayer = currentPlayer === '^' ? 'v' : '^'; // ターン交代

    // 勝利判定
    if (checkWin()) {
      gameState = 'gameOver';
      displayMessage(`${currentPlayer === '^' ? player2Name : player1Name} の勝利！`);
    } else {
      displayBoard();
    }
  }
}

// 木の除去と狐の生成
function removeWood(row, col) {
  board[row][col] = null;
  woodCount--;

  if (woodCount > 0) {
    const closestWood = findClosestWood();
    if (closestWood) {
      const [foxRow, foxCol] = closestWood;
      board[foxRow][foxCol] = `狐${currentPlayer === '^' ? 'v' : '^'}`;
      foxPiece = `狐${currentPlayer === '^' ? 'v' : '^'}`;
      foxPlayer = currentPlayer === '^' ? 'v' : '^';
    }
  } else {
    gameState = 'gameOver';
    displayMessage(`${currentPlayer === '^' ? player1Name : player2Name} の勝利！`);
  }
}

// 最も近い木の探索
function findClosestWood() {
  let minDistance = Infinity;
  let closestWood = null;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '木') {
        const distance = Math.sqrt(Math.pow(selectedPiecePosition[0] - row, 2) + Math.pow(selectedPiecePosition[1] - col, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestWood = [row, col];
        }
      }
    }
  }
  return closestWood;
}

// 勝利判定
function checkWin() {
  const opponentKing = currentPlayer === '^' ? '王v' : '王^';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === opponentKing) {
        return false;
      }
    }
  }
  return true;
}

// ゲーム盤の表示
function displayBoard() {
  drawBoard();
  displayHistory();
  displayMessage(`${currentPlayer === '^' ? player2Name : player1Name} の手番です。`);
}

// メッセージ表示
function displayMessage(message) {
  messageElement.textContent = message;
}

// ゲームのリセット
function resetGame() {
  if (gameState === 'gameOver') {
    gameState = 'playerNameInput';
    player1Name = '';
    player2Name = '';
    moveHistory = [];
    woodCount = 3;
    foxPiece = null;
    foxPlayer = null;
    selectedPiece = null;
    selectedPiecePosition = null;
    board = [
      ['車v', '馬v', '槍v', '臣v', '王v', '官v', '弓v', '馬v', '車v'],
      ['兵v', '兵v', '兵v', '兵v', '盾v', '兵v', '兵v', '兵v', '兵v'],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, '木', null, null, '木', null, null, '木', null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      ['兵^', '兵^', '兵^', '兵^', '盾^', '兵^', '兵^', '兵^', '兵^'],
      ['車^', '馬^', '弓^', '官^', '王^', '臣^', '槍^', '馬^', '車^']
    ];
    displayMessage('プレイヤー名を入力してください。');
    // プレイヤー名入力欄と開始ボタンを表示
    player1NameInput.style.display = 'block';
    player2NameInput.style.display = 'block';
    startGameButton.style.display = 'block';
    resetButton.style.display = 'none';
  }
}

// ゲーム盤の初期化
function initBoard() {
  board = [
    ['車v', '馬v', '槍v', '臣v', '王v', '官v', '弓v', '馬v', '車v'],
    ['兵v', '兵v', '兵v', '兵v', '盾v', '兵v', '兵v', '兵v', '兵v'],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, '木', null, null, '木', null, null, '木', null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    ['兵^', '兵^', '兵^', '兵^', '盾^', '兵^', '兵^', '兵^', '兵^'],
    ['車^', '馬^', '弓^', '官^', '王^', '臣^', '槍^', '馬^', '車^']
  ];
  currentPlayer = Math.random() < 0.5 ? '^' : 'v'; // 先手後手ランダム
  selectedPiece = null;
  selectedPiecePosition = null;
  moveHistory = [];
  woodCount = 3;
  foxPiece = null;
  foxPlayer = null;
}

// プレイヤー名の入力
function setPlayerNames(name1, name2) {
  if (gameState === 'playerNameInput' && name1 && name2) {
    player1Name = name1;
    player2Name = name2;
    gameState = 'playing';
    initBoard();
    displayBoard();
    // プレイヤー名入力欄と開始ボタンを非表示
    player1NameInput.style.display = 'none';
    player2NameInput.style.display = 'none';
    startGameButton.style.display = 'none';
    resetButton.style.display = 'block';
  }
}

// ゲームの初期化と開始
function startGame() {
  displayMessage('プレイヤー名を入力してください。');
  // プレイヤー名入力欄と開始ボタンを表示
  player1NameInput.style.display = 'block';
  player2NameInput.style.display = 'block';
  startGameButton.style.display = 'block';
  resetButton.style.display = 'none';
}

// HTML 要素の取得
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const historyElement = document.getElementById('history');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const startGameButton = document.getElementById('startGame');
const resetButton = document.getElementById('reset');

// イベントリスナーの設定
startGameButton.addEventListener('click', () => {
  setPlayerNames(player1NameInput.value, player2NameInput.value);
});

resetButton.addEventListener('click', resetGame);

// 盤面の描画
function drawBoard() {
  boardElement.innerHTML = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);

      const piece = board[row][col];
      if (piece) {
        cell.textContent = piece; // 駒の表示
      }
      boardElement.appendChild(cell);
    }
  }
}

// セルクリック時の処理
function handleCellClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (selectedPiece) {
    movePiece(row, col);
  } else {
    selectPiece(row, col);
  }
}

// 履歴の表示
function displayHistory() {
  historyElement.innerHTML = '';
  moveHistory.forEach((move, index) => {
    const moveItem = document.createElement('li');
    moveItem.textContent = `${index + 1}. ${move}`;
    historyElement.appendChild(moveItem);
  });
}

// メッセージの表示
function displayMessage(message) {
  messageElement.textContent = message;
}

// ゲーム盤の表示
function displayBoard() {
  drawBoard();
  displayHistory();
  displayMessage(`${currentPlayer === '^' ? player2Name : player1Name} の手番です。`);
}

// ゲームの初期化と開始
function startGame() {
  displayMessage('プレイヤー名を入力してください。');
  // プレイヤー名入力欄と開始ボタンを表示
  player1NameInput.style.display = 'block';
  player2NameInput.style.display = 'block';
  startGameButton.style.display = 'block';
  resetButton.style.display = 'none';
  drawBoard(); // ゲーム開始時に盤面を描画
}
startGame();

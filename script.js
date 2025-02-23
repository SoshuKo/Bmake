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
let currentPlayer = '^'; // 先手
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
            if(move[0] === 0 || move[1] === 0){
                return true;
            } else if(move[0] === move[1] || move[0] === -move[1]){
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
  const piece = board[row][col];
  if (!piece || piece.indexOf(currentPlayer) === -1) return;

  selectedPiece = piece;
  selectedPiecePosition = [row, col];
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
    moveHistory.push(`${selectedPiece}: (${fromRow}, ${fromCol}) -> (${toRow}, ${toCol})`);
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

// ゲーム盤の表示 (コンソール)
function displayBoard() {
  console.clear();
  console.log('--- ブマケ ---');
  console.log(`プレイヤー1: ${player1Name} (${player1Name === currentPlayer ? '手番' : ''})`);
  console.log(`プレイヤー2: ${player2Name} (${player2Name === currentPlayer ? '手番' : ''})`);
  console.log('  0 1 2 3 4 5 6 7 8');
  for (let row = 0; row < 9; row++) {
    let rowStr = `${row} `;
    for (let col = 0; col < 9; col++) {
      rowStr += board[row][col] ? board[row][col].padEnd(3, ' ') : '    ';
    }
    console.log(rowStr);
  }
  console.log('--- 履歴 ---');
  moveHistory.forEach((move, index) => console.log(`${index + 1}. ${move}`));
}

// メッセージ表示
function displayMessage(message) {
  console.log(`--- ${message} ---`);
}

// ゲームのリセット
function resetGame() {
  if (gameState === 'gameOver') {
    gameState = 'playerNameInput';
    player1Name = '';
    player2Name = '';
    displayMessage('プレイヤー名を入力してください。');
  }
}

// プレイヤー名の入力
function setPlayerNames(name1, name2) {
  if (gameState === 'playerNameInput') {
    player1Name = name1;
    player2Name = name2;
    gameState = 'playing';
    initBoard();
    displayBoard();
  }
}

// ゲームの初期化と開始
function startGame() {
  displayMessage('プレイヤー名を入力してください。');
  // ... (HTML のクリックイベントなど)
}

startGame();

// プレイヤー名の入力例
// setPlayerNames('プレイヤー1', 'プレイヤー2');

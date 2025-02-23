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

// 駒の移動
function movePiece(toRow, toCol) {
  if (!selectedPiece) return;

  const [fromRow, fromCol] = selectedPiecePosition;

  if (isValidMove(selectedPiece, selectedPiecePosition, [toRow, toCol])) {
    board[toRow][toCol] = selectedPiece;
    board[fromRow][fromCol] = null;
    selectedPiece = null;
    selectedPiecePosition = null;
    currentPlayer = currentPlayer === '^' ? 'v' : '^'; // ターン交代
  }
}

// ゲーム盤の表示 (コンソール)
function displayBoard() {
  for (let row of board) {
    console.log(row.join(' '));
  }
}

// ゲームの初期化と開始
function startGame() {
  displayBoard();
  // ... (HTML のクリックイベントなど)
}

startGame();

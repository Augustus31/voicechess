/****************************\
 ============================

         BROWSER MODE

 ============================
\****************************/

// init engine
var engine = new Engine();
var book = [];
var botName = ''

// update version in GUI
document.title = 'WukongJS v ' + engine.VERSION;

// run in browser mode
console.log('\n  Wukong JS - BROWSER MODE - v' + engine.VERSION);
console.log('  type "engine" for public API reference');

// import sounds
var moveSound = new Audio('Sounds/move.wav');
var captureSound = new Audio('Sounds/capture.wav');

// stats
var guiScore = 0;
var guiDepth = 0;
var guiTime = 0;
var guiPv = '';
var guiSide = 0;
var userTime = 0;
var gameResult = '*';
var guiFen = '';
var promotedPiece = 5;

// difficulty
var fixedTime = 0;
var fixedDepth = 0;

// user input controls
var clickLock = 0;
var allowBook = 1;
var userSource, userTarget;

// 3 fold repetitions
var repetitions = 0;

// pick piece handler
function dragPiece(event, square) {
  userSource = square;
}

// drag piece handler
function dragOver(event, square) {
  event.preventDefault();
  if (square == userSource) event.target.src = 'Images/0.gif';
}

// drop piece handler
function dropPiece(event, square) {
  userTarget = square;
  promotedPiece = (engine.getSide() ? (promotedPiece + 6): promotedPiece)
  let valid = validateMove(userSource, userTarget, promotedPiece);
  engine.movePiece(userSource, userTarget, promotedPiece);
  if (engine.getPiece(userTarget) == 0) valid = 0;
  clickLock = 0;

  if (engine.getPiece(square) && valid) {
    userTime = Date.now() - userTime;
    document.getElementById(square).style.backgroundColor = engine.SELECT_COLOR;
    playSound(valid);
    updatePgn();
  }

  event.preventDefault();
  if (valid) setTimeout(function() { think(); }, 100);
}

function voicePiece(piese, target) {
  //console.log(piese);
  //console.log(target);
  promotedPiece = (engine.getSide() ? (promotedPiece + 6): promotedPiece)
  for(i = 0; i <= 63; i++){
    if(piese == engine.getPiece(Math.floor(i/8)*16 + i%8)){
      userSource = Math.floor(i/8)*16 + i%8;
      userTarget = target;
      let valid = validateMove2(userSource, userTarget, promotedPiece);
      //console.log(target);
      const coordinates = [
        'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'i8', 'j8', 'k8', 'l8', 'm8', 'n8', 'o8', 'p8',
        'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'i7', 'j7', 'k7', 'l7', 'm7', 'n7', 'o7', 'p7',
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'i6', 'j6', 'k6', 'l6', 'm6', 'n6', 'o6', 'p6',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'i5', 'j5', 'k5', 'l5', 'm5', 'n5', 'o5', 'p5',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'i4', 'j4', 'k4', 'l4', 'm4', 'n4', 'o4', 'p4',
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'i3', 'j3', 'k3', 'l3', 'm3', 'n3', 'o3', 'p3',
        'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'i2', 'j2', 'k2', 'l2', 'm2', 'n2', 'o2', 'p2',
        'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'i1', 'j1', 'k1', 'l1', 'm1', 'n1', 'o1', 'p1'
      ];
      for(j = 0; j < 128; j++){
        if(userTarget == coordinates[j]){
          userTarget = j;
        }
      }
      //console.log(userSource);
      //console.log(userTarget);
      //console.log(promotedPiece);
      engine.movePiece(userSource, userTarget, promotedPiece);
      if (engine.getPiece(userTarget) == 0) valid = 0;
      clickLock = 0;

      if (engine.getPiece(userTarget) && valid) {
        userTime = Date.now() - userTime;
        document.getElementById(userTarget).style.backgroundColor = engine.SELECT_COLOR;
        playSound(valid);
        updatePgn();
        // engine.updateBoard();
        // engine.drawBoard();
      }

      event.preventDefault();
      if (valid) setTimeout(function() { think(); }, 100);
    }
  }


}

// click event handler
function tapPiece(square) {
  engine.drawBoard();
  engine.updateBoard();

  if (engine.getPiece(square))
    document.getElementById(square).style.backgroundColor = engine.SELECT_COLOR;

  var clickSquare = parseInt(square, 10)

  if(!clickLock && engine.getPiece(clickSquare)) {
    userSource = clickSquare;
    clickLock ^= 1;
  } else if(clickLock) {
    userTarget = clickSquare;

    promotedPiece = (engine.getSide() ? (promotedPiece + 6): promotedPiece)
    let valid = validateMove(userSource, userTarget, promotedPiece);
    engine.movePiece(userSource, userTarget, promotedPiece);
    if (engine.getPiece(userTarget) == 0) valid = 0;
    clickLock = 0;

    if (engine.getPiece(square) && valid) {
      document.getElementById(square).style.backgroundColor = engine.SELECT_COLOR;
      playSound(valid);
      updatePgn();
    }

    if (valid) setTimeout(function() { think(); }, 1);
  }
}

// validate move
function validateMove(userSource, userTarget, promotedPiece) {
  let moveString = engine.squareToString(userSource) +
                   engine.squareToString(userTarget) +
                   engine.promotedToString(promotedPiece);
  console.log(moveString);

  let move = engine.moveFromString(moveString);
  return move;
}

function validateMove2(userSource, userTarget, promotedPiece) {
  let moveString = engine.squareToString(userSource) +
                   userTarget +
                   engine.promotedToString(promotedPiece);
  console.log(moveString);

  let move = engine.moveFromString(moveString);
  return move;
}

// set FEN
function setFen() {
  let fen = document.getElementById('fen').value;
  if (fen != engine.START_FEN) allowBook = 0;
  engine.setBoard(fen);
  engine.drawBoard();
  engine.updateBoard();
  guiFen = fen;
}

// start new game
function newGame() {
  guiScore = 0;
  guiDepth = 0;
  guiTime = 0;
  guiPv = '';
  gameResult = '';
  userTime = 0;
  allowBook = 1;
  engine.setBoard(engine.START_FEN);
  engine.drawBoard();
  engine.updateBoard();
  document.getElementById('pgn').value = '';
  repetitions = 0;
}

// take move back
function undo() {
  repetitions = 0;
  gameResult = '*';
  engine.takeBack();
  engine.drawBoard();
  engine.updateBoard();
}

// flip board
function flip() {
  guiSide ^= 1;
  engine.flipBoard();
  engine.drawBoard();
  engine.updateBoard();
}

// use opening book
function getBookMove() {
  if (allowBook == 0) return 0;

  let moves = engine.getMoves();
  let lines = [];

  if (moves.length == 0) {
    let randomLine = book[Math.floor(Math.random() * book.length)];
    let firstMove = randomLine.split(' ')[0];
    return engine.moveFromString(firstMove);
  } else if (moves.length) {
    for (let line = 0; line < book.length; line++) {
      let currentLine = moves.join(' ');

      if (book[line].includes(currentLine) && book[line].split(currentLine)[0] == '')
        lines.push(book[line]);
    }
  }

  if (lines.length) {
    let currentLine = moves.join(' ');
    let randomLine = lines[Math.floor(Math.random() * lines.length)];

    try {
      let bookMove = randomLine.split(currentLine)[1].split(' ')[1];
      return engine.moveFromString(bookMove);
    } catch(e) { return 0; }
  }

  return 0;
}

// engine move
function think() {
  if (engine.inCheck(guiSide)) return;

  engine.resetTimeControl();

  let timing = engine.getTimeControl();
  let startTime = new Date().getTime();

  if (fixedTime) {
    fixedDepth = 64;
    timing.timeSet = 1;
    timing.time = fixedTime * 1000;
    timing.stopTime = startTime + timing.time
    engine.setTimeControl(timing);
  }

  let bookMoveFlag = 0;
  let delayMove = 0;
  let bestMove = getBookMove();

  if (bestMove) {
    bookMoveFlag = 1;
    delayMove = 1000;
  }

  else if (bestMove == 0) bestMove = engine.search(fixedDepth);

  let sourceSquare = engine.getMoveSource(bestMove);
  let targetSquare = engine.getMoveTarget(bestMove);
  let promotedPiece = engine.getMovePromoted(bestMove);

  if (engine.isRepetition()) repetitions++;
  if (repetitions == 3) {
    gameResult = '1/2-1/2 Draw by 3 fold repetition';
    updatePgn();
    return;
  } else if (engine.getFifty() >= 100) {
    gameResult = '1/2-1/2 Draw by 50 rule move';
    updatePgn();
    return;
  } else if (engine.isMaterialDraw()) {
    gameResult = '1/2-1/2 Draw by insufficient material';
    updatePgn();
    return;
  } else if (engine.generateLegalMoves().length == 0 && engine.inCheck()) {
    gameResult = engine.getSide() == 0 ? '0-1 Mate' : '1-0 Mate';
    updatePgn();
    return;
  } else if (guiScore == 'M1') {
    gameResult = engine.getSide() == 0 ? '1-0 Mate' : '0-1 Mate';
  } else if (engine.generateLegalMoves().length == 0 && engine.inCheck() == 0) {
    gameResult = 'Stalemate';
    updatePgn();
    return;
  }

  setTimeout(function() {
    engine.movePiece(sourceSquare, targetSquare, promotedPiece);
    engine.drawBoard();
    engine.updateBoard();

    if (engine.getPiece(targetSquare)) {
      document.getElementById(targetSquare).style.backgroundColor = engine.SELECT_COLOR;
      playSound(bestMove);
      updatePgn();
      userTime = Date.now();
    }

  }, delayMove + (guiTime < 100 && delayMove == 0) ? 1000 : ((guiDepth == 0) ? 500 : 100));
}

function getGamePgn() {
  let moveStack = engine.moveStack();
  let pgn = '';

  for (let index = 0; index < moveStack.length; index++) {
    let move = moveStack[index].move;
    let moveScore = moveStack[index].score;
    let moveDepth = moveStack[index].depth;
    let moveTime = moveStack[index].time;
    let movePv = moveStack[index].pv;
    let moveString = engine.moveToString(move);
    let moveNumber = ((index % 2) ? '': ((index / 2 + 1) + '. '));
    let displayScore = (((moveScore / 100) == 0) ? '-0.00' : (moveScore / 100)) + '/' + moveDepth + ' ';
    let stats = (movePv ? '(' + movePv.trim() + ')' + ' ': '') +
                (moveDepth ? ((moveScore > 0) ? ('+' + displayScore) : displayScore): '') +
                Math.round(moveTime / 1000);

    let nextMove = moveNumber + moveString + (moveTime ? ' {' + stats + '}' : '');

    pgn += nextMove + ' ';
    userTime = 0;
  }

  return pgn;
}

// update PGN
function updatePgn() {
  let pgn = getGamePgn();
  let gameMoves = document.getElementById('pgn');

  gameMoves.value = pgn;

  if (gameResult == '1-0 Mate' || gameResult == '0-1 Mate') {
    gameMoves.value += '# ' + gameResult;
  } else if (gameResult != '*') {
    gameMoves.value += ' ' + gameResult;
  }

  gameMoves.scrollTop = gameMoves.scrollHeight;
}

// download PGN
function downloadPgn() {
  let userName = prompt('Enter your name:', 'Player');
  let userColor = (guiSide == 0) ? 'White' : 'Black';

  if (userColor != 'White' && userColor != 'Black') {
    alert('Wrong color, please try again');
    return;
  }

  let header = '';
  if (guiFen) header += '[FEN "' + guiFen + '"]\n';
  header += '[Event "Friendly chess game"]\n';
  header += '[Site "https://maksimkorzh.github.io/wukongJS/wukong.html"]\n';
  header += '[Date "' + new Date() + '"]\n';
  header += '[White "' + ((userColor == 'White') ? userName : botName) + '"]\n';
  header += '[Black "' + ((userColor == 'Black') ? userName : botName) + '"]\n';
  header += '[Result "' + gameResult + '"]\n\n';

  let downloadLink = document.createElement('a');
  downloadLink.id = 'download';
  downloadLink.download = ((userColor == 'White') ? (userName + '_vs_' + botName + '.pgn') : (botName + '_vs_' + userName + '.pgn'));
  downloadLink.hidden = true;
  downloadLink.href = window.URL.createObjectURL( new Blob([header + getGamePgn() + ((gameResult == '*') ? ' *' : '')], {type: 'text'}));
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}

// set promoted piece
function setPromotion(piece) {
  document.getElementById('current-promoted-image').src = 'Images/' + piece + '.gif';
  promotedPiece = piece;
}

// set bot
function setBot(bot) {
  botName = bot;
  document.getElementById('current-bot-image').src = bots[bot].image;
  fixedTime = bots[bot].time;
  fixedDepth = bots[bot].depth;
  book = JSON.parse(JSON.stringify(bots[bot].book));
  document.getElementById('pgn').value = bots[bot].description;
}

// Set Wukong as default bot
setBot('Wukong');

// play sound
function playSound(move) {
  if (engine.getMoveCapture(move)) captureSound.play();
  else moveSound.play();
}

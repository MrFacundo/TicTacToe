//Selection of html elements and assigning variables

const cells = document.querySelectorAll("[data-spaces]");
const nextPlayer = document.querySelector("[data-status]");
const resetBtn = document.querySelector("[data-reset]");
const selectOpponentBtn = document.querySelector("[data-opponent]");

const gridWidth = 3;

let player = "X";
let AI = "O"
let moveCount = 0;
let inPlay = true;

//Initialize game with event listener for cells

function init() {

	for(let i = 0; i < cells.length; i++) {

		cells[i].addEventListener("click", () => {

			if (!inPlay || cells[i].innerHTML != '') return;

            setCellValue(i, player);

            let win = getWinCombo(Math.floor(i % gridWidth), Math.floor(i / gridWidth), player);

            displayWin(win, player);

            moveCount++;

            //AI or player 2 move

            if(inPlay) {
                if(AI != "")
                    makeAIMove();
                else 
                    player = player == "O" ? "X" : "O";
                    nextPlayer.innerHTML = `${player} is Next`;

            }
		});
	}
}

function selectOpponent() {
    reset() 
    if (selectOpponentBtn.innerHTML == "1P") {
        selectOpponentBtn.innerHTML = "2P"
        AI = ""
        
    } else {
        selectOpponentBtn.innerHTML = "1P"
        AI = "O"
    }
}

//Check win condition functions

function checkRowSpace(index, x, y, board) {
    return getGridCell  (index, y, board);
}

function checkColSpace(index, x, y, board) {
    return getGridCell  (x, index, board);
}

function checkDiagonal(index, x, y, board) {
    if(x == y)
        return getGridCell  (index, index, board);
    else
        return null;
}

function checkAntiDiagonal(index, x, y, board) {
    if(x + y == gridWidth - 1)
        return getGridCell  (index, gridWidth - 1 - index, board);
    else
        return null
}

const checkFunctions = [checkRowSpace, checkColSpace, checkDiagonal, checkAntiDiagonal];

function getWinCombo(x, y, currentPlayer, board) {
    let winSequence = [];

    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < gridWidth; j++) {
            let currentCell = checkFunctions[i](j, x, y, board);
            
            if(board == undefined) {
                if(getCellValue(currentCell) != currentPlayer) {
                    winSequence = [];
                    break;
                }
            } else if(currentCell != currentPlayer) {
                winSequence = [];
                break;
            }

            winSequence.push(currentCell);
            if(j == gridWidth - 1) {
                return winSequence;
            }
        }
    }

    if(moveCount == 8) {
        return cells; 
    }

    return winSequence;

}

function getGridCell    (x, y, board) {
    if(board != undefined)
        return board[y * gridWidth + x];
    else
        return cells[y * gridWidth + x];
}

//Display win or draw and reset variables and HTML elements

function displayWin(win, player) {

    let condition = ""

    if (win.length == 0) {
        return;
    } else if (win.length > 3) {
        condition = "draw";
        nextPlayer.innerHTML = `Draw!`;
    } else {
        condition = "win";
        nextPlayer.innerHTML = `${player} wins!`;
    }

	win.forEach(space => {
		space.className += ` ${condition}`;
    });
    
    cells.forEach(space => {
        space.style.cursor = "default";

    });

	resetBtn.className = "restart";
	inPlay = false;
}

function reset() {
    player = "X";
    moveCount = 0;
	inPlay = true;
    resetBtn.className = "hidden";
    nextPlayer.innerHTML = "";


    cells.forEach(space => {
        space.className = "cell";
        space.innerHTML = '';
    });
}

// AI move

function makeAIMove() {

    let bestVal = -11;
    let bestMove;
    let newBoard = [];

    cells.forEach(space => {
        newBoard.push(getCellValue(space));
    });

    let possibleMoves = getBoardChildren(newBoard, "O");

    possibleMoves.forEach(child => {
        let value = minimax(child, 9, false);
        if(value > bestVal) {
            bestVal = value;
            bestMove = child;
        }
    });


    for(let i = 0; i < bestMove.length; i++) {
        if(getCellValue(i) != bestMove[i]) {
            setCellValue(i, 'O');
            let win = getWinCombo(Math.floor(i % gridWidth), Math.floor(i / gridWidth), AI);
            displayWin(win, AI);
        }
    }
    moveCount++;
}


function getBoardChildren(board, currentPlayer) {
    let children = [];
    for(let i = 0; i < board.length; i++) {
        if(board[i] == '') {
            board[i] = currentPlayer;
            children.push([...board]);
            board[i] = '';
        }
    }
    return children;
}

function getCellValue(x, y, board) {
    if(x == null)
        return;
    else if(typeof x === 'object')
        return x.innerHTML;
    else if(y == undefined)
        return cells[x].innerHTML;
    else
        return cells[y * gridWidth + x].innerHTML;
}

function minimax(board, depth, maximizingPlayer) {
    let score = scoreBoard(board, depth);
    if(depth == 0 || isTerminating(board) || score != 0)
        return score;
    if(maximizingPlayer) {
        let value = -10;
        getBoardChildren(board, AI).forEach(child => {
            value = Math.max(value, minimax(child, depth - 1, false));
        });
        return value;
    } else {
        let value = 10;
        getBoardChildren(board, player).forEach(child => {
            value = Math.min(value, minimax(child, depth - 1, true));
        });
        return value;
    }
}

function scoreBoard(board, depth) {
    let currentPlayer = "O";
    for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 3; j++) {
            if(getWinCombo(j, j, currentPlayer, board).length == 3) {
                if(currentPlayer == "O")
                    return 10;
                else
                    return -10
            }
        }
        currentPlayer = "X";
    }
    return 0;
}

function isTerminating(board) {
    for(let i = 0; i < board.length; i++) {
        if(board[i] == '')
            return false;
    }
    return true;
}

function setCellValue(i, value) {
    cells[i].innerHTML= value;
    cells[i].style.cursor = "default";
}

init() 

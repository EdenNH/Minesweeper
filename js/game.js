'use strict'

const FLAG_IMG = '<img src="img/flag.png">';
const MINE_IMG = '<img src="img/mine.png">';
const MINE_EXPLODE_IMG = '<img src="img/mineExplode.jpg">';
const MINE_CHECK_IMG = '<img src="img/mineCheck.png">';

var gBoard = [];
var gLevel = {};
var gState = {};
var gGameWon;


function init() {
    var elBoard = document.querySelector('.board');
    elBoard.style.display = 'none';
    var button = document.querySelector('.button');
    button.style.display = 'block';
    var buttonRetry = document.querySelector('.button-retry');
    buttonRetry.style.display = 'none';
    gBoard = [];
    gGameWon = false;
    gLevel = { SIZE: 0, MINES: 0 };
    gState = { 
        isGameOn: false, 
        shownCount: 0, 
        markedCount: 0, 
        secsPassed: 0 
    };
}


function buildBoard(size, mineNum) {
    var flagCount = document.getElementById("flag-count");
    flagCount.innerHTML = '' + mineNum;
    var playAgain = document.querySelector('.button-retry');
    playAgain.style.display = 'block';
    var button = document.querySelector('.button');
    button.style.display = 'none';
    gLevel = { 
        SIZE: size, 
        MINES: mineNum 
    };
    for (var i = 0; i < size; i++) {
        gBoard.push([]);
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false };
        }
    }
    renderBoard(gBoard);
}

function renderBoard(board) {
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j });
            if (currCell.isMine === true) cellClass += ' mine';
            else if (currCell.minesAroundCount > 0) cellClass += ' not-empty';
            else cellClass += ' empty';

            strHTML += '\t<td class="cell ' + cellClass +
                '" onmousedown="whichButton(event' + ',' + i + ',' + j + ',' + 'this)" oncontextmenu="return false;">\n';

            if (currCell.isMine === true) {
                strHTML += '\t' + MINE_IMG + '\n';
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
    elBoard.style.display = 'block';
}


function cellMarkedWithFlag(elCell, i, j) {
    if (gState.isGameOn === false || checkGameOver() === true || gBoard[i][j].isShown === true) return;
    if (gBoard[i][j].isMarked === true) {
        elCell.innerHTML = '';
        elCell.classList.remove('flag');
        gState.markedCount--;
        var flagCount = document.getElementById("flag-count");
        flagCount.innerHTML = '' + (gLevel.MINES - gState.markedCount);
        gBoard[i][j].isMarked = false;
        if (gBoard[i][j].isMine === true) elCell.innerHTML += MINE_IMG;
    } else {
        if (gState.markedCount === gLevel.MINES && gBoard[i][j].isMarked === false) return;
        else if (gBoard[i][j].isMarked === false && gState.markedCount < gLevel.MINES) {
            elCell.classList.add('flag');
            gState.markedCount++;
            var flagCount = document.getElementById("flag-count");
            flagCount.innerHTML = '' + (gLevel.MINES - gState.markedCount);
            gBoard[i][j].isMarked = true;
            elCell.innerHTML = FLAG_IMG;
        }
        var isDone = checkGameOver();
    }
    isDone = checkGameOver();
    if (gGameWon === true && isDone === true) {
        var elMineCheck = document.querySelectorAll('.flag');
        for (var i = 0; i < gState.markedCount; i++) {
            elMineCheck[i].innerHTML = '';
            elMineCheck[i].innerHTML += MINE_CHECK_IMG;
        } var playAgain = document.querySelector('.button-retry');
        playAgain.style.display = 'block';
    }
}


function checkGameOver() {
	if (gState.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
		gGameWon = true;
		return true;
	} if (gState.explode === true) return true;
	return false; 
}


function whichButton(event, i, j, elCell) {
	if (event.button === 0) cellClicked(elCell, i, j);
	else if (event.button === 2) cellMarkedWithFlag(elCell, i, j);
}


function setNeighborsMinesCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine === true) {
                mineNeighbors(i, j);
            }
        }
    }
    renderBoard(gBoard);
}


function mineNeighbors(mineI, mineJ) {
    for (var k = mineI - 1; k <= mineI + 1; k++) {
        if (k > -1 && k < gBoard.length) {
            for (var l = mineJ - 1; l <= mineJ + 1; l++) {
                if (l > -1 && l < gBoard[k].length) {
                    if (gBoard[k][l].isMine === false) {
                        var currCell = gBoard[k][l];
                        currCell.minesAroundCount++;
                    }
                }
            }
        }
    }
}


function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location);
    var elCell = document.querySelector(cellSelector);
    elCell.style.opacity = '0.5';
    if (elCell.innerHTML.length > 1) elCell.innerHTML += value;
}


function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown === true || gBoard[i][j].isMarked === true ||
        checkGameOver() === true) return;
    if (gState.isGameOn === false) {
        addMine(i, j);
        gState.isGameOn = true;
        var flagCount = document.getElementById("flag-count");
        flagCount.innerHTML = '' + gLevel.MINES;
        expandShown(elCell, i, j);
    } if (gBoard[i][j].isMine === true) {
        elCell.innerHTML = MINE_EXPLODE_IMG;
        gState.explode = true;
        var isDone = checkGameOver();
        var elMine = document.querySelectorAll('.mine img');
        for (var i = 0; i < gLevel.MINES; i++) {
            elMine[i].style.display = 'block';
        } var elMineCheck = document.querySelectorAll('.mine')
        for (var j = 0; j < gLevel.MINES; j++) {
            if (elMineCheck[j].classList.contains("flag")) {
                elMineCheck[j].innerHTML = '';
                elMineCheck[j].innerHTML += MINE_CHECK_IMG;
            }
        }
    }
    else if (gBoard[i][j].minesAroundCount > 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        expandShown(elCell, i, j);
    }
    else if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
        elCell.innerHTML = '';
        expandShown(elCell, i, j);
    }
    var isDone = checkGameOver();
    if (gGameWon === true && isDone === true) {
        alert('You Won!!!')
        var elMineCheck = document.querySelectorAll('.mine');
        for (var i = 0; i < gLevel.MINES; i++) {
            elMineCheck[i].classList.add('flag');
            elMineCheck[i].innerHTML = '';
            elMineCheck[i].innerHTML += MINE_CHECK_IMG;
        }
    }
}


function whichButton(event, i, j, elCell) {
    if (event.button === 0) cellClicked(elCell, i, j);
    else if (event.button === 2) cellMarkedWithFlag(elCell, i, j);
}


function expandShown(elCell, i, j) {
    if (gBoard[i][j].isShown === false) {
        var currCell = gBoard[i][j];
        if (currCell.isMine === true || currCell.isMarked === true) {
            return;
        } if (currCell.minesAroundCount > 0) {
            currCell.isShown = true;
            gState.shownCount++;
            renderCell({ i: i, j: j }, currCell.minesAroundCount);
            return;
        }
        if (currCell.minesAroundCount === 0) {
            currCell.isShown = true;
            gState.shownCount++;
            renderCell({ i: i, j: j }, '');
        }
        for (var k = i - 1; k <= i + 1; k++) {
            if (k > -1 && k < gLevel.SIZE) {
                for (var l = j - 1; l <= j + 1; l++) {
                    if (l > -1 && l < gLevel.SIZE) {
                        var location = { i: k, j: l };
                        var cellSelector = '.' + getClassName(location);
                        var elNextCell = document.querySelector(cellSelector);
                        expandShown(elNextCell, k, l);
                    }
                }
            }
        }
    }
}


function addMine(currIndI, currIndJ) {
    var mineCount = 0;
    while (mineCount < gLevel.MINES) {
        var randIndxRow = getRandomInt(0, gLevel.SIZE - 1);
        var randIndxCol = getRandomInt(0, gLevel.SIZE - 1);
        var mine = gBoard[randIndxRow][randIndxCol];
        if (mine.isMine === false && randIndxRow !== currIndI && randIndxCol !== currIndJ) {
            mine.isMine = true;
            mineCount++;
        }
    }
    setNeighborsMinesCount();
}



function restartGame() {
    var elBoard = document.querySelector('.board');
    elBoard.style.display = 'none';
    var button = document.querySelector('.button');
    button.style.display = 'block';
    var buttonRetry = document.querySelector('.button-retry');
    buttonRetry.style.display = 'none';
    cleanBoard();
    gBoard = [];
    gGameWon = false;
    gState = { isGameOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
    buildBoard(gLevel.SIZE, gLevel.MINES);
}


function cleanBoard() {
    var tds = document.querySelectorAll('.mine, .empty, .not-empty, .flag');
    for (var i = 0; i < tds.length; i++) {
        tds[i].classList.remove('mine', 'empty', 'not-empty', 'flag');
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}



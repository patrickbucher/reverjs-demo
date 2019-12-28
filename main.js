'use strict';

let Board = require('reverjs');
let board = new Board();
render(board.fields);

function deleteChildren(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function fieldId(row, col) {
    return `${row}-${col}`;
}

function randomElement(array) {
    if (array.length < 1) {
        throw new RangeError('array is empty');
    }
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

// TODO: This is the "AI". Improve it to play against a stronger player.
function opponentMove(board, player) {
    return randomOpponentMove(board, player);
}

function randomOpponentMove(board, player) {
    const moves = board.validMoves(player);
    if (moves.size < 1) {
        return undefined;
    }
    const move = randomElement([...moves]);
    return move;
}

function render(fields) {
    const boardDiv = document.getElementById('board');
    deleteChildren(boardDiv);
    for (let row in fields) {
        for (let col in fields[row]) {
            const fieldDiv = document.createElement('div');
            fieldDiv.id = fieldId(row, col);
            boardDiv.appendChild(fieldDiv);
            fieldDiv.classList.add('field');
            if (col % 8 == 0) {
                fieldDiv.classList.add('clear');    
            }
            let style = '';
            if (fields[row][col] == 0) {
                style = 'empty';
                fieldDiv.addEventListener('click', selectField);
            } else if (fields[row][col] == 1) {
                style = 'playerOne';
            } else if (fields[row][col] == 2) {
                style = 'playerTwo';
            }
            fieldDiv.classList.add(style);    
        }
        const playerOne = document.getElementById('playerOne');
        const playerTwo = document.getElementById('playerTwo');
        const result = board.result();
        playerOne.textContent = result.playerOne;
        playerTwo.textContent = result.playerTwo;
        const statusDiv = document.getElementById('status');
        if (result.finished) {
            const resultDiv = document.getElementById('result');
            if (result.tied) {
                resultDiv.textContent = 'Tied';
            } else if (result.winner == 1) {
                resultDiv.textContent = 'Black Wins';
            } else if (result.winner == 2) {
                resultDiv.textContent = 'White Wins';
            }
            statusDiv.textContent = 'Reload page to restart the game';
        } else {
            statusDiv.textContent = '';
        }
    }

    function selectField(e) {
        let unableToMove = 0;
        const statusDiv = document.getElementById('status');
        const moves = board.validMoves(1);
        if (moves.size > 0) {
            const id = e.target.id;
            const matches = id.match(/([0-9]{1})-([0-9]{1})/);
            const row = Number(matches[1]);
            const col = Number(matches[2]);
            let valid = false;
            for (const move of moves) {
                if (move[0] == row && move[1] == col) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                statusDiv.textContent = 'invalid move';
                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 2000);
                return;
            }
            board = board.play(row, col, 1);
            const pickedFieldId = fieldId(row, col);
            document.getElementById(pickedFieldId).removeEventListener('click', selectField);
            render(board.fields);
            if (board.result().finished) {
                return;
            }
        } else {
            unableToMove++;
            statusDiv.textContent = 'Black is unable to move, skipping...';
        }
        setTimeout(() => {
            const move = opponentMove(board, 2);
            if (move === undefined) {
                unableToMove++;
                statusDiv.textContent = 'White is unable to move, skipping...';
                if (unableToMove == 2) {
                    statusDiv.textContent = 'Game is stuck (no more possible moves)';
                }
                return;
            }
            const [r, c] = move;
            board = board.play(r, c, 2);
            document.getElementById(`${r}-${c}`).removeEventListener('click', selectField);
            render(board.fields);
        }, 1000);
    }
}

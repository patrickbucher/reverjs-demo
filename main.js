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
//
// Ideas:
//
// 1) Apply all valid moves to board and pick the one with the best outcome.
// 2) Try to capture the corners (can't be taken away).
// 3) Try not to capture the three fields around the corner, for they give the
//    opponent a chance to capture the corner.
// 4) Apply the Minimax algorithm (with recursion) too simulate n moves ahead.
// 5) Try to capture whole triangles around the corners, which cannot be taken
//    away afterwards.
// 6) [insert your idea]
function opponentMove(board, player) {
    // TODO: raise level for stronger bot
    const minimaxLevel = 3;
    const min = Number.MIN_SAFE_INTEGER;
    const max = Number.MAX_SAFE_INTEGER;
    return minimaxMove(board, player, minimaxLevel, min, max);
}

function minimaxMove(board, player, depth, alpha, beta) {
    const opponent = player == 1 ? 2 : 1;
    let bestMove = undefined;
    let bestLead = alpha;
    const validMoves = board.validMoves(player)
    if (validMoves.length == 0) {
        return undefined;
    }
    const emptyFields = board.fieldsWithState(0);
    depth = depth > emptyFields ? emptyFields : depth;
    for (const move of validMoves) {
        let newBoard = board.play(move[0], move[1], player);
        let standing = newBoard.result();
        if (depth > 0) {
            const nextMove = minimaxMove(newBoard, opponent, depth - 1);
            if (nextMove) {
                newBoard = newBoard.play(nextMove[0], nextMove[1], opponent, -beta, -bestLead);
                standing = newBoard.result();
            }
        }
        const diff = standing.playerOne - standing.playerTwo;
        const lead = player == 1 ? diff : diff * -1;
        if (lead > bestLead) {
            bestLead = lead;
            bestMove = move;
            if (bestLead >= beta) {
                return move;
            }
        }
    }
    if (bestMove === undefined) {
        bestMove = randomMove(board, player);
    }
    return bestMove;
}

function randomMove(board, player) {
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
        }, 1250);
    }
}

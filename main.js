'use strict';

let Board = require('reverjs');

let board = new Board();
render(board.fields);

function render(fields) {
    const boardDiv = document.getElementById('board');
    while (boardDiv.firstChild) {
        boardDiv.removeChild(boardDiv.firstChild);
    }
    for (let row in fields) {
        for (let col in fields[row]) {
            const fieldDiv = document.createElement('div');
            fieldDiv.id = `${row}-${col}`;
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
        if (result.finished) {
            const resultDiv = document.getElementById('result');
            if (result.tied) {
                resultDiv.textContent = 'Tied';
            } else if (result.winner == 1) {
                resultDiv.textContent = 'Black Wins';
            } else if (result.winner == 2) {
                resultDiv.textContent = 'White Wins';
            }
        }
    }

    function selectField(e) {
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
                window.alert('invalid move');
                return;
            }
            board = board.play(row, col, 1);
            document.getElementById(`${row}-${col}`).removeEventListener('click', selectField);
            render(board.fields);
        }
        setTimeout(() => {
            const opponentMoves = board.validMoves(2);
            if (opponentMoves.size > 0) {
                const moveIndex = Math.floor(Math.random() * opponentMoves.size);
                const [r, c] = [...opponentMoves][moveIndex];
                board = board.play(r, c, 2);
                document.getElementById(`${r}-${c}`).removeEventListener('click', selectField);
                render(board.fields);
            } else {
                console.log('opponent is stuck, your turn');
            }
        }, 1000);
    }
}

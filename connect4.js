/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
const players = [
  '',
  {
    name: '',
    color:'red'
  },
  {
    name:'',
    color:'blue'
  }
]
let currPlayer = 1; // active player: 1 or 2
let htmlBoard = []; // array of rows, each row is array of cells  (board[y][x])
let gameStillRunning = true; //This is a variable to track if the game has ended or is still being played 

const startBtn = document.getElementById('start-button');
const game = document.getElementById('game');
const playerTurn = document.querySelector('.player-turn');
const reset = document.getElementById('reset');

startBtn.addEventListener('click', function (e) {
 e.preventDefault();

  // This sets up a prompt to allow players to enter their names and use it to play the game once the game starts
  //The first name entered is assigned the currPlayer value of 1

  for(let index = 1; index < players.length; index++){
    players[index].name = prompt(`Player ${index} enter your name, you will be red! `)
  }

    playerTurn.innerText = `${players[1].name}'s turn`;
    game.style.opacity = 1;
    makeBoard();
    makeHtmlBoard();
    
    startBtn.remove();

})

reset.addEventListener('click',function(evt){
evt.preventDefault();

// When the reset button is clicked, the board is to remain but all rows and pieces are to be removed and replaced by new 
//empty rows.

  const allRows = document.querySelectorAll('tr');
  for(let row of allRows){
    row.remove();
  }
  htmlBoard = [];
  makeBoard();
  makeHtmlBoard();
  currPlayer = 1;
  playerTurn.style.color = "#F7F603";
  playerTurn.innerText = `${players[currPlayer].name}'s turn`
  gameStillRunning = true;
  reset.style.opacity = 0;
})


/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  for(let y = 0; y < HEIGHT; y++){
    htmlBoard.push(Array.from({length: WIDTH}));
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  const htmlBoard = document.getElementById('board');
  // Add the top section of the column which when clicked will allow pieces to be dropped 
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // make board entries 
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  // Going through each column from the second row, not including the top, check if the cells are empty, if so y if filled return null
  for(let y = HEIGHT -1; y >=0; y--){
    if(!htmlBoard[y][x]){
      return y
    }
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
  const piece = document.createElement("div");
  piece.classList.add('piece')
  piece.classList.add(`p${currPlayer}`);
  piece.style.top = -50 * (y + 2);
  const place = document.getElementById(`${y}-${x}`);
  place.append(piece);
}

/** endGame: announce game end */
function endGame(msg) {
//Set the variable used to track if the game is still running to false 
  gameStillRunning = false;
// Alert msg when game has ended, use built in setTimeOut method to delay alert until the 4 connected pieces can be seen
  setTimeout(() => {
    alert(msg);
    reset.style.opacity = 1;
  }, 100)

}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
if(gameStillRunning === false) return;
// get x from ID of clicked cell
  let x = +evt.target.id;

// get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }
// place piece in board and add to HTML table
  htmlBoard[y][x] = currPlayer;
  placeInTable(y, x);

// check for win
  if (checkForWin()) {
    playerTurn.style.color = players[currPlayer].color;
    return endGame(`${players[currPlayer].name} has won the game!`);
  }

// check for tie, we check to see if all cells in board are filled; if so, call endGame
  if(checkForTie()){
    return endGame("Tie Game!")
  }

// switch players
  switchCurrPlayer();
}

// We check if the current player is player 1 using ternary operator, if it's 1 we switch to player 2, if not player one takes turn
function switchCurrPlayer(){
  currPlayer = currPlayer === 1 ? 2 : 1;
  playerTurn.innerText = `${players[currPlayer].name}'s turn`;
}

/** checkForTie: check board cell-by-cell for "are all cells filled?" */
function checkForTie(){
  return htmlBoard.every(row => row.every(cell => cell))
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        htmlBoard[y][x] === currPlayer
    );
  }

  // This for loop goes through each cell starting at [x,y] = [0,0] checking if there are four cells filled up consecutively 
  // in the four directions listed horizontal, vertical, right diagonal and left diagonal. If one of these directions have 4 pieces
  //it returns true.

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

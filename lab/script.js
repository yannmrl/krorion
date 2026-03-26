const rows = 21;
const cols = 21;
const colsVisible = 5;
const maxCoins = 25;
let rowsVisible = 0;
let maze = [];
let player = { x: 1, y: 1 };
let enemy = null;
let moveCount = 0;
let initialPlayerPos = { x: player.x, y: player.y };
let playerMoves = [];
let coinsLeft = maxCoins;
let win = 0;
let isAlive = false;

function load_lab()
{
    if (localStorage.getItem("uuid") == null)
        back();
    
    uuid = localStorage.getItem("uuid");

    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?uuid=${uuid}&isalive=true`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function ()
    {
        if (httpRequest.readyState === 4)
        {
            if (httpRequest.status === 200)
            {
                if (parseInt(httpRequest.responseText) == 1) isAlive = true;
                else showLabel("Reviens demain pour récupérer plus de pièces");
                generateMaze();
                drawMaze(); 
            }
        }
    }
}

// DFS
function generateMaze() {
    for (let y = 0; y < rows; y++)
    {
        maze[y] = [];
        for (let x = 0; x < cols; x++)
            maze[y][x] = 1;
    }

    function carve(x, y)
    {
        maze[y][x] = 0;

        if (coinsLeft && Math.random() < rows * cols / maxCoins / 100)
        {
            maze[y][x] = 0.5;
            coinsLeft--;
        }

        let directions = [[0, 2], [0, -2], [2, 0], [-2, 0]];
        directions.sort(() => Math.random() - 0.5);

        for (let [dx, dy] of directions)
        {
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && maze[ny][nx] === 1)
            {
                maze[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);

                if (Math.random() < 0.3)
                {
                    let extraDirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
                    extraDirs = extraDirs.filter(d => d[0] !== dx || d[1] !== dy);
                    for (let [ex, ey] of extraDirs)
                    {
                        let exx = nx + ex, eyy = ny + ey;
                        if (exx > 0 && exx < cols - 1 && eyy > 0 && eyy < rows - 1 && maze[eyy][exx] === 1)
                        {
                            maze[ny + ey / 2][nx + ex / 2] = 0;
                            maze[eyy][exx] = 0;
                        }
                    }
                }
            }
        }
    }

    carve(1, 1);
}

function drawMaze()
{
    const mazeDiv = document.getElementById('maze');
    mazeDiv.innerHTML = '';

    const cellSize = Math.floor(window.innerWidth / colsVisible);
    rowsVisible = Math.floor(window.innerHeight / cellSize);

    const visionRadiusX = Math.floor(colsVisible / 2);
    const visionRadiusY = Math.floor(rowsVisible / 2);

    for (let y = player.y - visionRadiusY; y <= player.y + visionRadiusY; y++)
    {
        for (let x = player.x - visionRadiusX; x <= player.x + visionRadiusX; x++)
        {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const hash = (x * 73856093) ^ (y * 19349663);
            mur = (Math.abs(hash) % 30) + 1;
            if (mur > 4) mur = 0;

            if (x < 0 || y < 0 || x >= cols || y >= rows)
                cell.style.backgroundImage = `url('assets/mur${mur}.png')`;
            else
            {
                if (maze[y][x] === 1)
                    cell.style.backgroundImage = `url('assets/mur${mur}.png')`;
                else if (maze[y][x] === 0.5)
                {
                    cell.style.backgroundImage = `url('assets/piece.png')`;
                }
                else
                    cell.style.backgroundImage = "url('assets/sol.png')";
                if (isAlive)
                {
                    if (x === player.x && y === player.y)
                        cell.style.backgroundImage = "url('assets/fugitifjpg.png')";
                    if (enemy && x === enemy.x && y === enemy.y)
                        cell.style.backgroundImage = "url('assets/traqueurjpg.png')";
                }
                else
                {
                    if (x === player.x && y === player.y)
                        cell.style.backgroundImage = "url('assets/traqueurjpg.png')";
                    if (enemy && x === enemy.x && y === enemy.y)
                        cell.style.backgroundImage = "url('assets/sol.png')";
                }
            }

            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            mazeDiv.appendChild(cell);
        }
    }

    mazeDiv.style.gridTemplateColumns = `repeat(${colsVisible}, ${cellSize}px)`;
    mazeDiv.style.gridTemplateRows = `repeat(${rowsVisible}, ${cellSize}px)`;

    updateFog(cellSize);
}

function updateFog(cellSize)
{
    const innerRadius = cellSize * 0.8;
    const outerRadius = cellSize * 2.6;
    document.getElementById('fog').style.background =
    `
        radial-gradient(circle ${outerRadius}px at 50% 50%, 
        rgba(0,0,0,0) ${innerRadius}px, 
        rgba(0,0,0,1) ${outerRadius}px)
    `;

    if (enemy) setTimeout(() => {if (player.x == enemy.x && player.y == enemy.y) {lost(); return;}}, 10);
}

function findTupleIndex(arr, tuple)
{
    for (let i = 0; i < arr.length; i++)
    {
        if (arr[i][0] === tuple[0] && arr[i][1] === tuple[1])
            return i;
    }

    return -1;
}

function push(x, y)
{
    if (i = findTupleIndex(playerMoves, [x, y]) >= 0)
        playerMoves.splice(i+2);
    else playerMoves.push([x, y]);
}

function move(direction)
{
    if (!isAlive) return;
    let dx = 0, dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    let nx = player.x + dx;
    let ny = player.y + dy;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] !== 1)
    {
        player.x = nx;
        player.y = ny;
        if (maze[player.y][player.x] === 0.5)
        {
            if (!win == 1)
            {
                var httpRequest = getHttpRequest();
                httpRequest.open('GET', `db.php?began=${uuid}`, true);
                httpRequest.send();
            }
            win++;
            if (win > 1) showLabel(`+${win} pièces`);
            else showLabel(`+${win} pièce`);
            maze[player.y][player.x] = 0;
        }
        push(nx, ny);
        moveCount++;

        if (moveCount === 2 && !enemy)
            enemy = { x: initialPlayerPos.x, y: initialPlayerPos.y };

        if (moveCount > 4)
            moveEnemy();

        drawMaze();
    }
}

function lost()
{
    isAlive = false;
    //localStorage.setItem('balance', parseInt(localStorage.getItem('balance'))+win);
    showGameOver();
    var httpRequest = getHttpRequest();
    httpRequest.open('GET', `db.php?win=${win}&uuid=${uuid}`, true);
    httpRequest.send();
}

function moveEnemy()
{
    if (player.x == enemy.x && player.y == enemy.y) {lost(); return;}
    pos = playerMoves.shift();
    enemy.x = pos[0];
    enemy.y = pos[1];
}

function showLabel(s)
{
	const label = document.getElementById('label');
	label.innerHTML = s;

	label.classList.add('visible');

	setTimeout(() =>
	{
		label.classList.remove('visible');
	}, 2000);
}


function showGameOver()
{
    document.getElementById("krollars").textContent = `${parseInt(win)}`;

    document.getElementById("gameOverPopup").style.display = "flex";
}

function closePopup()
{
    document.getElementById("gameOverPopup").style.display = "none";
}


document.addEventListener('keydown', (event) =>
{
    if (event.key === 'ArrowUp') move('up');
    if (event.key === 'ArrowDown') move('down');
    if (event.key === 'ArrowLeft') move('left');
    if (event.key === 'ArrowRight') move('right');
});

var getHttpRequest = function () {
	var httpRequest = false;

	if (window.XMLHttpRequest) {
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType) {
			httpRequest.overrideMimeType('text/xml');
		}
	}
	else if (window.ActiveXObject) {
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {}
		}
	}
	if (!httpRequest) {
		return false;
	}
	return httpRequest;
}
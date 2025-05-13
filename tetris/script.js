const canvas = document.getElementById("tetris")
const context = canvas.getContext("2d")
const scoreCount = document.getElementById("score")
const levelCount = document.getElementById("level")
const linesCount = document.getElementById("lines")
const startButton = document.getElementById("startButton")
const restartButton = document.getElementById("restartButton")
let queueShape1 = document.getElementById("queueShape1")
let queueShape2 = document.getElementById("queueShape2")
let queueShape3 = document.getElementById("queueShape3")

const blockSize = 30
const columns = 10
const rows = 20

canvas.width = columns * blockSize
canvas.height = rows * blockSize

context.scale(blockSize, blockSize)

let map = createShape(columns, rows)
let gameRunning = false

let dropCounter = 0
let dropInterval = 1000
let lastTime = 0
const shapeQueue = []

const shapes = {
    I: [[1, 1, 1, 1]],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1],
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
    ]
}

const shapeColors = {
    I: "#00f0f0",
    O: "#f0f000",
    T: "#a000f0",
    L: "#f0a000",
    J: "#0000f0",
    Z: "#f00000",
    S: "#00f000"
}

const player = {
    pos: { x: 0, y: 0 },
    currentShape: null
}

function createShape(width, height) {
    const currentShape = []
    while (height--) {
        currentShape.push(new Array(width).fill({ value: 0, color: null }))
    }
    return currentShape
}

function drawShape(currentShape, offset, shapeType = null) {
    currentShape.forEach((row, y) => {
        row.forEach((cell, x) => {
            let color
            if (typeof cell === "object") {
                color = cell.value !== 0 ? cell.color : null
            } else {
                color = cell !== 0 ? shapeColors[shapeType] : null
            }

            if (color) {
                context.fillStyle = color
                context.fillRect(x + offset.x, y + offset.y, 1, 1)
            }
        })
    })
}

function drawQueueShape(shape, color, canvasId) {
    const canvas = document.getElementById(canvasId)
    const context = canvas.getContext("2d")

    const blockSize = 20
    context.clearRect(0, 0, canvas.width, canvas.height)

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color
                context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
            }
        })
    })
}

function collide(map, player) {
    const [shape, offset] = [player.currentShape, player.pos];
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[y].length; ++x) {
            if (
                shape[y][x] !== 0 &&
                (map[y + offset.y] &&
                    map[y + offset.y][x + offset.x] &&
                    map[y + offset.y][x + offset.x].value) !== 0
            ) {
                return true
            }
        }
    }
    return false
}

function merge(map, player) {
    player.currentShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                map[y + player.pos.y][x + player.pos.x] = {
                    value,
                    color: shapeColors[shapeQueue[0]],
                }
            }
        })
    })
}

function clearLines() {
    let rowCount = 0
    for (let y = map.length - 1; y >= 0; --y) {
        if (map[y].every(cell => cell.value !== 0)) {
            const row = map.splice(y, 1)[0];
            map.unshift(row.map(() => ({ value: 0, color: null })))
            rowCount++
            y++
        }
    }

    if (rowCount > 0) {
        linesCount.textContent = parseInt(linesCount.textContent) + rowCount
        scoreCount.textContent = parseInt(scoreCount.textContent) + rowCount * 100
        if (parseInt(linesCount.textContent) % 10 === 0) {
            dropInterval = Math.max(100, dropInterval - 100)
            levelCount.textContent = parseInt(levelCount.textContent) + 1
        }
    }
}

function rotate(currentShape) {
    return currentShape[0].map((_, i) => currentShape.map(row => row[i]).reverse())
}

function playerDrop() {
    player.pos.y++
    if (collide(map, player)) {
        player.pos.y--
        merge(map, player)
        resetPlayer()
        clearLines()
    }
    dropCounter = 0
}

function resetPlayer() {
    const pieces = "IOTLJSZ";
    if (shapeQueue.length === 0) {
        for (let i = 0; i < 4; i++) {
            const randomPiece = pieces[Math.floor(pieces.length * Math.random())]
            shapeQueue.push(randomPiece)
        }
    }else{
        shapeQueue.push(pieces[Math.floor(pieces.length * Math.random())])
    }

    drawQueueShape(shapes[shapeQueue[1]], "#fff", "queueShape1")
    drawQueueShape(shapes[shapeQueue[2]], "#fff", "queueShape2")
    drawQueueShape(shapes[shapeQueue[3]], "#fff", "queueShape3")

    player.currentShape = shapes[shapeQueue[0]]
    player.pos.y = 0
    player.pos.x = (columns / 2 | 0) - (player.currentShape[0].length / 2 | 0)

    if (collide(map, player)) {
        gameRunning = false
        restartButton.disabled = false
    }else{
        shapeQueue.shift()
    }
}

function draw() {
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)

    drawShape(map, { x: 0, y: 0 }, null)
    drawShape(player.currentShape, player.pos, shapeQueue[0])
}


function update(time = 0) {
    if (!gameRunning) return

    const deltaTime = time - lastTime
    lastTime = time

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop()
    }

    draw()
    requestAnimationFrame(update)
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true
        resetPlayer()
        update()
        startButton.disabled = true
        restartButton.disabled = false
    }
}

function restartGame() {
    gameRunning = false
    map = createShape(columns, rows)
    shapeQueue.length = 0
    linesCount.textContent = "0"
    scoreCount.textContent = "0"
    levelCount.textContent = "0"
    dropInterval = 1000

    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawQueueShape([], null, "queueShape1");
    drawQueueShape([], null, "queueShape2");
    drawQueueShape([], null, "queueShape3");
    startButton.disabled = false
    restartButton.disabled = true
}

startButton.addEventListener("click", startGame)
restartButton.addEventListener("click", restartGame)

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "a") {
        player.pos.x--
        if (collide(map, player)) {
            player.pos.x++
        }
    } 
    else if (event.key === "ArrowRight" || event.key === "d") {
        player.pos.x++
        if (collide(map, player)) {
            player.pos.x--
        }
    } 
    else if (event.key === "ArrowDown" || event.key === "s") {
        playerDrop()
    } 
    else if (event.key === "ArrowUp" || event.key === "w") {
        player.currentShape = rotate(player.currentShape)
        if (collide(map, player)) {
            player.currentShape = rotate(player.currentShape, -1)
        }
    }
})

resetPlayer()
update()
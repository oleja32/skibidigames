const canvas = document.getElementById("tetris")
const context = canvas.getContext("2d")
const scoreCount = document.getElementById("score")
const levelCount = document.getElementById("level")
const linesCount = document.getElementById("lines")
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

const player = {
    pos: { x: 0, y: 0 },
    currentShape: null
}

function createShape(width, height) {
    const currentShape = []
    while (height--) {
        currentShape.push(new Array(width).fill(0))
    }
    return currentShape
}

function drawShape(currentShape, offset) {
    currentShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "white"
                context.fillRect(x + offset.x, y + offset.y, 1, 1)
            }
        })
    })
}

function collide(map, player) {
    const [shape, offset] = [player.currentShape, player.pos]
    for(let y = 0; y < shape.length; ++y){
        for(let x = 0; x < shape[y].length; ++x){
            if(shape[y][x] !== 0 
            &&(map[y + offset.y] && map[y + offset.y][x + offset.x]) !== 0){
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
                map[y + player.pos.y][x + player.pos.x] = value
            }
        })
    })
}

function clearLines() {
    outer: for (let y = map.length - 1; y >= 0; --y) {
        for (let x = 0; x < map[y].length; ++x) {
            if (map[y][x] === 0) {
                continue outer
            }
        }
        const row = map.splice(y, 1)[0].fill(0)
        map.unshift(row)
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
    const pieces = "IOTLJSZ"
    if(shapeQueue.length === 0){
        for (let i = 0; i < 4; i++) {
            const randomPiece = pieces[pieces.length * Math.random() | 0]
            shapeQueue.push(randomPiece)
        }
    }
    else{
        shapeQueue.push(pieces[pieces.length * Math.random() | 0])
    }
    [queueShape1.innerHTML, queueShape2.innerHTML, queueShape3.innerHTML] = [shapeQueue[1], shapeQueue[2], shapeQueue[3]]
    player.currentShape = shapes[shapeQueue[0]]
    player.pos.y = 0
    player.pos.x = (columns / 2 | 0) - (player.currentShape[0].length / 2 | 0)
    if (collide(map, player)) {
        map = createShape(columns, rows)
    }
    shapeQueue.shift()
}

function draw() {
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)

    drawShape(map, { x: 0, y: 0 })
    drawShape(player.currentShape, player.pos)
}

function update(time = 0) {
    const deltaTime = time - lastTime
    lastTime = time

    dropCounter += deltaTime
    if (dropCounter > dropInterval) {
        playerDrop()
    }

    draw()
    requestAnimationFrame(update)
}

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
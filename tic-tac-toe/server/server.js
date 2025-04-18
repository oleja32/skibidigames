const express = require("express");
const path = require("path");
const http = require("http")
const WebSocket = require("ws");

const app = express();
app.use(express.static(path.join(__dirname, "..", "client")))
app.listen(3000);

const httpServer = http.createServer();
const wss = new WebSocket.Server({ server: httpServer })
httpServer.listen(8080);

const clientConnections = {};
const opponents ={};
let clientIdsWaitingMatch =[];

wss.on("connection", connection => {
const clientId = createClientId();
    clientConnections[clientId] = connection;

    matchClients(clientId);

    connection.on("message", message => {
        const result = JSON.parse(message);
        if (result.method === "move") {
            moveHandler(result, clientId);
        }
    });
})

function matchClients(clientId) {
    clientIdsWaitingMatch.push(clientId);

    if (clientIdsWaitingMatch.length < 2) return;

    const firstClientId = clientIdsWaitingMatch.shift();
    const secondClientId = clientIdsWaitingMatch.shift();

    opponents[firstClientId] = secondClientId;
    opponents[secondClientId] = firstClientId;

    clientConnections[firstClientId].send(JSON.stringify({
        method: "join",
        symbol: "X",
        turn: "X"
    }));

    clientConnections[secondClientId].send(JSON.stringify({
        method: "join",
        symbol: "O",
        turn: "X"
    }));
}

function moveHandler(result, clientId) {
    const opponentClientId = opponents[clientId];

    if (CheckWin(result.field)) {
        [clientId, opponentClientId].forEach(cId => {
            clientConnections[cId].send(JSON.stringify({
                method: "result",
                message: `${result.symbol} win`,
                field: result.field
            }));
        });
        return;
    }

    if (CheckDraw(result.field)) {
        [clientId, opponentClientId].forEach(cId => {
            clientConnections[cId].send(JSON.stringify({
                method: "result",
                message: "Draw",
                field: result.field
            }));
        });
        return;
    }

    [clientId, opponentClientId].forEach(cId => {
        clientConnections[cId].send(JSON.stringify({
            method: "update",
            turn: result.symbol === "X" ? "O" : "X",
            field: result.field
        }));
    })
}

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // collumns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

function CheckWin(field) {
    return winningCombos.some(combo => {
        const [first, second, third] = combo;
        return field[first] !== "" && field[first] === field[second] && field[first] === field[third]; 
    });
}

function CheckDraw(field) {
    return field.every(symbol => symbol === "X" || symbol === "O");
}

let clientIdCounter = 0;
function createClientId() {
    clientIdCounter++;
    return clientIdCounter;
}
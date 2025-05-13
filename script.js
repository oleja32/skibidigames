const container = document.getElementById('container')
const searchBar = document.getElementById('searchBar')
const searchBtn = document.getElementById('searchBtn')

const items = [
    {id: '1', name: 'Tetris', link: 'tetris/index.html', description: 'Tetris is a series of puzzle video games created in 1985 by Alexey Pajitnov. In Tetris games, falling tetromino shapes must be neatly sorted into a pile; once a horizontal line of the game board is filled in, it disappears, granting points and preventing the pile from overflowing.'},
    {id: '2', name: 'Tic Tac Toe', link: 'tic-tac-toe/index.html', description: 'Tic-tac-toe is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row first is the winner.'},
    {id: '3', name: 'Flappy Bird', link: 'flappybird/index.html', description: 'Flappy Bird is a casual game. The game is a side-scroller where the player controls a bird, attempting to fly between columns of green pipes without hitting them. The player\'s score is determined by the number of pipes they pass.'},
    {id: '4', name: 'Dinosaur Game', link: 'dinogame/index.html', description: 'The Dinosaur Game (also known as the Chrome Dino) is a browser game developed by Google. The player guides a pixelated t-rex across a side-scrolling landscape, avoiding obstacles to achieve a higher score.'}
]

items.forEach(item => {
    container.innerHTML += `
    <div class="item">
            <div class="itemDiv1">
                <p class="itemName">${item.name}</p>
                <img src="images/${item.id}.png" alt="Failed to load the image.">
            </div>
            <div class="itemDiv2">
                <p class="itemDesc">
                    ${item.description}
                </p>
                <a href="${item.link}"><button class="lookBtn">Play</button></a>
            </div>
        </div>
    `
})

const htmlItems = document.querySelectorAll('.item')

function search(){
    htmlItems.forEach(htmlItem => {
        if(htmlItem.firstElementChild.firstElementChild.innerHTML.includes(searchBar.value)
        || htmlItem.firstElementChild.firstElementChild.innerHTML.toLowerCase().includes(searchBar.value)
        || htmlItem.firstElementChild.firstElementChild.innerHTML.toUpperCase().includes(searchBar.value)){
            htmlItem.style.display = 'flex'
        }else{
            htmlItem.style.display = 'none'
        }
    })
}

searchBtn.addEventListener('click', search)
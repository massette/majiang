bonuses = document.getElementById("bonus")
tiles = document.getElementById("hand")

const update_tiles = () => {
    while (tiles.firstChild) tiles.removeChild(tiles.firstChild)
    if (user.hand) {
        user.hand.forEach((v,i) => {
            let tile = new Image()
            tile.src = `assets/${v}-tile.png`
            tile.onclick = () => {
                console.log(`clicked tile: ${i}`)
            }
            if (v.includes("bonus")) {
                bonuses.appendChild(tile)
            } else {
                tiles.appendChild(tile)
            }
        })
    }
}

soc.on("setup",(g) => {
    if (!user.hand) soc.emit("draw",13)
    else { update_tiles() }
})

soc.on("add:cards",(tiles) => {
    if (!user.hand) user.hand = []
    console.log(tiles)
    user.hand = user.hand.concat(tiles)

    update_tiles()
    soc.emit("update:user",user)
})
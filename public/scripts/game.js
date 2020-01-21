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

const check_turns = (g) => {
    _draw = document.getElementById("draw")

    console.log("is this defeat")

    if (g.members[g.playing].id == soc.id) {
        _draw.className = "block small"
        _draw.onclick = () => { soc.emit("draw",1,true); check_turns() }
    } else {
        _draw.className = "disabled block small"
        _draw.onclick = null
    }
}

soc.on("setup",(g) => {
    if (!user.hand) soc.emit("draw",13)
    else { update_tiles() }

    check_turns(g)
})

soc.on("check:turns",check_turns)

soc.on("add:cards",(tiles) => {
    if (!user.hand) user.hand = []
    console.log(tiles)
    user.hand = user.hand.concat(tiles)

    update_tiles()
    soc.emit("update:user",user)
})
/*bonuses = document.getElementById("bonus")
tiles = document.getElementById("hand")

selected = []

const select_tile = (i) => {
    if (i != undefined) {
        if (selected.includes(i)) selected.splice(selected.indexOf(i),1)
        else { selected.push(i) }
    }

    _sel = document.getElementById("selected")
    while (_sel.firstChild) _sel.removeChild(_sel.firstChild)

    if (selected.length) {
        _sel.className = "block"
        selected.forEach((v,i) => {
            let tile = new Image()
            tile.src = `assets/${user.hand[v]}-tile.png`
            tile.onclick = () => {
                select_tile(v)
            }
            _sel.appendChild(tile)
        })
    } else {
        _sel.className = "disabled block"
        _sel.innerText = "Nothing selected"
    }

    _dis = document.getElementById("discard-tile")
    if (selected.length > 0 && user.hand.length - selected.length == 13) {
        _dis.className = "block"
        _dis.onclick = () => {
            let last
            selected.forEach((v,i) => {
                last = user.hand.splice(v,1)[0]
            })

            soc.emit("update:user",user)

            selected = []

            select_tile()
            update_tiles()

            soc.emit("next:turn",last)
        }
    } else {
        _dis.className = "disabled block"
    }
}

const update_tiles = () => {
    while (tiles.firstChild) tiles.removeChild(tiles.firstChild)
    while (bonuses.firstChild) bonuses.removeChild(bonuses.firstChild)

    if (user.hand) {
        user.hand.forEach((v,i) => {
            let tile = new Image()
            tile.src = `assets/${v}-tile.png`
            tile.onclick = () => {
                select_tile(i)
            }
            if (v.includes("bonus")) {
                bonuses.appendChild(tile)
            } else {
                console.log(v)
                tiles.appendChild(tile)
            }
        })
    }
}

const check_turns = (g) => {
    _draw = document.getElementById("draw")

    if (g.members[g.playing].id == soc.id && user.hand.length <= 13) {
        _draw.className = "block small"
        _draw.onclick = () => {
            soc.emit("draw",1,true)
        
            _draw.onclick = null
            _draw.className = "disabled block small"
            console.log("why is everything breaking")
            
            soc.emit("delete:lastcard")
        }
    } else {
        _draw.className = "disabled block small"
        _draw.onclick = null
    }
}
*/

soc.on("setup:game",(g) => {
    if (!user.hand) soc.emit("draw:card",13)
    else { tiles() }

    _u = g.members.map((v,i) => (i))
    _u = _u.filter((v,i) => (g.members[i].id == soc.id))

    let ch = ""

    if (_u.length) {
        _u = _u[0]
        ch = CHINESE[(_u + 1) + "d"]
    }

    document.getElementById("back-text").innerText = ch

    _discard = document.getElementById("pickup")

    while (_discard.firstChild) _discard.removeChild(_discard.firstChild)

    if (g.discard) {
        _discard.className = ""
        
        _tile = new Image()
        _tile.src = `assets/${g.discard}-tile.png`
        _tile.onclick = () => {
            soc.emit("draw:card",-1)
        }
        _discard.appendChild(_tile)

        _label = document.createElement("div")
        _label.className = "label"
        _label.innerText = "Steal Discard"
        _discard.appendChild(_label)

    } else {
        _discard.className = "disabled"
        
        _tile = new Image()
        _tile.src = `assets/empty-tile.png`
        _tile.onclick = () => {
            if (user.drawing) {
                soc.emit("draw:card",-1)
            }
        }
        _discard.appendChild(_tile)

        _label = document.createElement("div")
        _label.className = "label"
        _label.innerText = "No discard..."
        _discard.appendChild(_label)
    }
})

/*
soc.on("setup",(g) => {
    if (!user.hand) soc.emit("draw",13)
    else { update_tiles() }

    _u = g.members.map((v,i) => (i))
    _u = _u.filter((v,i) => (g.members[i].id == soc.id))

    let ch

    if (_u.length) {
        _u = _u[0]

        ch = CHINESE[(_u + 1) + "d"]
    }

    document.getElementById("back-text").innerText = ch
    --

    _disc = document.getElementById("discard")
    while (_disc.firstChild) _disc.removeChild(_disc.firstChild)

    if (g.last_discard) {
        _disc.className = "block"
        let tile = new Image()
        tile.src = `assets/${g.last_discard}-tile.png`
        tile.onclick = () => {
            user.hand.push(g.last_discard)
            soc.emit("delete:lastcard")
            soc.emit("update:user",user)
        }

        _disc.appendChild(tile)
    } else {
        _disc.className = "disabled block"
        _disc.innerText = "Nothing selected"
    }

    check_turns(g)
})

soc.on("check:turns",(g) => check_turns)

soc.on("add:cards",(tiles) => {
    if (!user.hand) user.hand = []
    user.hand = user.hand.concat(tiles)

    update_tiles()
    soc.emit("update:user",user)
})*/
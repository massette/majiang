const newbutton = document.getElementById("new-game")
const groups_container = document.getElementById("games")

const add_group = (g) => {
    let new_g = document.createElement("div")
    new_g.className = "group"

    let lbl = document.createElement("div")
    lbl.className = "label"
    lbl.innerText = g.name
    new_g.appendChild(lbl)

    let desc = document.createElement("div")
    desc.className = "desc"
    desc.innerHTML = `<b>${CHINESE["east"]}:</b> ${g.members[0].name}<span style="margin-right: 16vh;"></span>${CHINESE[g.members.length]} / ${CHINESE[4]} <b>Players</b>`
    new_g.appendChild(desc)

    let button = document.createElement("button")
    button.innerText = "Join"
    if (g.members.length >= 4) button.className = "disabled"
    else { button.onclick = (e) => soc.emit("join:group",g.name) }
    new_g.appendChild(button)

    groups_container.appendChild(new_g)
}

soc.on("update:groups",(gs) => {
    var _groups = document.getElementsByClassName("game")
    while (_groups[0]) _groups[0].parentNode.removeChild(_groups[0])

    gs.forEach(add_group)
})

newbutton.onclick = (e) => { redirect("/new-game") }
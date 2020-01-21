soc.on("update:group",(group) => {
    if (group.members.length >= 4) soc.emit("start:group",group.name)

    let disp = document.getElementById("waiting")
    while (disp.firstChild) disp.removeChild(disp.firstChild)

    let lbl = document.createElement("div")
    lbl.className = "label"
    lbl.innerHTML = `${group.name} <b>(${group.members.length}/4)</b>`
    disp.appendChild(lbl)

    let _m = group.members.slice(0)
    while (_m.length < 4) _m.push({"name": "..."})

    let _buttons = document.createElement("div")
    _buttons.id = "buttons"

    let _leave = document.createElement("div")
    _leave.className = "small block"
    _leave.innerText = "Leave"
    _buttons.appendChild(_leave)

    let _start = document.createElement("div")
    _start.className = "small block"
    if (group.members.length < 4) _start.className = "small block disabled"
    _start.innerText = "Start"
    _buttons.appendChild(_start)

    disp.appendChild(_buttons)

    let users = document.createElement("div")
    users.className = "users"

    _m.forEach((v,i) => {
        _u = document.createElement("user")
        _u.className = "block"
        if (!v.id) _u.className = "block disabled"

        _u.innerHTML = `<b>${CHINESE[`${i+1}d`]}:</b> ${v.name}`
        users.appendChild(_u)
    })

    disp.appendChild(users)
})
soc = io()
user = null

soc.on("init",(u) => {
    _rd = null
    if (!user.name) { _rd = "/" }
    if (!user.in) { _rd = "/games" }
    if (user.playing) { _rd = "/game" }

    _id = null
    if (localStorage.getItem("id")) {
        _id = localStorage.getItem("id")

        soc.emit("user:update:id",_id)
    } else {
        user = u

        if (user.name) console.log(`connected as ${user.name}!`)
        else { console.log(`connected as new user!`) }
    }
})
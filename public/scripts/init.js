soc = io()
user = null

soc.on("init:user",(u) => {
    _rd = null
    if (!u.name) { _rd = "/" }
    else if (!u.in) { _rd = "/games" }
    else if (u.playing) { _rd = "/game" }
    
    _user = u
    _user["rd"] = _rd

    _id = u.id
    if (localStorage.getItem("id")) _id = localStorage.getItem("id")

    soc.emit("set:id",_user,_id)
})

soc.on("finalize:user",(u) => {
    user = u

    localStorage.setItem("id",u.id)

    if (user.name) console.log(`connected as ${user.name}!`)
    else { console.log(`connected as new user!`) }
})
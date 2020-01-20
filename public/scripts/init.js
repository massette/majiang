soc = io()
user = null

const err = document.getElementById("err")
const CHINESE = {
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    
    "east": "东",
    "south": "南",
    "west": "西",
    "north": "北"
  }

const redirect = (path) => {
    if (path && path != window.location.href) {
        if (user) {
            delete user.rd
            soc.emit("update:user",user,() => { window.location.href = path })
        } else {
            setTimeout(redirect,10,path)
            console.log("redirecting...")
        }
    }
}

soc.on("init:user",(u) => {
    _rd = null
    if (!u.name) { _rd = "/" }
    else if (!u.in && window.location.href.split("/").pop() != "new-game") { _rd = "/games" }
    else if (u.playing) { _rd = "/game" }
    
    _user = u
    _user.rd = _rd

    _id = u.id
    if (localStorage.getItem("id")){
        _id = localStorage.getItem("id")
    }

    soc.emit("set:id",_user,_id)
})

soc.on("finalize:user",(u) => {
    user = u
    oldid = localStorage.getItem("id")

    localStorage.setItem("id",u.id)

    if (user.name) console.log(`connected as ${user.name}!`)
    else { console.log(`connected as new user!`) }
})

soc.on("update:user",(u,rd) => {
    user = u
    if (rd) redirect(rd)
})

soc.on("join:group",(g) => {

})


soc.on("err:nouser",() => {
    err.innerText = "Invalid user"
    err.style.display = "block";
})


soc.on("put",(str) => console.log(`[server] ${str}`))
soc.on("clear:local",() => localStorage.clear())
soc.on("redirect",redirect)
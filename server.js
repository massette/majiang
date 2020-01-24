const path = require("path")
const fs = require("fs")

const express = require("express")
// const morgan = require("morgan")
const helmet = require("helmet")
let app = express()

// app.use(morgan("tiny"))
app.use(helmet())
app.use(express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "views"))

const HTTP = require("http")
let http = HTTP.createServer(app)

const socket = require("socket.io")
var io = socket(http)

const shuffle = (arr) => {
    let len = arr.length
    let rand, temp

    while (len != 0) {
        rand = Math.floor(Math.random() * len)
        len -= 1

        temp = arr[len]
        arr[len] = arr[rand]
        arr[rand] = temp
    }

    return arr
}

const createDeck = () => {
    _dck = []
  
    // simples: dots
    _dck.push("1d")
    _dck.push("2d")
    _dck.push("3d")
    _dck.push("4d")
    _dck.push("5d")
    _dck.push("6d")
    _dck.push("7d")
    _dck.push("8d")
    _dck.push("9d")
  
    // simples: bamboo
    _dck.push("1b")
    _dck.push("2b")
    _dck.push("3b")
    _dck.push("4b")
    _dck.push("5b")
    _dck.push("6b")
    _dck.push("7b")
    _dck.push("8b")
    _dck.push("9b")
  
    // simples: characters
    _dck.push("1c")
    _dck.push("2c")
    _dck.push("3c")
    _dck.push("4c")
    _dck.push("5c")
    _dck.push("6c")
    _dck.push("7c")
    _dck.push("8c")
    _dck.push("9c")
  
    // honours: dragons
    _dck.push("rdr") // zhong (中)
    _dck.push("gdr") // fa (發)
    _dck.push("wdr")
  
    // honours: winds
    _dck.push("east") // dong (东)
    _dck.push("south") // nan (南)
    _dck.push("west") // xi (西)
    _dck.push("north") // bei (北)
  
    _dck = _dck.concat(_dck)
    _dck = _dck.concat(_dck)
  
    // bonus: flowers
    _dck.push("f1-bonus")
    _dck.push("f2-bonus")
    _dck.push("f3-bonus")
    _dck.push("f4-bonus")
  
    // bonus: seasons
    _dck.push("s1-bonus")
    _dck.push("s2-bonus")
    _dck.push("s3-bonus")
    _dck.push("s4-bonus")
  
    return _dck
}

const DECK = createDeck()

const pages = {
    "/": "new-user.pug",
    "/games": "game-list.pug",
    "/new-game": "new-game.pug",
    "/waiting": "waiting.pug",
    "/game": "game.pug",
    "*": "404.pug"
}
const page_names = Object.keys(pages)

online = {}
recent = {}

groups = []

started_at = Date.now()

const ms = (_t) => {
    _t = _t || (Date.now() - started_at)

    _s = Math.floor(_t / 1000)
    _t -= _s * 1000

    _m = Math.floor(_s / 60)
    _s -= _m * 60

    _h = Math.floor(_m / 60)
    _m = _m - (_h * 60)

    return `${_h}:${_m}:${_s}:${_t}`
}

const timed_log = (m) => {
    console.log(`[${ms()}] ${m}`)
}


const check_sock = (soc) => {
    if (online[soc.id]) return true

    let _user = { "id": soc.id }

    io.to(`${soc.id}`).emit("init:user",_user)

    return false
}


page_names.forEach((name) => {
    app.get(name, (req,res) => {
        res.render(pages[name], { "title": "Mahjong" })
        timed_log(`retrieved: ${pages[name]}`)
    })
})

io.on("connection", (soc) => {
    let _user = { "id": soc.id }
    let _page = soc.handshake.headers.referer.split("/").pop()

    io.to(`${soc.id}`).emit("init:user",_user)

    if (_page == "games") io.to(`${soc.id}`).emit("update:groups",groups)

    soc.on("request:group",() => {
        if (online[soc.id].in) {
            g = groups.filter((v,i) => (v.name == online[soc.id].in))
            if (g.length) {
                soc.emit("update:group",g[0])
                timed_log(`[${soc.id}] updated group`)
            } else {
                delete online[soc.id].in
                soc.emit("update:user",online[soc.id])
                timed_log(`[${soc.id}] invalid group`)
            }
        } else {
            timed_log(`[${soc.id}] not in group`)
        }
    })

    soc.on("set:id", (user,id) => {
        if (recent[id]) {
            user = recent[id]
            delete recent[id]
            delete user.rd
            user.id = soc.id
            online[soc.id] = user

            _gs = groups.map((v,i) => (i))
            _g = _gs.filter((v,i) => (groups[i].name == online[soc.id].in))
            if (_g.length) {
                _g = _g[0]

                _mi = groups[_g].members.map((v,i) => (i))
                _mi = _mi.filter((v,i) => (groups[_g].members[i].id == id))

                if (_mi.length) {
                    groups[_g].members[_mi[0]] = user
                }
            }
            if (online[soc.id].in) soc.join(online[soc.id].in)
            else if (online[soc.id].playing) delete online[soc.id].playing

            timed_log(`retrieved user: #${id}...`)
            soc.emit("init:user",user)
        } else {
            if (user.rd && (user.rd != `/${_page}`)) {
                recent[soc.id] = user
                soc.emit("redirect",user.rd)
            }
            online[soc.id] = user
            timed_log(`created user: #${soc.id}`)
            soc.emit("finalize:user",user)
        }
    })

    soc.on("set:name", (n) => {
        if (!check_sock(soc)) io.to(`${soc.id}`).emit("err:nouser")

        if (n && n.trim().length) {
            n = n.trim()

            online[soc.id].name = n
            timed_log(`[${soc.id}] set name: ${n}`)
            soc.emit("update:user",online[soc.id])
            soc.emit("redirect","/games")
        } else {
            timed_log(`[${soc.id}] invalid name: ${n}`)
            soc.emit("err:nick")
        }
    })

    soc.on("add:group",(g) => {
        if (!check_sock(soc)) io.to(`${soc.id}`).emit("err:nouser")
        _gs = groups.filter((v,i) => (groups[i].name == g.trim()))

        if (g && g.trim().length && !(_gs.length)) { 
            g = { "name": g.trim(), "members": [] }

            groups.push(g)
            
            timed_log(`[${soc.id}] created group: ${g.name}`)
            soc.broadcast.emit("update:groups",groups)
            soc.emit("echo","join:group",g.name)
        } else {
            timed_log(`[${soc.id}] invalid name: ${g}`)
            io.to(`${soc.id}`).emit("err:groupname")
        }
    })

    soc.on("join:group", (g) => {
        let _g = groups.map((v,i) => (i))
        _g = _g.filter((v,i) => (groups[i].name == g))

        if (_g.length) {
            _g = _g[0]

            if (online[soc.id]) {
                online[soc.id].in = groups[_g].name
                soc.emit("update:user",online[soc.id],"/waiting")

                groups[_g].members.push(online[soc.id])
                soc.broadcast.emit("update:groups",groups)
            }

            soc.join(groups[_g].name)
            io.to(g).emit("update:group",groups[_g])

            timed_log(`[${soc.id}] joined: ${groups[_g].name}`)
        } else {
            timed_log(`[${soc.id}] tried to join non-existant group`)
        }
    })

    soc.on("leave:group", () => {
        if (!online[soc.id].in) timed_log(`[${soc.id}] not in a group`)
        else {
            _g = groups.map((v,i) => (i))
            _g = _g.filter((v,i) => (groups[i].name == online[soc.id].in))
            if (_g.length) {
                _g = _g[0]

                _mi = groups[_g].members.map((v,i) => (i))
                _mi = _mi.filter((v,i) => (groups[_g].members[i].id == soc.id))

                _mi.forEach((v,i) => { groups[_g].members.splice(v,1) })
                timed_log(`[${soc.id}] left group: ${online[soc.id].in}`)
                if (!groups[_g].members.length) {
                    timed_log(`deleted empty group: ${groups[_g].name}`)
                    groups.splice(_g,1)
                }

                delete online[soc.id].in
                soc.emit("update:user",online[soc.id])
                if (groups[_g]) io.to(groups[_g].name).emit("update:group",groups[_g])
                soc.emit("redirect","/games")
            } else {
                timed_log(`[${soc.id}] invalid group: ${online[soc.id].in}`)
                delete online[soc.id].in
                soc.emit("update:user",online[soc.id])
            }

        }
    })

    soc.on("start:game",(g) => {
        _g = groups.map((v,i) => (i))
        _g = _g.filter((v,i) => (groups[i].name == g))

        if (_g.length) {
            io.to(g).emit("start:game")
            groups[_g[0]].deck = shuffle(DECK.slice(0))
        }
    })

    soc.on("update:game",(g) => {
        _g = groups.map((v,i) => (i))
        _g = _g.filter((v,i) => (groups[v].name == online[soc.id].in))

        if (_g.length) {
            groups[_g[0]].playing = 0
            soc.emit("setup:game",groups[_g[0]])
        }
    })

    soc.on("update:user",(u,then) => {
        online[soc.id] = u
        if (then) then()
    })

    /*soc.on("draw",(i) => {
        arr = []
        _g = groups.map((v,i) => (i))
        _g = _g.filter((v,i) => (groups[i].name == online[soc.id].in))

        if (_g.length) {
            _g = _g[0]

            while (i) {
                arr.push(groups[_g].deck.shift())
                i -= 1
            }

            soc.emit("add:cards",arr)
            soc.emit("setup",groups[_g])
        }
    })

    soc.on("next:turn",(disc) => {
        _g = groups.map((v,i) => (i))
        _g = _g.filter((v,i) => (groups[i].name == online[soc.id].in))
        groups[_g].playing = (groups[_g].playing + 1) % groups[_g].members.length
        if (disc) groups[_g].last_discard = disc
        io.to(groups[_g].name).emit("setup",groups[_g])
    })*/

    soc.on("draw:card",(i) => {
        _g = groups.map((v,i) => (i))
        _g = groups.filter((v,i) => (v.name == online[soc.id].in))
        
        if (_g.length) {

            if (i < 0) {
                online[soc.id].hand.push(_g[0].discard)
                delete _g[0].discard
                soc.emit("update:user",online[soc.id])
            }
        }
    })

    soc.on("disconnect",() => {
        if (online[soc.id]) {
            if (online[soc.id].name) timed_log(`user disconnected: #${soc.id} (${online[soc.id].name})`)
            else { timed_log(`user disconnected: #${soc.id}`) }

            recent[soc.id] = online[soc.id]
            delete online[soc.id]
        } else {
            timed_log(`user disconnected: #${soc.id}`)
        }
    })


    soc.on("put",(m) => {
        timed_log(`[${soc.id}] ${m}`)
    })

    soc.on("echo",(m,arg) => (soc.emit(m,arg)))
})

const PORT = (process.env.PORT || 80)

http.listen(PORT, "::", () => {
    timed_log(`listening on port *: ${PORT}`)
})
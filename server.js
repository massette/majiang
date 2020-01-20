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

const pages = {
    "/": "new-user.pug",
    "/games": "game-list.pug"
}
const page_names = Object.keys(pages)

online = {}
recent = {}

boards = []

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

    soc.on("set:id", (user,id) => {
        if (recent[id]) {
            user = recent[id]
            delete recent[id]
            delete user.rd
            user.id = soc.id
            online[soc.id] = user
            timed_log(`retrieved user: #${id}...`)
            io.to(`${soc.id}`).emit("init:user",user)
        } else {
            if (user.rd && (user.rd != `/${_page}`)) {
                recent[soc.id] = user
                soc.emit("redirect",user.rd)
            }
            online[soc.id] = user
            timed_log(`created user: #${soc.id}`)
            io.to(`${soc.id}`).emit("finalize:user",user)
        }
    })

    soc.on("set:name", (n) => {
        if (!check_sock(soc)) io.to(`${soc.id}`).emit("err:nouser")

        if (n && n.trim().length) {
            n = n.trim()

            online[soc.id].name = n
            timed_log(`[${soc.id}] set name: ${n}`)
            io.to(`${soc.id}`).emit("update:user",online[soc.id])
            io.to(`${soc.id}`).emit("redirect","/games")
        } else {
            timed_log(`[${soc.id}] invalid name: ${n}`)
            io.to(`${soc.id}`).emit("err:nick")
        }
    })

    soc.on("update:user",(u,then) => {
        online[soc.id] = u
        if (then) then()
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
})

const PORT = (process.env.PORT || 8080)

http.listen(PORT, "::", () => {
    timed_log(`listening on port *: ${PORT}`)
})
const path = require("path")
const fs = require("fs")

const express = require("express")
// const morgan = require("morgan")
let app = express()

// app.use(morgan("tiny"))
app.use(express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "views"))

const HTTP = require("http")
let http = HTTP.createServer(app)

const socket = require("socket.io")
var io = socket(http)

const pages = {
    "/": "new-user.pug",
    "/new-game": "new-game.pug",
    "/games": "games.pug",
    "/game": "game.pug",
    "/waiting": "waiting.pug"
}

const page_names = Object.keys(pages)

page_names.forEach((name,i) => {
    app.get(name, (req,res) => res.render(pages[name], { "title": "Mahjong" }))
})

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

const timed_log = (_m) => {
    console.log(`[${ms()}] ${_m}`)
}

http.listen(3000, () => {
    timed_log("listening on port *: 3000")
})
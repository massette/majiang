const nick_form = document.getElementById("in")
const nick = document.getElementById("nick")
const invalid = document.getElementById("invalid-nick")

nick_form.onsubmit = (e) => {
    e.preventDefault()
    soc.emit("set:name", nick.value)
}

soc.on("err:nick",() => {
    err.innerText = "Please try a different name"
    err.style.display = "block";
})

soc.on("err:nouser",() => {
    err.innerText = "Invalid user"
    err.style.display = "block";
})
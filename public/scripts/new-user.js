const nick_form = document.getElementById("in")
const nick = document.getElementById("nick")

nick_form.onsubmit = (e) => {
    e.preventDefault()
    soc.emit("set:name", nick.value)
}

soc.on("err:nick",() => {
    err.innerText = "Please try a different name"
    err.style.display = "block";
})
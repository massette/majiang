const group_form = document.getElementById("in")
const group = document.getElementById("group")

group_form.onsubmit = (e) => {
    e.preventDefault()
    soc.emit("add:group", group.value)
}

soc.on("err:groupname",() => {
    err.innerText = "Please try a different name"
    err.style.display = "block";
})
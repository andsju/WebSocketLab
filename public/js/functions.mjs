export function parse(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log('Error parsing expected json data: ', error);
        return;
    }
}

// function to add new messages
export function addMessage(user, message, date) {

    // validate arguments...
    // template clone
    let tpl = document.querySelector("#message").cloneNode(true);

    // console.log("tpl", tpl);

    tpl = tpl.content;
    tpl.querySelector("span").textContent = user;
    tpl.querySelector("p").textContent = message;
    tpl.querySelector("time").textContent = formatDate(date);
    tpl.querySelector("time").setAttribute("datetime", date.toISOString());
    return document.body.querySelector("#conversation").append(tpl);
}

// function to return date in HH:MM:ss
export function formatDate(date) {

    if (date instanceof Date !== true) {
        return "";
    }

    // hours...
    let hours = date.getHours();
    hours = hours < 10 ? "0" + hours : hours;

    let minutes = date.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;

    let seconds = date.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // HH:MM:ss
    return hours + ":" + minutes + ":" + seconds;
}

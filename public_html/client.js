function getChats() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/chats',
            type: 'GET',
            success: data => {
                resolve(data);
            },
            error: err => {
                reject(err);
            },
        });
    })
}

function postChat(chat) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/chats/post',
            type: 'POST',
            data: JSON.stringify(chat),
            contentType: 'application/json',
            success: (data, status, xhr) => {
                resolve({data, status, xhr});
            },
            error: (xhr, status, err) => {
                reject({xhr, status, err});
            },
        });
    })
}

function chatToHTML(chat) {
    return `<div class="chat">`
        + `<div class="chat-header">`
        + `<div class="alias">${chat.alias}</div>`
        + `<div class="time">${new Date(chat.time).toLocaleString()}</div>`
        + `</div>`
        + `<div class="message">${chat.message}</div>`
        + `</div>`;
}

async function displayNewChats() {
    const chats = await getChats();
    $('#chatbox').html(
        chats.map(chatToHTML).join('\n')
    );
}

$(() => {
    displayNewChats();
    setInterval(displayNewChats, 1000);

    $('#send').click(async () => {
        const alias = $('#alias').val();
        const message = $('#message').val();
        if(!alias || !message) return;

        $('#message').val('');
        await postChat({alias, message});
    });

    $('#message').keypress(e => {
        if(e.code == "Enter") $('#send').click();
    });
});
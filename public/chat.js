const socket = io()

const query = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.emit('join', query, (error)=> {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('messageStream', (message) => {
    let html = ''
    console.log(message)
    switch (message.type) {
        case 'message':
            html = Mustache.render( $('#message-template').html(), {
                name:message.name,
                message:message.text,
                createdAt:moment(message.createdAt).format('LT')
            })
            break
        case 'location':
            html = Mustache.render( $('#location-template').html(), {
                name:message.name,
                message:message.text,
                key:message.key,
                createdAt:moment(message.createdAt).format('LT')
            })
            break
        case 'system':
            html = Mustache.render( $('#sysmsg-template').html(), {
                message:message.text,
                createdAt:moment(message.createdAt).format('LT')
            })
            if (message.key !== '') {
                createRoom({
                    roomName:message.key.split(',')[0],
                    email: `${message.name}@jitsi.com`,
                    displayName: message.name,
                    domain: message.key.split(',')[1],
                    password: message.key.split(',')[0]
                })
            }
            break
    }
    addMessagetoChatbox(html)
})

socket.on('roomUserData', (users, room) => {
    let html = ''
    html = Mustache.render( $('#user-header-template').html(), {room} )
    if(room === query.roomname) {   
        $('#users').empty()
        $('#users').append(html)
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            html = Mustache.render( $('#user-template').html(), {user})
            $('#users').append(html)
        }
    }
})

$('#chat').submit( (event) => {
    event.preventDefault();
    if($('#message').val() == "") {
        return 
    } 
    $('#send-message').prop('disabled', true)
    socket.emit('reply', $('#message').val(), 'message', (error, reply, type) => {
        if(error) {
            console.log(error, reply, type)
            socket.emit('join', {...query, reply, type}, (error)=> {
                if(error){
                    alert(error)
                    location.href = '/'
                }
            })
        }
        $('#send-message').prop('disabled', false)
    })
    $('#message').val('')
})

$('#share-location').click( () => {
    if(!navigator.geolocation) {
        alert('Not supported')
    }
    $('#share-location').prop('disabled', true)
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('reply', `${position.coords.latitude}, ${position.coords.longitude}`, 'location', (error, reply, type) => {
            if(error) {
                console.log(error, reply, type)
                socket.emit('join', {...query, reply, type}, (error)=> {
                    if(error){
                        alert(error)
                        location.href = '/'
                    }
                })
            }
            $('#share-location').prop('disabled', false)
        })
    })
})

$('#chatbox').scroll( () => {
    if(isScrollNearEnd()){
        $('#down-icon').hide()
        $('#down-icon').removeClass('new-unread')
    } else {
        $('#down-icon').show()
    }
})

$('#down-icon').click( () => {
    scrollSmoothToBottom('chatbox')
})

function addMessagetoChatbox(html) {
    const shouldScroll = isScrollNearEnd()
    $('#chatbox').append(html)
    if (shouldScroll) {
        scrollSmoothToBottom('chatbox')
    } else {
        $('#down-icon').addClass('new-unread')
    }
}

function isScrollNearEnd() {
    var div = document.getElementById('chatbox')
    const scrollHeight = div.scrollTop
    const scrollBottom = div.scrollHeight - div.clientHeight
    if (scrollHeight > scrollBottom - 200) {
        return true
    }
    return false
}

function scrollSmoothToBottom (id) {
    var div = document.getElementById(id)
    $('#' + id).animate({
    scrollTop: div.scrollHeight - div.clientHeight
    }, 200)
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
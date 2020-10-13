const createRoom = async function (roomData) {
    const domain = roomData.domain
    const options = {
        roomName: roomData.roomName,
        width: 500,
        height: 500,
        parentNode: document.querySelector('#meet'),
        configOverwrite: { disableInviteFunctions: false },
        userInfo: {
            email: roomData.email,
            displayName: roomData.displayName
        }
    }
    const api = await new JitsiMeetExternalAPI(domain, options);
    api.addEventListener('participantRoleChanged', function (event) {
        if (event.role === "moderator") {
            api.executeCommand('password', roomData.password)
        }
    })
    api.on('passwordRequired', function () {
        api.executeCommand('password', roomData.password)
    })
}

//createRoom(roomData)

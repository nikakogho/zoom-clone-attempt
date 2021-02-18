const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer = new Peer(undefined, {
    //host: '/',
    //port: '3001'
})
const peers = {}
const video = document.createElement('video')
video.muted = true // mute me for myself
video.id = 'Me'

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(video, stream)

    peer.on('call', call => {
        call.answer(stream)

        const video = document.createElement('video')
        video.id = call.peer

        call.on('stream', userStream => {
            addVideoStream(video, userStream)
        })
    })

    socket.on('user-connected', id => {
        connectToNewUser(id, stream)
    })
})

socket.on('user-disconnected', id => {
    if(peers[id]) {
        document.getElementById(id).remove()
        peers[id].close()
    }
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function connectToNewUser(id, stream) {
    const call = peer.call(id, stream)
    const video = document.createElement('video')
    video.id = id

    call.on('stream', userStream => {
        addVideoStream(video, userStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[id] = call
}
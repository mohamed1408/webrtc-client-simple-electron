// const io = require("socket.io-client");
var Peer = window.SimplePeer;
var socket = io.connect("https://wertc-server-simple.herokuapp.com/");

var initiateBtn = document.getElementById('initiateBtn');
var stopBtn = document.getElementById('stopBtn');
var initiator = false;

const stunServerConfig = {
  iceServers: [{
    url: 'turn:13.250.13.83:3478?transport=udp',
    username: "YzYNCouZM1mhqhmseWk6",
    credential: "YzYNCouZM1mhqhmseWk6"
  }]
};

initiateBtn.onclick = (e) => {
  initiator = true;
  socket.emit('initiate');
}

stopBtn.onclick = (e) => {
  socket.emit('initiate');
}

socket.on('initiate', () => {
  startStream();
  initiateBtn.style.display = 'none';
  stopBtn.style.display = 'block';
})

function startStream() {
  console.log(initiator)
  captureScreen()
  // if (initiator) {
  //   // get screen stream
  //   navigator.mediaDevices.getUserMedia({
  //     video: {
  //       mediaSource: "screen",
  //       width: { max: '1920' },
  //       height: { max: '1080' },
  //       frameRate: { max: '10' }
  //     }
  //   }).then(gotMedia);
  // } else {
  //   gotMedia(null);
  // }
}

function gotMedia(stream) {
  console.log(stream)
  if (initiator) {
    var peer = new Peer({
      initiator,
      stream,
      config: stunServerConfig
    });
  } else {
    var peer = new Peer({
      config: stunServerConfig
    });
  }

  peer.on('signal', function (data) {
    socket.emit('offer', JSON.stringify(data));
  });

  socket.on('offer', (data) => {
    peer.signal(JSON.parse(data));
  })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video');
    video.srcObject = stream;
    video.play();
  })
}

async function startCapture(displayMediaOptions) {
  let captureStream = null;

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch (err) {
    console.error("Error: " + err);
  }
  return captureStream;
}
function setVideo(mediaConstraints) {
    var video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(stream => {
            // video.srcObject = stream;
            gotMedia(stream)
        })
        .catch(error => {
            console.error('getUserMedia error', error);
            alert(JSON.stringify(error, null, 2)); // eslint-disable-line no-alert
        });
}

function captureScreen() { // eslint-disable-line no-unused-vars
    setVideo({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'screen'
            }
        }
    });
}

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
const peers = {};

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        console.log(text.value);
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class='message'><b>user </b><br/>${message}</li>`
      );
      scrolltoBottom();
    });
  });
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close"),
    () => {
      video.remove();
    };
  peers[userId] = call;
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};
const scrolltoBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const setMuteButton = () => {
  const html = `<i class='fas fa-microphone'></i>
  <span>Mute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `<i class='unmute fas fa-microphone-slash'></i>
  <span>Unmute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const setPlayVideo = () => {
  const html = `<i class='fas fa-video'></i><span>Play Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
const setStopVideo = () => {
  const html = `<i class='stop fas fa-video-slash'></i><span>Stop Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
const leaveMeet = () => {
  myVideoStream.getVideoTracks()[0].enabled = false;
  myVideoStream.getAudioTracks()[0].enabled = false;
  window.location.href = `https://whispering-savannah-56836.herokuapp.com/room`;
};
const toggleChat = () => {
  let html = document.getElementById("chat__section");

  if (html.style.display === "none") {
    html.style.display = "block";
  } else {
    html.style.display = "none";
  }
};

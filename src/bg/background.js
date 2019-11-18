var remoteAudio = new Audio();
var localAudio = new Audio();
var sessions = [];
var ua = null;
var contentTabId;

console.log(chrome.extension.getURL("ask-permissions.html"));

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason.search(/install/g) === -1) {
    return;
  }
  chrome.tabs.create({
    url: chrome.extension.getURL("ask-permissions.html"),
    active: true
  });
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
  if (msg.from == "content") {
    // get content scripts tab id
    contentTabId = sender.tab.id;
  }

  // Exemplo de como mandar um evento pro content_script abrir o modal no browser
  // chrome.tabs.sendMessage(contentTabId, {
  //   event: "open_rece_modal",
  // });
});

chrome.runtime.onMessageExternal.addListener(function(
  request,
  sender,
  sendResponse
) {
  const { event } = request;
  switch (event) {
    case "logIn":
      logInHandler(request, sender, sendResponse);
      break;
    default:
      console.log(`Não ta mapeado o evento: ${event}`);
  }
});

function penduraOsEventosDeLigacao(newSession) {
  // check next
  newSession.displayName =
    newSession.remoteIdentity.displayName || newSession.remoteIdentity.uri.user;
  newSession.ctxid = Math.random()
    .toString(36)
    .substr(2, 9);
  newSession.isOnHold = false;
  newSession.isMuted = false;

  newSession.on("accepted", function(e) {
    console.log("session accepted");
  });

  newSession.on("directionChanged", function() {
    console.log("session directionChanged");
  });

  newSession.on("trackAdded", function() {
    console.log("session trackAdded");
    var pc = newSession.sessionDescriptionHandler.peerConnection;
    console.log("hehe");

    // Gets remote tracks
    var remoteStream = new MediaStream();
    pc.getReceivers().forEach(function(receiver) {
      try {
        remoteStream.addTrack(receiver.track);
      } catch (e) {}
    });
    remoteAudio.srcObject = remoteStream;
    remoteAudio.play();

    // Gets local tracks
    var localStream = new MediaStream();
    pc.getSenders().forEach(function(sender) {
      try {
        localStream.addTrack(sender.track);
      } catch (e) {}
    });
    localAudio.srcObject = localStream;
    localAudio.play();
  });

  newSession.on("cancel", function(e) {
    console.log("session cancel");
  });

  newSession.on("bye", function(e) {
    console.log("session bye");
  });

  newSession.on("failed", function(e) {
    console.log("session failed");
  });

  newSession.on("rejected", function(e) {
    console.log("session rejected");
  });

  sessions[newSession.ctxid] = newSession;
}

function logInHandler(request, sender, sendResponse) {
  console.log("logInHandler");

  if (ua !== null) {
    ua.stop();
  }

  var config = {
    user: "",
    password: "",
    displayName: "",
    realm: "",
    hostname: "",
  };

  var options = {
    authorizationUser: config.user + ".ws",
    password: config.password,
    displayName: config.displayName || "",
    transportOptions: {
      wsServers: [
        {
          scheme: "WSS",
          sipUri:
            "<sip:" +
            config.user +
            ".ws@" +
            config.realm +
            ";transport=wss;lr>",
          weight: 1,
          wsUri: "wss://" + config.hostname + ":443/ws",
          isError: false
        }
      ],
      traceSip: true
    },
    uri: "sip:" + config.user + ".ws@" + config.realm,
    log: {
      level: "debug"
    },
    hackIpInContact: config.hackIpInContact || false
  };

  ua = new SIP.UA(options);

  ua.on("invite", function(incomingSession) {
    console.log("chegou ligação");
    incomingSession.direction = "incoming";
    penduraOsEventosDeLigacao(incomingSession);

    let url = chrome.runtime.getURL("src/note.mp3");
    let a = new Audio(url);
    a.loop = true;
    a.play();

    setTimeout(() => {
      a.pause();
      incomingSession.accept({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false
          }
        }
      });
    }, 2000);
  });

  ua.on("registered", function(e) {
    console.log("registered caraai");
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { audio: true, video: false },
        () => console.log("Pegamos as media, sucesso"),
        e => console.log("getUserMedia failed:", e)
      );
    }
  });

  ua.on("unregistered", function(e) {
    console.log("unregistered caraai");
  });
  ua.on("registrationFailed", function(e) {
    console.log("registrationFailed caraai");
  });
  ua.on("message", function(e) {
    console.log("message caraai");
  });
  ua.on("outOfDialogReferRequested", function(e) {
    console.log("outOfDialogReferRequested caraai");
  });
  ua.on("transportCreated", function(e) {
    console.log("transportCreated caraai");
  });

  console.log(request);
  console.log(sender);
  sendResponse({ success: true, queue: "hue" });
  console.log("cabo logInHandler");
}

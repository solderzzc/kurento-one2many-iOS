var host = 'live.raidcdn.com'; // the domain or IP where the node server and kurento media server are running


function deviceReady() {
  return new Promise(function(resolve, reject) {
    if (window.cordova) {
      document.addEventListener("deviceready", function() {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

function isDevice(device) {
  return window.device && window.device.platform === device;
}


deviceReady().then(function() {
  if (isDevice('iOS')) {
    cordova.plugins.iosrtc.registerGlobals();
    window.getUserMedia = navigator.getUserMedia.bind(navigator);
  }
  stuff();
});

function stuff() {

  var ws = new WebSocket('wss://'+host+':443/one2many');
  var video;
  var webRtcPeer;

  video = document.getElementById('video');

  document.getElementById('call').addEventListener('click', function() { presenter(); } );
  document.getElementById('viewer').addEventListener('click', function() { viewer(); } );
  document.getElementById('terminate').addEventListener('click', function() { stop(); } );

  window.onbeforeunload = function() {
    ws.close();
  }

  ws.onmessage = function(message) {
    var parsedMessage = JSON.parse(message.data);

    switch (parsedMessage.id) {
    case 'presenterResponse':
      presenterResponse(parsedMessage);
      break;
    case 'viewerResponse':
      viewerResponse(parsedMessage);
      break;
    case 'stopCommunication':
      dispose();
      break;
    case 'iceCandidate':
      webRtcPeer.addIceCandidate(parsedMessage.candidate)
    default:

    }
  }

  function presenterResponse(message) {
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      dispose();
    } else {
      webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  function viewerResponse(message) {
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      dispose();
    } else {
      webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  function presenter() {
    if (!webRtcPeer) {

      var options = {
        localVideo: video,
        onicecandidate : onIceCandidate
      };

      webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
        if(error) return onError(error);

        this.generateOffer(onOfferPresenter);
      });
    }
  }

  function onOfferPresenter(error, offerSdp) {
    if (error) return onError(error);

    var message = {
      id : 'presenter',
      sdpOffer : offerSdp
    };
    sendMessage(message);
  }

  function viewer() {
    if (webRtcPeer) { return; }

    var options = {
      remoteVideo: video,
      onicecandidate : onIceCandidate
    };

    deviceReady().then(function() {
      if (isDevice('iOS')) {
        options.connectionConstraints = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };
      }

      webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
        if(error) return onError(error);
        this.generateOffer(onOfferViewer);
      });
    });
  }

  function onOfferViewer(error, offerSdp) {
    if (error) return onError(error)

    var message = {
      id : 'viewer',
      sdpOffer : offerSdp
    };
    sendMessage(message);
  }

  function onIceCandidate(candidate) {
       var message = {
          id : 'onIceCandidate',
          candidate : candidate
       }
       sendMessage(message);
  }

  function stop() {
    if (webRtcPeer) {
      var message = {
          id : 'stop'
      }
      sendMessage(message);
      dispose();
    }
  }

  function dispose() {
    if (webRtcPeer) {
      webRtcPeer.dispose();
      webRtcPeer = null;
    }
  }

  function sendMessage(message) {
    var jsonMessage = JSON.stringify(message);
    ws.send(jsonMessage);
  }
}

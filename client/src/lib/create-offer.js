const createOffer = (pc, constraints) => {
  return new Promise(function(resolve, reject) {
    pc.createOffer(function(offer) {
      pc.setLocalDescription(new RTCSessionDescription(offer), function() {
        resolve(offer)
      }, reject)
    }, reject, constraints)
  })
}

export default createOffer
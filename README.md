# Kurento One2Many iOS Demo

Start [Kurento Media Server](https://www.kurento.org/docs/current/installation_guide.html) on port 8888 (default).

Enter ./server and run `npm install` then start the server with `node server`

### Test in browser

Serve ./www/index.html

```sh
cd www
live-server --port=8081
```

Visit localhost:8081 in a browser.

### Test on iOS device

Connect your iOS device to the Apple computer.

```sh
cordova platform add ios
cordova build ios
cordova run ios --device
```

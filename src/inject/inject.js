chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log("Hello. This message was sent from scripts/inject.js");
      console.log(document.Rollbar);
      // ----------------------------------------------------------
    }
  }, 10);
});

chrome.runtime.sendMessage({ from: "content" }); //first, tell the background page that this is the tab that wants to receive the messages.

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.event == "open_rece_modal") {
    // Aqui da para receber o evento do background.js e emitir pra tab abrir o modal (pode ser diretamente pelo DOM ou chamar algo)
    // Pelo que entendi, o background.js não consegue falar diretamente com a página
  }
});

# sip-chrome-extension

- Pra usar tem que importar a extensão no chrome - https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/
- Precisa configurar a `var config = {...` dentro do `background.js`
- Depois disso é só entrar no https://vendas.querobolsa.com.br/ e executar o proximo comando no console 👇

```
queroSipId = '<pegar o ID da extensão>'
chrome.runtime.sendMessage(queroSipId, {event: 'logIn'}, function(response) { console.log("ext_response"); console.log(response); });
```

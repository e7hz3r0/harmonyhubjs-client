var login = require('./login')
var auth = require('./login/auth')
var HarmonyClient = require('./harmonyclient')

function createHarmonyClient (xmppClient) {
  return new HarmonyClient(xmppClient)
}

function getHarmonyClient (email, password, hubhost, hubport) {
  return auth(email, password)
      .then(function(authToken) {
          return login(authToken, hubhost, hubport)
            .then(createHarmonyClient)
      })
}

module.exports = getHarmonyClient

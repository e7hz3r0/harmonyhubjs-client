var login = require('./login')
var auth = require('./login/auth')
var HarmonyClient = require('./harmonyclient')

function createHarmonyClient (xmppClient, isLink) {
  return new HarmonyClient(xmppClient, isLink)
}

function getHarmonyClient (hubhost, hubport, email, password) {
    var getHarmonyClientWithToken =  function(authToken) {
          var isLink = !!authToken
          return login(hubhost, hubport, authToken)
            .then(function (xmppClient) {
              return createHarmonyClient(xmppClient, isLink)
            })
      }
    if (!email) {
        return getHarmonyClientWithToken();
    }
    return auth(email, password)
        .then(function(token) {
            return getHarmonyClientWithToken(token)
        })
}

module.exports = getHarmonyClient

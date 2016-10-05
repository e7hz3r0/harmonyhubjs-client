var debug = require('debug')('harmonyhubjs:client:login:hub')
var Client = require('node-xmpp-client')
var Q = require('q')
var util = require('../util')
var injectLinkSaslAuth = require('./linksaslplain')

/** PrivateFunction: getIdentity
 * Logs in to a Harmony hub as a guest and uses the userAuthToken from logitech's
 * web service to retrieve an identity token.
 *
 * Parameters:
 *     (String) hubhost - Hostname/IP of the Harmony hub to connect.
 *     (int) hubport - Optional. Port of the Harmony hub to connect. By default,
 *                     this is set to 5222.
 *     (String) authToken - Required for Link.
 *                          Unique token received from myharmony.com via the auth module
 *
 * Returns:
 *     (Q.promise) - The resolved promise passes the retrieved identity token.
 */
function getIdentity (hubhost, hubport, authToken) {
  debug('retrieve identity by logging in as guest')

  // guest@x.com / guest
  // guest@connect.logitech.com/gatorade
  var deferred = Q.defer()
  var iqId

  var isHarmonyLink = !!authToken


  var xmppClient = new Client({
    jid: 'guest@x.com' + (isHarmonyLink ? '' : '/gatorade'),
    password: 'guest',
    host: hubhost,
    port: hubport,
    disallowTLS: true
  })

  if (isHarmonyLink) {
    injectLinkSaslAuth(xmppClient.availableSaslMechanisms)
  }

  xmppClient.on('online', function () {
    debug('XMPP client connected')

    var body = (isHarmonyLink ? 'token=' + authToken : 'method=pair') + ':name=harmonyjs#iOS6.0.1#iPhone';
    debug('Login XMl body: ' + body)
    var iq = util.buildIqStanza(
      'get', 'connect.logitech.com', 'vnd.logitech.connect/vnd.logitech.pair',
      body, 'guest')

    iqId = iq.attr('id')

    xmppClient.send(iq)
  })

  xmppClient.on('error', function (e) {
    debug('XMPP client error')
    console.log('errorhub', e)
  })

  xmppClient.on('stanza', function (stanza) {
    debug('received XMPP stanza: ' + stanza)

    if (stanza.attrs.id === iqId.toString()) {
      var body = stanza.getChildText('oa')
      var response = util.decodeColonSeparatedResponse(body)

      if (response.identity && response.identity !== undefined) {
        debug('received identity token: ' + response.identity)
        xmppClient.end()
        deferred.resolve(response.identity)
      } else {
        debug('could not find identity token')
        xmppClient.end()
        deferred.reject(new Error('Did not retrieve identity.'))
      }
    }
  })

  return deferred.promise
}

/** PrivateFunction: loginWithIdentity
 * After fetching an identity from the Harmony hub, this function creates an
 * XMPP client using that identity. It returns a promise which, when resolved,
 * passes that XMPP client.
 *
 * Parameters:
 *     (String) identity - Identity token to login to the Harmony hub.
 *     (String) hubhost - Hostname/IP of the Harmony hub to connect.
 *     (int) hubport - Optional. Port of the Harmony hub to connect. By default,
 *                     this is set to 5222.
 *
 * Returns:
 *     (Q.promise) - When resolved, passes the logged in XMPP client, ready to
 *                   communicate with the Harmony hub.
 */
function loginWithIdentity (identity, hubhost, hubport) {
  debug('create xmpp client using retrieved identity token: ' + identity)

  var deferred = Q.defer()
  var jid = identity + '@connect.logitech.com/gatorade'
  var password = identity
  var xmppClient = new Client({
    jid: jid,
    password: password,
    host: hubhost,
    port: hubport,
    disallowTLS: true
  })

  xmppClient.once('online', function () {
    debug('XMPP client connected using identity token')
    deferred.resolve(xmppClient)
  })

  return deferred.promise
}

/** Function: loginToHub
 * Uses a userAuthToken to login to a Harmony hub.
 *
 * Parameters:
 *     (String) hubhost - Hostname/IP of the Harmony hub to connect.
 *     (int) hubport - Optional. Port of the Harmony hub to connect. By default,
 *                     this is set to 5222.
 *     (String) userAuthToken - Required for Link only. A authentication token, retrieved from logitechs
 *                              web service.
 *
 * Returns:
 *     (Q.promise) - The final resolved promise will pass a fully authenticated
 *                   XMPP client which can be used to communicate with the
 *                   Harmony hub.
 */
function loginToHub (hubhost, hubport, userAuthToken) {
  debug('perform hub login')

  hubport = hubport || 5222

  return getIdentity(hubhost, hubport, userAuthToken)
    .then(function (identity) {
      return loginWithIdentity(identity, hubhost, hubport)
  })
}

module.exports = loginToHub

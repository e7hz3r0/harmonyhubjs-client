var debug = require('debug')('harmonyhubjs:client:login')
var loginToHub = require('./hub')

/** Function: login
 * Retrieves a UserAuthToken using a valid Harmony account and logs in to a
 * local Harmony hub. If everything runs fine, the returned promise resolves by
 * passing a logged in XMPP client which provied communications to the Hamrony
 * hub.
 *
 * Parameters:
 *     (String) hubhost - Hostname/IP of the Harmony hub to login to.
 *     (int) hubport - Optional. Port of the Harmony hub to login to.
 *     (String) authToken - Requireed for Link. Unique token received from myharmony.com via the auth module
 *
 * Returns:
 *     (Q.promise) - When resolved, the promise passes a prepared XMPP client,
 *                   ready to communicate with the Harmony hub.
 */
function login (hubhost, hubport, authToken) {
  debug('login on hub ' + hubhost + (hubport ? ':' + hubport : '') + (authToken ? ' ' + authToken : ''))
  return loginToHub(hubhost, hubport, authToken)
}

module.exports = login

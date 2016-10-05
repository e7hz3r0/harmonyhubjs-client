'use strict'

var util = require('util');

/*
 * The PLAIN SASL Mechanism in node-xmpp-client sends authzid with auth(). It was determined
 * in (https://github.com/e7hz3r0/node-xmpp/commit/c310683baa9903eed4ad85d01f14019c56ba678a) that
 * it was not supported by HarmonyLink.
 */

function injectSaslAuth(availableSaslMechanisms) {
    for (var i = 0, len = availableSaslMechanisms.length; i < len; i++) {
        var mechCls = availableSaslMechanisms[i];
        if (mechCls.prototype.name === 'PLAIN') {
            mechCls.prototype.auth = function () {
                return '\0' + this.authcid + '\0' + this.password
            }
        }
    }
}

module.exports = injectSaslAuth;
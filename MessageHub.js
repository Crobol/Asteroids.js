"use strict";

var MessageHub = function () {
    this.callbacks = {};
}

MessageHub.prototype = {
    registerCallback: function (messageType, callback) {
        if (typeof this.callbacks[messageType] == 'undefined') {
            this.callbacks[messageType] = [];
        }
        this.callbacks[messageType].push(callback);
    },
    sendMessage: function (message) {
        if (!(message.type in this.callbacks))
            return;

        for (var i = 0; i < this.callbacks[message.type].length; i++) {
            this.callbacks[message.type][i](message);
        }
    }
}

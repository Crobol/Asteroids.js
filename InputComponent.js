"use strict";

var InputComponent = function (messageHub) {
    InputComponent.shortName = "input";
    this.shortName = InputComponent.shortName;
    var me = this;
    kd.UP.down(function () { me.up(); });
    kd.DOWN.down(function () { me.down(); });
    kd.LEFT.down(function () { me.left(); });
    kd.RIGHT.down(function () { me.right(); });
    kd.SPACE.down(function () { me.space(); });
    this.messageHub = messageHub;
}

InputComponent.prototype = new Component();

InputComponent.prototype.update = function (now) {
    kd.tick();
}

InputComponent.prototype.up = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.messageHub.sendMessage({type: "accelerate", entityId: this.entities[i].id});
    }
}

InputComponent.prototype.down = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.messageHub.sendMessage({type: "deaccelerate", entityId: this.entities[i].id});
    }
}

InputComponent.prototype.left = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.messageHub.sendMessage({type: "turnLeft", entityId: this.entities[i].id});
    }
}

InputComponent.prototype.right = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.messageHub.sendMessage({type: "turnRight", entityId: this.entities[i].id});
    }
}

InputComponent.prototype.space = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.messageHub.sendMessage({type: "shoot", entityId: this.entities[i].id});
    }
}

"use strict";

// TODO: Strategies/behaviours

var AiComponent = function (messageHub) {
    AiComponent.shortName = "ai";
    this.shortName = AiComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["physics"];
    this.messageHub = messageHub;
    this.now = new Date();
    this.lastFire = 0;
}

// Prototype methods

AiComponent.prototype = new Component();

AiComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("collision", function (message) {
        
    });
}

AiComponent.prototype.update = function (now) {
    this.now = now;

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        entity.physics.xVel = Math.sin(entity.ai.counter++ / 200) * 300;
        entity.physics.yVel = Math.cos(entity.ai.counter++ / 80) * 200;

        if (now.getTime() - this.lastFire > 2000) {
            this.messageHub.sendMessage({type: "shoot", entityId: entity.id});
            this.lastFire = now.getTime();
        }
    }
}

AiComponent.prototype.createDefaultEntityData = function () {
    var ai = {
        counter: 0
    };

    return ai;
}

"use strict";

var FrictionComponent = function (messageHub) {
	FrictionComponent.shortName = "friction";
	this.shortName = FrictionComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position", "movement"];
	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
}

// Prototype methods

FrictionComponent.prototype = new Component();

FrictionComponent.prototype.update = function (now) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity.movement.xVel != 0) {
            entity.movement.xVel = entity.movement.xVel * entity.friction.frictionFactor;
        }
        if (entity.movement.yVel != 0) {
            entity.movement.yVel = entity.movement.yVel * entity.friction.frictionFactor;
        }

    }
}

FrictionComponent.prototype.registerCallbacks = function(messageHub) {
    var me = this;
}

FrictionComponent.prototype.createComponentEntityData = function () {
	var friction = {
        frictionFactor: 0.98
	};

	return friction;
}

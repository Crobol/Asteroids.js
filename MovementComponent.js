"use strict";

var MovementComponent = function (messageHub) {
	MovementComponent.shortName = "movement";
	this.shortName = MovementComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position"];
	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
}

// Prototype methods

MovementComponent.prototype = new Component();

MovementComponent.prototype.update = function (now) {
    /*for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entity.position.x += entity.movement.xVel; 
        entity.position.y += entity.movement.yVel;
        entity.rotation += entity.movement.turnVel;
    }*/
}

MovementComponent.prototype.registerCallbacks = function(messageHub) {
    var me = this;
    /*messageHub.registerCallback("accelerate", function (message) { me.accelerate(message); });
    messageHub.registerCallback("deaccelerate", function (message) { me.deaccelerate(message); });
    messageHub.registerCallback("turnLeft", function (message) { me.turnLeft(message); });
    messageHub.registerCallback("turnRight", function (message) { me.turnRight(message); });*/
}

	// Private callbacks
MovementComponent.prototype.accelerate = function(message) {
    var entity = this.getEntityById(message.entityId);
    entity.movement.xVel += entity.movement.acceleration * Math.cos(entity.rotation);
    entity.movement.yVel += entity.movement.acceleration * Math.sin(entity.rotation);
}

MovementComponent.prototype.deaccelerate = function(message) {
    var entity = this.getEntityById(message.entityId);
    entity.movement.xVel -= entity.movement.acceleration * Math.cos(entity.rotation);
    entity.movement.yVel -= entity.movement.acceleration * Math.sin(entity.rotation);
}

MovementComponent.prototype.turnLeft = function (message) {
    var entity = this.getEntityById(message.entityId);
    entity.rotation -= entity.movement.turnRate;
}

MovementComponent.prototype.turnRight = function (message) {
    var entity = this.getEntityById(message.entityId);
    entity.rotation += entity.movement.turnRate;
}

MovementComponent.prototype.createDefaultEntityData = function () {
	var movement = {
		xVel: 0,
		yVel: 0,
		acceleration: 0.0,
		turnRate: 0.0,
        turnVel: 0
	};

	return movement;
}

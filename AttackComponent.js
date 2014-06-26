"use strict";

var AttackComponent = function (messageHub) {
	AttackComponent.shortName = "attack";
	this.shortName = AttackComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position"];
	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
	this.now = new Date();
}

// Prototype methods

AttackComponent.prototype = new Component();

AttackComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("shoot", function (message) { me.attack(message); });
}

AttackComponent.prototype.update = function (now) {
    this.now = now;
}

	// Callbacks
AttackComponent.prototype.attack = function (message) {
    var entity = this.getEntityById(message.entityId);

    if (this.now.getTime() - entity.attack.lastFire > entity.attack.fireRate * 1000) {
        entity.attack.lastFire = this.now.getTime();

        var projectile = {
            rotation: entity.rotation,
            position: new Vector(entity.position.x, entity.position.y),
            movement: {
                xVel: 14 * Math.cos(entity.rotation),
                yVel: 14 * Math.sin(entity.rotation)
            },
            collision: {
                dieOnCollision: true
            }
        };

        this.messageHub.sendMessage({ type: "spawnEntity", sender: entity, entityTypeName: "projectile", componentData: projectile });
    }	
}

AttackComponent.prototype.createComponentEntityData = function () {
	var attack = {
		fireRate: 1,
		lastFire: 0
	};

	return attack;
};

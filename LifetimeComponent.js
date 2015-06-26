"use strict";

var LifetimeComponent = function (messageHub) {
	LifetimeComponent.shortName = "lifetime";
	this.shortName = LifetimeComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
	this.now = new Date();
}

// Prototype methods

LifetimeComponent.prototype = new Component();

LifetimeComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    this.messageHub.registerCallback("collision", function (message) { me.onCollision(message); });
}

LifetimeComponent.prototype.update = function (now) {
    this.now = now;

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        if (entity.lifetime.birthtime + entity.lifetime.lifetime < this.now.getTime()) {
            entity.dead = true;
        }
    }
}

// Callbacks
LifetimeComponent.prototype.onCollision = function (message) {
    var entity = this.getEntityById(message.entityId);

    if (entity == null)
        return;

    if (entity.lifetime.dieOnCollision) {
        entity.dead = true;
    }
}

LifetimeComponent.prototype.createDefaultEntityData = function () {
	var lifetime = {
		birthtime: new Date().getTime(),
		lifetime: 1 * 500,
		dieOnCollision: false
	};

	return lifetime;
}

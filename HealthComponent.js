"use strict";

var HealthComponent = function (messageHub) {
	HealthComponent.shortName = "health";
	this.shortName = HealthComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
}

// Prototype methods

HealthComponent.prototype = new Component();

HealthComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);
    entity.health.currentHitPoints = entity.health.hitPoints;
}

HealthComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("collision", function (message) { me.onCollision(message); });
}

HealthComponent.prototype.update = function (now) {
    this.now = now;

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        if (entity.health.currentHitPoints <= 0) {
            entity.dead = true;
            this.messageHub.sendMessage({ type: "entityKilled", entityId: entity.id, entityTypeName: entity.entityTypeName })
        }
    }
}

HealthComponent.prototype.onCollision = function (message) {
    var entity = this.getEntityById(message.entityId);
    var collidingEntity = message.collidingEntity;

    if (entity == null || collidingEntity == null)
        return;

    if (entity.componentPropertyContains("health", "damageExceptions", collidingEntity.entityTypeName))
        return;

    if (this.now.getTime() - entity.health.lastDamageTakenTime > 200) {
        entity.health.lastDamageTakenTime = this.now.getTime();
        entity.health.currentHitPoints -= collidingEntity.collision.collisionDamage;
        this.messageHub.sendMessage({ type: "damageTaken", entityId: entity.id, fromEntityId: collidingEntity.id });
    }
}

HealthComponent.prototype.createComponentEntityData = function () {
	var health = {
        hitPoints: 1,
        currentHitPoints: 1,
        lastDamageTakenTime: 0
	};

	return health;
}

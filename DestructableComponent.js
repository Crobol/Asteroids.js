"use strict";

var DestructableComponent = function (messageHub) {
	DestructableComponent.shortName = "destructable";
	this.shortName = DestructableComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position", "health", "movement", "graphics"];
	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);
}

// Prototype methods

DestructableComponent.prototype = new Component();

DestructableComponent.prototype.update = function (now) {

}

DestructableComponent.prototype.registerCallbacks = function(messageHub) {
    var me = this;
    messageHub.registerCallback("entityKilled", function (message) { me.entityKilled(message); });
}

// Private callbacks
DestructableComponent.prototype.entityKilled = function(message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null)
        return;

    if (entity.destructable.stage == 1)
        return;

    var numToSpawn = entity.destructable.stage; //Math.round(entity.destructable.edges / 3);
    var edges = entity.graphics.model.length > 3 ? entity.graphics.model.length - 1 : 3;
    var unit = 2 * Math.PI / edges;
    var scale = entity.destructable.scale;

    for (var i = 0; i < numToSpawn; i++) {
        var model = { color: entity.graphics.model.color, points: [] };
        for (var j = 0; j < edges; j++) {
            model.points.push({x: 20 * scale * Math.cos(unit * j), y: 20 * scale * Math.sin(unit * j)});
        }

        var overrides = {
            position: new Vector(entity.position.x, entity.position.y), 
            graphics: {
                color:  entity.graphics.color,
                'model': model
            },
            movement: {
                xVel: Math.random() * 5 - 2.5,
                yVel: Math.random() * 5 - 2.5,
                turnVel: Math.random() * 0.2 - 0.1
            },
            collision: {
                radius: entity.collision.radius * scale,
                mass: entity.collision.mass * scale,
                collisionDamage: entity.collision.collisionDamage * scale
            },
            health: {
                hitPoints: entity.health.hitPoints * scale
            },
            destructable: {
                "scale": scale / 2,
                stage: numToSpawn - 1,
                "edges": edges / numToSpawn
            }
        }

        this.messageHub.sendMessage({ type: "spawnEntity", entityTypeName: "asteroid", componentData: overrides });
    }
}

DestructableComponent.prototype.createComponentEntityData = function () {
	var destructable = {
        stage: 3,
        scale: 0.5
	};

	return destructable;
}

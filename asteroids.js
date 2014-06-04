"use strict";


function generateId() {	
	if ( typeof generateId.counter == 'undefined' ) {
        generateId.counter = 0;
    }

	return ++generateId.counter;
}

var Vector = function(x, y) {
    if (typeof x != "undefined") {
        this.x = x;
    }
    else {
        this.x = 0;
    }
    if (typeof y != "undefined") {
        this.y = y;
    }
    else {
        this.y = 0;
    }
}

var Entity = function () {
	this.id = generateId();
	this.dead = false;

	this.position = new Vector();
    this.rotation = 0;
}

Entity.prototype = {
	hasComponent: function (componentShortName) {
		return typeof this[componentShortName] != 'undefined';
	}
}

var ComponentManager = function () {
	this.components = [];
	this.entities = [];
	this.messageHub = new MessageHub();
	this.entityFactory = new EntityFactory(this.components);

	var me = this;
	this.messageHub.registerCallback("spawnProjectile", function (message) { me.spawnProjectile(message); });
}

ComponentManager.prototype = {
	addComponent: function (component) {
		this.components.push(component);
	},
	update: function (extra) {
		var date = new Date();
		for (var i = 0; i < this.components.length; i++) {
			var component = this.components[i];
			component.update(date);
		}
		var me = this;
		requestAnimFrame(function () { me.update(extra); extra(); });

		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			if (entity.dead) {
				this.deleteEntity(entity);
			}
		}
	},
	createEntity: function (components) {
		var entity = this.entityFactory.createBareEntity(components);
		this.entities.push(entity);
		return entity;
	},
	deleteEntity: function (entity) {
		for (var i = 0; i < this.components.length; i++) {
            this.components[i].unregisterEntity(entity);
		}
        
        var index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
	},

	// Callbacks
	spawnProjectile: function (message) {
		var entity = this.entityFactory.createEntity("projectile", message.componentData);
		this.entities.push(entity);
	}
}

var MessageHub = function () {
	this.callbacks = [];
}

MessageHub.prototype = {
	registerCallback: function (messageType, callback) {
		if (typeof this.callbacks[messageType] == 'undefined') {
			this.callbacks[messageType] = [];
		}
		this.callbacks[messageType].push(callback);
	},
	sendMessage: function (message) {
		for (var i = 0; i < this.callbacks[message.type].length; i++) {
			this.callbacks[message.type][i](message);
		}
	}
}



var EntityFactory = function (availableComponents) {
	this.components = availableComponents;
}

EntityFactory.prototype = {
	createEntity: function (entityName, componentData) {
		var entity = {};

		if (entityName == "projectile") {
			entity = this.createBareEntity(["lifetime", "movement", "collision", "graphics"]);

			entity.collision.radius = 2;
			entity.collision.mass = 2;

			entity.lifetime.dieOnCollision = true;

			entity.graphics.model.push({x: 2, y: 0});
			entity.graphics.model.push({x: -2, y: 2});
			entity.graphics.model.push({x: -2, y: -2});
			entity.graphics.model.push({x: 2, y: 0});

			entity.owner = componentData.owner;

			if (typeof componentData.position != 'undefined') {
                entity.rotation = componentData.rotation;
				entity.position = componentData.position;

				entity.movement.xVel = 14 * Math.cos(entity.rotation);
				entity.movement.yVel = 14 * Math.sin(entity.rotation);
			}
		}

		return entity;
	},
	createBareEntity: function (components) {
		var entity = new Entity();

		var componentsToRegister = [];
		for (var i = 0; i < this.components.length; i++) {
			if (components.indexOf(this.components[i].shortName) != -1) {
				componentsToRegister.push(this.components[i]);
			}
		}

		for (var i = 0; i < componentsToRegister.length; i++) {
			var component = componentsToRegister[i];
			component.registerEntity(entity);
		}

		return entity;
	}

}

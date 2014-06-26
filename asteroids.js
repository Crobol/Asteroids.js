"use strict";

var debug = true;

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

var EntityTemplate = function () {
    
}

var Entity = function (entityTypeName) {
	this.id = generateId();
    if (typeof name != 'undefined') {
        this.entityTypeName = entityTypeName;
    }
	this.dead = false;

	this.position = new Vector();
    this.rotation = 0;
}

Entity.prototype = {
	hasComponent: function (componentShortName) {
		return typeof this[componentShortName] != 'undefined';
	}
}

var EntityManager = function (messageHub, componentManager, entityFactory) {
    this.entities = [];
    this.messageHub = messageHub;
    this.componentManager = componentManager;
	this.entityFactory = entityFactory;

    var me = this;
	this.messageHub.registerCallback("spawnEntity", function (message) { me.spawnEntity(message); });
}

EntityManager.prototype = {
    update: function (extra) {
        this.componentManager.update(extra);
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.dead) {
                this.deleteEntity(entity);
            }
        }
		var me = this;
		requestAnimFrame(function () { me.update(extra); extra(); });
    },
    addEntity: function (entity) {
        this.entities.push(entity);
    },
    deleteEntity: function (entity) {
        this.componentManager.deleteEntity(entity);
        var index = this.entities.indexOf(entity);
        if (index != -1) {
            this.entities.splice(index, 1);
        }
    },
    // Callbacks
    spawnEntity: function (message) {
        var entity = this.entityFactory.createEntityFromTemplate(message.entityTypeName, message.componentData);
        if (typeof message.sender != 'undefined' && message.sender != null)
            entity.owner = message.sender.id;
        this.entities.push(entity);
    }
};

var ComponentManager = function () {
	this.components = [];
	this.messageHub = new MessageHub();

	var me = this;
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
	},
	deleteEntity: function (entity) {
		for (var i = 0; i < this.components.length; i++) {
            this.components[i].unregisterEntity(entity);
		}
	},

}

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
        if (!message.type in this.callbacks)
            return;

		for (var i = 0; i < this.callbacks[message.type].length; i++) {
			this.callbacks[message.type][i](message);
		}
	}
}



var EntityFactory = function (availableComponents) {
	this.components = availableComponents;
    this.entityTemplates = {};
}

EntityFactory.prototype = {
    addEntityTemplate: function (name, template) {
        if (name in this.entityTemplates) {
            throw "Entity with name " + name + " already exists";
        }

        this.entityTemplates[name] = template;

        if (debug)
            console.log("Added entity template: " + name);
    },
	createEntity: function (entityName, componentData) {
		var entity = {};

		if (entityName == "projectile") {
			entity = this.createBareEntity(["lifetime", "movement", "collision", "graphics"]);

			entity.collision.radius = 2;
			entity.collision.mass = 2;
            entity.collision.collisionDamage = 10;

			entity.lifetime.dieOnCollision = true;

			entity.graphics.model.push({x: 2, y: 0});
			entity.graphics.model.push({x: -2, y: 2});
			entity.graphics.model.push({x: -2, y: -2});

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
	},
    createEntityFromTemplate: function (templateName, overrides) {
        var template = this.entityTemplates[templateName];
        var entity = new Entity();

        entity.entityTypeName = template.entityTypeName;

        if (typeof template.rotation != 'undefined' && template.rotation != null) {
            entity.rotation = template.rotation;
        }

        if (typeof template.position != 'undefined' && template.position != null) {
            entity.position = template.position;
        }

        if (overrides != null) {
            if (typeof overrides.position != 'undefined') {
                entity.position = overrides.position;
            }
             if (typeof overrides.rotation != 'undefined') {
                entity.rotation = overrides.rotation;
            }
        }


        for (var i = 0; i < template.components.length; i++) {
            var componentName = template.components[i];
            var componentData = template[componentName];
            var componentIndex = -1;
            
            for (var j = 0; j < this.components.length; j++) {
                if (this.components[j].shortName == componentName) {
                    componentIndex = j;
                    break;
                }
            }

            if (componentIndex != -1)
                entity[componentName] = this.components[componentIndex].createComponentEntityData();

            if (componentData != null) {
                for (var dataKey in componentData) {
                    entity[componentName][dataKey] = componentData[dataKey];
                }
            }

            if (overrides != null) {
                for (var overrideKey in overrides[componentName]) {
                    entity[componentName][overrideKey] = overrides[componentName][overrideKey];
                }
            }

            if (componentIndex != -1) 
                this.components[componentIndex].registerEntity(entity);
        }

        return entity;
    }

}

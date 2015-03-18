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
    this.lastSwitch = new Date().getTime();
}

// Prototype methods

AttackComponent.prototype = new Component();

AttackComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("shoot", function (message) { me.attack(message); });
    messageHub.registerCallback("switchWeapon", function (message) { me.switchWeapon(message); });
}

AttackComponent.prototype.update = function (now) {
    this.now = now;
}

// Callbacks
AttackComponent.prototype.switchWeapon = function (message) {
    var entity = this.getEntityById(message.entityId);
    
    if (entity == null)
        return;

    if (this.now.getTime() - this.lastSwitch > 200) {
        console.log('switch');
        entity.attack.flak = !entity.attack.flak;
        this.lastSwitch = this.now.getTime();
    }
}

AttackComponent.prototype.attack = function (message) {
    var entity = this.getEntityById(message.entityId);

    if (this.now.getTime() - entity.attack.lastFire > entity.attack.fireRate * 1000) {
        entity.attack.lastFire = this.now.getTime();

        if (entity.attack.flak) {
            for (var i = 0; i < 4; i++) {
                var rotation = entity.rotation + (Math.random() * 0.05 * Math.PI - 0.05 * Math.PI / 2);
                var offset = Math.random() * 4;
                var projectile = {
                    rotation: rotation,
                    position: new Vector(entity.position.x, entity.position.y),
                    movement: {
                        xVel: (14 + offset) * Math.cos(rotation),
                        yVel: (14 + offset) * Math.sin(rotation)
                    }
                };

                this.messageHub.sendMessage({ type: "spawnEntity", sender: entity, entityTypeName: "flakProjectile", componentData: projectile });
            }



            //var laser = {
            //    rotation: entity.rotation,
             //   position: new Vector(entity.position.x, entity.position.y)
            //};

            //this.messageHub.sendMessage({ type: "spawnEntity", sender: entity, entityTypeName: "laser", componentData: laser });
        }
        else {
            var projectile = {
                rotation: entity.rotation,
                position: new Vector(entity.position.x, entity.position.y),
                movement: {
                    xVel: 1000 * Math.cos(entity.rotation),
                    yVel: 1000 * Math.sin(entity.rotation)
                },
                physics: {
                    dieOnCollision: true
                }
            };
                
            this.messageHub.sendMessage({ type: "spawnEntity", sender: entity, entityTypeName: "projectile", componentData: projectile });
        }
    }	
}

AttackComponent.prototype.createComponentEntityData = function () {
	var attack = {
		fireRate: 1,
		lastFire: 0
	};

	return attack;
};

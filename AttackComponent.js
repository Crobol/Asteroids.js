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
        entity.attack.selectedWeapon++;

        if (entity.attack.selectedWeapon > entity.attack.weapons.length - 1) {
            entity.attack.selectedWeapon = 0;
        }

        console.log('Switching weapon to ' + entity.attack.weapons[entity.attack.selectedWeapon]);
        this.lastSwitch = this.now.getTime();
    }
}

AttackComponent.prototype.attack = function (message) {
    var entity = this.getEntityById(message.entityId);

    var selectedWeapon = entity.attack.weapons[entity.attack.selectedWeapon];

    if (this.now.getTime() - entity.attack.lastFire > selectedWeapon.fireRate * 1000) {
        entity.attack.lastFire = this.now.getTime();

        var projectiles = selectedWeapon.createProjectiles(entity)

        for (var i = 0; i < projectiles.length; i++) {
            this.messageHub.sendMessage({ type: "spawnEntity", sender: entity, entityTypeName: projectiles[i].entityTypeName, componentData: projectiles[i] });
        }
    }	
}

AttackComponent.prototype.createDefaultEntityData = function () {
	var attack = {
		fireRate: 1,
		lastFire: 0
	};

	return attack;
};

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

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        for (var j = 0; j < entity.attack.weaponSlots.length; j++) {
            var slot = entity.attack.weaponSlots[j];

            if (!slot.weapon.isReloading(this.now) && !slot.weapon.ammunitionFull()) {
                slot.weapon.reload(this.now);
            }
        }
    }
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

        if (debug)
            console.log('Switching weapon to ' + entity.attack.weapons[entity.attack.selectedWeapon]);
        this.lastSwitch = this.now.getTime();
    }
}

AttackComponent.prototype.attack = function (message) {
    var entity = this.getEntityById(message.entityId);

    for (var i = 0; i < entity.attack.weaponSlots.length; i++) {
        var slot = entity.attack.weaponSlots[i];

        if (slot.isActive && slot.weapon.isReady(this.now) && slot.weapon.hasAmmunition()) {
            var me = this;
            slot.weapon.fire(entity, this.now, slot.position, slot.rotation, function (projectiles) {
                me.spawnProjectiles(entity, projectiles);
            });
            // if (this.now.getTime() - slot.weapon.lastReload > slot.weapon.reloadTime * 1000 && !slot.weapon.ammunitionFull()) {
            //     slot.weapon.lastReload = this.now.getTime();
            // }
        }
    }
}

AttackComponent.prototype.spawnProjectiles = function (spawningEntity, projectiles) {
    for (var j = 0; j < projectiles.length; j++) {
        this.messageHub.sendMessage({ type: "spawnEntity", sender: spawningEntity, entityTypeName: projectiles[j].entityTypeName, componentData: projectiles[j] });
    }
}

AttackComponent.prototype.createDefaultEntityData = function () {
	var attack = {};

	return attack;
};

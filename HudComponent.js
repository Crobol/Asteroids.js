"use strict";

var HudComponent = function (messageHub) {
	HudComponent.shortName = "hud";
	this.shortName = HudComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["health"];
	this.messageHub = messageHub;

	this.registerCallbacks(this.messageHub);

}

// Prototype methods

HudComponent.prototype = new Component();

HudComponent.prototype.update = function (now) {

}

HudComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);
    document.getElementById('hitPoints').innerHTML = Math.round(entity.health.currentHitPoints);
    if (entity.hasComponent('attack')) {
        if (entity.attack.flak)
            document.getElementById('weapon').innerHTML = "Multi";
        else
            document.getElementById('weapon').innerHTML = "Single";
    }
}

HudComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("damageTaken", function (message) { me.onDamageTaken(message); });
    messageHub.registerCallback("switchWeapon", function (message) { me.onSwitchWeapon(message); });
}

HudComponent.prototype.onDamageTaken = function (message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null)
        return;

    document.getElementById('hitPoints').innerHTML = Math.round(entity.health.currentHitPoints);
}

HudComponent.prototype.onSwitchWeapon = function (message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null)
        return;

    if (entity.hasComponent('attack')) {
        var weaponName = entity.attack.weapons[entity.attack.selectedWeapon].name;
        document.getElementById('weapon').innerHTML = weaponName;
    }
}

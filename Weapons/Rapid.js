"use strict";

var Rapid = function (options) {
    this.name = "Rapid";
    this.entityTypeName = "flakProjectile";
    this.fireRate = 0.1;
    this.lastFire = 0;
    this.reloadTime = 0.3;
    this.lastReload = 0;
    this.ammunitionCapacity = 100;
    this.currentAmmunition = this.ammunitionCapacity;
    this.projectileVelocity = 800;
    this.spread = 0.04;

    this.position = new Vector(10, 10);
    this.rotation = 0;

    extend(this, options);
}

Rapid.prototype = new Weapon();

Rapid.prototype.createProjectiles = function (firingEntity, position, rotation) {
    if (typeof position == 'undefined') {
        position = this.position;
    }

    if (typeof rotation == 'undefined') {
        rotation = this.rotation;
    }

    var projectilePosition = this.absolutePosition(firingEntity, position);

    var projectileRotation = firingEntity.rotation + (Math.random() * this.spread * Math.PI - this.spread * Math.PI / 2) + rotation;
    var offset = Math.random() * 4;

    var projectile = {
        entityTypeName: this.entityTypeName,
        rotation: projectileRotation,
        position: projectilePosition,
        physics: {
            xVel: (this.projectileVelocity + offset) * Math.cos(projectileRotation),
            yVel: (this.projectileVelocity + offset) * Math.sin(projectileRotation)
        }
    };

    return [projectile];
}

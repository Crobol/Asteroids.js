"use strict";

var Single = function (options) {
    this.name = "Single";
    this.entityTypeName = "projectile";
    this.fireRate = 0.5;
    this.lastFire = 0;
    this.reloadTime = 0.5;
    this.lastReload = 0;
    this.ammunitionCapacity = 10;
    this.currentAmmunition = this.ammunitionCapacity;
    this.projectileVelocity = 1000;

    this.position = new Vector(10, 10);
    this.rotation = 0;

    extend(this, options);
}

Single.prototype = new Weapon();

Single.prototype.createProjectiles = function (firingEntity, now, position, rotation) {
    if (typeof position == 'undefined') {
        position = this.position;
    }

    if (typeof rotation == 'undefined') {
        rotation = this.rotation;
    }

    var projectilePosition = this.aboslutePosition(firingEntity, position);
    var projectileRotation = firingEntity.rotation + rotation;

    var projectile = {
        entityTypeName: this.entityTypeName,
        rotation: projectileRotation,
        position: projectilePosition,
        physics: {
            xVel: this.projectileVelocity * Math.cos(projectileRotation),
            yVel: this.projectileVelocity * Math.sin(projectileRotation),
            dieOnCollision: true
        }
    };

    return [projectile];
}

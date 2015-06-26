"use strict";

var Weapon = function () {
}

Weapon.prototype = {
    createProjectiles: function (firingEntity) {
        
    }
}

var Single = function (fireRate, projectileVelocity) {
    this.name = "Single";
    this.entityTypeName = "projectile";
    this.fireRate = fireRate;
    this.projectileVelocity = projectileVelocity;
}

Single.prototype = new Weapon();

Single.prototype.createProjectiles = function (firingEntity) {
    var projectile = {
        entityTypeName: this.entityTypeName,
        rotation: firingEntity.rotation,
        position: new Vector(firingEntity.position.x, firingEntity.position.y),
        movement: {
            xVel: this.projectileVelocity * Math.cos(firingEntity.rotation),
            yVel: this.projectileVelocity * Math.sin(firingEntity.rotation)
        },
        physics: {
            dieOnCollision: true
        }
    };
    return [projectile];
}

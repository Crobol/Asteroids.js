"use strict";

var Multiple = function (options) {
    this.name = "Flak";
    this.entityTypeName = "flakProjectile";
    this.fireRate = 1.0;
    this.projectileVelocity = 1000;

    this.position = new Vector(0, 10);
    this.rotation = 0;

    extend(this, options);
}

Multiple.prototype = new Weapon();

Multiple.prototype.createProjectiles = function (firingEntity, position, rotation) {
    if (typeof position == 'undefined') {
        position = this.position;
    }

    if (typeof rotation == 'undefined') {
        rotation = this.rotation;
    }

    var projectiles = [];

    for (var i = 0; i < 4; i++) {
        var projectilePosition = this.absolutePosition(firingEntity, position);
        var rotation = firingEntity.rotation + (Math.random() * 0.05 * Math.PI - 0.05 * Math.PI / 2) + this.rotation;
        var offset = Math.random() * 4;
        var projectile = {
            entityTypeName: this.entityTypeName,
            rotation: rotation,
            position: projectilePosition,
            physics: {
                xVel: (this.projectileVelocity + offset) * Math.cos(rotation),
                yVel: (this.projectileVelocity + offset) * Math.sin(rotation)
            }
        };
        projectiles.push(projectile);
    };

    return projectiles;
}

"use strict";

var Multiple = function (fireRate, projectileVelocity) {
    this.name = "Flak";
    this.entityTypeName = "flakProjectile";
    this.fireRate = fireRate;
    this.projectileVelocity = projectileVelocity;
}

Multiple.prototype = new Weapon();

Multiple.prototype.createProjectiles = function (firingEntity) {
    var projectiles = [];
    for (var i = 0; i < 4; i++) {
        var rotation = firingEntity.rotation + (Math.random() * 0.05 * Math.PI - 0.05 * Math.PI / 2);
        var offset = Math.random() * 4;
        var projectile = {
            entityTypeName: this.entityTypeName,
            rotation: rotation,
            position: new Vector(firingEntity.position.x, firingEntity.position.y),
            movement: {
                xVel: (this.projectileVelocity + offset) * Math.cos(rotation),
                yVel: (this.projectileVelocity + offset) * Math.sin(rotation)
            }
        };
        projectiles.push(projectile);
    };
    return projectiles;
}

"use strict";

var Weapon = function () {
    this.reloadTime = 0;
    this.lastReload = 0;
    this.ammunitionCapacity = 1;
    this.currentAmmunition = this.ammunitionCapacity;
    this.delay = 0;
    this.collisionGroup = 0;
    this.collisionMask = 0;

    this.position = new Vector(0, 0);
    this.rotation = 0;
}

Weapon.prototype._fire = function (firingEntity, now, position, rotation, callback) {
    var projectiles = this.createProjectiles(firingEntity, position, rotation);
    if (typeof callback == 'function') {
        callback(projectiles);
    } else {}
}

Weapon.prototype.fire = function (firingEntity, now, position, rotation, callback) {
    this.lastFire = now.getTime();
    this.currentAmmunition--;

    if (this.delay == 0) {
        this._fire(firingEntity, now, position, rotation, callback);
    } else {
        var me = this;
        setTimeout(function () {
            me._fire(firingEntity, now, position, rotation, callback);
        }, this.delay);
    }
};

Weapon.prototype.createProjectiles = function (firingEntity, position, rotation) {};

Weapon.prototype.reload = function (now) {
    this.lastReload = now.getTime();
    this.currentAmmunition++;
}

Weapon.prototype.isReady = function (now) {
    return now.getTime() - this.lastFire > this.fireRate * 1000;
}

Weapon.prototype.isReloading = function (now) {
    return now.getTime() - this.lastReload < this.reloadTime * 1000 && !this.ammunitionFull();
}

Weapon.prototype.ammunitionFull = function () {
    return this.currentAmmunition >= this.ammunitionCapacity;
}

Weapon.prototype.hasAmmunition = function () {
    return this.currentAmmunition > 0;
}

Weapon.prototype.absolutePosition = function (firingEntity, weaponPosition) {
    var rx = weaponPosition.x * Math.cos(firingEntity.rotation) - weaponPosition.y * Math.sin(firingEntity.rotation);
    var ry = weaponPosition.x * Math.sin(firingEntity.rotation) + weaponPosition.y * Math.cos(firingEntity.rotation);

    rx += firingEntity.position.x;
    ry += firingEntity.position.y;

    return new Vector(rx, ry);
}

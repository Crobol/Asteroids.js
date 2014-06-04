"use strict";

var Component = function () {
    this.dependencies = [];
    this.entities = [];
    this.now = new Date();
}

Component.prototype = {
    registerEntityBase: function (entity) {
        for (var key in this.dependencies) {
            if (!entity.hasComponent(this.dependencies[key])) {
                throw "Entity is missing required component dependencies for this component";
            }
        }
        
        this.entities.push(entity);
        entity[this.shortName] = this.createComponentEntityData();
    },
    registerEntity: function (entity) {
        this.registerEntityBase(entity);
    },
    unregisterEntityBase: function (entity) {
        var index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    },
    unregisterEntity: function (entity) {
        this.unregisterEntityBase(entity);
    },
    getEntityById: function (entityId) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].id == entityId) {
                return this.entities[i];
            }
        }
        return null;
    },
    hasEntityById: function (entityId) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].id == entityId) {
                return true;
            }
        }
        return false;
    },
    createComponentEntityData: function () {
        return {};
    }
}

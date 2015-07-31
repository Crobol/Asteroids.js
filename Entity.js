"use strict";

var Entity = function (entityTypeName) {
    this.id = generateId();
    if (typeof entityTypeName != 'undefined') {
        this.entityTypeName = entityTypeName;
    }
    this.dead = false;

    this.position = new Vector();
    this.rotation = 0;
}

Entity.prototype = {
    registerComponent: function (componentShortName) {
        this[componentShortName] = {};
    },
    hasComponent: function (componentShortName) {
        return typeof this[componentShortName] != 'undefined';
    },
    hasComponentProperty: function (componentShortName, propertyName) {
        return typeof this[componentShortName] != 'undefined' && typeof this[componentShortName][propertyName] != 'undefined';
    },
    componentPropertyContains: function (componentShortName, propertyName, contains) {
        if (this.hasComponentProperty(componentShortName, propertyName)) {
            return this[componentShortName][propertyName].indexOf(contains) != -1;
        }
        return false;
    },
    setComponentData: function (componentShortName, data) {
        if (this.hasComponent(componentShortName)) {
            this[componentShortName] = data;
        } else {
            throw "Trying to set data of missing component " + componentShortName;
        }
    },
    setComponentProperty: function (componentShortName, propertyName, value) {
        if (this.hasComponent(componentShortName)) {
            this[componentShortName][propertyName] = value;
        } else {
            throw "Trying to set property " + propertyName + " of missing component " + componentShortName;
        }
    },
    getComponentProperty: function (componentShortName, propertyName) {
        if (this.hasComponentProperty(componentShortName, propertyName)) {
            return this[componentShortName][propertyName];
        } else {
            throw "Trying to get property " + propertyName + " of missing component " + componentShortName;
        }
    }
}

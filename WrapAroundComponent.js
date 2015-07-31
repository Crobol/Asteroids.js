"use strict";

var WrapAroundComponent = function (messageHub, worldDimensions) {
    WrapAroundComponent.shortName = "wrapAround";
    this.shortName = WrapAroundComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position", "physics"];
    this.worldDimensions = worldDimensions;
}

WrapAroundComponent.prototype = new Component();

WrapAroundComponent.prototype.update = function (now) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if (entity.position.x > this.worldDimensions.x) {
            entity.position.x = 0;
        }
        else if (entity.position.x < 0) {
            entity.position.x = this.worldDimensions.x;
        } 

        if (entity.position.y > this.worldDimensions.y) {
            entity.position.y = 0;
        }
        else if (entity.position.y < 0) {
            entity.position.y = this.worldDimensions.y;
        } 
    }
}

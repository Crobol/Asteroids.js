"use strict";

var EntityManager = function (messageHub, componentManager, entityFactory) {
    this.entities = [];
    this.messageHub = messageHub;
    this.componentManager = componentManager;
    this.entityFactory = entityFactory;

    var me = this;
    this.messageHub.registerCallback("spawnEntity", function (message) { me.spawnEntity(message); });
}

EntityManager.prototype = {
    update: function () {
        this.componentManager.update();
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.dead) {
                this.deleteEntity(entity);
            }
        }
        var me = this;
        requestAnimationFrame(function () { me.update(); });
    },
    addEntity: function (entity) {
        this.entities.push(entity);
    },
    deleteEntity: function (entity) {
        this.componentManager.deleteEntity(entity);
        var index = this.entities.indexOf(entity);
        if (index != -1) {
            this.entities.splice(index, 1);
        }
    },
    // Callbacks
    spawnEntity: function (message) {
        var entity = this.entityFactory.createEntityFromTemplate(message.entityTypeName, message.componentData);
        if (typeof message.sender != 'undefined' && message.sender != null)
            entity.owner = message.sender.id;
        this.entities.push(entity);
    }
};

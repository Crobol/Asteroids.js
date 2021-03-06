"use strict";

var GraphicsComponent = function (messageHub, viewportDimensions, worldDimensions) {
    GraphicsComponent.shortName = "graphics";
    this.shortName = GraphicsComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position"];
    this.messageHub = messageHub;

    this.registerCallbacks(messageHub);

    this.graphics = new GraphicsSystem(viewportDimensions, worldDimensions);
    this.entityToFollow = 0;
}

GraphicsComponent.prototype = new Component();

GraphicsComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("entityKilled", function (message) { me.onEntityKilled(message) });
    messageHub.registerCallback("damageTaken", function (message) { me.onDamageTaken(message) });
}

GraphicsComponent.prototype.addModel = function (model) {
    this.graphics.addModel(model);
}

GraphicsComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);

    if (entity.hasComponentProperty("graphics", "followWithCamera") && entity.graphics.followWithCamera) {
        this.entityToFollow = entity.id;
    }

    if (entity.hasComponentProperty("graphics", "model")) {
        var sprite = this.graphics.createSpriteFromModel(entity.graphics.model);
        sprite.position.x = entity.position.x;
        sprite.position.y = entity.position.y;
        sprite.rotation = entity.rotation;

        var blurSprite = this.graphics.createSpriteFromModel(entity.graphics.model, true);
        blurSprite.position.x = entity.position.x;
        blurSprite.position.y = entity.position.y;
        blurSprite.rotation = entity.rotation;

        entity.graphics.sprites.push(sprite);
        entity.graphics.sprites.push(blurSprite);
    }

    if (typeof entity.graphics.particleEmitterTemplates != 'undefined') {
        for (var i = 0; i < entity.graphics.particleEmitterTemplates.length; i++) {
            var template = entity.graphics.particleEmitterTemplates[i];

            // TODO: Refactor this 'if'
            var color = 0x00ff00; // Default color
            if (typeof entity.graphics.model.color != 'undefined' && typeof template.model != 'string' && typeof template.model.color == 'undefined') {
                color = entity.graphics.model.color; // The entity's current color
            }
            else if (typeof template.model == 'string' && typeof template.model.color != 'undefined') {
                color = template.model.color; // The emitter template specified color
            }
            else if (typeof template.model == 'string' && typeof entity.graphics.model != 'undefined' && typeof entity.graphics.model.color != 'undefined') {
                color = entity.graphics.model.color;
            }
            else if (typeof entity.graphics.model == 'string' && this.graphics.models[entity.graphics.model] != null && typeof this.graphics.models[entity.graphics.model].color != 'undefined') {
                color = this.graphics.models[entity.graphics.model].color;
            }
            var emitter = this.graphics.createParticleEmitter(template, color);
            if (typeof template.onCreate != 'undefined') {
                template.onCreate(emitter, entity);
            }
            entity.graphics.particleEmitters.push(emitter);
        }
    }
}

GraphicsComponent.prototype.unregisterEntity = function (entity) {
    for (var i = 0; i < entity.graphics.sprites.length; i++) {
        this.graphics.destroySprite(entity.graphics.sprites[i]);
    }

    entity.graphics.sprites.length = 0;

    for (var i = 0; i < entity.graphics.particleEmitters.length; i++) {
        this.graphics.destroyParticleEmitter(entity.graphics.particleEmitters[i]);
    }

   this.unregisterEntityBase(entity);
}

GraphicsComponent.prototype.update = function (now) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        for (var j = 0; j < entity.graphics.sprites.length; j++) {
            var sprite = entity.graphics.sprites[j];
            sprite.position.x = entity.position.x;
            sprite.position.y = entity.position.y;
            sprite.rotation = entity.rotation;
        }

        for (var j = 0; j < entity.graphics.particleEmitters.length; j++) {
            var emitter = entity.graphics.particleEmitters[j];
            emitter.p.x = entity.position.x;
            emitter.p.y = entity.position.y;
        }

        if (entity.id == this.entityToFollow) {
            this.graphics.stage.position.x = -(entity.position.x - (this.graphics.viewportDimensions.x / 2));
            this.graphics.stage.position.y = -(entity.position.y - (this.graphics.viewportDimensions.y / 2));
        }
    }
    this.graphics.update();
}

GraphicsComponent.prototype.createDefaultEntityData = function () {
    return GraphicsComponent.createDefaultEntityData();
}

// Callbacks
GraphicsComponent.prototype.onEntityKilled = function (message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null)
        return;

    for (var i = 0; i < entity.graphics.particleEmitters.length; i++) {
        var emitter = entity.graphics.particleEmitters[i];
        if (typeof emitter.triggerMessageType != 'undefined' && emitter.triggerMessageType == message.type) {
            emitter.emit();
            this.graphics.proton.update();
        }
    }
}

GraphicsComponent.prototype.onDamageTaken = function (message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null || entity.dead || entity.health.currentHitPoints <= 0)
        return;

    var fromEntity = this.getEntityById(message.fromEntityId);
    if (fromEntity == null)
        return;

    for (var i = 0; i < entity.graphics.particleEmitters.length; i++) {
        var emitter = entity.graphics.particleEmitters[i];
        if (typeof emitter.triggerMessageType != 'undefined' && emitter.triggerMessageType == message.type) {
            var d = new Vector(entity.position.x - fromEntity.position.x, entity.position.y - fromEntity.position.y);

            var length = Math.sqrt(d.x*d.x + d.y*d.y);

            d.x = d.x / length;
            d.y = d.y / length;

            d.x = d.x * entity.physics.radius;
            d.y = d.y * entity.physics.radius;

            emitter.p.x -= d.x;
            emitter.p.y -= d.y;

            emitter.emit();
            this.graphics.proton.update();
            emitter.stopEmit();
        }
    }
}

// Statics

GraphicsComponent.createDefaultEntityData = function () {
    var graphics = { 
        refresh: true, 
        color: 0x33FF00,
        sprites: [],
        particleEmitters: []
    };

    return graphics;
}

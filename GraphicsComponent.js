"use strict";

var GraphicsComponent = function (messageHub, viewportDimensions) {
    GraphicsComponent.shortName = "graphics";
    this.shortName = GraphicsComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position"];
    this.messageHub = messageHub;

    this.registerCallbacks(messageHub);

    this.renderer = new PIXI.WebGLRenderer(viewportDimensions.x, viewportDimensions.y);
    this.renderer.view.style.display = "block";

    this.globalBlur = new PIXI.BlurFilter();
    this.globalBlur.blur = 20;

    this.stage = new PIXI.Stage;

    this.utilGraphics = new PIXI.Graphics();

    this.stage.addChild(this.utilGraphics);

    document.body.appendChild(this.renderer.view);

    this.sprites = {};
    this.blurSprites = {};
    this.emitters = {};
    this.particleTextures = {};
    this.spriteBatch = new PIXI.DisplayObjectContainer();
    this.blurBatch = new PIXI.DisplayObjectContainer();
    this.blurBatch.filters = [this.globalBlur];
    this.stage.addChild(this.spriteBatch);
    this.stage.addChild(this.blurBatch);

    var particleGraphics = new PIXI.Graphics();
    this.drawModel(particleGraphics, [ { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 } ], 0x00ff00);
    this.particleTexture = particleGraphics.generateTexture();
    
    this.proton = new Proton;

    var graphicsComponent = this;
    this.protonRenderer = new Proton.Renderer('other', this.proton);
    this.protonRenderer.onParticleCreated = function(particle) {
        var particleSprite = new PIXI.Sprite(particle.target);
        particle.sprite = particleSprite;
        graphicsComponent.stage.addChild(particle.sprite);
    };

    this.protonRenderer.onParticleUpdate = function(particle) {
        GraphicsComponent.transformSprite(particle.sprite, particle);
    };

    this.protonRenderer.onParticleDead = function(particle) {
        graphicsComponent.stage.removeChild(particle.sprite);
    };
    this.protonRenderer.start();
}

GraphicsComponent.prototype = new Component();

GraphicsComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("entityKilled", function (message) { me.onEntityKilled(message) });
}

GraphicsComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);

    var modelBounds = this.getModelBounds(entity.graphics.model);

    var graphics = new PIXI.Graphics();
    this.drawModel(graphics, entity.graphics.model, entity.graphics.color);

    graphics.position.x = modelBounds.width / 2 + 5;
    graphics.position.y = modelBounds.height / 2 + 5;
    
    var renderTexture = graphics.generateTexture();

    var sprite = new PIXI.Sprite(renderTexture);
    sprite.position.x = entity.position.x;
    sprite.position.y = entity.position.y;
    sprite.rotation = entity.rotation;
    sprite.pivot = new PIXI.Point(sprite.width / 2, sprite.height / 2);

    var blurSprite = new PIXI.Sprite(renderTexture);
    blurSprite.position.x = entity.position.x;
    blurSprite.position.y = entity.position.y;
    blurSprite.rotation = entity.rotation;
    blurSprite.pivot = new PIXI.Point(blurSprite.width / 2, blurSprite.height / 2);

    this.spriteBatch.addChild(sprite);
    this.blurBatch.addChild(blurSprite);
    this.sprites[entity.id] = sprite;
    this.blurSprites[entity.id] = blurSprite;

    if (typeof entity.graphics.particleSystems != 'undefined') {
        for (var i = 0; i < entity.graphics.particleSystems.length; i++) {
            var particleSystem = entity.graphics.particleSystems[i];
            var emitter = new Proton.Emitter();
            emitter.rate = particleSystem.rate;

            var textureGraphics = new PIXI.Graphics();
            this.drawModel(textureGraphics, particleSystem.model, entity.graphics.color);
            this.particleTextures[entity.id] = textureGraphics.generateTexture();

            emitter.addInitialize(new Proton.ImageTarget(this.particleTextures[entity.id]));
            
            for (var j = 0; j < particleSystem.initialize.length; j++) {
                emitter.addInitialize(particleSystem.initialize[j]);
            }

            for (var j = 0; j < particleSystem.behaviours.length; j++) {
                emitter.addBehaviour(particleSystem.behaviours[j]);
            }

            emitter.p.x = particleSystem.position.x;
            emitter.p.y = particleSystem.position.y;

            if (typeof particleSystem.triggerMessageType == 'undefined')
                emitter.emit();
            else
                emitter.triggerMessageType = particleSystem.triggerMessageType;

            this.proton.addEmitter(emitter);
            this.emitters[entity.id] = emitter;
        }
    }
}

GraphicsComponent.prototype.unregisterEntity = function (entity) {
    this.spriteBatch.removeChild(this.sprites[entity.id]);
    this.blurBatch.removeChild(this.blurSprites[entity.id]);

    if (entity.id in this.emitters) {
        var emitter = this.emitters[entity.id];
        emitter.destroy();
        delete this.emitters[entity.id];
    }

    if (entity.id in this.particleTextures) {
        var texture = this.particleTextures[entity.id];
        texture.destroy();
        delete this.particleTextures[entity.id];
    }

    delete this.sprites[entity.id];
    delete this.blurSprites[entity.id];
    this.unregisterEntityBase(entity);
}

GraphicsComponent.prototype.update = function (now) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var sprite = this.sprites[entity.id];
        var blurSprite = this.blurSprites[entity.id];

        sprite.position.x = entity.position.x;
        sprite.position.y = entity.position.y;
        sprite.rotation = entity.rotation;

        blurSprite.position.x = entity.position.x;
        blurSprite.position.y = entity.position.y;
        blurSprite.rotation = entity.rotation;

        if (entity.id in this.emitters) {
            var emitter = this.emitters[entity.id];
            emitter.p.x = entity.position.x;
            emitter.p.y = entity.position.y;
        }
    }

    this.proton.update();
    this.renderer.render(this.stage);
}

GraphicsComponent.prototype.drawModel = function (graphic, model, color) {
    graphic.clear();

    graphic.lineStyle(2, color);
    graphic.moveTo(model[0].x, model[0].y);

    for (var i = 1; i < model.length; i++) {
        graphic.lineTo(model[i].x, model[i].y);
    }

    graphic.lineTo(model[0].x, model[0].y);
}

GraphicsComponent.prototype.getModelBounds = function (model) {
    var minX = 0;
    var minY = 0;
    var maxX = 0;
    var maxY = 0;

    for (var i = 0; i < model.length; i++) {
        var currMinX = model[i].x;
        var currMinY = model[i].y;
        var currMaxX = model[i].x;
        var currMaxY = model[i].y;

        if (currMinX < minX) minX = currMinX;
        if (currMinY < minY) minY = currMinY;
        if (currMaxX > maxX) maxX = currMaxX;
        if (currMaxY > maxY) maxY = currMaxY;
    }

    return { width: Math.abs(maxX) + Math.abs(minX), height: Math.abs(maxY) + Math.abs(minY) };
}

GraphicsComponent.prototype.renderQuadtree = function (quadtree) {
    var g = this.utilGraphics; 
    g.clear();
    g.lineStyle(2, 0x555555);

    drawNode(quadtree.root, g);
}

GraphicsComponent.prototype.createComponentEntityData = function () {
    return GraphicsComponent.createComponentEntityData();
}

// Callbacks
GraphicsComponent.prototype.onEntityKilled = function (message) {
    var entity = this.getEntityById(message.entityId);
    if (entity == null)
        return;

    if (!entity.id in this.emitters)
        return;

    var emitter = this.emitters[entity.id];
    if (typeof emitter.triggerMessageType != 'undefined' && emitter.triggerMessageType == message.type) {
        emitter.emit();
        this.proton.update();
    }

    /*for (var i = 0; i < entity.graphics.particleSystems.length; i++) {
        var particleSystem = entity.graphics.particleSystems[i];
        if (typeof particleSystem.triggerMessageType != 'undefined' && particleSystem.triggerMessageType == message.type) {
            particleSystem.emit();
        }
    }*/
}

// Statics

GraphicsComponent.createComponentEntityData = function () {
    var graphics = { 
        model: [], 
        refresh: true, 
        color: 0x33FF00 
    };

    return graphics;
}

GraphicsComponent.transformSprite = function (particleSprite, particle) {
    particleSprite.position.x = particle.p.x;
    particleSprite.position.y = particle.p.y;
    particleSprite.scale.x = particle.scale;
    particleSprite.scale.y = particle.scale;
    particleSprite.anchor.x = 0.5;
    particleSprite.anchor.y = 0.5;
    particleSprite.alpha = particle.alpha;
    particleSprite.rotation = particle.rotation*Math.PI/180;
}

function drawNode(node, graphics)
{
    var bounds = node._bounds;
    var g = graphics;

    g.drawRect(
        Math.abs(bounds.x) + 0.5,
        Math.abs(bounds.y) + 0.5,
        bounds.width,
        bounds.height
    );

    var len = node.nodes.length;

    for(var i = 0; i < len; i++)
    {
        drawNode(node.nodes[i], g);
    }
}

"use strict";

var GraphicsSystem = function (viewportDimensions) {
    this.renderer = new PIXI.WebGLRenderer(viewportDimensions.x, viewportDimensions.y);
    this.renderer.view.style.display = "block";
    document.body.appendChild(this.renderer.view);

    this.globalBlur = new PIXI.BlurFilter();
    this.globalBlur.blur = 20;

    this.stage = new PIXI.Stage;

    this.models = {};
    this.textures = {};

    //this.sprites = {};
    //this.blurSprites = {};
    //this.emitters = {};

    this.spriteBatch = new PIXI.DisplayObjectContainer();
    this.blurBatch = new PIXI.DisplayObjectContainer();
    this.blurBatch.filters = [this.globalBlur];
    this.stage.addChild(this.spriteBatch);
    this.stage.addChild(this.blurBatch);

    this._initProton();
}

GraphicsSystem.prototype = {
    _initProton: function() {
        var me = this;
        this.proton = new Proton;

        this.protonRenderer = new Proton.Renderer('other', this.proton);
        this.protonRenderer.onParticleCreated = function(particle) {
            var particleSprite = new PIXI.Sprite(particle.target);
            particle.sprite = particleSprite;
            me.stage.addChild(particle.sprite);
        };

        this.protonRenderer.onParticleUpdate = function(particle) {
            GraphicsSystem.transformSprite(particle.sprite, particle);
        };

        this.protonRenderer.onParticleDead = function(particle) {
            me.stage.removeChild(particle.sprite);
        };

        this.protonRenderer.start();
    },
    addModel: function (model) {
        this.models[model.name] = model;
        if (typeof model.color != 'undefined')
            this.textures[model.name] = this.renderTextureFromModel(model);
    },
    renderTextureFromModel: function (model, color, prioritizeModelColor) {
        if (typeof model == 'string' && model in this.models) {
            var storedModel = this.models[model];
            if (typeof storedModel.color != 'undefined' && typeof prioritizeModelColor != 'undefined' && prioritizeModelColor || typeof color == 'undefined')
                color = storedModel.color;
            return this.renderTextureFromPoints(storedModel.points, color);
        }
        else {
            if (typeof model.color != 'undefined' && typeof prioritizeModelColor != 'undefined' && prioritizeModelColor || typeof color == 'undefined')
                color = model.color;
            return this.renderTextureFromPoints(model.points, color);
        }
    },
    renderTextureFromPoints: function (points, color) {
        var textureGraphics = new PIXI.Graphics();
        this.drawPoints(textureGraphics, points, color);
        return textureGraphics.generateTexture();
    },
    drawPoints: function (graphic, points, color) {
        graphic.clear();

        graphic.lineStyle(2, color);
        graphic.moveTo(points[0].x, points[0].y);

        for (var i = 1; i < points.length; i++) {
            graphic.lineTo(points[i].x, points[i].y);
        }

        graphic.lineTo(points[0].x, points[0].y);
    },
    createSpriteFromTexture: function (texture, glow) {
        var sprite = new PIXI.Sprite(texture);
        sprite.pivot = new PIXI.Point(sprite.width / 2, sprite.height / 2);
        this.addSprite(sprite, glow);
        return sprite;
    },
    createSpriteFromModel: function (model, glow) {
        var sprite = null;

        if (typeof model == 'string' && model in this.textures) {
            var texture = this.textures[model];
            sprite = new PIXI.Sprite(texture);
        }
        else {
            var texture = this.renderTextureFromModel(model);
            sprite = new PIXI.Sprite(texture);
        }
        sprite.pivot = new PIXI.Point(sprite.width / 2, sprite.height / 2);
        this.addSprite(sprite, glow);
        return sprite;
    },
    addSprite: function (sprite, glow) {
        if (glow)
            this.blurBatch.addChild(sprite);
        else
            this.spriteBatch.addChild(sprite);
    },
    createParticleEmitter: function (template, color, prioritizeModelColor) {
        var emitter = new Proton.Emitter();
        emitter.rate = template.rate;

        var texture = null;
        if (typeof color != 'undefined')
            texture = this.renderTextureFromModel(template.model, color);
        else
            texture = this.renderTextureFromModel(template.model);
        
        emitter.addInitialize(new Proton.ImageTarget(texture));
        
        for (var j = 0; j < template.initialize.length; j++) {
            emitter.addInitialize(template.initialize[j]);
        }

        for (var j = 0; j < template.behaviours.length; j++) {
            emitter.addBehaviour(template.behaviours[j]);
        }

        emitter.p.x = template.position.x;
        emitter.p.y = template.position.y;

        if (typeof template.triggerMessageType == 'undefined')
            emitter.emit();
        else
            emitter.triggerMessageType = template.triggerMessageType;

        this.proton.addEmitter(emitter);

        return emitter;
    },
    destroySprite: function (sprite) {
        if (this.spriteBatch.children.indexOf(sprite) != -1) {
            this.spriteBatch.removeChild(sprite);
        }
        else if (this.blurBatch.children.indexOf(sprite) != -1) {
            this.blurBatch.removeChild(sprite);
        }
    },
    destroyParticleEmitter: function (emitter) {
        emitter.destroy();
    },
    update: function () {
        this.proton.update();
        this.renderer.render(this.stage);
    }
}

GraphicsSystem.getModelBounds = function (model) {
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

GraphicsSystem.drawNode = function (node, graphics) {
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
        GraphicsSystem.drawNode(node.nodes[i], g);
    }
}

GraphicsSystem.renderQuadtree = function (quadtree) {
    var g = new PIXI.Graphics();
    g.lineStyle(2, 0x555555);
    GraphicsSystem.drawNode(quadtree.root, g);
}

GraphicsSystem.transformSprite = function (particleSprite, particle) {
    particleSprite.position.x = particle.p.x;
    particleSprite.position.y = particle.p.y;
    particleSprite.scale.x = particle.scale;
    particleSprite.scale.y = particle.scale;
    particleSprite.anchor.x = 0.5;
    particleSprite.anchor.y = 0.5;
    particleSprite.alpha = particle.alpha;
    particleSprite.rotation = particle.rotation*Math.PI/180;
}

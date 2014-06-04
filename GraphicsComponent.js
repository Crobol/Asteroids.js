"use strict";

var GraphicsComponent = function (messageHub, viewportDimensions) {
    GraphicsComponent.shortName = "graphics";
    this.shortName = GraphicsComponent.shortName;
    this.dependencies = ["position"];
    this.messageHub = messageHub;

    this.renderer = new PIXI.WebGLRenderer(viewportDimensions.x, viewportDimensions.y);
    this.renderer.view.style.display = "block";

    this.globalBlur = new PIXI.BlurFilter();
    this.globalBlur.blur = 20;

    this.stage = new PIXI.Stage;

    this.utilGraphics = new PIXI.Graphics();

    this.stage.addChild(this.utilGraphics);

    document.body.appendChild(this.renderer.view);

    this.graphics = {};
}

GraphicsComponent.prototype = new Component();

GraphicsComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);

    this.graphics[entity.id] = new PIXI.Graphics();

    var blurGraphics = new PIXI.Graphics();
    blurGraphics.filters = [this.globalBlur];
    this.graphics[entity.id].addChild(blurGraphics);

    this.stage.addChild(this.graphics[entity.id]);

    entity[GraphicsComponent.shortName] = GraphicsComponent.createComponentEntityData();
}

GraphicsComponent.prototype.unregisterEntity = function (entity) {
    this.graphics[entity.id].removeChild(this.graphics[entity.id].children[0]);
    this.stage.removeChild(this.graphics[entity.id]);

    delete this.graphics[entity.id];
    this.unregisterEntityBase(entity);
}

GraphicsComponent.prototype.update = function (now) {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var graphic = this.graphics[entity.id];
        
        graphic.position.x = entity.position.x;
        graphic.position.y = entity.position.y;
        graphic.rotation = entity.rotation;

        if (entity.graphics.refresh) {
            this.drawModel(graphic.children[0], entity.graphics.model, entity.graphics.color);
            this.drawModel(graphic, entity.graphics.model, entity.graphics.color);
            entity.graphics.refresh = false;
        }
    }

    this.renderer.render(this.stage);
}

GraphicsComponent.prototype.drawModel = function (graphic, model, color) {
    graphic.clear();

    graphic.lineStyle(2, color);
    graphic.moveTo(model[0].x, model[0].y);

    for (var i = 1; i < model.length; i++) {
        graphic.lineTo(model[i].x, model[i].y);
    }
}


GraphicsComponent.prototype.renderQuadtree = function renderQuad(quadtree)
{
    var g = this.utilGraphics; 
    g.clear();
    g.lineStyle(2, 0x555555);

    drawNode(quadtree.root, g);
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


// Statics

GraphicsComponent.createComponentEntityData = function () {
    var graphics = { model: [], refresh: true, color: 0x33FF00 };
    return graphics;
}

"use strict";

var PhysicsComponent = function (messageHub, worldDimensions) {
    var me = this;

    PhysicsComponent.shortName = "physics";
    this.shortName = PhysicsComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position", "movement"];
    this.messageHub = messageHub;

    this.world = new p2.World({gravity: [0, 0]});
    this.world.on("impact", function (e) { me.onCollision(e); });
    this.bodies = {};

    this.registerCallbacks(this.messageHub);
    this.now = new Date();
}

// Prototype methods

PhysicsComponent.prototype = new Component();

PhysicsComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
    messageHub.registerCallback("accelerate", function (message) { me.accelerate(message); });
    messageHub.registerCallback("deaccelerate", function (message) { me.deaccelerate(message); });
    messageHub.registerCallback("turnLeft", function (message) { me.turnLeft(message); });
    messageHub.registerCallback("turnRight", function (message) { me.turnRight(message); });
}

PhysicsComponent.prototype.registerEntity = function (entity) {
    this.registerEntityBase(entity);

    var shape = new p2.Circle(entity.physics.radius);
    shape.collisionGroup = entity.physics.collisionGroup;
    shape.collisionMask = entity.physics.collisionMask;
    this.bodies[entity.id] = new p2.Body({
        mass: entity.physics.mass,
        position: [entity.position.x, entity.position.y],
        velocity: [entity.movement.xVel, entity.movement.yVel],
        angle: entity.rotation,
        angularVelocity: entity.movement.turnVel
    });

    this.bodies[entity.id].entityId = entity.id;

    this.bodies[entity.id].addShape(shape);
    this.world.addBody(this.bodies[entity.id]);
}

PhysicsComponent.prototype.unregisterEntity = function (entity) {
    var index = this.entities.indexOf(entity);
    if (index != -1) {
        var body = this.bodies[entity.id];
        this.world.removeBody(body);
        this.unregisterEntityBase(entity);
    }
}

PhysicsComponent.prototype.update = function (now) {
    this.now = now;

    // TODO: change to message "setPosition" and "setRotation"?
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var body = this.bodies[entity.id];        
        body.position[0] = entity.position.x; 
        body.position[1] = entity.position.y;
        body.angle = entity.rotation;
    }

    this.world.step(1/60);

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var body = this.bodies[entity.id];
        entity.position.x = body.position[0];
        entity.position.y = body.position[1];
        entity.rotation = body.angle;
    }
}

// Private callbacks
PhysicsComponent.prototype.accelerate = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.velocity[0] += entity.movement.acceleration * Math.cos(body.angle);
    body.velocity[1] += entity.movement.acceleration * Math.sin(body.angle);
}

PhysicsComponent.prototype.deaccelerate = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.velocity[0] -= entity.movement.acceleration * Math.cos(body.angle);
    body.velocity[1] -= entity.movement.acceleration * Math.sin(body.angle);
}

PhysicsComponent.prototype.turnLeft = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.angle -= entity.movement.turnRate;
    entity.rotation -= entity.movement.turnRate;
}

PhysicsComponent.prototype.turnRight = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.angle += entity.movement.turnRate;
    entity.rotation += entity.movement.turnRate;
}

PhysicsComponent.prototype.onCollision = function (e) {
    var bodyA = e.bodyA;
    var bodyB = e.bodyB;

    var a = this.getEntityById(bodyA.entityId);
    var b = this.getEntityById(bodyB.entityId);

    if (a.hasComponent("health") && !a.componentPropertyContains("health", "damageExceptions", b.entityTypeName)) {
        a.health.currentHitPoints -= b.physics.collisionDamage;
        this.messageHub.sendMessage({ type: "damageTaken", entityId: a.id, fromEntityId: b.id }); //
    }

    if (b.hasComponent("health") && !b.componentPropertyContains("health", "damageExceptions", a.entityTypeName)) {
        b.health.currentHitPoints -= a.physics.collisionDamage;
        this.messageHub.sendMessage({ type: "damageTaken", entityId: b.id, fromEntityId: a.id });
    }

    this.messageHub.sendMessage({ type: "collision", entityId: bodyA.entityId });
    this.messageHub.sendMessage({ type: "collision", entityId: bodyB.entityId });
}

PhysicsComponent.prototype.createDefaultEntityData = function () {
    // Default values
    var physics = {
        radius: 20,
        mass: 1,
        collisionDamage: 0
    };

    return physics;
}


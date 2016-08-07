"use strict";

var PhysicsComponent = function (messageHub, worldDimensions) {
    var me = this;

    PhysicsComponent.shortName = "physics";
    this.shortName = PhysicsComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.dependencies = ["position"];
    this.messageHub = messageHub;

    this.world = new p2.World({gravity: [0, 0]});
    this.world.applyGravity = false;
    this.world.applyDamping = false;
    this.world.applySpringForces = false;
    this.world.on("impact", function (e) { me.onCollision(e); });
    this.bodies = {};

    // Create world boundries
    var planeShape = new p2.Plane();
    planeShape.collisionGroup = collisionGroup.World;
    planeShape.collisionMask = 0xffffffff;
    var planeBody = new p2.Body({ mass: 0, position:[0,worldDimensions.y] });
    planeBody.addShape(planeShape);
    planeBody.angle = Math.PI;
    this.world.addBody(planeBody);

    planeShape = new p2.Plane();
    planeShape.collisionGroup = collisionGroup.World;
    planeShape.collisionMask = 0xffffffff;
    planeBody = new p2.Body({ mass: 0, position:[0,0] });
    planeBody.addShape(planeShape);
    this.world.addBody(planeBody);

    planeShape = new p2.Plane();
    planeShape.collisionGroup = collisionGroup.World;
    planeShape.collisionMask = 0xffffffff;
    planeBody = new p2.Body({ mass: 0, position:[worldDimensions.x,0] });
    planeBody.angle = Math.PI/2;
    planeBody.addShape(planeShape);
    this.world.addBody(planeBody);

    planeShape = new p2.Plane();
    planeShape.collisionGroup = collisionGroup.World;
    planeShape.collisionMask = 0xffffffff;
    planeBody = new p2.Body({ mass: 0, position:[0,0] });
    planeBody.angle = -Math.PI/2;
    planeBody.addShape(planeShape);
    this.world.addBody(planeBody);

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
        velocity: [entity.physics.xVel, entity.physics.yVel],
        angle: entity.rotation,
        angularVelocity: entity.physics.turnVel,
        fixedRotation: entity.physics.fixedRotation
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
        body.velocity[0] = entity.physics.xVel;
        body.velocity[1] = entity.physics.yVel;
    }

    this.world.step(1/60);

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        var body = this.bodies[entity.id];
        entity.position.x = body.position[0];
        entity.position.y = body.position[1];
        entity.rotation = body.angle;
        entity.physics.xVel = body.velocity[0];
        entity.physics.yVel = body.velocity[1];
    }
}

// Private callbacks
PhysicsComponent.prototype.accelerate = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    entity.physics.xVel += entity.physics.acceleration * Math.cos(body.angle);
    entity.physics.yVel += entity.physics.acceleration * Math.sin(body.angle);
}

PhysicsComponent.prototype.deaccelerate = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    entity.physics.xVel -= entity.physics.acceleration * Math.cos(body.angle);
    entity.physics.yVel -= entity.physics.acceleration * Math.sin(body.angle);
}

PhysicsComponent.prototype.turnLeft = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.angle -= entity.physics.turnRate;
    entity.rotation -= entity.physics.turnRate;
}

PhysicsComponent.prototype.turnRight = function (message) {
    var entity = this.getEntityById(message.entityId);
    var body = this.bodies[entity.id];
    body.angle += entity.physics.turnRate;
    entity.rotation += entity.physics.turnRate;
}

PhysicsComponent.prototype.onCollision = function (e) {
    var bodyA = e.bodyA;
    var bodyB = e.bodyB;

    if (typeof e.bodyA.entityId != 'undefined' && typeof e.bodyB.entityId != 'undefined') {
        var a = this.getEntityById(bodyA.entityId);
        var b = this.getEntityById(bodyB.entityId);

        if (a.hasComponent("health") && !a.componentPropertyContains("health", "damageExceptions", b.entityTypeName)) {
            a.health.currentHitPoints -= b.physics.collisionDamage;
            this.messageHub.sendMessage({ type: "damageTaken", entityId: a.id, fromEntityId: b.id });
        }

        if (b.hasComponent("health") && !b.componentPropertyContains("health", "damageExceptions", a.entityTypeName)) {
            b.health.currentHitPoints -= a.physics.collisionDamage;
            this.messageHub.sendMessage({ type: "damageTaken", entityId: b.id, fromEntityId: a.id });
        }
    }

    if (typeof e.bodyA.entityId != 'undefined')
        this.messageHub.sendMessage({ type: "collision", entityId: bodyA.entityId });

    if (typeof e.bodyB.entityId != 'undefined')
        this.messageHub.sendMessage({ type: "collision", entityId: bodyB.entityId });
}

PhysicsComponent.prototype.createDefaultEntityData = function () {
    // Default values
    var physics = {
        xVel: 0,
        yVel: 0,
        acceleration: 0.0,
        turnRate: 0.0,
        turnVel: 0,
        radius: 20,
        mass: 1,
        collisionDamage: 0,
        fixedRotation: false
    };

    return physics;
}


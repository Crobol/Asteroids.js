"use strict";

var CollisionComponent = function (messageHub, worldDimensions) {
    CollisionComponent.shortName = "collision";
    this.shortName = CollisionComponent.shortName;

    if (debug)
        console.log("Creating component: " + this.shortName);

    this.messageHub = messageHub;

    this.quadtree = new QuadTree({x: 0, y: 0, width: worldDimensions.x, height: worldDimensions.y});

    this.registerCallbacks(this.messageHub);
    this.now = new Date();
}

// Prototype methods

CollisionComponent.prototype = new Component();

CollisionComponent.prototype.registerCallbacks = function (messageHub) {
    var me = this;
}

CollisionComponent.prototype.update = function (now) {
    this.now = now;

    this.quadtree.clear();

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        this.quadtree.insert({ x: entity.position.x, y: entity.position.y,
                               width: entity.collision.radius, height: entity.collision.radius, index: i }); // this.entities[i]);
    }

    var leaves = this.quadtree.retrieveLeaves();
    var collisions = 0;

    for (var i = 0; i < leaves.length; i++) {
        var leaf = leaves[i];

        var childLen = leaf.children.length;
        var childLen2 = Math.ceil(leaf.children.length - leaf.children.length / 2);

        for (var k = 0; k < childLen; k++) {
            var a = this.entities[leaf.children[k].index];
            
            for (var j = 0; j < childLen2; j++) {
                var b = this.entities[leaf.children[j].index];
                if (a.id != b.id) {
                    this.resolveCollisions(a, b);
                    collisions += 1;
                }
            }
            
            //var collidies = this.quadtree.retrieve({x: a.position.x, y: a.position.y,
                               //width: a.collision.radius, height: a.collision.radius});

            //for (var j = 0; j < collidies.length; j++) {
            //    if (leaf.children[k].index != collidies[j].index) {
            //        var b = this.entities[collidies[j].index];
            //        this.resolveCollisions(a, b);
            //    }
            //}
        }
    }

    //console.log(collisions);

    /*for (var i = 0; i < this.entities.length; i++) {
        for (var j = 0; j < this.entities.length; j++) {
            if (i != j) {
               this.resolveCollisions(this.entities[i], this.entities[j]);
               collisions += 1;
            }
        }
    }*/



    //for (var i = 0; i < this.entities.length; i++) {
    //    var a = this.entities[i];
    //    var collidies = this.quadtree.retrieve({x: a.position.x, y: a.position.y,
    //                           width: a.collision.radius, height: a.collision.radius});

    //    for (var j = 0; j < collidies.length; j++) {
    //        if (i != collidies[j].index) {
    //            var b = this.entities[collidies[j].index];
    //            this.resolveCollisions(a, b);
    //        }
    //    }

                //for (var j = 0; j < this.entities.length; j++) {
        //    if (i != j) {
        //        this.resolveCollisions(this.entities[i], this.entities[j]);
        //    }
        //}
    //}
}

CollisionComponent.prototype.resolveCollisions = function (a, b) {
    if ("owner" in a && a.owner == b.id)
        return;

    if ("owner" in b && b.owner == a.id)
        return;
    
    if (a.componentPropertyContains(this.shortName, "collisionExceptions", b.entityTypeName))
        return;

    if (b.componentPropertyContains(this.shortName, "collisionExceptions", a.entityTypeName))
        return;

    if (CollisionComponent.checkCollision(a, b)) {
        this.collisionResponse(a, b);
        this.messageHub.sendMessage({ type: "collision", entityId: a.id, collidingEntity: b });
        this.messageHub.sendMessage({ type: "collision", entityId: b.id, collidingEntity: a });
    }

}

CollisionComponent.checkCollision = function (a, b) {
    var dv = { 
        x: a.movement.xVel - b.movement.xVel, 
        y: a.movement.yVel - b.movement.yVel 
    };

    var dp = {
        x: a.position.x - b.position.x,
        y: a.position.y - b.position.y
    }

    var r = a.collision.radius + b.collision.radius;
    var pp = dp.x * dp.x + dp.y * dp.y - r*r;
    if (pp < 0)
        return true;

    var pv = dp.x * dv.x + dp.y * dv.y;
    if (pv >= 0) 
        return false;

    var vv = dv.x * dv.x + dv.y * dv.y;
    if ((pv + vv) <= 0 && (vv + 2 * pv + pp) >= 0) 
        return false;

    //Discriminant/4
    var d = pv * pv - pp * vv; 
    return d > 0;
}

CollisionComponent.prototype.collisionResponse = function (a, b) {
    var d = { 
        x: b.position.x - a.position.x,
        y: b.position.y - a.position.y
    };

    var distanceSquared = d.x*d.x + d.y*d.y;

    var radius = a.collision.radius + b.collision.radius;
    //var radiusSquared = radius*radius;

    //if(distanceSquared > radiusSquared) 
    //  return;

    var distance = Math.abs(Math.sqrt(distanceSquared));

    var ncoll = { x: d.x / distance, y: d.y / distance };
    var peneteration = radius - Math.abs(Math.sqrt(d.x*d.x + d.y*d.y));

    var mass1 = 1 / a.collision.mass;
    var mass2 = 1 / b.collision.mass;

    var s = peneteration / (mass1 + mass2);
    var separation = {
        x: ncoll.x * s,
        y: ncoll.y * s
    };

    var newPosition1 = {
        x: a.position.x - separation.x * mass1,
        y: a.position.y - separation.y * mass1
    };

    var newPosition2 = {
        x: b.position.x + separation.x * mass2,
        y: b.position.y + separation.y * mass2
    };

    a.position.x = newPosition1.x;
    a.position.y = newPosition1.y;

    b.position.x = newPosition2.x;
    b.position.y = newPosition2.y;


    var vcoll = {
        x: b.movement.xVel - a.movement.xVel,
        y: b.movement.yVel - a.movement.yVel
    };

    var vn = vcoll.x*ncoll.x + vcoll.y*ncoll.y;

    if (vn > 0)
        return;

    // coefficient of restitution in range [0, 1].
    var cor = 0.1; // air hockey -> high cor

    var j = -(1 + cor) * vn / (mass1 + mass2);
    var impulse = {
        x: j * ncoll.x,
        y: j * ncoll.y
    };

    a.movement.xVel -= impulse.x * mass1;
    a.movement.yVel -= impulse.y * mass1;

    b.movement.xVel += impulse.x * mass2;
    b.movement.yVel += impulse.y * mass2;

    /*if (a.hasComponent("health") && ) {
        this.messageHub.sendMessage({ type: "collision", entityId: a.id, collidingEntity: b }); // TODO: Move this to HealthComponent as reponse to takeDamage message
    }

    if (b.hasComponent("health") && !b.componentPropertyContains("health", "damageExceptions", a.entityTypeName)) {
        this.messageHub.sendMessage({ type: "collision", entityId: b.id, collidingEntity: a });
    }*/
}   

CollisionComponent.prototype.createComponentEntityData = function () {
    var collision = {
        radius: 20,
        mass: 1,
        collisionDamage: 0
    };

    return collision;
}


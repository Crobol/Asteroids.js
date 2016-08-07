"use strict";

var collisionGroup = {
    Player: Math.pow(2, 1),
    Projectile: Math.pow(2, 2),
    EnemyProjectile: Math.pow(2, 3),
    Asteroid: Math.pow(2, 4),
    World: Math.pow(2, 5)
}

var models = [
    {
        name: "particle",
        points: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }]
    },
    {
        name: "player",
        points: [
            { x: 15, y: 0 },
            { x: -15, y: 15 },
            { x: -15, y: -15 }
        ],
        color: 0x00ff00
    },
    {
        name: "star",
        points: [
            { x: 0, y: 20 },
            { x: 5, y: 5 },
            { x: 20, y: 0 },
            { x: 5, y: -5 },
            { x: 0, y: -20 },
            { x: -5, y: -5 },
            { x: -20, y: 0 },
            { x: -5, y: 5 },
        ],
        color: primaryColors[colorIndex.red]
    },
    {
        name: "projectile",
        points: [
            { x: 2, y: 0 },
            { x: -2, y: 2 },
            { x: -2, y: -2 }
        ],
        color: primaryColors[colorIndex.red]
    },
    {
        name: "flakProjectile",
        points: [
            { x: -4, y: 1 },
            { x: 4, y: 1 },
            { x: 4, y: -1 },
            { x: -4, y: -1 }
        ],
        color: 0x00ff00
    },
    {
        name: "laser",
        points: [
            { x: -2, y: 2 },
            { x: 2, y: 2 },
            { x: 2, y: -2 },
            { x: -2, y: -2 }
        ],
        color: 0x00ff00
    }
];

var playerTemplate = {
    entityTypeName: "player",
    components: ["input", "attack", "physics", "health", "graphics", "hud"],
    position: new Vector(0, 0),
    graphics: {
        model: "player",
        followWithCamera: true,
        particleEmitterTemplates: [{
            triggerMessageType: "damageTaken",
            model: "particle",
            rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
            initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
            behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
            position: new Vector(0, 0)
        }]
    },
    attack: {
        weaponSlots: [
            {
                name: "Slot 1",
                weapon: new Multiple({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.04
                }),//0.1, 800, 0.04),
                position: new Vector(10, 0),
                rotation: 0,
                isActive: true
            },
            /*{
                name: "Slot 1",
                weapon: new Rapid({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.04
                }),//0.1, 800, 0.04),
                position: new Vector(-15, 15),
                rotation: 0,
                isActive: true
            },
            {
                name: "Slot 2",
                weapon: new Rapid({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.04,
                    delay: 50
                }),//0.1, 800, 0.04),
                position: new Vector(-15, -15),
                rotation: 0,
                isActive: true
            }*/
        ]
    },
    health: {
        hitPoints: 100
    },
    physics: {
        turnRate: 0.1,
        acceleration: 10,
        collisionGroup: collisionGroup.Player,
        collisionMask: collisionGroup.Asteroid | collisionGroup.World | collisionGroup.EnemyProjectile,
        fixedRotation: true
    }
};

var spinningEnemyTemplate = {
    entityTypeName: "Spinner",
    components: ["attack", "physics", "ai", "health", "graphics"],
    graphics: {
        model: "star",
        particleEmitterTemplates: [{
                triggerMessageType: "entityKilled",
                model: {
                    points: [{ x: -4, y: -1 }, { x: 4, y: -1 }, { x: 4, y: 1 }, { x: -4, y: 1 }]
                },
                rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
                initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
                behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
                position: new Vector(0, 0)
            },
            {
                triggerMessageType: "damageTaken",
                model: "particle",
                rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
                initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
                behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
                position: new Vector(0, 0)
            }
        ]
    },
    physics: {
        mass: 1,
        radius: 20,
        collisionDamage: 1,
        collisionGroup: collisionGroup.Asteroid,
        collisionMask: collisionGroup.Player | collisionGroup.Asteroid | collisionGroup.World | collisionGroup.Projectile
    },
    health: {
        hitPoints: 200,
        damageExceptions: ['asteroid']
    },
    attack: {
        weaponSlots: [
            {
                name: "Slot 1",
                weapon: new Single({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.0,
                    collisionGroup: collisionGroup.EnemyProjectile,
                    collisionMask: collisionGroup.Player | collisionGroup.World | collisionGroup.Asteroid
                }),
                position: new Vector(20, 0),
                rotation: 0,
                isActive: true
            },
            {
                name: "Slot 2",
                weapon: new Single({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.0,
                    delay: 1000,
                    collisionGroup: collisionGroup.EnemyProjectile,
                    collisionMask: collisionGroup.Player | collisionGroup.World | collisionGroup.Asteroid
                }),
                position: new Vector(0, 20),
                rotation: Math.PI / 2,
                isActive: true
            },
            {
                name: "Slot 3",
                weapon: new Single({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.0,
                    collisionGroup: collisionGroup.EnemyProjectile,
                    collisionMask: collisionGroup.Player | collisionGroup.World | collisionGroup.Asteroid
                }),
                position: new Vector(-20, 0),
                rotation: Math.PI,
                isActive: true
            },
            {
                name: "Slot 4",
                weapon: new Single({
                    fireRate: 0.1,
                    projectileVelocity: 800,
                    spread: 0.0,
                    delay: 1000,
                    collisionGroup: collisionGroup.EnemyProjectile,
                    collisionMask: collisionGroup.Player | collisionGroup.World | collisionGroup.Asteroid
                }),
                position: new Vector(0, -20),
                rotation: Math.PI * 1.5,
                isActive: true
            }
        ]
    }
};

var asteroidTemplate = {
    entityTypeName: "asteroid",
    components: ["physics", "health", "graphics", "destructable"],
    physics: {
        mass: 20,
        radius: 17,
        collisionDamage: 1,
        collisionGroup: collisionGroup.Asteroid,
        collisionMask: collisionGroup.Player | collisionGroup.Asteroid | collisionGroup.Projectile | collisionGroup.World | collisionGroup.EnemyProjectile
    },
    health: {
        hitPoints: 20,
        damageExceptions: ['asteroid', 'player']
    },
    destructable: {
        scale: 0.6
    },
    graphics: {
         particleEmitterTemplates: [{
                triggerMessageType: "entityKilled",
                model: {
                    points: [{ x: -4, y: -1 }, { x: 4, y: -1 }, { x: 4, y: 1 }, { x: -4, y: 1 }]
                },
                rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
                initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
                behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
                position: new Vector(0, 0)
            },
            {
                triggerMessageType: "damageTaken",
                model: "particle",
                rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
                initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
                behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
                position: new Vector(0, 0)
            }
        ]
    }
};

var projectileTemplate = {
    entityTypeName: "projectile",
    components: ["lifetime", "physics", "graphics"],
    physics: {
        radius: 2,
        mass: 2,
        collisionDamage: 10,
        collisionGroup: collisionGroup.Projectile,
        collisionMask: collisionGroup.Asteroid | collisionGroup.World
    },
    lifetime: {
        dieOnCollision: true,
        lifetime: 10*1000
    },
    graphics: {
        model: "projectile",
        particleEmitterTemplates: [{
                rate: new Proton.Rate(new Proton.Span(0.5, 1), new Proton.Span(0.01)),
                model: "particle",
                initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(0.3), new Proton.Span(0, 360), 'polar')],
                behaviours: [new Proton.Alpha(1, 0)],
                position: new Vector(0, 0)
            }
        ]
    }
};

var flakProjectileTemplate = {
    entityTypeName: "flakProjectile",
    components: ["lifetime", "physics", "graphics"],
    physics: {
        radius: 2,
        mass: 0.5,
        collisionDamage: 4,
        collisionGroup: collisionGroup.Projectile,
        collisionMask: collisionGroup.Asteroid | collisionGroup.World
    },
    lifetime: {
        dieOnCollision: true,
        lifetime: 10*1000
    },
    graphics: {
        model: "flakProjectile"
    }
};

//var laserTemplate = {
    //entityTypeName: "laser",
    //components: ["lifetime", "graphics"],
    //lifetime: {
        //lifetime: 100,
        //dieOnCollision: false
    //},
    //graphics: {
        //particleEmitterTemplates: [{
                //onCreate: function (emitter, entity) {
                    //var x1 = 20 * Math.cos(entity.rotation);
                    //var y1 = 20 * Math.sin(entity.rotation);
                    //var x2 = 500 * Math.cos(entity.rotation);
                    //var y2 = 500 * Math.sin(entity.rotation);

                    //emitter.addInitialize(new Proton.P(new Proton.LineZone(x1, y1, x2, y2)));
                //},
                //rate: new Proton.Rate(new Proton.Span(20, 30), new Proton.Span(0, 0)),
                //model: "laser",
                //initialize: [new Proton.Life(0.3), new Proton.V(new Proton.Span(0.1, 0.2), new Proton.Span(0, 360), 'polar'), new Proton.Mass(1)],
                //behaviours: [new Proton.Alpha(1, 0)],
                //position: new Vector(0, 0)
            //}
        //],
        //onRegister: function (entity) {
        //}
    //}
//}

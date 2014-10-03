"use strict";

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
        name: "projectile",
        points: [
            { x: 2, y: 0 },
            { x: -2, y: 2 },
            { x: -2, y: -2 }
        ],
        color: 0x00ff00
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
    components: ["input", "attack", "movement", "friction", "collision", "health", "wrapAround", "graphics", "hud"],
    position: new Vector(0, 0),
    graphics: {
        model: "player",
        particleEmitterTemplates: [{
            triggerMessageType: "damageTaken",
            model: "particle",
            rate: new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0.01)),
            initialize: [new Proton.Life(1), new Proton.V(new Proton.Span(1), new Proton.Span(0, 360), 'polar'), new Proton.Position(new Proton.CircleZone(0, 0, 17))],
            behaviours: [new Proton.Alpha(1, 0), new Proton.Rotate()],
            position: new Vector(0, 0)
        }]
    },
    movement: {
        turnRate: 0.1,
        acceleration: 0.3
    },
    attack: {
        fireRate: 0.4,
        flak: false
    },
    health: {
        hitPoints: 100
    }
};

var asteroidTemplate = {
    entityTypeName: "asteroid",
    components: ["movement", "collision", "health", "wrapAround", "graphics", "destructable"],
    collision: {
        mass: 20,
        radius: 17,
        collisionDamage: 10
    },
    health: {
        hitPoints: 20,
        damageExceptions: ['asteroid', 'player']
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
    components: ["lifetime", "movement", "collision", "graphics"],
    collision: {
        radius: 2,
        mass: 2,
        collisionDamage: 10,
        collisionExceptions: ['projectile']
    },
    lifetime: {
        dieOnCollision: true
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
}

var flakProjectileTemplate = {
    entityTypeName: "flakProjectile",
    components: ["lifetime", "movement", "collision", "graphics"],
    collision: {
        radius: 2,
        mass: 0.5,
        collisionDamage: 4,
        collisionExceptions: ['flakProjectile']
    },
    lifetime: {
        dieOnCollision: true
    },
    graphics: {
        model: "flakProjectile"
    }
}

var laserTemplate = {
    entityTypeName: "laser",
    components: ["lifetime", "graphics"],
    lifetime: {
        lifetime: 100,
        dieOnCollision: false
    },
    graphics: {
        particleEmitterTemplates: [{
                onCreate: function (emitter, entity) {
                    var x1 = 20 * Math.cos(entity.rotation);
                    var y1 = 20 * Math.sin(entity.rotation);
                    var x2 = 500 * Math.cos(entity.rotation);
                    var y2 = 500 * Math.sin(entity.rotation);

                    emitter.addInitialize(new Proton.P(new Proton.LineZone(x1, y1, x2, y2)));
                },
                rate: new Proton.Rate(new Proton.Span(20, 30), new Proton.Span(0, 0)),
                model: "laser",
                initialize: [new Proton.Life(0.3), new Proton.V(new Proton.Span(0.1, 0.2), new Proton.Span(0, 360), 'polar'), new Proton.Mass(1)],
                behaviours: [new Proton.Alpha(1, 0)],
                position: new Vector(0, 0)
            }
        ],
        onRegister: function (entity) {
            
        }
    }
}

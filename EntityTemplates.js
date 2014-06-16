"use strict";

var playerTemplate = {
    entityTypeName: "player",
    components: ["input", "attack", "movement", "friction", "collision", "wrapAround", "graphics"],
    position: new Vector(0, 0),
    graphics: {
        model: [
        { x: 15, y: 0 },
        { x: -15, y: 15 },
        { x: -15, y: -15 }
        ]
    },
    movement: {
        turnRate: 0.1,
        acceleration: 0.3
    },
    attack: {
        fireRate: 0.4
    }
};

var asteroidTemplate = {
    entityTypeName: "asteroid",
    components: ["movement", "collision", "health", "wrapAround", "graphics"],
    collision: {
        mass: 20,
        radius: 17
    },
    health: {
        hitPoints: 20
    }
};


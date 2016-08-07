"use strict";

var debug = true;

var primaryColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ff00, 0x00ffff, 0xffffff];
var colorIndex = {
    red: 0
}

function generateId() {	
    if ( typeof generateId.counter == 'undefined' ) {
        generateId.counter = 0;
    }

    return ++generateId.counter;
}

var Vector = function(x, y) {
    if (typeof x != "undefined") {
        this.x = x;
    }
    else {
        this.x = 0;
    }
    if (typeof y != "undefined") {
        this.y = y;
    }
    else {
        this.y = 0;
    }
}

function extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                if (source[prop].constructor === Object) {
                    if (!obj[prop] || obj[prop].constructor === Object) {
                        obj[prop] = obj[prop] || {};
                        extend(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                } else {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
}

function createRandomModelPoints() {
    var modelPoints = [];
    var edges = 3 + Math.round(Math.random() * 5);
    var unit = 2 * Math.PI / edges;

    for (var j = 0; j < edges; j++) {
        modelPoints.push({x: 20 * Math.cos(unit * j), y: 20 * Math.sin(unit * j)});
    }

    return modelPoints;
}

function createRandomAsteroid(entityManager, worldDimensions) {
    var modelPoints = createRandomModelPoints();
    var velocity = 500;
    var angularVelocity = 5;

    var overrides = { 
        position: new Vector(Math.random() * worldDimensions.x, Math.random() * worldDimensions.y), 
        graphics: {
            model: {
                color:  primaryColors[Math.floor(Math.random() * primaryColors.length)],
                'points': modelPoints
            }
        },
        physics: {
            xVel: Math.random() * velocity - velocity / 2,
            yVel: Math.random() * velocity - velocity / 2,
            turnVel: Math.random() * angularVelocity - angularVelocity / 2
        }
    };

    var asteroid = entityManager.entityFactory.createEntityFromTemplate("asteroid", overrides);
    return asteroid;
}

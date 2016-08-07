"use strict";

if (debug)
    console.log("Starting asteroids...");

var kills = 0;

var worldDimensions = new Vector(2400, 1600);
var viewportDimensions = new Vector(window.innerWidth * 0.9, window.innerHeight * 0.9);

if (debug) {
    console.log("Setting world dimensions to " + worldDimensions.x + "x" + worldDimensions.y);
    console.log("Setting viewport dimensions to " + viewportDimensions.x + "x" + viewportDimensions.y);
}

var messageHub = new MessageHub();
var componentManager = new ComponentManager();

messageHub.registerCallback('entityKilled', function (message) {
    if (debug)
        console.log(message.entityTypeName + " killed");

    if (message.entityTypeName == 'asteroid') {
        kills = kills + 1;
        document.getElementById('kills').innerHTML = kills;
    }
    else if (message.entityTypeName == 'player') {
        console.log('Game over, man, game over.');
    }
});

if (debug)
    console.log("Creating components...");

var graphicsComponent = new GraphicsComponent(messageHub, viewportDimensions, worldDimensions);
var inputComponent = new InputComponent(messageHub);
var physicsComponent = new PhysicsComponent(messageHub, worldDimensions);
var healthComponent = new HealthComponent(messageHub);
var attackComponent = new AttackComponent(messageHub);
var lifetimeComponent = new LifetimeComponent(messageHub);
var destructableComponent = new DestructableComponent(messageHub);
var frictionComponent = new FrictionComponent(messageHub);
var hudComponent = new HudComponent(messageHub);
var aiComponent = new AiComponent(messageHub);

componentManager.addComponent(inputComponent);
componentManager.addComponent(attackComponent);
componentManager.addComponent(frictionComponent);
componentManager.addComponent(physicsComponent);
componentManager.addComponent(healthComponent);
componentManager.addComponent(graphicsComponent);
componentManager.addComponent(destructableComponent);
componentManager.addComponent(lifetimeComponent);
componentManager.addComponent(hudComponent);
componentManager.addComponent(aiComponent);

for (var i = 0; i < models.length; i++) {
    graphicsComponent.addModel(models[i]);
}

var entityFactory = new EntityFactory(componentManager.components);

entityFactory.addEntityTemplate("player", playerTemplate);
entityFactory.addEntityTemplate("asteroid", asteroidTemplate);
entityFactory.addEntityTemplate("projectile", projectileTemplate);
entityFactory.addEntityTemplate("flakProjectile", flakProjectileTemplate);
entityFactory.addEntityTemplate("spinningEnemy", spinningEnemyTemplate);

var entityManager = new EntityManager(messageHub, componentManager, entityFactory);

var player = entityManager.entityFactory.createEntityFromTemplate("player");
player.position.x = worldDimensions.x / 2;
player.position.y = worldDimensions.y / 2;
entityManager.addEntity(player);

for (var i = 0; i < 10; i++) {
    var asteroid = createRandomAsteroid(entityManager, worldDimensions);
    entityManager.addEntity(asteroid); 
}

var overrides = {
    physics: {
        turnVel: Math.random() * 10 - 10 / 2
    }
};
var enemy = entityManager.entityFactory.createEntityFromTemplate("spinningEnemy", overrides);
enemy.position.x = worldDimensions.x / 2 - 200;
enemy.position.y = worldDimensions.y / 2 + 200;
enemy.physics.xVel = Math.random() * 100 - 100 / 2;
enemy.physics.yVel = Math.random() * 100 - 100 / 2;
entityManager.addEntity(enemy);

requestAnimationFrame(function () { entityManager.update(); });

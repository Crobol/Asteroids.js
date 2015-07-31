"use strict";

var EntityFactory = function (availableComponents) {
    this.components = availableComponents;
    this.entityTemplates = {};
}

EntityFactory.prototype = {
    addEntityTemplate: function (name, template) {
        if (name in this.entityTemplates) {
            throw "Entity with name " + name + " already exists";
        }

        this.entityTemplates[name] = template;

        if (debug)
            console.log("Added entity template: " + name);
    },
    createBareEntity: function (components) {
        var entity = new Entity();

        var componentsToRegister = [];
        for (var i = 0; i < this.components.length; i++) {
            if (components.indexOf(this.components[i].shortName) != -1) {
                componentsToRegister.push(this.components[i]);
            }
        }

        for (var i = 0; i < componentsToRegister.length; i++) {
            var component = componentsToRegister[i];
            component.registerEntity(entity);
		    }

		    return entity;
    },
    createEntityFromTemplate: function (templateName, overrides) {
        var template = this.entityTemplates[templateName];
        if (template == null)
            throw "No template with name " + templateName + " is registered";

        if (debug)
            console.log("Creating " + template.entityTypeName);

        var entity = new Entity();

        entity.entityTypeName = template.entityTypeName;

        if (typeof template.rotation != 'undefined' && template.rotation != null) {
            entity.rotation = template.rotation;
        }

        if (typeof template.position != 'undefined' && template.position != null) {
            entity.position = template.position;
        }

        if (overrides != null) {
            if (typeof overrides.position != 'undefined') {
                entity.position = overrides.position;
            }
             if (typeof overrides.rotation != 'undefined') {
                entity.rotation = overrides.rotation;
            }
        }

        for (var i = 0; i < template.components.length; i++) {
            var componentName = template.components[i];
            var componentData = {};
            var componentDataFromTemplate = template[componentName];
            var componentIndex = -1;

            // Find component with corresponding short name in available components
            for (var j = 0; j < this.components.length; j++) {
                if (this.components[j].shortName == componentName) {
                    componentIndex = j;
                    break;
                }
            }

            // Check if component was found and create default data
            if (componentIndex != -1) {
                componentData = this.components[componentIndex].createDefaultEntityData();
            }

            // Override default values with template specific values
            if (componentDataFromTemplate != null) {
                for (var dataKey in componentDataFromTemplate) {
                    componentData[dataKey] = componentDataFromTemplate[dataKey];
                }
            }

            // Override default and template values with override values
            if (overrides != null) {
                for (var overrideKey in overrides[componentName]) {
                    componentData[overrideKey] = overrides[componentName][overrideKey];
                }
            }

            // Register entity
            if (componentIndex != -1) {
                entity.registerComponent(componentName);
                entity.setComponentData(componentName, componentData);
                this.components[componentIndex].registerEntity(entity);
            }
        }

        return entity;
    }
}

"use strict";

var ComponentManager = function () {
	  this.components = [];
	  this.messageHub = new MessageHub();

	  var me = this;
}

ComponentManager.prototype = {
	  addComponent: function (component) {
		    this.components.push(component);
	  },
	  update: function () {
		    var date = new Date();
		    for (var i = 0; i < this.components.length; i++) {
			      var component = this.components[i];
			      component.update(date);
		    }
	  },
	  deleteEntity: function (entity) {
		    for (var i = 0; i < this.components.length; i++) {
            this.components[i].unregisterEntity(entity);
		    }
	  }
}

var _wrapped = Meteor.Collection;

Meteor.Collection = function () {
  _wrapped.apply(this, arguments);

  var collection = this;

  collection.beforeInsert(function (fields) {
    Meteor.Collection.timestamps(fields);
  });

  collection.beforeUpdate(function (sel, mod) {
    var set = Meteor._ensure(mod, '$set');
    Meteor.Collection.touch(set);
  });

  return this;
};

//XXX should be a better way
Meteor.Collection.prototype = _wrapped.prototype;
_.extend(Meteor.Collection, _wrapped);

Meteor.Collection.touch = function (doc) {
  return _.extend(doc, {
    updated_at: new Date
  });
};

Meteor.Collection.timestamps = function (doc) {
  return _.extend(doc, {
    created_at: new Date
  }, Meteor.Collection.touch(doc));
};

Meteor.Collection.idString = function (id) {
  return id.toHexString ? id.toHexString() : id;
};

Meteor.Collection.ensure = function (fields, prop, value) {
  if (_.isUndefined(fields[prop])) {
    fields[prop] = value;
  }

  return fields;
};

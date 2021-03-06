var capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
};

Tinytest.add('Collection Hooks', function (test) { 

  //XXX on client
  //  - insert/update/remove invokes callbacks
  //  - callbacks not invoked if inserted directly into the collection
  //
  //XXX on server
  //  - insert/update/remove invokes callbacks
  //  - callbacks ALSO invoked if you insert directly into the collection


  if (Meteor.isClient) {
    if (!ClientItems)
      ClientItems = new Meteor.Collection('client_items', {connection: null});

    ClientItems.remove({});

    var hookCalls = {
      total: 0
    };

    _.each(['insert', 'update', 'remove'], function (method) {
      var beforeHook = 'before' + capitalize(method);
      var afterHook = 'after' + capitalize(method);

      hookCalls[beforeHook] = 0;
      hookCalls[afterHook] = 0;

      ClientItems[beforeHook](function () {
        hookCalls[beforeHook]++;
        hookCalls.total++;
      });

      ClientItems[afterHook](function () {
        hookCalls[afterHook]++;
        hookCalls.total++;
      });
    });

    var id = ClientItems._collection.insert({title: '1'});
    test.equal(hookCalls.total, 0, 'Hooks should not be called for LocalCollection.prototype.insert');

    ClientItems._collection.update({_id: id}, {$set: {title: 'updated'}});
    test.equal(hookCalls.total, 0, 'Hooks should not be called for LocalCollection.prototype.update');

    ClientItems._collection.remove({_id: id});
    test.equal(hookCalls.total, 0, 'Hooks should not be called for LocalCollection.prototype.remove');

    var id = ClientItems.insert({title: '2'});
    test.equal(hookCalls.total, 2, 'Hooks should be called for Collection.prototype.insert');
    test.equal(hookCalls.beforeInsert, 1);
    test.equal(hookCalls.afterInsert, 1);

    ClientItems.update({_id: id}, {$set: {title: 'updated'}});
    test.equal(hookCalls.total, 4, 'Hooks should be called for Collection.prototype.update');
    test.equal(hookCalls.beforeUpdate, 1);
    test.equal(hookCalls.afterUpdate, 1);

    ClientItems.remove({_id: id});
    test.equal(hookCalls.total, 6, 'Hooks should be called for Collection.prototype.remove');
    test.equal(hookCalls.beforeRemove, 1);
    test.equal(hookCalls.afterRemove, 1);

    // Test pauseHooks and resumeHooks()
    var total = hookCalls.total;
    Meteor.Collection.pauseHooks();
    ClientItems.insert({title: 'paused'});
    test.equal(hookCalls.total, total, 'hook should not have run because we are paused');
    var item = ClientItems.findOne({title: 'paused'});
    test.isTrue(item, 'item was not inserted while hooks paused');

    var total = hookCalls.total;
    Meteor.Collection.resumeHooks();
    ClientItems.insert({title: 'resumed'});
    // we expect two insert hooks to get called (before and after)
    // so that's why we check the previous total + 2.
    test.equal(hookCalls.total, total + 2, 'hook should be called because we resumed');
    var item = ClientItems.findOne({title: 'resumed'});
    test.isTrue(item, 'item was not inserted after resumeHooks');
  }

  if (Meteor.isServer) {
    if (!ServerItems)
      ServerItems = new Meteor.Collection('server_items');

    ServerItems.remove({});

    ServerItems.allow({
      insert: function () { return true; },
      update: function () { return true; },
      remove: function () { return true; }
    });

    var hookCalls = {
      total: 0
    };

    _.each(['insert', 'update', 'remove'], function (method) {
      var beforeHook = 'before' + capitalize(method);
      var afterHook = 'after' + capitalize(method);

      hookCalls[beforeHook] = 0;
      hookCalls[afterHook] = 0;

      ServerItems[beforeHook](function () {
        hookCalls[beforeHook]++;
        hookCalls.total++;
      });

      ServerItems[afterHook](function () {
        hookCalls[afterHook]++;
        hookCalls.total++;
      });
    });

    var id = ServerItems._collection.insert({title: '1'});
    test.equal(hookCalls.total, 2, 'Hooks should be called for Mongo insert');
    test.equal(hookCalls.beforeInsert, 1);
    test.equal(hookCalls.afterInsert, 1);

    ServerItems._collection.update({_id: id}, {$set: {title: 'updated'}});
    test.equal(hookCalls.total, 4, 'Hooks should be called for Mongo update');
    test.equal(hookCalls.beforeUpdate, 1);
    test.equal(hookCalls.afterUpdate, 1);

    ServerItems._collection.remove({_id: id});
    test.equal(hookCalls.total, 6, 'Hooks should be called for Mongo remove');
    test.equal(hookCalls.beforeRemove, 1);
    test.equal(hookCalls.afterRemove, 1);

    // Test pauseHooks and resumeHooks()
    var total = hookCalls.total;
    Meteor.Collection.pauseHooks();
    ServerItems.insert({title: 'paused'});
    test.equal(hookCalls.total, total, 'hook should not have run because we are paused');
    var item = ServerItems.findOne({title: 'paused'});
    test.isTrue(item, 'item was not inserted while hooks paused');

    var total = hookCalls.total;
    Meteor.Collection.resumeHooks();
    ServerItems.insert({title: 'resumed'});
    // we expect two insert hooks to get called (before and after)
    // so that's why we check the previous total + 2.
    test.equal(hookCalls.total, total + 2, 'hook should be called because we resumed');
    var item = ServerItems.findOne({title: 'resumed'});
    test.isTrue(item, 'item was not inserted after resumeHooks');
  }
});

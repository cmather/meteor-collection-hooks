# Collection Hooks

Provides before and after hooks for collections on the client and the server.

This is just for examle. It's the same code used in EventedMind, but I've
decided not to publish it as a package.

## Usage

```javascript
Items = new Meteor.Collection('items');

Items.beforeInsert(function (doc) {
  // runs on client and server
});

Items.afterInsert(function (doc) {
  // runs on client and server
});

Items.beforeUpdate(function (selector, mutator) {
  // runs on client and server
});

Items.afterUpdate(function (selector, mutator) {
  // runs on client and server
});

Items.beforeRemove(function (selector) {
  // runs on client and server
});

Items.afterRemove(function (selector) {
  // runs on client and server
});
```

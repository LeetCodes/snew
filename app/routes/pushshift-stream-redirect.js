import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    return this.transitionTo('pushshiftStream', '@event=t3');
  }
});
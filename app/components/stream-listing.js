import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  snoocore: Ember.inject.service(),
  url: "https://stream.pushshift.io/?event=t3&over_18=1&previous=1000",
  classNames: 'sitetable stream-listing',
  maxUpdates: 25,
  autoExpand: true,
  items: function() {return [];}.property(),

  itemSort: ['created_utc:desc'],
  listing: Ember.computed.sort('items', 'itemSort'),

  eventStream: function() {
    var source = new EventSource(this.get('url'));
    function handle(evt) {
      var data = JSON.parse(evt.data);
      if (data.body_html) {
        data.body_html = $('<textarea />').html(data.body_html).text();
      }
      if (data.selftext_html) {
        data.selftext_html = $('<textarea />').html(data.selftext_html).text();
      }
      if (data.media && data.media.oembed && data.media.oembed.html) {
        data.media.oembed.html = $('<textarea />').html(data.media.oembed.html).text();
      }
      Ember.run(this, function() {
        try {
          this.trigger('didReceiveItem', data);
        } catch (e) {
          console.error(e.stack || e);
        }
      });
    }
    source.addEventListener('t1', handle.bind(this));
    source.addEventListener('t3', handle.bind(this));
    return source;
  }.property('url'),

  eventStreamWillChange: function() {
    var stream = this.get('eventStream');
    if (stream) {stream.close();}
  }.observesBefore('eventStream'),

  onReceiveItem: function(item) {
    this.get('items').pushObject(item);
    if (this.get('items.length') > this.get('maxUpdates')) {
      this.get('items').removeObject(this.get('listing.lastObject'));
    }
  }.on('didReceiveItem'),

  willDestroy: function() {
    this.eventStreamWillChange();
  },

  initStream: function() {this.get('eventStream');}.on('init')
});

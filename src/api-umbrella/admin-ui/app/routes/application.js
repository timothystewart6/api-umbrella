import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  busy: Ember.inject.service('busy'),

  // By default, ember-simple-auth sets the "session.attemptedTransition" value
  // to track where to redirect unauthenticated users to after logging in.
  // However, since we're using a server-side login page, this variable
  // disappears after the server-side login redirect. So instead, we'll store
  // just the string value of the attempted transition and persist it in the
  // session store so it's available after the server-side login.
  attemptedTransitionChange: Ember.observer('session.attemptedTransition', function() {
    const attemptedTransition = this.get('session.attemptedTransition');
    if(attemptedTransition) {
      this.get('session').set('data.attemptedTransitionUrl', attemptedTransition.intent.url);
    } else {
      this.get('session').set('data.attemptedTransitionUrl', null);
    }
  }),

  // After successfully logging in, then redirect to the URL the user was
  // originally trying to access. Since we're using a server-side login page,
  // we need to do this a little differently than ember-simple-auth's default
  // mechanism. We need to use the "attempedTransitionUrl" string value we
  // persist in the session store.
  sessionAuthenticated() {
    const attemptedTransitionUrl = this.get('session.data.attemptedTransitionUrl');
    if(attemptedTransitionUrl) {
      this.transitionTo(attemptedTransitionUrl);
      this.set('session.attemptedTransition', null);
      this.get('session').set('data.attemptedTransitionUrl', null);
    } else {
      this.transitionTo(this.get('routeAfterAuthentication'));
    }
  },

  actions: {
    loading(transition) {
      let busy = this.get('busy');
      busy.show();
      transition.promise.finally(function() {
        busy.hide();
      });
    },

    error() {
      this.get('busy').hide();
    },
  },
});

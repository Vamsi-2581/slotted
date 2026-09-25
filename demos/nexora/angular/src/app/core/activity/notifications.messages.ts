import { provideNotificationCenterDefaults } from '@slotted/angular/notification-center';

/** The centre's words in the product's language, set once for every centre in the application. */
export function provideNotificationCenterMessages() {
  return provideNotificationCenterDefaults({
    messages: {
      all: 'All',
      caughtUp: "You're all caught up",
      dismiss: 'Archive',
      empty: 'No notifications',
      fresh: (count) => `${count} new notification${count === 1 ? '' : 's'}`,
      loadMore: 'Load more',
      loading: 'Loading notifications',
      markAll: 'Mark all as read',
      markRead: 'Mark as read',
      markUnread: 'Mark as unread',
      title: 'Notifications',
      unread: (count) => `${count} unread`,
      unreadView: 'Unread',
      views: 'Views',
    },
  });
}

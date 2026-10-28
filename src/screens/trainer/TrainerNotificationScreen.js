import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

const TrainerNotificationsScreen = ({navigation}) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'member',
      icon: 'person-add-outline',
      title: 'New Member Added',
      message: 'Priya has been added to your members list.',
      time: '10 min ago',
      unread: true,
    },
    {
      id: '2',
      type: 'workout',
      icon: 'barbell-outline',
      title: 'Workout Completed',
      message: 'Rahul completed his scheduled workout.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      type: 'appointment',
      icon: 'calendar-outline',
      title: 'Upcoming Session',
      message: 'Your session with Priya is scheduled for 11:30 AM.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: '4',
      type: 'progress',
      icon: 'trending-up-outline',
      title: 'Member Progress Updated',
      message: 'Rahul has updated his latest fitness measurements.',
      time: 'Yesterday',
      unread: false,
    },
    {
      id: '5',
      type: 'attendance',
      icon: 'checkmark-circle-outline',
      title: 'Attendance Updated',
      message: 'Priya marked attendance for today.',
      time: 'Yesterday',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(
    notification => notification.unread,
  ).length;

  const handleNotificationPress = id => {
    setNotifications(previousNotifications =>
      previousNotifications.map(notification =>
        notification.id === id
          ? {...notification, unread: false}
          : notification,
      ),
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(previousNotifications =>
      previousNotifications.map(notification => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const getIconColor = type => {
    if (type === 'member') {
      return '#4169D8';
    }

    if (type === 'workout') {
      return '#16A765';
    }

    if (type === 'appointment') {
      return '#E58A00';
    }

    if (type === 'progress') {
      return '#7B61FF';
    }

    return '#4169D8';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Ionicons
              name="arrow-back"
              size={23}
              color="#333333"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.subtitle}>
              Stay updated
            </Text>

            <Text style={styles.title}>
              Notifications
            </Text>
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.readButton}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}>
              <Text style={styles.readButtonText}>
                Read all
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpace} />
          )}

        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          <View style={styles.summaryCard}>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="notifications-outline"
                size={25}
                color="#4169D8"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>
                {unreadCount} Unread Notifications
              </Text>

              <Text style={styles.summaryText}>
                Stay informed about your members and sessions.
              </Text>
            </View>

          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Notifications
            </Text>
          </View>

          {notifications.length > 0 ? (
            notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread &&
                    styles.unreadCard,
                ]}
                onPress={() =>
                  handleNotificationPress(
                    notification.id,
                  )
                }
                activeOpacity={0.8}>

                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        notification.unread
                          ? '#EAF0FF'
                          : '#F1F3F5',
                    },
                  ]}>

                  <Ionicons
                    name={notification.icon}
                    size={23}
                    color={getIconColor(
                      notification.type,
                    )}
                  />

                </View>

                <View style={styles.notificationInfo}>

                  <View style={styles.titleRow}>

                    <Text
                      style={styles.notificationTitle}
                      numberOfLines={1}>
                      {notification.title}
                    </Text>

                    {notification.unread && (
                      <View
                        style={styles.unreadDot}
                      />
                    )}

                  </View>

                  <Text
                    style={styles.notificationMessage}>
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#999999"
                />

              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>

              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={32}
                  color="#4169D8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Notifications
              </Text>

              <Text style={styles.emptyText}>
                You're all caught up. New notifications
                will appear here.
              </Text>

            </View>
          )}

        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  screen: {
    flex: 1,
  },

  header: {
    minHeight: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  headerTitleContainer: {
    flex: 1,
  },

  subtitle: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 2,
  },

  title: {
    color: '#333333',
    fontSize: 22,
    fontWeight: '700',
  },

  readButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  readButtonText: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
  },

  headerSpace: {
    width: 55,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 30,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  summaryTitle: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  summaryText: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 16,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  unreadCard: {
    borderColor: '#BFCBEB',
    backgroundColor: '#FCFDFF',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  notificationTitle: {
    flex: 1,
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4169D8',
    marginLeft: 7,
  },

  notificationMessage: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 5,
  },

  notificationTime: {
    color: '#999999',
    fontSize: 10,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyText: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});

export default TrainerNotificationsScreen;
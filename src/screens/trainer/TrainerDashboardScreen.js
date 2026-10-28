import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

import DashboardHeader from '../../components/DashboardHeader';
import StatCard from '../../components/StatCard';
import AppointmentCard from '../../components/AppointmentCard';
import TrainerDrawerMenu from '../../components/TrainerDrawerMenu';

const TrainerDashboardScreen = ({navigation}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const currentTrainer = useSelector(
    state => state.auth?.user || null,
  );

  const allMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const appointments = useSelector(
    state => state.trainer?.appointments || [],
  );

  const currentTrainerId =
    currentTrainer?.trainerId ||
    currentTrainer?.id ||
    currentTrainer?.userId ||
    null;

  const members = allMembers.filter(member => {
    if (!currentTrainerId) {
      return false;
    }

    const trainerIds = Array.isArray(member?.trainerIds)
      ? member.trainerIds
      : member?.trainerId
      ? [member.trainerId]
      : [];

    return trainerIds.some(
      id => String(id) === String(currentTrainerId),
    );
  });

  const getTodayDateKey = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      today.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const todayDateKey = getTodayDateKey();

  const trainerAppointments = appointments.filter(
    appointment => {
      if (!currentTrainerId) {
        return false;
      }

      const appointmentTrainerIds =
        Array.isArray(appointment?.trainerIds)
          ? appointment.trainerIds
          : appointment?.trainerId
          ? [appointment.trainerId]
          : [];

      return appointmentTrainerIds.some(
        id =>
          String(id) ===
          String(currentTrainerId),
      );
    },
  );

  const todayAppointments =
    trainerAppointments.filter(
      appointment =>
        appointment?.dateKey === todayDateKey,
    );

  const handleAppointmentPress = appointment => {
    navigation.navigate('MemberDetails', {
      memberId: appointment.memberId,
      memberName: appointment.memberName,
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>

      <View style={styles.screen}>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>

          <View style={styles.topHeader}>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() =>
                setDrawerVisible(true)
              }
              activeOpacity={0.8}>

              <Ionicons
                name="menu-outline"
                size={26}
                color="#333333"
              />

            </TouchableOpacity>

            <View style={styles.headerContent}>

              <DashboardHeader
                name="Trainer"
                subtitle="Good Morning,"
                onNotificationPress={() =>
                  navigation.navigate(
                    'TrainerNotifications',
                  )
                }
              />

            </View>

          </View>

          <View style={styles.profileCard}>

            <View style={styles.profileCircle}>

              <Ionicons
                name="person"
                size={30}
                color="#4169D8"
              />

            </View>

            <View style={styles.profileInfo}>

              <Text style={styles.profileName}>
                Fitness Trainer
              </Text>

              <Text style={styles.profileRole}>
                Certified Personal Trainer
              </Text>

            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('Profile')
              }
              activeOpacity={0.8}>

              <Ionicons
                name="create-outline"
                size={19}
                color="#4169D8"
              />

            </TouchableOpacity>

          </View>

          <Text style={styles.sectionTitle}>
            Today's Overview
          </Text>

          <View style={styles.statsRow}>

            <TouchableOpacity
              style={styles.statTouchable}
              onPress={() =>
                navigation.navigate('Members')
              }
              activeOpacity={0.8}>

              <StatCard
                icon="people-outline"
                title="Members"
                value={String(members.length)}
              />

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statTouchable}
              onPress={() =>
                navigation.navigate('Schedule')
              }
              activeOpacity={0.8}>

              <StatCard
                icon="calendar-outline"
                title="Sessions"
                value={String(
                  todayAppointments.length,
                )}
              />

            </TouchableOpacity>

            <View style={styles.statTouchable}>

              <StatCard
                icon="star-outline"
                title="Rating"
                value="4.8"
              />

            </View>

          </View>

          <View style={styles.quickActionCard}>

            <View style={styles.quickActionIcon}>

              <Ionicons
                name="person-add-outline"
                size={25}
                color="#4169D8"
              />

            </View>

            <View style={styles.quickActionInfo}>

              <Text style={styles.quickActionTitle}>
                Add New Member
              </Text>

              <Text style={styles.quickActionSubtitle}>
                Add a registered member to
                your members list
              </Text>

            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate(
                  'AddMembers',
                )
              }
              activeOpacity={0.8}>

              <Text style={styles.addButtonText}>
                Add
              </Text>

            </TouchableOpacity>

          </View>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Today's Sessions
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Schedule')
              }
              activeOpacity={0.8}>

              <Text style={styles.viewAll}>
                View All
              </Text>

            </TouchableOpacity>

          </View>

          {todayAppointments.length === 0 ? (
            <View style={styles.emptySessionsCard}>

              <View
                style={styles.emptySessionsIcon}>

                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color="#4169D8"
                />

              </View>

              <Text
                style={styles.emptySessionsTitle}>
                No Sessions Today
              </Text>

              <Text
                style={styles.emptySessionsSubtitle}>
                No appointments have been
                scheduled for today.
              </Text>

              <TouchableOpacity
                style={styles.createSessionButton}
                onPress={() =>
                  navigation.navigate(
                    'CreateAppointment',
                  )
                }
                activeOpacity={0.8}>

                <Ionicons
                  name="add"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.createSessionButtonText
                  }>
                  Create Appointment
                </Text>

              </TouchableOpacity>

            </View>
          ) : (
            todayAppointments
              .slice(0, 3)
              .map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  name={appointment.memberName}
                  date="Today"
                  time={appointment.time}
                  type={appointment.type}
                  status={
                    appointment.status ||
                    'Upcoming'
                  }
                  onPress={() =>
                    handleAppointmentPress(
                      appointment,
                    )
                  }
                />
              ))
          )}

          {todayAppointments.length > 3 && (
            <TouchableOpacity
              style={styles.moreSessionsButton}
              onPress={() =>
                navigation.navigate('Schedule')
              }
              activeOpacity={0.8}>

              <Text
                style={styles.moreSessionsText}>
                View{' '}
                {todayAppointments.length - 3}{' '}
                more sessions
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#4169D8"
              />

            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Recent Activity
            </Text>

          </View>

          <View style={styles.activityCard}>

            <View style={styles.activityIcon}>

              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#16A765"
              />

            </View>

            <View style={styles.activityInfo}>

              <Text style={styles.activityTitle}>
                Workout completed
              </Text>

              <Text
                style={styles.activitySubtitle}>
                Complete your scheduled
                workouts here
              </Text>

            </View>

            <Text style={styles.activityTime}>
              --
            </Text>

          </View>

          <View style={styles.activityCard}>

            <View style={styles.activityIcon}>

              <Ionicons
                name="calendar-outline"
                size={22}
                color="#4169D8"
              />

            </View>

            <View style={styles.activityInfo}>

              <Text style={styles.activityTitle}>
                Appointments
              </Text>

              <Text
                style={styles.activitySubtitle}>
                Total scheduled sessions
              </Text>

            </View>

            <Text style={styles.activityTime}>
              {trainerAppointments.length}
            </Text>

          </View>

        </ScrollView>

        <TrainerDrawerMenu
          visible={drawerVisible}
          onClose={() =>
            setDrawerVisible(false)
          }
          navigation={navigation}
          activeScreen="TrainerDashboard"
        />

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

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  headerContent: {
    flex: 1,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 23,
  },

  profileCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  profileRole: {
    color: '#777777',
    fontSize: 12,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 23,
  },

  viewAll: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 23,
  },

  statTouchable: {
    flex: 1,
  },

  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickActionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  quickActionTitle: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  quickActionSubtitle: {
    color: '#888888',
    fontSize: 10,
    lineHeight: 15,
  },

  addButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  emptySessionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptySessionsIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  emptySessionsTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },

  emptySessionsSubtitle: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 17,
  },

  createSessionButton: {
    height: 43,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  moreSessionsButton: {
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    marginTop: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreSessionsText: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 5,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityInfo: {
    flex: 1,
    marginLeft: 11,
  },

  activityTitle: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },

  activitySubtitle: {
    color: '#888888',
    fontSize: 10,
  },

  activityTime: {
    color: '#999999',
    fontSize: 9,
  },
});

export default TrainerDashboardScreen;
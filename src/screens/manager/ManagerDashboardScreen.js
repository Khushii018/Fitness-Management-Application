
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useSelector,
} from 'react-redux';

import {
  useFocusEffect,
} from '@react-navigation/native';

import ManagerDrawerMenu from '../../components/ManagerDrawerMenu';

import StatCard from '../../components/StatCard';

const PRIMARY_COLOR = '#4169D8';
const BLACK_COLOR = '#111111';
const GRAY_COLOR = '#6B7280';
const LIGHT_GRAY = '#F5F7FA';
const WHITE = '#FFFFFF';

const ManagerDashboardScreen = ({
  navigation,
}) => {
  const [
    drawerVisible,
    setDrawerVisible,
  ] = useState(false);

  const [
    registeredUsers,
    setRegisteredUsers,
  ] = useState([]);

  const trainers = useSelector(
    state => state.manager?.trainers || [],
  );

  const members = useSelector(
    state => state.manager?.members || [],
  );

  const trainerMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const managerUser = useSelector(
    state => state.auth?.user,
  );

  const managerId = useMemo(() => {
    const id =
      managerUser?.managerId ||
      managerUser?.id;

    return id ? String(id) : null;
  }, [
    managerUser,
  ]);

  const loadRegisteredUsers =
    useCallback(async () => {
      try {
        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        if (!storedUsers) {
          setRegisteredUsers([]);
          return;
        }

        const parsedUsers =
          JSON.parse(storedUsers);

        setRegisteredUsers(
          Array.isArray(parsedUsers)
            ? parsedUsers
            : [],
        );
      } catch (error) {
        console.log(
          'Error loading registered users:',
          error,
        );

        setRegisteredUsers([]);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadRegisteredUsers();
    }, [
      loadRegisteredUsers,
    ]),
  );

  const allTrainers = useMemo(() => {
    if (!managerId) {
      return [];
    }

    const reduxTrainers =
      Array.isArray(trainers)
        ? trainers.filter(
            trainer =>
              trainer?.managerId &&
              String(
                trainer.managerId,
              ) === managerId,
          )
        : [];

    const storageTrainers =
      Array.isArray(registeredUsers)
        ? registeredUsers.filter(
            user =>
              String(
                user?.role || '',
              ).toLowerCase() ===
                'trainer' &&
              user?.managerId &&
              String(
                user.managerId,
              ) === managerId,
          )
        : [];

    const combined = [
      ...reduxTrainers,
      ...storageTrainers,
    ];

    const uniqueTrainers = [];

    combined.forEach(trainer => {
      const key = String(
        trainer?.id ||
          trainer?.trainerId ||
          trainer?.userId ||
          trainer?.email ||
          '',
      )
        .trim()
        .toLowerCase();

      if (!key) {
        return;
      }

      const exists =
        uniqueTrainers.some(
          existing => {
            const existingKey =
              String(
                existing?.id ||
                  existing?.trainerId ||
                  existing?.userId ||
                  existing?.email ||
                  '',
              )
                .trim()
                .toLowerCase();

            return (
              existingKey === key
            );
          },
        );

      if (!exists) {
        uniqueTrainers.push(
          trainer,
        );
      }
    });

    return uniqueTrainers;
  }, [
    trainers,
    registeredUsers,
    managerId,
  ]);

  const allMembers = useMemo(() => {
    if (!managerId) {
      return [];
    }

    const reduxMembers =
      Array.isArray(members)
        ? members.filter(
            member =>
              member?.managerId &&
              String(
                member.managerId,
              ) === managerId,
          )
        : [];

    const trainerReduxMembers =
      Array.isArray(trainerMembers)
        ? trainerMembers.filter(
            member =>
              member?.managerId &&
              String(
                member.managerId,
              ) === managerId,
          )
        : [];

    const storageMembers =
      Array.isArray(registeredUsers)
        ? registeredUsers.filter(
            user =>
              String(
                user?.role || '',
              ).toLowerCase() ===
                'member' &&
              user?.managerId &&
              String(
                user.managerId,
              ) === managerId,
          )
        : [];

    const combined = [
      ...reduxMembers,
      ...trainerReduxMembers,
      ...storageMembers,
    ];

    const uniqueMembers = [];

    combined.forEach(member => {
      const key = String(
        member?.id ||
          member?.memberId ||
          member?.userId ||
          member?.email ||
          '',
      )
        .trim()
        .toLowerCase();

      if (!key) {
        return;
      }

      const exists =
        uniqueMembers.some(
          existing => {
            const existingKey =
              String(
                existing?.id ||
                  existing?.memberId ||
                  existing?.userId ||
                  existing?.email ||
                  '',
              )
                .trim()
                .toLowerCase();

            return (
              existingKey === key
            );
          },
        );

      if (!exists) {
        uniqueMembers.push(
          member,
        );
      }
    });

    return uniqueMembers;
  }, [
    members,
    trainerMembers,
    registeredUsers,
    managerId,
  ]);

  const handleTrainerCountPress = () => {
    navigation.navigate(
      'ManagerTrainerSelection',
    );
  };

  const handleMemberCountPress = () => {
    navigation.navigate(
      'ManagerMemberSelection',
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }>

        <View style={styles.header}>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.menuButton}
            onPress={() =>
              setDrawerVisible(true)
            }>

            <Ionicons
              name="menu-outline"
              size={26}
              color={BLACK_COLOR}
            />

          </TouchableOpacity>

          <View style={styles.welcomeLine}>

            <Text
              style={styles.welcomeText}>
              Welcome back
            </Text>

            <Text
              style={styles.managerName}>
              {managerUser?.fullName ||
                managerUser?.name ||
                'Manager'}
            </Text>

          </View>

        </View>

        <View style={styles.titleSection}>

          <Text style={styles.title}>
            Manager Dashboard
          </Text>

          <Text style={styles.subtitle}>
            Manage trainers and monitor
            members
          </Text>

        </View>

        <View
          style={styles.statsContainer}>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.statWrapper}
            onPress={
              handleTrainerCountPress
            }>

            <StatCard
              icon="people-outline"
              title="Total Trainers"
              value={
                allTrainers.length
              }
            />

          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.statWrapper}
            onPress={
              handleMemberCountPress
            }>

            <StatCard
              icon="person-outline"
              title="Total Members"
              value={
                allMembers.length
              }
            />

          </TouchableOpacity>

        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createTrainerButton
          }
          onPress={() =>
            navigation.navigate(
              'CreateTrainer',
            )
          }>

          <View
            style={styles.createIcon}>

            <Ionicons
              name="person-add-outline"
              size={22}
              color={WHITE}
            />

          </View>

          <View
            style={
              styles.createTextContainer
            }>

            <Text
              style={
                styles.createTrainerTitle
              }>
              Create Trainer
            </Text>

            <Text
              style={
                styles.createTrainerSubtitle
              }>
              Add a new trainer account
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={WHITE}
          />

        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createTrainerButton
          }
          onPress={() =>
            navigation.navigate(
              'CreateMember',
            )
          }>

          <View
            style={styles.createIcon}>

            <Ionicons
              name="person-add-outline"
              size={22}
              color={WHITE}
            />

          </View>

          <View
            style={
              styles.createTextContainer
            }>

            <Text
              style={
                styles.createTrainerTitle
              }>
              Create Member
            </Text>

            <Text
              style={
                styles.createTrainerSubtitle
              }>
              Add a new member account
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={WHITE}
          />

        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createTrainerButton
          }
          onPress={() =>
            navigation.navigate(
              'ManagerAssignMember',
            )
          }>

          <View
            style={styles.createIcon}>

            <Ionicons
              name="person-add-outline"
              size={22}
              color={WHITE}
            />

          </View>

          <View
            style={
              styles.createTextContainer
            }>

            <Text
              style={
                styles.createTrainerTitle
              }>
              Add Member to Trainer
            </Text>

            <Text
              style={
                styles.createTrainerSubtitle
              }>
              Add a new member account
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={WHITE}
          />

        </TouchableOpacity>

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>

            <Ionicons
              name="information-circle-outline"
              size={22}
              color={PRIMARY_COLOR}
            />

          </View>

          <View
            style={styles.infoContent}>

            <Text
              style={styles.infoTitle}>
              View trainer members
            </Text>

            <Text
              style={styles.infoText}>
              Tap the Total Trainers card
              to select a trainer and view
              their members.
            </Text>

          </View>

        </View>

      </ScrollView>

      <ManagerDrawerMenu
        navigation={navigation}
        visible={drawerVisible}
        onClose={() =>
          setDrawerVisible(false)
        }
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },

  welcomeText: {
    fontSize: 14,
    color: GRAY_COLOR,
    marginBottom: 3,
    fontWeight: '400',
  },

  welcomeLine: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    paddingVertical: 2,
  },

  managerName: {
    fontSize: 22,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleSection: {
    marginTop: 28,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BLACK_COLOR,
  },

  subtitle: {
    fontSize: 14,
    color: GRAY_COLOR,
    marginTop: 6,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },

  statWrapper: {
    flex: 1,
    position: 'relative',
  },

  createTrainerButton: {
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  createIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  createTrainerTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },

  createTrainerSubtitle: {
    color:
      'rgba(255,255,255,0.78)',
    fontSize: 12,
    marginTop: 3,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F9FF',
    borderWidth: 1,
    borderColor: '#DCE5FF',
    borderRadius: 16,
    padding: 15,
    marginTop: 2,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: GRAY_COLOR,
    marginTop: 3,
  },
});

export default ManagerDashboardScreen;

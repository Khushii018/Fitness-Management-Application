import React, {
  useCallback,
  useEffect,
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

import {SafeAreaView} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {logout} from '../../redux/slices/authSlice';

import SettingsItem from '../../components/SettingsItem';

const TrainerSettingsScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const currentUser = useSelector(
    state => state.auth?.user,
  );

  const [managerName, setManagerName] =
    useState('Loading...');

  const [managerEmail, setManagerEmail] =
    useState('');

  const trainerName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    'Trainer';

  const trainerEmail =
    currentUser?.email || '';

  const trainerId =
    currentUser?.id ||
    currentUser?._id ||
    currentUser?.userId ||
    null;

  const getManagerDetails = useCallback(
    async () => {
      try {
        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        if (!storedUsers) {
          setManagerName('Manager not found');
          setManagerEmail('');
          return;
        }

        const users = JSON.parse(storedUsers);

        if (!Array.isArray(users)) {
          setManagerName('Manager not found');
          setManagerEmail('');
          return;
        }

        const trainerManagerId =
          currentUser?.managerId;

        if (!trainerManagerId) {
          setManagerName('Manager not assigned');
          setManagerEmail('');
          return;
        }

        const manager = users.find(
          user =>
            String(user?.id) ===
              String(trainerManagerId) &&
            String(
              user?.role || '',
            ).toLowerCase() === 'manager',
        );

        if (manager) {
          setManagerName(
            manager?.fullName ||
              manager?.name ||
              manager?.username ||
              'Manager',
          );

          setManagerEmail(
            manager?.email || '',
          );
        } else {
          setManagerName('Manager not found');
          setManagerEmail('');
        }
      } catch (error) {
        console.log(
          'Error getting manager details:',
          error,
        );

        setManagerName('Manager not found');
        setManagerEmail('');
      }
    },
    [currentUser],
  );

  useEffect(() => {
    getManagerDetails();
  }, [getManagerDetails]);

  const handleLogout = () => {
    dispatch(logout());

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Welcome',
        },
      ],
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}>

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('Home')
            }
            activeOpacity={0.8}>

            <Ionicons
              name="arrow-back"
              size={23}
              color="#111111"
            />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>
          My Profile
          </Text>

          <View style={styles.headerSpace} />

        </View>

        <View style={styles.profileCard}>

          <View style={styles.profileIcon}>

            <Ionicons
              name="person"
              size={27}
              color="#4169D8"
            />

          </View>

          <View style={styles.profileInfo}>

            <Text
              style={styles.profileTitle}>
              Trainer Settings
            </Text>

            <Text
              style={styles.profileSubtitle}>
              Manage your account and
              preferences
            </Text>

          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Your Profile
        </Text>

        <View style={styles.loggedInCard}>

          <View style={styles.loggedInIconContainer}>

            <Ionicons
              name="person-circle-outline"
              size={30}
              color="#4169D8"
            />

          </View>

          <View style={styles.loggedInInfo}>

            
            <Text
              style={styles.loggedInName}
              numberOfLines={1}>
              {trainerName}
            </Text>

            {trainerEmail ? (
              <Text
                style={styles.loggedInEmail}
                numberOfLines={1}>
                {trainerEmail}
              </Text>
            ) : null}

           
          </View>

          <View style={styles.loggedInStatus}>

            <View style={styles.loggedInStatusDot} />

            <Text style={styles.loggedInStatusText}>
              Active
            </Text>

          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.settingsCard}>

          <SettingsItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your trainer information"
            onPress={() =>
              navigation.navigate(
                'TrainerProfile',
              )
            }
          />

          <View style={styles.divider} />

          <SettingsItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() =>
              navigation.navigate(
                'ForgotPassword',
              )
            }
          />

        </View>

        <Text style={styles.sectionTitle}>
          Manager
        </Text>

        <View style={styles.managerCard}>

          <View
            style={styles.managerIconContainer}>

            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#4169D8"
            />

          </View>

          <View style={styles.managerInfo}>

           

            <Text
              style={styles.managerName}
              numberOfLines={1}>

              {managerName}

            </Text>

            {managerEmail ? (
              <Text
                style={styles.managerEmail}
                numberOfLines={1}>

                {managerEmail}

              </Text>
            ) : null}

          </View>

          <View style={styles.managerStatus}>

            <View
              style={styles.managerStatusDot}
            />

            <Text
              style={styles.managerStatusText}>
              Assigned
            </Text>

          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        <View style={styles.settingsCard}>

          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() =>
              navigation.navigate(
                'TrainerNotifications',
              )
            }
          />

          <View style={styles.divider} />

          <SettingsItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />

        </View>

        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <View style={styles.settingsCard}>

          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() => {}}
          />

          <View style={styles.divider} />

          <SettingsItem
            icon="information-circle-outline"
            title="About"
            subtitle="App information and version"
            onPress={() => {}}
          />

        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>

          <Ionicons
            name="log-out-outline"
            size={21}
            color="#D64545"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>

        </TouchableOpacity>

        <Text style={styles.version}>
          Fitness App v1.0.0
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '700',
  },

  headerSpace: {
    width: 42,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  profileTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  profileSubtitle: {
    color: '#777777',
    fontSize: 11,
  },

  sectionTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  loggedInCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  loggedInIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loggedInInfo: {
    flex: 1,
    marginLeft: 12,
  },

  loggedInLabel: {
    fontSize: 10,
    color: '#777777',
    marginBottom: 3,
  },

  loggedInName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  loggedInEmail: {
    fontSize: 10,
    color: '#777777',
    marginTop: 3,
  },

  loggedInId: {
    fontSize: 9,
    color: '#999999',
    marginTop: 3,
  },

  loggedInStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  loggedInStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 4,
  },

  loggedInStatusText: {
    fontSize: 9,
    color: '#22C55E',
    fontWeight: '600',
  },

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    marginBottom: 22,
    overflow: 'hidden',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8E9EC',
    marginLeft: 66,
  },

  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  managerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  managerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  managerLabel: {
    fontSize: 10,
    color: '#777777',
    marginBottom: 3,
  },

  managerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  managerEmail: {
    fontSize: 10,
    color: '#777777',
    marginTop: 3,
  },

  managerStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  managerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 4,
  },

  managerStatusText: {
    fontSize: 9,
    color: '#22C55E',
    fontWeight: '600',
  },

  logoutButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2BABA',
    backgroundColor: '#FFF7F7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },

  logoutText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '700',
  },

  version: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 10,
    marginTop: 18,
  },
});

export default TrainerSettingsScreen;
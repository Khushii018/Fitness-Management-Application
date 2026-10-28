import React, {
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

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  logout,
} from '../../redux/slices/authSlice';

import {
  clearMemberData,
} from '../../redux/slices/memberSlice';

const BLUE = '#4169D8';

const MemberProfileScreen = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user,
  );

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const memberProfile = useSelector(
    state => state.member?.profile || null,
  );

  const [profile, setProfile] =
    useState(null);

  const [trainerName, setTrainerName] =
    useState('Trainer not assigned');

  const [trainerEmail, setTrainerEmail] =
    useState('');

  const getMemberId = user => {
    return (
      user?.memberId ||
      user?.id ||
      user?.userId ||
      user?._id ||
      user?.email ||
      user?.mobile ||
      null
    );
  };

  const findMember = () => {
    if (!authUser && !memberProfile) {
      return null;
    }

    const memberId =
      getMemberId(authUser) ||
      getMemberId(memberProfile);

    const email =
      authUser?.email ||
      memberProfile?.email ||
      '';

    const mobile =
      authUser?.mobile ||
      memberProfile?.mobile ||
      '';

    return members.find(member => {
      if (
        memberId &&
        (
          member?.memberId ||
          member?.id ||
          member?.userId ||
          member?._id
        )
      ) {
        const memberIds = [
          member?.memberId,
          member?.id,
          member?.userId,
          member?._id,
        ].filter(Boolean);

        if (
          memberIds.some(
            id =>
              String(id) ===
              String(memberId),
          )
        ) {
          return true;
        }
      }

      if (
        email &&
        member?.email &&
        String(
          member.email,
        ).toLowerCase() ===
          String(
            email,
          ).toLowerCase()
      ) {
        return true;
      }

      if (
        mobile &&
        member?.mobile &&
        String(
          member.mobile,
        ) ===
          String(mobile)
      ) {
        return true;
      }

      return false;
    });
  };

  const getTrainerId = member => {
    if (!member) {
      return null;
    }

    if (
      Array.isArray(
        member?.trainerIds,
      ) &&
      member.trainerIds.length > 0
    ) {
      return String(
        member.trainerIds[0],
      );
    }

    if (member?.trainerId) {
      return String(
        member.trainerId,
      );
    }

    if (member?.assignedTrainerId) {
      return String(
        member.assignedTrainerId,
      );
    }

    if (member?.createdByTrainerId) {
      return String(
        member.createdByTrainerId,
      );
    }

    if (member?.trainer?.id) {
      return String(
        member.trainer.id,
      );
    }

    if (member?.trainer?.trainerId) {
      return String(
        member.trainer.trainerId,
      );
    }

    return null;
  };

  const findTrainer = async member => {
    try {
      if (!member) {
        setTrainerName(
          'Trainer not assigned',
        );
        setTrainerEmail('');
        return;
      }

      const trainerId =
        getTrainerId(member);

      if (!trainerId) {
        setTrainerName(
          'Trainer not assigned',
        );
        setTrainerEmail('');
        return;
      }

      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (!storedUsers) {
        setTrainerName(
          'Trainer not found',
        );
        setTrainerEmail('');
        return;
      }

      const users =
        JSON.parse(storedUsers);

      if (!Array.isArray(users)) {
        setTrainerName(
          'Trainer not found',
        );
        setTrainerEmail('');
        return;
      }

      const trainer =
        users.find(user => {
          const userId =
            user?.trainerId ||
            user?.id ||
            user?.userId ||
            user?._id;

          return (
            String(userId) ===
              String(trainerId) &&
            String(
              user?.role || '',
            ).toLowerCase() ===
              'trainer'
          );
        });

      if (trainer) {
        setTrainerName(
          trainer?.fullName ||
            trainer?.name ||
            trainer?.username ||
            'Trainer',
        );

        setTrainerEmail(
          trainer?.email || '',
        );

        return;
      }

      const reduxTrainer =
        members.find(item => {
          const itemId =
            item?.trainerId ||
            item?.id ||
            item?.userId ||
            item?._id;

          return (
            String(itemId) ===
            String(trainerId)
          );
        });

      if (reduxTrainer) {
        setTrainerName(
          reduxTrainer?.trainerName ||
            reduxTrainer?.fullName ||
            reduxTrainer?.name ||
            'Trainer',
        );

        setTrainerEmail(
          reduxTrainer?.email || '',
        );

        return;
      }

      setTrainerName(
        'Trainer not found',
      );

      setTrainerEmail('');
    } catch (error) {
      console.log(
        'Error loading trainer:',
        error,
      );

      setTrainerName(
        'Trainer not found',
      );

      setTrainerEmail('');
    }
  };

  const loadProfile = async () => {
    try {
      const reduxMember =
        findMember();

      const finalProfile = {
        fullName:
          memberProfile?.fullName ||
          memberProfile?.name ||
          reduxMember?.fullName ||
          reduxMember?.name ||
          authUser?.fullName ||
          authUser?.name ||
          'John Doe',

        email:
          memberProfile?.email ||
          reduxMember?.email ||
          authUser?.email ||
          'john.doe@gmail.com',

        mobile:
          memberProfile?.mobile ||
          reduxMember?.mobile ||
          authUser?.mobile ||
          '+91 98765 43210',

        age:
          memberProfile?.age ||
          reduxMember?.age ||
          authUser?.age ||
          '28',

        gender:
          memberProfile?.gender ||
          reduxMember?.gender ||
          authUser?.gender ||
          'Not specified',

        height:
          memberProfile?.height ||
          memberProfile?.heightCm ||
          reduxMember?.height ||
          reduxMember?.heightCm ||
          authUser?.height ||
          authUser?.heightCm ||
          '175 cm',

        weight:
          memberProfile?.weight ||
          memberProfile?.weightKg ||
          reduxMember?.weight ||
          reduxMember?.weightKg ||
          authUser?.weight ||
          authUser?.weightKg ||
          '78 kg',

        goal:
          memberProfile?.goal ||
          memberProfile?.fitnessGoal ||
          reduxMember?.goal ||
          reduxMember?.fitnessGoal ||
          authUser?.goal ||
          authUser?.fitnessGoal ||
          'Weight Loss',

        activityLevel:
          memberProfile?.activityLevel ||
          reduxMember?.activityLevel ||
          authUser?.activityLevel ||
          'Active',
      };

      setProfile(finalProfile);

      await findTrainer(
        reduxMember ||
          memberProfile ||
          authUser,
      );
    } catch (error) {
      console.log(
        'Error loading member profile:',
        error,
      );
    }
  };

  useEffect(() => {
    loadProfile();
  }, [
    authUser,
    memberProfile,
    members,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearMemberData());

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Welcome',
        },
      ],
    });
  };

  if (!profile) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          'top',
          'left',
          'right',
        ]}>

        <View
          style={
            styles.loadingContainer
          }>

          <Text
            style={
              styles.loadingText
            }>
            Loading profile...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }>

        <View style={styles.header}>

          <View>

            <Text
              style={
                styles.headerTitle
              }>
              My Profile
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Manage your personal
              information
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <Ionicons
              name="person-outline"
              size={24}
              color={BLUE}
            />

          </View>

        </View>

        <View style={styles.profileCard}>

          <View style={styles.profileIcon}>

            <Ionicons
              name="person"
              size={27}
              color={BLUE}
            />

          </View>

          <View style={styles.profileInfo}>

            <Text
              style={
                styles.profileTitle
              }>
              Member Profile
            </Text>

            <Text
              style={
                styles.profileSubtitle
              }>
              Manage your account and
              preferences
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          Your Profile
        </Text>

        <View
          style={
            styles.memberProfileCard
          }>

          <View
            style={
              styles.memberIconContainer
            }>

            <Ionicons
              name="person-circle-outline"
              size={30}
              color={BLUE}
            />

          </View>

          <View
            style={
              styles.memberInfo
            }>

            <Text
              style={
                styles.memberName
              }
              numberOfLines={1}>
              {profile.fullName}
            </Text>

            {profile.email ? (
              <Text
                style={
                  styles.memberEmail
                }
                numberOfLines={1}>
                {profile.email}
              </Text>
            ) : null}

          </View>

          <View
            style={
              styles.memberStatus
            }>

            <View
              style={
                styles.memberStatusDot
              }
            />

            <Text
              style={
                styles.memberStatusText
              }>
              Active
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          My Trainer
        </Text>

        <View
          style={
            styles.trainerCard
          }>

          <View
            style={
              styles.trainerIcon
            }>

            <Ionicons
              name="fitness-outline"
              size={25}
              color={BLUE}
            />

          </View>

          <View
            style={
              styles.trainerInfo
            }>

           

            <Text
              style={
                styles.trainerName
              }
              numberOfLines={1}>
              {trainerName}
            </Text>

            {trainerEmail ? (
              <Text
                style={
                  styles.trainerEmail
                }
                numberOfLines={1}>
                {trainerEmail}
              </Text>
            ) : null}

          </View>

          <View
            style={
              styles.trainerStatus
            }>

            <View
              style={
                styles.trainerStatusDot
              }
            />

            <Text
              style={
                styles.trainerStatusText
              }>
              Assigned
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          Personal Information
        </Text>

        <View
          style={
            styles.settingsCard
          }>

          <View
            style={
              styles.settingsRow
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="person-outline"
                size={20}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemLabel
                }>
                Full Name
              </Text>

              <Text
                style={
                  styles.itemValue
                }>
                {profile.fullName}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.settingsRow
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="mail-outline"
                size={20}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemLabel
                }>
                Email
              </Text>

              <Text
                style={
                  styles.itemValue
                }>
                {profile.email}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.settingsRow
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="call-outline"
                size={20}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemLabel
                }>
                Mobile
              </Text>

              <Text
                style={
                  styles.itemValue
                }>
                {profile.mobile}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.settingsRow
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="calendar-outline"
                size={20}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemLabel
                }>
                Age
              </Text>

              <Text
                style={
                  styles.itemValue
                }>
                {profile.age}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.settingsRow
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="male-female-outline"
                size={20}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemLabel
                }>
                Gender
              </Text>

              <Text
                style={
                  styles.itemValue
                }>
                {profile.gender}
              </Text>

            </View>

          </View>

        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          Account
        </Text>

        <View
          style={
            styles.settingsCard
          }>

          <TouchableOpacity
            style={
              styles.menuRow
            }
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate(
                'MemberProfileSetup',
              )
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="create-outline"
                size={21}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemTitle
                }>
                Edit Profile
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }>
                Update your personal
                information
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999999"
            />

          </TouchableOpacity>

          <View
            style={
              styles.divider
            }
          />

          <TouchableOpacity
            style={
              styles.menuRow
            }
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate(
                'ForgotPassword',
              )
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemTitle
                }>
                Change Password
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }>
                Update your account
                password
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999999"
            />

          </TouchableOpacity>

          <View
            style={
              styles.divider
            }
          />

          <TouchableOpacity
            style={
              styles.menuRow
            }
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate(
                'Notifications',
              )
            }>

            <View
              style={
                styles.itemIcon
              }>

              <Ionicons
                name="notifications-outline"
                size={21}
                color={BLUE}
              />

            </View>

            <View
              style={
                styles.itemContent
              }>

              <Text
                style={
                  styles.itemTitle
                }>
                Notifications
              </Text>

              <Text
                style={
                  styles.itemSubtitle
                }>
                Manage your notifications
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999999"
            />

          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={
            styles.logoutButton
          }
          activeOpacity={0.8}
          onPress={
            handleLogout
          }>

          <Ionicons
            name="log-out-outline"
            size={21}
            color="#D64545"
          />

          <Text
            style={
              styles.logoutText
            }>
            Logout
          </Text>

        </TouchableOpacity>

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
    paddingTop: 10,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#777777',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
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

  memberProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  memberIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },

  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  memberEmail: {
    fontSize: 10,
    color: '#777777',
    marginTop: 3,
  },

  memberStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  memberStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 4,
  },

  memberStatusText: {
    fontSize: 9,
    color: '#22C55E',
    fontWeight: '600',
  },

  trainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  trainerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trainerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  trainerLabel: {
    fontSize: 10,
    color: '#777777',
    marginBottom: 3,
  },

  trainerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  trainerEmail: {
    fontSize: 10,
    color: '#777777',
    marginTop: 3,
  },

  trainerStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  trainerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 4,
  },

  trainerStatusText: {
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

  settingsRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  itemContent: {
    flex: 1,
  },

  itemLabel: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 3,
  },

  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  menuRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },

  itemSubtitle: {
    fontSize: 11,
    color: '#777777',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8E9EC',
    marginLeft: 69,
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
});

export default MemberProfileScreen; 
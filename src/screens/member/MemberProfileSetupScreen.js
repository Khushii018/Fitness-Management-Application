import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  setUser,
} from '../../redux/slices/authSlice';

import {
  setProfile,
} from '../../redux/slices/memberSlice';

const MemberProfileSetupScreen = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState('');

  const [activityLevel, setActivityLevel] =
    useState('');

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!goal) {
        Alert.alert(
          'Select Goal',
          'Please select your fitness goal.',
        );

        return;
      }

      setStep(3);

      return;
    }

    saveProfile();
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const saveProfile = async () => {
    if (!activityLevel) {
      Alert.alert(
        'Select Activity Level',
        'Please select your activity level.',
      );

      return;
    }

    if (!authUser) {
      Alert.alert(
        'Error',
        'User information not found. Please login again.',
      );

      return;
    }

    try {
      const memberId =
        authUser?.memberId ||
        authUser?.id ||
        authUser?.email;

      const profileData = {
        ...authUser,

        id:
          authUser?.id ||
          memberId,

        memberId,

        role: 'member',

        goal,

        activityLevel,

        profileCompleted: true,
      };

      dispatch(
        setUser(profileData),
      );

      dispatch(
        setProfile(profileData),
      );

      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (storedUsers) {
        let users = [];

        try {
          const parsedUsers =
            JSON.parse(storedUsers);

          users = Array.isArray(parsedUsers)
            ? parsedUsers
            : [];
        } catch (error) {
          users = [];
        }

        const updatedUsers = users.map(
          user => {
            const userId =
              user?.memberId ||
              user?.id ||
              user?.email;

            if (
              String(userId) ===
              String(memberId)
            ) {
              return {
                ...user,

                id:
                  user?.id ||
                  memberId,

                memberId,

                role: 'member',

                goal,

                activityLevel,

                profileCompleted: true,
              };
            }

            return user;
          },
        );

        await AsyncStorage.setItem(
          'registeredUsers',
          JSON.stringify(updatedUsers),
        );
      }

      console.log(
        'Profile completed:',
        profileData,
      );

      navigation.replace(
        'MemberTabs',
      );
    } catch (error) {
      console.log(
        'Profile save error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save your profile. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={previousStep}>

              <Ionicons
                name="arrow-back"
                size={21}
                color="#333333"
              />

            </TouchableOpacity>
          ) : (
            <View
              style={styles.backPlaceholder}
            />
          )}

          <Text style={styles.stepText}>
            {step}/3
          </Text>

          <View
            style={styles.backPlaceholder}
          />
        </View>

        <View
          style={styles.progressContainer}>

          <View
            style={[
              styles.progress,
              {
                width: `${(step / 3) * 100}%`,
              },
            ]}
          />

        </View>

        {step === 1 && (
          <View style={styles.introScreen}>

            <View>

              <View style={styles.logoArea}>

                <View
                  style={styles.mainLogo}>

                  <Ionicons
                    name="fitness-outline"
                    size={55}
                    color="#4169D8"
                  />

                </View>

              </View>

              <Text
                style={styles.introSmallTitle}>
                PROFILE SETUP
              </Text>

              <Text
                style={styles.introTitle}>
                Complete Your Profile
              </Text>

              <Text
                style={styles.introSubtitle}>
                Let's personalize your fitness experience.
              </Text>

              <View
                style={styles.introContent}>

                <View
                  style={styles.verticalSteps}>

                  <View
                    style={styles.verticalLine}
                  />

                  <View
                    style={styles.verticalStepRow}>

                    <View
                      style={styles.introIcon}>

                      <Ionicons
                        name="person-outline"
                        size={25}
                        color="#4169D8"
                      />

                    </View>

                    <View
                      style={styles.introStepText}>

                      <Text
                        style={styles.introStepTitle}>
                        Personal Information
                      </Text>

                      <Text
                        style={styles.introStepSubtitle}>
                        Tell us a little about yourself
                      </Text>

                    </View>

                  </View>

                  <View
                    style={styles.verticalStepRow}>

                    <View
                      style={styles.introIcon}>

                      <Ionicons
                        name="flag-outline"
                        size={25}
                        color="#4169D8"
                      />

                    </View>

                    <View
                      style={styles.introStepText}>

                      <Text
                        style={styles.introStepTitle}>
                        Fitness Goal
                      </Text>

                      <Text
                        style={styles.introStepSubtitle}>
                        Choose what you want to achieve
                      </Text>

                    </View>

                  </View>

                  <View
                    style={styles.verticalStepRow}>

                    <View
                      style={styles.introIcon}>

                      <Ionicons
                        name="flash-outline"
                        size={25}
                        color="#4169D8"
                      />

                    </View>

                    <View
                      style={styles.introStepText}>

                      <Text
                        style={styles.introStepTitle}>
                        Activity Level
                      </Text>

                      <Text
                        style={styles.introStepSubtitle}>
                        Tell us about your current activity
                      </Text>

                    </View>

                  </View>

                </View>

              </View>

            </View>

            <View
              style={styles.bottomSection}>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={nextStep}>

                <Text
                  style={styles.continueText}>
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

              <Text
                style={styles.bottomHint}>
                This will only take a few minutes
              </Text>

            </View>

          </View>
        )}

        {step === 2 && (
          <View
            style={styles.screenContainer}>

            <View>

              <View
                style={styles.logoArea}>

                <View
                  style={styles.mainLogo}>

                  <Ionicons
                    name="fitness-outline"
                    size={55}
                    color="#4169D8"
                  />

                </View>

              </View>

              <Text
                style={styles.title}>
                Let's Get Started
              </Text>

              <Text
                style={styles.subtitle}>
                Tell us what you want to achieve so we can personalize your fitness journey.
              </Text>

              <Text
                style={styles.sectionTitle}>
                What's your main goal?
              </Text>

              <TouchableOpacity
                style={[
                  styles.goalCard,
                  goal === 'lose_weight' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setGoal('lose_weight')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="trending-down-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Lose Weight
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    Burn fat and become healthier
                  </Text>

                </View>

                {goal === 'lose_weight' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.goalCard,
                  goal === 'build_muscle' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setGoal('build_muscle')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="barbell-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Build Muscle
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    Gain strength and muscle
                  </Text>

                </View>

                {goal === 'build_muscle' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.goalCard,
                  goal === 'stay_fit' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setGoal('stay_fit')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="fitness-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Stay Fit
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    Maintain a healthy lifestyle
                  </Text>

                </View>

                {goal === 'stay_fit' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

            </View>

            <View
              style={styles.bottomSection}>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={nextStep}>

                <Text
                  style={styles.continueText}>
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

              <Text
                style={styles.bottomHint}>
                This will only take a few minutes
              </Text>

            </View>

          </View>
        )}

        {step === 3 && (
          <View
            style={styles.screenContainer}>

            <View>

              <View
                style={styles.logoArea}>

                <View
                  style={styles.mainLogo}>

                  <Ionicons
                    name="flash-outline"
                    size={55}
                    color="#4169D8"
                  />

                </View>

              </View>

              <Text
                style={styles.title}>
                Your Activity Level
              </Text>

              <Text
                style={styles.subtitle}>
                Choose the option that best describes your current activity level.
              </Text>

              <TouchableOpacity
                style={[
                  styles.activityCard,
                  activityLevel === 'beginner' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setActivityLevel('beginner')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="walk-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Beginner
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    I'm new to regular exercise
                  </Text>

                </View>

                {activityLevel === 'beginner' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityCard,
                  activityLevel === 'moderate' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setActivityLevel('moderate')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="bicycle-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Moderate
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    I exercise a few times a week
                  </Text>

                </View>

                {activityLevel === 'moderate' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityCard,
                  activityLevel === 'active' &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setActivityLevel('active')
                }>

                <View
                  style={styles.iconBox}>

                  <Ionicons
                    name="flame-outline"
                    size={27}
                    color="#4169D8"
                  />

                </View>

                <View
                  style={styles.cardContent}>

                  <Text
                    style={styles.cardTitle}>
                    Active
                  </Text>

                  <Text
                    style={styles.cardSubtitle}>
                    I exercise regularly
                  </Text>

                </View>

                {activityLevel === 'active' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                )}

              </TouchableOpacity>

            </View>

            <View
              style={styles.bottomSection}>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={saveProfile}>

                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.completeText}>
                  Profile Completed
                </Text>

              </TouchableOpacity>

              <Text
                style={styles.bottomHint}>
                Your profile will be saved securely
              </Text>

            </View>

          </View>
        )}

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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  topRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  backPlaceholder: {
    width: 42,
  },

  stepText: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '600',
  },

  progressContainer: {
    height: 5,
    backgroundColor: '#E4E7EC',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },

  progress: {
    height: 5,
    backgroundColor: '#4169D8',
    borderRadius: 3,
  },

  introScreen: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },

  screenContainer: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },

  logoArea: {
    height: 115,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  mainLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DFFF',
  },

  introSmallTitle: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  introTitle: {
    color: '#333333',
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  introSubtitle: {
    color: '#707070',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  introContent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 17,
  },

  verticalSteps: {
    position: 'relative',
  },

  verticalLine: {
    position: 'absolute',
    left: 26,
    top: 28,
    bottom: 28,
    width: 2,
    backgroundColor: '#C8D5F4',
  },

  verticalStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 78,
    marginBottom: 3,
  },

  introIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF0FF',
    borderWidth: 1,
    borderColor: '#B9C9F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  introStepText: {
    flex: 1,
    marginLeft: 15,
  },

  introStepTitle: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  introStepSubtitle: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 16,
  },

  title: {
    color: '#333333',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 8,
  },

  subtitle: {
    color: '#707070',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  goalCard: {
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 10,
  },

  activityCard: {
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 11,
  },

  selectedCard: {
    backgroundColor: '#EAF0FF',
    borderColor: '#4169D8',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContent: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitle: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  cardSubtitle: {
    color: '#777777',
    fontSize: 11,
  },

  bottomSection: {
    marginTop: 'auto',
  },

  continueButton: {
    height: 50,
    backgroundColor: '#4169D8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },

  completeButton: {
    height: 50,
    backgroundColor: '#4169D8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  bottomHint: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 12,
    marginTop: 14,
  },
});

export default MemberProfileSetupScreen;
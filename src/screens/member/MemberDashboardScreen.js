import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

import MemberDrawerMenu from '../../components/MemberDrawerMenu';

const MemberDashboardScreen = ({navigation}) => {
  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxWorkoutPlans = useSelector(
    state => state.trainer?.workoutPlans || [],
  );

  const [userName, setUserName] = useState('John');
  const [user, setUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loadingWorkout, setLoadingWorkout] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      setUserName('John');
      return;
    }

    setUser(authUser);

    if (authUser.fullName) {
      setUserName(
        authUser.fullName.split(' ')[0],
      );
    } else if (authUser.name) {
      setUserName(
        authUser.name.split(' ')[0],
      );
    } else if (authUser.username) {
      setUserName(authUser.username);
    } else {
      setUserName('John');
    }
  }, [authUser]);

  useEffect(() => {
    loadMemberWorkouts();
  }, [user, reduxWorkoutPlans]);

  const loadMemberWorkouts = () => {
    try {
      setLoadingWorkout(true);

      const currentUserData = user || authUser;

      if (!currentUserData) {
        setWorkoutPlans([]);
        return;
      }

      const possibleMemberIds = [
        currentUserData.id,
        currentUserData.memberId,
        currentUserData._id,
        currentUserData.userId,
      ]
        .filter(Boolean)
        .map(String);

      const possibleEmails = [
        currentUserData.email,
        currentUserData.memberEmail,
      ]
        .filter(Boolean)
        .map(email =>
          String(email)
            .trim()
            .toLowerCase(),
        );

      const possibleMobiles = [
        currentUserData.mobile,
        currentUserData.phone,
        currentUserData.memberMobile,
      ]
        .filter(Boolean)
        .map(String);

      const plansMap = new Map();

      if (Array.isArray(reduxWorkoutPlans)) {
        reduxWorkoutPlans.forEach(plan => {
          if (
            !plan ||
            !Array.isArray(plan.exercises)
          ) {
            return;
          }

          const planMemberIds = [
            plan.memberId,
            plan.userId,
            plan.member?.id,
            plan.member?._id,
            plan.member?.userId,
          ]
            .filter(Boolean)
            .map(String);

          const planEmails = [
            plan.memberEmail,
            plan.email,
            plan.member?.email,
          ]
            .filter(Boolean)
            .map(email =>
              String(email)
                .trim()
                .toLowerCase(),
            );

          const planMobiles = [
            plan.memberMobile,
            plan.mobile,
            plan.member?.mobile,
            plan.phone,
          ]
            .filter(Boolean)
            .map(String);

          const isGlobalPlan =
            !planMemberIds.length &&
            !planEmails.length &&
            !planMobiles.length;

          const idMatches =
            possibleMemberIds.length > 0 &&
            planMemberIds.some(id =>
              possibleMemberIds.includes(id),
            );

          const emailMatches =
            possibleEmails.length > 0 &&
            planEmails.some(email =>
              possibleEmails.includes(email),
            );

          const mobileMatches =
            possibleMobiles.length > 0 &&
            planMobiles.some(mobile =>
              possibleMobiles.includes(mobile),
            );

          if (
            isGlobalPlan ||
            idMatches ||
            emailMatches ||
            mobileMatches
          ) {
            const planId =
              plan.id ||
              plan._id ||
              `${plan.planName || 'Workout Plan'}-${
                plan.createdAt || ''
              }`;

            plansMap.set(
              String(planId),
              plan,
            );
          }
        });
      }

      const validPlans = Array.from(
        plansMap.values(),
      ).filter(
        plan =>
          plan &&
          Array.isArray(plan.exercises) &&
          plan.exercises.some(
            exercise =>
              exercise &&
              (
                exercise.name ||
                exercise.exerciseName ||
                exercise.title
              ),
          ),
      );

      const sortedPlans = [
        ...validPlans,
      ].sort((a, b) => {
        const dateA = new Date(
          a?.createdAt || 0,
        ).getTime();

        const dateB = new Date(
          b?.createdAt || 0,
        ).getTime();

        return dateB - dateA;
      });

      setWorkoutPlans(sortedPlans);
    } catch (error) {
      console.log(
        'Load member workouts error:',
        error,
      );

      setWorkoutPlans([]);
    } finally {
      setLoadingWorkout(false);
    }
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        () => {
          loadMemberWorkouts();
        },
      );

    return unsubscribe;
  }, [
    navigation,
    user,
    reduxWorkoutPlans,
  ]);

  const getExerciseName = exercise => {
    return (
      exercise?.name ||
      exercise?.exerciseName ||
      exercise?.title ||
      'Exercise'
    );
  };

  const getExerciseSets = exercise => {
    const sets =
      exercise?.sets || '-';

    const reps =
      exercise?.reps || '-';

    return `${sets} × ${reps}`;
  };

  const getWorkoutDuration = plan => {
    if (!plan?.duration) {
      return null;
    }

    return `${plan.duration} weeks`;
  };

  const getWorkoutTitle = plan => {
    return (
      plan?.planName ||
      plan?.name ||
      'Workout Plan'
    );
  };

  const getWorkoutExercises = plan => {
    if (
      !Array.isArray(
        plan?.exercises,
      )
    ) {
      return [];
    }

    return plan.exercises.filter(
      exercise =>
        exercise &&
        (
          exercise.name ||
          exercise.exerciseName ||
          exercise.title
        ),
    );
  };

  const renderWorkoutPlan = (
    plan,
    planIndex,
  ) => {
    const exercises =
      getWorkoutExercises(plan);

    if (exercises.length === 0) {
      return null;
    }

    const workoutTitle =
      getWorkoutTitle(plan);

    return (
      <View
        key={
          plan?.id ||
          plan?._id ||
          `${workoutTitle}-${planIndex}`
        }
        style={
          styles.workoutCard
        }>

        <View
          style={
            styles.workoutHeader
          }>

          <View
            style={
              styles.workoutIcon
            }>
            <Ionicons
              name="barbell-outline"
              size={24}
              color="#4169D8"
            />
          </View>

          <View
            style={
              styles.workoutInfo
            }>

            <Text
              style={
                styles.workoutTitle
              }
              numberOfLines={2}>
              {workoutTitle}
            </Text>

            <Text
              style={
                styles.workoutSubtitle
              }>
              {exercises.length}{' '}
              {exercises.length ===
              1
                ? 'Exercise'
                : 'Exercises'}
            </Text>

          </View>

          <View
            style={
              styles.workoutTime
            }>

            <Ionicons
              name="time-outline"
              size={15}
              color="#777777"
            />

            <Text
              style={
                styles.timeText
              }>
              {getWorkoutDuration(
                plan,
              ) ||
                'Workout'}
            </Text>

          </View>

        </View>

        {exercises.map(
          (
            exercise,
            index,
          ) => (
            <View
              key={
                `${
                  exercise?.id ||
                  exercise?._id ||
                  getExerciseName(
                    exercise,
                  )
                }-${index}`
              }
              style={
                styles.exerciseRow
              }>

              <View
                style={
                  styles.exerciseNumber
                }>

                <Text
                  style={
                    styles.exerciseNumberText
                  }>
                  {index + 1}
                </Text>

              </View>

              <Text
                style={
                  styles.exerciseName
                }
                numberOfLines={1}>
                {getExerciseName(
                  exercise,
                )}
              </Text>

              <Text
                style={
                  styles.exerciseSets
                }>
                {getExerciseSets(
                  exercise,
                )}
              </Text>

            </View>
          ),
        )}

        <TouchableOpacity
          style={
            styles.startWorkoutButton
          }
          onPress={() =>
            navigation.navigate(
              'Workout',
            )
          }
          activeOpacity={0.85}>

          <Text
            style={
              styles.startWorkoutText
            }>
            Start Workout
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>
    );
  };

  const latestWorkout =
    workoutPlans.length > 0
      ? workoutPlans[0]
      : null;

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        'top',
        'left',
        'right',
      ]}>

      <View
        style={
          styles.mainContainer
        }>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }>

          <View
            style={
              styles.header
            }>

            <View
              style={
                styles.headerLeft
              }>

              <TouchableOpacity
                style={
                  styles.menuButton
                }
                onPress={() =>
                  setDrawerVisible(
                    true,
                  )
                }>

                <Ionicons
                  name="menu-outline"
                  size={26}
                  color="#333333"
                />

              </TouchableOpacity>

              <View>

                <Text
                  style={
                    styles.goodMorning
                  }>
                  Good Morning,
                </Text>

                <Text
                  style={
                    styles.userName
                  }>
                  {userName}
                </Text>

              </View>

            </View>

            <TouchableOpacity
              style={
                styles.notificationButton
              }
              onPress={() =>
                navigation.navigate(
                  'Notifications',
                )
              }>

              <Ionicons
                name="notifications-outline"
                size={23}
                color="#333333"
              />

              <View
                style={
                  styles.notificationDot
                }
              />

            </TouchableOpacity>

          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'MyMembership',
              )
            }>

            <View
              style={
                styles.membershipCard
              }>

              <View
                style={
                  styles.membershipTop
                }>

                <View
                  style={
                    styles.membershipIcon
                  }>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4169D8"
                  />
                </View>

                <View
                  style={
                    styles.membershipInfo
                  }>

                  <Text
                    style={
                      styles.membershipTitle
                    }>
                    Membership
                  </Text>

                  <View
                    style={
                      styles.activeRow
                    }>

                    <View
                      style={
                        styles.activeDot
                      }
                    />

                    <Text
                      style={
                        styles.activeText
                      }>
                      Active
                    </Text>

                  </View>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.membershipDivider
                }
              />

              <View
                style={
                  styles.membershipBottom
                }>

                <View>

                  <Text
                    style={
                      styles.smallLabel
                    }>
                    Plan
                  </Text>

                  <Text
                    style={
                      styles.smallValue
                    }>
                    Yearly Membership
                  </Text>

                </View>

                <View>

                  <Text
                    style={
                      styles.smallLabel
                    }>
                    Expires
                  </Text>

                  <Text
                    style={
                      styles.smallValue
                    }>
                    25 Dec 2026
                  </Text>

                </View>

              </View>

            </View>

          </TouchableOpacity>

          <View
            style={
              styles.sectionHeader
            }>

            <Text
              style={
                styles.sectionTitle
              }>
              Today's Workout
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Workout',
                )
              }>

              <Text
                style={
                  styles.seeAll
                }>
                See All
              </Text>

            </TouchableOpacity>

          </View>

          {loadingWorkout ? (

            <View
              style={
                styles.emptyWorkoutCard
              }>

              <View
                style={
                  styles.emptyWorkoutIcon
                }>

                <Ionicons
                  name="barbell-outline"
                  size={32}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.emptyWorkoutTitle
                }>
                Loading Workout
              </Text>

              <Text
                style={
                  styles.emptyWorkoutText
                }>
                Loading your workout plans...
              </Text>

            </View>

          ) : latestWorkout ? (

            renderWorkoutPlan(
              latestWorkout,
              0,
            )

          ) : (

            <View
              style={
                styles.emptyWorkoutCard
              }>

              <View
                style={
                  styles.emptyWorkoutIcon
                }>

                <Ionicons
                  name="barbell-outline"
                  size={32}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.emptyWorkoutTitle
                }>
                No Workout Plan
              </Text>

              <Text
                style={
                  styles.emptyWorkoutText
                }>
                Your trainer has not assigned
                a workout plan yet.
              </Text>

              <TouchableOpacity
                style={
                  styles.emptyWorkoutButton
                }
                onPress={() =>
                  navigation.navigate(
                    'Workout',
                  )
                }>

                <Text
                  style={
                    styles.emptyWorkoutButtonText
                  }>
                  View Workout
                </Text>

              </TouchableOpacity>

            </View>
          )}

          <Text
            style={
              styles.sectionTitle
            }>
            Quick Access
          </Text>

          <View
            style={
              styles.quickGrid
            }>

            <TouchableOpacity
              style={
                styles.quickCard
              }
              onPress={() =>
                navigation.navigate(
                  'Attendance',
                )
              }>

              <View
                style={[
                  styles.quickIcon,
                  styles.blueIcon,
                ]}>

                <Ionicons
                  name="qr-code-outline"
                  size={23}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.quickTitle
                }>
                Attendance
              </Text>

              <Text
                style={
                  styles.quickSubtitle
                }>
                Check in
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.quickCard
              }
              onPress={() =>
                navigation.navigate(
                  'MemberDietPlan',
                )
              }>

              <View
                style={[
                  styles.quickIcon,
                  styles.greenIcon,
                ]}>

                <Ionicons
                  name="restaurant-outline"
                  size={23}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.quickTitle
                }>
                Diet
              </Text>

              <Text
                style={
                  styles.quickSubtitle
                }>
                Today's plan
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.quickCard
              }
              onPress={() =>
                navigation.navigate(
                  'Progress',
                )
              }>

              <View
                style={[
                  styles.quickIcon,
                  styles.purpleIcon,
                ]}>

                <Ionicons
                  name="trending-up-outline"
                  size={23}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.quickTitle
                }>
                Progress
              </Text>

              <Text
                style={
                  styles.quickSubtitle
                }>
                View progress
              </Text>

            </TouchableOpacity>

          </View>

          <View
            style={
              styles.sectionHeader
            }>

            <Text
              style={
                styles.sectionTitle
              }>
              Today's Progress
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Progress',
                )
              }>

              <Text
                style={
                  styles.seeAll
                }>
                Details
              </Text>

            </TouchableOpacity>

          </View>

          <View
            style={
              styles.progressCard
            }>

            <View
              style={
                styles.progressItem
              }>

              <View
                style={
                  styles.progressIcon
                }>

                <Ionicons
                  name="flame-outline"
                  size={22}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.progressInfo
                }>

                <Text
                  style={
                    styles.progressTitle
                  }>
                  Calories
                </Text>

                <Text
                  style={
                    styles.progressValue
                  }>
                  420 kcal
                </Text>

              </View>

              <Text
                style={
                  styles.progressTarget
                }>
                / 600
              </Text>

            </View>

            <View
              style={
                styles.progressBarBackground
              }>

              <View
                style={[
                  styles.progressBar,
                  {
                    width: '70%',
                  },
                ]}
              />

            </View>

            <View
              style={
                styles.progressItem
              }>

              <View
                style={
                  styles.progressIcon
                }>

                <Ionicons
                  name="water-outline"
                  size={22}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.progressInfo
                }>

                <Text
                  style={
                    styles.progressTitle
                  }>
                  Water
                </Text>

                <Text
                  style={
                    styles.progressValue
                  }>
                  5 glasses
                </Text>

              </View>

              <Text
                style={
                  styles.progressTarget
                }>
                / 8
              </Text>

            </View>

            <View
              style={
                styles.progressBarBackground
              }>

              <View
                style={[
                  styles.progressBar,
                  {
                    width: '62%',
                  },
                ]}
              />

            </View>

          </View>

          <View
            style={
              styles.bottomSpace
            }
          />

        </ScrollView>

        <MemberDrawerMenu
          visible={drawerVisible}
          onClose={() =>
            setDrawerVisible(false)
          }
          navigation={navigation}
          activeScreen="MemberDashboard"
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

  mainContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 11,
  },

  goodMorning: {
    color: '#777777',
    fontSize: 13,
    marginBottom: 3,
  },

  userName: {
    color: '#333333',
    fontSize: 24,
    fontWeight: '700',
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4169D8',
    top: 9,
    right: 10,
  },

  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    marginBottom: 23,
  },

  membershipTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  membershipIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  membershipInfo: {
    flex: 1,
    marginLeft: 12,
  },

  membershipTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2DBE72',
    marginRight: 6,
  },

  activeText: {
    color: '#2DBE72',
    fontSize: 12,
    fontWeight: '600',
  },

  membershipDivider: {
    height: 1,
    backgroundColor: '#E8EBEF',
    marginVertical: 14,
  },

  membershipBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallLabel: {
    color: '#999999',
    fontSize: 10,
    marginBottom: 4,
  },

  smallValue: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 11,
  },

  seeAll: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '600',
  },

  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 15,
    marginBottom: 16,
  },

  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  workoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  workoutInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  workoutTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  workoutSubtitle: {
    color: '#777777',
    fontSize: 11,
  },

  workoutTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeText: {
    color: '#777777',
    fontSize: 11,
    marginLeft: 4,
  },

  exerciseRow: {
    minHeight: 43,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  exerciseNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  exerciseNumberText: {
    color: '#4169D8',
    fontSize: 11,
    fontWeight: '700',
  },

  exerciseName: {
    flex: 1,
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  exerciseSets: {
    color: '#777777',
    fontSize: 11,
    marginLeft: 8,
  },

  startWorkoutButton: {
    height: 45,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  startWorkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 7,
  },

  emptyWorkoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 25,
    marginBottom: 23,
    alignItems: 'center',
  },

  emptyWorkoutIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyWorkoutTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyWorkoutText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  emptyWorkoutButton: {
    height: 42,
    paddingHorizontal: 22,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  emptyWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
  },

  quickCard: {
    width: '31.5%',
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 11,
  },

  quickIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  blueIcon: {
    backgroundColor: '#EAF0FF',
  },

  greenIcon: {
    backgroundColor: '#EAF0FF',
  },

  purpleIcon: {
    backgroundColor: '#EAF0FF',
  },

  quickTitle: {
    color: '#333333',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },

  quickSubtitle: {
    color: '#888888',
    fontSize: 9,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 15,
  },

  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressInfo: {
    flex: 1,
    marginLeft: 11,
  },

  progressTitle: {
    color: '#555555',
    fontSize: 11,
    marginBottom: 3,
  },

  progressValue: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
  },

  progressTarget: {
    color: '#999999',
    fontSize: 11,
  },

  progressBarBackground: {
    height: 6,
    backgroundColor: '#E8EBF0',
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },

  progressBar: {
    height: 6,
    backgroundColor: '#4169D8',
    borderRadius: 3,
  },

  bottomSpace: {
    height: 20,
  },
});

export default MemberDashboardScreen;
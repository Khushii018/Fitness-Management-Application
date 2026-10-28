import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {
  setWorkoutHistory,
} from '../redux/slices/memberSlice';

const BLUE = '#4169D8';
const GREEN = '#22C55E';

const CompleteExerciseScreen = ({
  navigation,
  route,
}) => {
  const {
    exercise,
    exerciseIndex = 0,
    workout,
    memberName,
  } = route.params || {};

  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user,
  );

  const workoutHistory = useSelector(
    state =>
      state.member?.workoutHistory || [],
  );

  const getExerciseName = () => {
    return (
      exercise?.name ||
      exercise?.exerciseName ||
      exercise?.title ||
      'Exercise'
    );
  };

  const getExerciseId = () => {
    return (
      exercise?.id ||
      exercise?._id ||
      exercise?.exerciseId ||
      null
    );
  };

  const getSets = () => {
    return Number(
      exercise?.sets ||
        exercise?.set ||
        1,
    );
  };

  const getReps = () => {
    return Number(
      exercise?.reps ||
        exercise?.rep ||
        0,
    );
  };

  const getDuration = () => {
    return (
      exercise?.duration ||
      workout?.duration ||
      '45 min'
    );
  };

  const getCalories = () => {
    return (
      exercise?.calories ||
      workout?.calories ||
      '350 kcal'
    );
  };

  const getExerciseCount = () => {
    if (
      Array.isArray(
        workout?.exercises,
      )
    ) {
      return workout.exercises.length;
    }

    return 1;
  };

  const getTotalSets = () => {
    if (
      Array.isArray(
        workout?.exercises,
      )
    ) {
      return workout.exercises.reduce(
        (total, item) => {
          return (
            total +
            Number(
              item?.sets ||
                item?.set ||
                0,
            )
          );
        },
        0,
      );
    }

    return getSets();
  };

  const getMemberId = () => {
    return String(
      authUser?.id ||
        authUser?.memberId ||
        authUser?.userId ||
        authUser?._id ||
        'default',
    );
  };

  const getWorkoutId = () => {
    return String(
      workout?.id ||
        workout?._id ||
        `${workout?.planName || 'Workout Plan'}-${
          workout?.createdAt || ''
        }`,
    );
  };

  const isAlreadyCompleted = item => {
    if (
      item?.completed !== true
    ) {
      return false;
    }

    const currentWorkoutId =
      getWorkoutId();

    const savedWorkoutId =
      item?.workoutId ||
      item?.workout?.id ||
      item?.workout?._id ||
      '';

    if (
      !currentWorkoutId ||
      !savedWorkoutId ||
      String(
        currentWorkoutId,
      ) !==
        String(
          savedWorkoutId,
        )
    ) {
      return false;
    }

    if (
      item?.exerciseIndex !==
        undefined &&
      item?.exerciseIndex !==
        null &&
      Number(
        item.exerciseIndex,
      ) ===
        Number(
          exerciseIndex,
        )
    ) {
      return true;
    }

    const currentExerciseId =
      getExerciseId();

    const savedExerciseId =
      item?.exercise?.id ||
      item?.exercise?._id ||
      item?.exerciseId ||
      null;

    if (
      currentExerciseId &&
      savedExerciseId &&
      String(
        currentExerciseId,
      ) ===
        String(
          savedExerciseId,
        )
    ) {
      return true;
    }

    const savedExerciseName =
      item?.exerciseName ||
      item?.exercise?.name ||
      item?.exercise?.exerciseName ||
      item?.exercise?.title ||
      '';

    if (
      savedExerciseName &&
      savedExerciseName
        .trim()
        .toLowerCase() ===
        getExerciseName()
          .trim()
          .toLowerCase()
    ) {
      return true;
    }

    return false;
  };

  const handleSave = () => {
    try {
      if (!authUser) {
        Alert.alert(
          'Error',
          'Logged-in user could not be found.',
        );

        return;
      }

      const memberId =
        getMemberId();

      const existingHistory =
        Array.isArray(
          workoutHistory,
        )
          ? workoutHistory
          : [];

      const alreadyCompleted =
        existingHistory.some(item =>
          isAlreadyCompleted(item),
        );

      if (alreadyCompleted) {
        navigation.navigate(
          'MemberWorkout',
        );

        return;
      }

      const workoutId =
        getWorkoutId();

      const completedExercise = {
        id: `${Date.now()}-${Math.random()}`,

        completed: true,

        completedAt:
          new Date().toISOString(),

        workoutId,

        planName:
          workout?.planName ||
          "Today's Workout",

        workoutName:
          workout?.planName ||
          "Today's Workout",

        memberId:
          String(memberId),

        memberName:
          memberName ||
          workout?.memberName ||
          authUser?.name ||
          authUser?.fullName ||
          authUser?.username ||
          '',

        exerciseIndex:
          Number(
            exerciseIndex,
          ),

        exerciseId:
          getExerciseId(),

        exercise: {
          ...exercise,
        },

        exerciseName:
          getExerciseName(),

        sets:
          getSets(),

        reps:
          getReps(),

        duration:
          getDuration(),

        calories:
          getCalories(),

        rest:
          exercise?.rest ||
          exercise?.restTime ||
          '',

        exercises:
          Array.isArray(
            workout?.exercises,
          )
            ? workout.exercises
            : [exercise],

        totalSets:
          getTotalSets(),

        exerciseCount:
          getExerciseCount(),
      };

      const updatedHistory = [
        completedExercise,
        ...existingHistory,
      ];

      dispatch(
        setWorkoutHistory(
          updatedHistory,
        ),
      );

      navigation.navigate(
        'MemberWorkout',
      );
    } catch (error) {
      console.log(
        'Error saving completed exercise:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save the completed exercise. Please try again.',
      );
    }
  };

  const exerciseName =
    getExerciseName();

  const duration =
    getDuration();

  const calories =
    getCalories();

  const exerciseCount =
    getExerciseCount();

  const totalSets =
    getTotalSets();

  const sets =
    getSets();

  const reps =
    getReps();

  return (
    <SafeAreaView
      style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }>

        <View
          style={styles.header}>

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.8}>

            <Ionicons
              name="arrow-back"
              size={20}
              color="#333333"
            />

          </TouchableOpacity>

          <View
            style={
              styles.headerInfo
            }>

            <Text
              style={
                styles.headerTitle
              }>
              Exercise Complete
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Review your exercise
            </Text>

          </View>

        </View>

        <View
          style={
            styles.completionSection
          }>

          <View
            style={
              styles.successIcon
            }>

            <Ionicons
              name="checkmark"
              size={28}
              color="#FFFFFF"
            />

          </View>

          <Text
            style={
              styles.completionTitle
            }>
            Exercise Completed
          </Text>

          <Text
            style={
              styles.completionText
            }>
            You have successfully
            completed this exercise.
          </Text>

        </View>

        <View
          style={
            styles.exerciseSection
          }>

          <View
            style={
              styles.exerciseIcon
            }>

            <Ionicons
              name="fitness-outline"
              size={24}
              color={BLUE}
            />

          </View>

          <View
            style={
              styles.exerciseInfo
            }>

            <Text
              style={
                styles.exerciseLabel
              }>
              EXERCISE
            </Text>

            <Text
              style={
                styles.exerciseName
              }
              numberOfLines={2}>
              {exerciseName}
            </Text>

            <Text
              style={
                styles.exerciseDetails
              }>
              {sets} sets
              {reps
                ? `  ×  ${reps} reps`
                : ''}
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          Workout Details
        </Text>

        <View
          style={
            styles.detailsContainer
          }>

          <View
            style={styles.detailRow}>

            <View
              style={
                styles.detailLeft
              }>

              <Ionicons
                name="time-outline"
                size={18}
                color={BLUE}
              />

              <Text
                style={
                  styles.detailLabel
                }>
                Duration
              </Text>

            </View>

            <Text
              style={
                styles.detailValue
              }>
              {duration}
            </Text>

          </View>

          <View
            style={
              styles.detailDivider
            }
          />

          <View
            style={styles.detailRow}>

            <View
              style={
                styles.detailLeft
              }>

              <Ionicons
                name="flame-outline"
                size={18}
                color={BLUE}
              />

              <Text
                style={
                  styles.detailLabel
                }>
                Calories
              </Text>

            </View>

            <Text
              style={
                styles.detailValue
              }>
              {calories}
            </Text>

          </View>

          <View
            style={
              styles.detailDivider
            }
          />

          <View
            style={styles.detailRow}>

            <View
              style={
                styles.detailLeft
              }>

              <Ionicons
                name="barbell-outline"
                size={18}
                color={BLUE}
              />

              <Text
                style={
                  styles.detailLabel
                }>
                Exercises
              </Text>

            </View>

            <Text
              style={
                styles.detailValue
              }>
              {exerciseCount}
            </Text>

          </View>

          <View
            style={
              styles.detailDivider
            }
          />

          <View
            style={styles.detailRow}>

            <View
              style={
                styles.detailLeft
              }>

              <Ionicons
                name="layers-outline"
                size={18}
                color={BLUE}
              />

              <Text
                style={
                  styles.detailLabel
                }>
                Total Sets
              </Text>

            </View>

            <Text
              style={
                styles.detailValue
              }>
              {totalSets}
            </Text>

          </View>

        </View>

        <TouchableOpacity
          style={
            styles.saveButton
          }
          onPress={handleSave}
          activeOpacity={0.85}>

          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.saveButtonText
            }>
            Save Completed Exercise
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.backWorkoutButton
          }
          onPress={() =>
            navigation.navigate(
              'MemberWorkout',
            )
          }
          activeOpacity={0.8}>

          <Ionicons
            name="arrow-back-outline"
            size={17}
            color={BLUE}
          />

          <Text
            style={
              styles.backWorkoutText
            }>
            Back to Workout
          </Text>

        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F7F8FA',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 35,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D9DDE3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    headerInfo: {
      flex: 1,
    },

    headerTitle: {
      color: '#333333',
      fontSize: 19,
      fontWeight: '700',
    },

    headerSubtitle: {
      color: '#888888',
      fontSize: 11,
      marginTop: 3,
    },

    completionSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#D9DDE3',
      paddingVertical: 25,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 16,
    },

    successIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 13,
    },

    completionTitle: {
      color: '#333333',
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 5,
    },

    completionText: {
      color: '#777777',
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },

    exerciseSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#D9DDE3',
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },

    exerciseIcon: {
      width: 48,
      height: 48,
      borderRadius: 13,
      backgroundColor: '#EAF0FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    exerciseInfo: {
      flex: 1,
    },

    exerciseLabel: {
      color: '#888888',
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.6,
      marginBottom: 4,
    },

    exerciseName: {
      color: '#333333',
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 20,
    },

    exerciseDetails: {
      color: '#888888',
      fontSize: 10,
      marginTop: 4,
    },

    sectionTitle: {
      color: '#333333',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 10,
    },

    detailsContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#D9DDE3',
      paddingHorizontal: 14,
      marginBottom: 18,
    },

    detailRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    detailLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    detailLabel: {
      color: '#666666',
      fontSize: 12,
      marginLeft: 9,
    },

    detailValue: {
      color: '#333333',
      fontSize: 12,
      fontWeight: '700',
    },

    detailDivider: {
      height: 1,
      backgroundColor: '#ECEEF1',
    },

    saveButton: {
      height: 46,
      borderRadius: 11,
      backgroundColor: BLUE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 7,
    },

    backWorkoutButton: {
      height: 46,
      borderRadius: 11,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D9DDE3',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backWorkoutText: {
      color: BLUE,
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 6,
    },
  });

export default CompleteExerciseScreen;
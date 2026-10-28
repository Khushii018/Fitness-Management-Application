import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

const MemberExerciseScreen = ({navigation, route}) => {
  const {
    exercise: passedExercise,
    exerciseIndex = 0,
    workout,
    memberName,
  } = route.params || {};

  const selectedExercise = passedExercise || {};

  const workoutExercises = Array.isArray(workout?.exercises)
    ? workout.exercises
    : [];

  const getExerciseName = () => {
    return (
      selectedExercise?.name ||
      selectedExercise?.exerciseName ||
      selectedExercise?.title ||
      'Exercise'
    );
  };

  const getSets = () => {
    return selectedExercise?.sets || selectedExercise?.set || '';
  };

  const getReps = () => {
    return selectedExercise?.reps || selectedExercise?.rep || '';
  };

  const getRest = () => {
    return selectedExercise?.rest || selectedExercise?.restTime || '';
  };

  const getDuration = () => {
    return selectedExercise?.duration || '';
  };

  const getExerciseIcon = () => {
    const name = String(getExerciseName()).toLowerCase();

    if (
      name.includes('bench') ||
      name.includes('press') ||
      name.includes('chest')
    ) {
      return 'barbell-outline';
    }

    if (
      name.includes('squat') ||
      name.includes('leg') ||
      name.includes('lunge')
    ) {
      return 'fitness-outline';
    }

    if (
      name.includes('curl') ||
      name.includes('arm') ||
      name.includes('bicep') ||
      name.includes('tricep')
    ) {
      return 'body-outline';
    }

    if (
      name.includes('run') ||
      name.includes('walk') ||
      name.includes('cardio')
    ) {
      return 'walk-outline';
    }

    if (
      name.includes('plank') ||
      name.includes('core') ||
      name.includes('abs')
    ) {
      return 'accessibility-outline';
    }

    if (name.includes('stretch') || name.includes('yoga')) {
      return 'body-outline';
    }

    return 'barbell-outline';
  };

  const exerciseName = getExerciseName();
  const sets = getSets();
  const reps = getReps();
  const rest = getRest();
  const duration = getDuration();

  const totalExercises =
    workoutExercises.length > 0 ? workoutExercises.length : 1;

  const handleStartExercise = () => {
    navigation.navigate('CompleteExercise', {
      exercise: {
        ...selectedExercise,
      },
      exerciseIndex,
      workout: {
        ...workout,
        exercises:
          workoutExercises.length > 0
            ? workoutExercises
            : [selectedExercise],
      },
      memberName,
    });
  };

  const StatItem = ({icon, label, value, unit}) => {
    return (
      <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={20} color="#4169D8" />
        </View>

        <Text style={styles.statLabel}>{label}</Text>

        <Text style={styles.statValue}>{value || '—'}</Text>

        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F8FA"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Ionicons
              name="arrow-back"
              size={21}
              color="#333333"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Exercise Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.exerciseCard}>
          <View style={styles.exerciseIcon}>
            <Ionicons
              name={getExerciseIcon()}
              size={28}
              color="#4169D8"
            />
          </View>

          <View style={styles.exerciseInfo}>
            <Text style={styles.smallLabel}>EXERCISE</Text>

            <Text style={styles.exerciseName}>
              {exerciseName}
            </Text>

            <Text style={styles.exerciseNumber}>
              Exercise {exerciseIndex + 1} of {totalExercises}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Workout Details</Text>

        <View style={styles.statsCard}>
          <StatItem
            icon="layers-outline"
            label="SETS"
            value={sets}
          />

          <View style={styles.divider} />

          <StatItem
            icon="repeat-outline"
            label="REPS"
            value={reps}
          />

          <View style={styles.divider} />

          <StatItem
            icon="pause-outline"
            label="REST"
            value={rest}
            unit={rest ? 'sec' : ''}
          />

          <View style={styles.divider} />

          <StatItem
            icon="time-outline"
            label="TIME"
            value={duration}
          />
        </View>

        {selectedExercise?.notes ? (
          <>
            <Text style={styles.sectionTitle}>Trainer Note</Text>

            <View style={styles.notesCard}>
              <View style={styles.notesIcon}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={21}
                  color="#4169D8"
                />
              </View>

              <Text style={styles.notesText}>
                {selectedExercise.notes}
              </Text>
            </View>
          </>
        ) : null}

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartExercise}
          activeOpacity={0.85}>

          <View style={styles.playIcon}>
            <Ionicons
              name="play"
              size={17}
              color="#4169D8"
            />
          </View>

          <Text style={styles.startButtonText}>
            Start Exercise
          </Text>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Follow your assigned sets and repetitions.
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#333333',
    fontSize: 18,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 42,
  },

  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  exerciseIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  exerciseInfo: {
    flex: 1,
  },

  smallLabel: {
    color: '#8A919C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  exerciseName: {
    color: '#333333',
    fontSize: 21,
    fontWeight: '800',
  },

  exerciseNumber: {
    color: '#8A919C',
    fontSize: 11,
    marginTop: 5,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingVertical: 15,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  statLabel: {
    color: '#8A919C',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  statValue: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '800',
  },

  statUnit: {
    color: '#8A919C',
    fontSize: 8,
    marginTop: 1,
  },

  divider: {
    width: 1,
    height: 52,
    backgroundColor: '#E6E8EC',
  },

  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  notesIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  notesText: {
    flex: 1,
    color: '#555D68',
    fontSize: 12,
    lineHeight: 19,
    paddingTop: 2,
  },

  startButton: {
    height: 58,
    borderRadius: 14,
    backgroundColor: '#4169D8',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  startButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    color: '#8A919C',
    fontSize: 10,
    marginTop: 12,
  },
});

export default MemberExerciseScreen;
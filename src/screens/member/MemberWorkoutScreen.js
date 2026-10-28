import React, {useCallback, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {useFocusEffect} from '@react-navigation/native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

const MemberWorkoutScreen = ({navigation}) => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedWorkout, setSelectedWorkout] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState('');

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const reduxWorkoutPlans = useSelector(
    state => state.trainer?.workoutPlans || [],
  );

  const loadMemberWorkout = () => {
    try {
      setLoading(true);

      const loggedInUser = authUser;

      if (!loggedInUser) {
        setWorkoutPlans([]);
        setSelectedWorkout(null);
        setMemberName('');
        return;
      }

      const membersFromRedux =
        Array.isArray(reduxMembers)
          ? reduxMembers
          : [];

      const uniqueMembers =
        membersFromRedux.filter(
          (member, index, array) =>
            index ===
            array.findIndex(
              item =>
                String(item?.id) ===
                String(member?.id),
            ),
        );

      const loggedInMemberId = String(
        loggedInUser?.memberId || '',
      ).trim();

      const loggedInEmail = String(
        loggedInUser?.email || '',
      )
        .trim()
        .toLowerCase();

      const loggedInMobile = String(
        loggedInUser?.mobile || '',
      ).trim();

      const currentMember =
        uniqueMembers.find(member => {
          const memberIdValue = String(
            member?.id || '',
          ).trim();

          const memberEmail = String(
            member?.email || '',
          )
            .trim()
            .toLowerCase();

          const memberMobile = String(
            member?.mobile || '',
          ).trim();

          return (
            (loggedInMemberId &&
              memberIdValue &&
              loggedInMemberId ===
                memberIdValue) ||
            (loggedInEmail &&
              memberEmail &&
              loggedInEmail ===
                memberEmail) ||
            (loggedInMobile &&
              memberMobile &&
              loggedInMobile ===
                memberMobile)
          );
        }) || null;

      const memberId =
        currentMember?.id ||
        loggedInUser?.memberId ||
        null;

      const name =
        currentMember?.name ||
        currentMember?.fullName ||
        loggedInUser?.fullName ||
        loggedInUser?.name ||
        'Member';

      const memberEmail =
        currentMember?.email ||
        loggedInUser?.email ||
        '';

      const memberMobile =
        currentMember?.mobile ||
        loggedInUser?.mobile ||
        '';

      setMemberName(name);

      const reduxPlans =
        Array.isArray(reduxWorkoutPlans)
          ? reduxWorkoutPlans
          : [];

      const uniqueWorkoutPlans =
        reduxPlans.filter(
          (plan, index, array) =>
            index ===
            array.findIndex(
              item =>
                String(item?.id) ===
                String(plan?.id),
            ),
        );

      const currentMemberId = String(
        memberId || '',
      ).trim();

      const currentMemberEmail = String(
        memberEmail || '',
      )
        .trim()
        .toLowerCase();

      const currentMemberMobile = String(
        memberMobile || '',
      ).trim();

      const filteredWorkoutPlans =
        uniqueWorkoutPlans.filter(plan => {
          const planMemberId = String(
            plan?.memberId || '',
          ).trim();

          const planMemberEmail = String(
            plan?.memberEmail || '',
          )
            .trim()
            .toLowerCase();

          const planMemberMobile = String(
            plan?.memberMobile || '',
          ).trim();

          const idMatches =
            currentMemberId &&
            planMemberId &&
            currentMemberId ===
              planMemberId;

          const emailMatches =
            currentMemberEmail &&
            planMemberEmail &&
            currentMemberEmail ===
              planMemberEmail;

          const mobileMatches =
            currentMemberMobile &&
            planMemberMobile &&
            currentMemberMobile ===
              planMemberMobile;

          return (
            idMatches ||
            emailMatches ||
            mobileMatches
          );
        });

      const sortedWorkoutPlans =
        [...filteredWorkoutPlans].sort(
          (a, b) => {
            const dateA = new Date(
              a?.createdAt || 0,
            ).getTime();

            const dateB = new Date(
              b?.createdAt || 0,
            ).getTime();

            return dateB - dateA;
          },
        );

      setWorkoutPlans(
        sortedWorkoutPlans,
      );

      if (
        sortedWorkoutPlans.length > 0
      ) {
        setSelectedWorkout(
          sortedWorkoutPlans[0],
        );
      } else {
        setSelectedWorkout(null);
      }
    } catch (error) {
      console.log(
        'Load member workout error:',
        error,
      );

      setWorkoutPlans([]);
      setSelectedWorkout(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMemberWorkout();
    }, [
      authUser,
      reduxMembers,
      reduxWorkoutPlans,
    ]),
  );

  const getDifficultyStyle =
    difficulty => {
      if (
        String(difficulty)
          .toLowerCase() === 'easy'
      ) {
        return styles.easyBadge;
      }

      if (
        String(difficulty)
          .toLowerCase() === 'hard'
      ) {
        return styles.hardBadge;
      }

      return styles.mediumBadge;
    };

  const getDifficultyTextStyle =
    difficulty => {
      if (
        String(difficulty)
          .toLowerCase() === 'easy'
      ) {
        return styles.easyText;
      }

      if (
        String(difficulty)
          .toLowerCase() === 'hard'
      ) {
        return styles.hardText;
      }

      return styles.mediumText;
    };

  const renderExercise = (
    exercise,
    index,
  ) => {
    const exerciseName =
      exercise?.name ||
      exercise?.exerciseName ||
      exercise?.title ||
      'Exercise';

    const sets =
      exercise?.sets ||
      exercise?.set ||
      '';

    const reps =
      exercise?.reps ||
      exercise?.rep ||
      '';

    const duration =
      exercise?.duration ||
      '';

    const rest =
      exercise?.rest ||
      exercise?.restTime ||
      '';

    return (
      <View
        key={
          exercise?.id ||
          `${exerciseName}-${index}`
        }
        style={styles.exerciseCard}>

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

        <View
          style={
            styles.exerciseContent
          }>

          <Text
            style={
              styles.exerciseName
            }>
            {exerciseName}
          </Text>

          <View
            style={
              styles.exerciseDetails
            }>

            {sets !== '' && (
              <View
                style={
                  styles.exerciseDetail
                }>
                <Ionicons
                  name="layers-outline"
                  size={14}
                  color="#777777"
                />

                <Text
                  style={
                    styles.exerciseDetailText
                  }>
                  {sets} sets
                </Text>
              </View>
            )}

            {reps !== '' && (
              <View
                style={
                  styles.exerciseDetail
                }>
                <Ionicons
                  name="repeat-outline"
                  size={14}
                  color="#777777"
                />

                <Text
                  style={
                    styles.exerciseDetailText
                  }>
                  {reps} reps
                </Text>
              </View>
            )}

            {duration !== '' && (
              <View
                style={
                  styles.exerciseDetail
                }>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#777777"
                />

                <Text
                  style={
                    styles.exerciseDetailText
                  }>
                  {duration}
                </Text>
              </View>
            )}

            {rest !== '' && (
              <View
                style={
                  styles.exerciseDetail
                }>
                <Ionicons
                  name="pause-outline"
                  size={14}
                  color="#777777"
                />

                <Text
                  style={
                    styles.exerciseDetailText
                  }>
                  Rest {rest}
                </Text>
              </View>
            )}

          </View>

          {exercise?.notes && (
            <Text
              style={
                styles.exerciseNotes
              }>
              {exercise.notes}
            </Text>
          )}

        </View>

      </View>
    );
  };

  if (loading) {
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

          <ActivityIndicator
            size="large"
            color="#4169D8"
          />

          <Text
            style={
              styles.loadingText
            }>
            Loading your workout...
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
          styles.scrollContent
        }>

        <View
          style={styles.header}>

          <View>

            <Text
              style={
                styles.headerSubtitle
              }>
              Your Workout
            </Text>

            <Text
              style={styles.headerTitle}>
              {memberName}
            </Text>

          </View>

          <TouchableOpacity
            style={
              styles.refreshButton
            }
            onPress={
              loadMemberWorkout
            }
            activeOpacity={0.8}>

            <Ionicons
              name="refresh-outline"
              size={22}
              color="#4169D8"
            />

          </TouchableOpacity>

        </View>

        {workoutPlans.length === 0 ? (

          <View
            style={
              styles.emptyCard
            }>

            <View
              style={
                styles.emptyIcon
              }>

              <Ionicons
                name="barbell-outline"
                size={34}
                color="#4169D8"
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No Workout Plan
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your trainer has not assigned
              a workout plan yet.
            </Text>

          </View>

        ) : (

          <>

            <Text
              style={
                styles.sectionTitle
              }>
              My Workout Plans
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.planList
              }>

              {workoutPlans.map(
                (plan, index) => {

                  const isSelected =
                    selectedWorkout?.id ===
                    plan?.id;

                  return (
                    <TouchableOpacity
                      key={
                        plan?.id ||
                        `plan-${index}`
                      }
                      style={[
                        styles.planCard,
                        isSelected &&
                          styles.selectedPlanCard,
                      ]}
                      onPress={() =>
                        setSelectedWorkout(
                          plan,
                        )
                      }
                      activeOpacity={0.8}>

                      <View
                        style={[
                          styles.planIcon,
                          isSelected &&
                            styles.selectedPlanIcon,
                        ]}>

                        <Ionicons
                          name="barbell-outline"
                          size={22}
                          color={
                            isSelected
                              ? '#FFFFFF'
                              : '#4169D8'
                          }
                        />

                      </View>

                      <Text
                        numberOfLines={2}
                        style={[
                          styles.planTitle,
                          isSelected &&
                            styles.selectedPlanTitle,
                        ]}>
                        {plan?.planName ||
                          'Workout Plan'}
                      </Text>

                      <Text
                        style={[
                          styles.planDate,
                          isSelected &&
                            styles.selectedPlanDate,
                        ]}>
                        {plan?.createdAt
                          ? new Date(
                              plan.createdAt,
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )
                          : 'Workout'}
                      </Text>

                    </TouchableOpacity>
                  );
                },
              )}

            </ScrollView>

            {selectedWorkout && (
              <>

                <View
                  style={
                    styles.workoutSummaryCard
                  }>

                  <View
                    style={
                      styles.workoutSummaryTop
                    }>

                    <View
                      style={
                        styles.summaryIcon
                      }>

                      <Ionicons
                        name="barbell"
                        size={27}
                        color="#4169D8"
                      />

                    </View>

                    <View
                      style={
                        styles.summaryInfo
                      }>

                      <Text
                        style={
                          styles.workoutPlanName
                        }>
                        {selectedWorkout?.planName ||
                          'Workout Plan'}
                      </Text>

                      <Text
                        style={
                          styles.workoutMember
                        }>
                        Assigned to {memberName}
                      </Text>

                    </View>

                  </View>

                  {selectedWorkout?.description && (
                    <Text
                      style={
                        styles.description
                      }>
                      {
                        selectedWorkout.description
                      }
                    </Text>
                  )}

                  <View
                    style={
                      styles.statsRow
                    }>

                    <View
                      style={
                        styles.statBox
                      }>

                      <Ionicons
                        name="time-outline"
                        size={18}
                        color="#4169D8"
                      />

                      <Text
                        style={
                          styles.statLabel
                        }>
                        Duration
                      </Text>

                      <Text
                        style={
                          styles.statValue
                        }>
                        {selectedWorkout?.duration ||
                          '-'}
                      </Text>

                    </View>

                    <View
                      style={
                        styles.statBox
                      }>

                      <Ionicons
                        name="fitness-outline"
                        size={18}
                        color="#4169D8"
                      />

                      <Text
                        style={
                          styles.statLabel
                        }>
                        Difficulty
                      </Text>

                      <View
                        style={[
                          styles.difficultyBadge,
                          getDifficultyStyle(
                            selectedWorkout?.difficulty,
                          ),
                        ]}>

                        <Text
                          style={[
                            styles.difficultyText,
                            getDifficultyTextStyle(
                              selectedWorkout?.difficulty,
                            ),
                          ]}>
                          {selectedWorkout?.difficulty ||
                            'Medium'}
                        </Text>

                      </View>

                    </View>

                    <View
                      style={
                        styles.statBox
                      }>

                      <Ionicons
                        name="list-outline"
                        size={18}
                        color="#4169D8"
                      />

                      <Text
                        style={
                          styles.statLabel
                        }>
                        Exercises
                      </Text>

                      <Text
                        style={
                          styles.statValue
                        }>
                        {Array.isArray(
                          selectedWorkout?.exercises,
                        )
                          ? selectedWorkout.exercises
                              .length
                          : 0}
                      </Text>

                    </View>

                  </View>

                </View>

                <View
                  style={
                    styles.exerciseSectionHeader
                  }>

                  <Text
                    style={
                      styles.sectionTitle
                    }>
                    Exercises
                  </Text>

                  <Text
                    style={
                      styles.exerciseCount
                    }>
                    {Array.isArray(
                      selectedWorkout?.exercises,
                    )
                      ? selectedWorkout.exercises
                          .length
                      : 0}{' '}
                    exercises
                  </Text>

                </View>

                {Array.isArray(
                  selectedWorkout?.exercises,
                ) &&
                selectedWorkout.exercises
                  .length > 0 ? (

                  selectedWorkout.exercises.map(
                    renderExercise,
                  )

                ) : (

                  <View
                    style={
                      styles.noExerciseCard
                    }>

                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color="#777777"
                    />

                    <Text
                      style={
                        styles.noExerciseText
                      }>
                      No exercises have been
                      added to this plan.
                    </Text>

                  </View>

                )}

                {selectedWorkout?.trainerNotes && (
                  <View
                    style={
                      styles.notesCard
                    }>

                    <View
                      style={
                        styles.notesHeader
                      }>

                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color="#4169D8"
                      />

                      <Text
                        style={
                          styles.notesTitle
                        }>
                        Trainer Notes
                      </Text>

                    </View>

                    <Text
                      style={
                        styles.notesText
                      }>
                      {
                        selectedWorkout.trainerNotes
                      }
                    </Text>

                  </View>
                )}

              </>
            )}

          </>
        )}

        <View
          style={
            styles.bottomSpace
          }
        />

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerSubtitle: {
    color: '#777777',
    fontSize: 13,
    marginBottom: 4,
  },

  headerTitle: {
    color: '#333333',
    fontSize: 24,
    fontWeight: '700',
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },

  planList: {
    paddingBottom: 18,
  },

  planCard: {
    width: 145,
    minHeight: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 12,
    marginRight: 10,
  },

  selectedPlanCard: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  selectedPlanIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  planTitle: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  selectedPlanTitle: {
    color: '#FFFFFF',
  },

  planDate: {
    color: '#888888',
    fontSize: 10,
  },

  selectedPlanDate: {
    color: '#E8F7F0',
  },

  workoutSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    marginBottom: 23,
  },

  workoutSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  workoutPlanName: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  workoutMember: {
    color: '#777777',
    fontSize: 11,
  },

  description: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statLabel: {
    color: '#888888',
    fontSize: 9,
    marginTop: 5,
    marginBottom: 3,
  },

  statValue: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '700',
  },

  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 1,
  },

  easyBadge: {
    backgroundColor: '#E8F7F0',
  },

  mediumBadge: {
    backgroundColor: '#FFF5DD',
  },

  hardBadge: {
    backgroundColor: '#FFE8E8',
  },

  difficultyText: {
    fontSize: 9,
    fontWeight: '700',
  },

  easyText: {
    color: '#4169D8',
  },

  mediumText: {
    color: '#B07800',
  },

  hardText: {
    color: '#D14343',
  },

  exerciseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  exerciseCount: {
    color: '#888888',
    fontSize: 11,
  },

  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
  },

  exerciseNumber: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  exerciseNumberText: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseName: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 13,
    marginBottom: 4,
  },

  exerciseDetailText: {
    color: '#777777',
    fontSize: 10,
    marginLeft: 4,
  },

  exerciseNotes: {
    color: '#888888',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 15,
    marginTop: 13,
  },

  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  notesTitle: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  notesText: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 19,
  },

  noExerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noExerciseText: {
    color: '#777777',
    fontSize: 12,
    marginLeft: 9,
    flex: 1,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 7,
  },

  emptyText: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#777777',
    fontSize: 13,
    marginTop: 10,
  },

  bottomSpace: {
    height: 20,
  },
});

export default MemberWorkoutScreen;
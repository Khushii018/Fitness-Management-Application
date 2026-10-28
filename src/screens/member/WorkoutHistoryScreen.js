import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {useSelector} from 'react-redux';

const BLUE = '#4169D8';

const WorkoutHistoryScreen = ({
  navigation,
}) => {
  const [history, setHistory] =
    useState([]);

  const [selectedFilter, setSelectedFilter] =
    useState('Week');

  const [loading, setLoading] =
    useState(true);

  const authUser = useSelector(
    state => state.auth?.user,
  );

  const reduxWorkoutHistory =
    useSelector(
      state =>
        state.member?.workoutHistory ||
        [],
    );

  const loadHistory = () => {
    try {
      setLoading(true);

      if (!authUser) {
        setHistory([]);
        return;
      }

      const sourceHistory =
        Array.isArray(
          reduxWorkoutHistory,
        )
          ? reduxWorkoutHistory
          : [];

      const completedExercises =
        sourceHistory.filter(
          item =>
            item?.completed === true,
        );

      completedExercises.sort(
        (a, b) => {
          const dateA =
            new Date(
              a?.completedAt || 0,
            ).getTime();

          const dateB =
            new Date(
              b?.completedAt || 0,
            ).getTime();

          return dateB - dateA;
        },
      );

      setHistory(
        completedExercises,
      );
    } catch (error) {
      console.log(
        'Load workout history error:',
        error,
      );

      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [
      authUser?.id,
      authUser?.memberId,
      authUser?.userId,
      authUser?._id,
      authUser?.email,
      authUser?.mobile,
      reduxWorkoutHistory,
    ]),
  );

  const getExerciseName = item => {
    return (
      item?.exerciseName ||
      item?.exercise?.name ||
      item?.exercise?.exerciseName ||
      item?.exercise?.title ||
      'Exercise'
    );
  };

  const getDateObject = item => {
    if (!item?.completedAt) {
      return null;
    }

    const date =
      new Date(
        item.completedAt,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return null;
    }

    return date;
  };

  const getFilteredHistory = () => {
    if (
      selectedFilter === 'All'
    ) {
      return history;
    }

    const now =
      new Date();

    return history.filter(
      item => {
        const date =
          getDateObject(item);

        if (!date) {
          return false;
        }

        if (
          selectedFilter === 'Week'
        ) {
          const difference =
            now.getTime() -
            date.getTime();

          const sevenDays =
            7 *
            24 *
            60 *
            60 *
            1000;

          return (
            difference >= 0 &&
            difference <=
              sevenDays
          );
        }

        if (
          selectedFilter === 'Month'
        ) {
          return (
            date.getMonth() ===
              now.getMonth() &&
            date.getFullYear() ===
              now.getFullYear()
          );
        }

        return true;
      },
    );
  };

  const filteredHistory =
    getFilteredHistory();

  const getExerciseIcon = item => {
    const name =
      String(
        getExerciseName(item),
      ).toLowerCase();

    if (
      name.includes('run') ||
      name.includes('walk') ||
      name.includes('cardio')
    ) {
      return 'walk-outline';
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
      name.includes('plank') ||
      name.includes('abs') ||
      name.includes('core')
    ) {
      return 'accessibility-outline';
    }

    return 'barbell-outline';
  };

  const getTotalCompleted =
    history.length;

  const getWeekCompleted =
    history.filter(item => {
      const date =
        getDateObject(item);

      if (!date) {
        return false;
      }

      const now =
        new Date();

      const difference =
        now.getTime() -
        date.getTime();

      const sevenDays =
        7 *
        24 *
        60 *
        60 *
        1000;

      return (
        difference >= 0 &&
        difference <=
          sevenDays
      );
    }).length;

  const getMonthCompleted =
    history.filter(item => {
      const date =
        getDateObject(item);

      if (!date) {
        return false;
      }

      const now =
        new Date();

      return (
        date.getMonth() ===
          now.getMonth() &&
        date.getFullYear() ===
          now.getFullYear()
      );
    }).length;

  const formatCompletedDate =
    completedAt => {
      if (!completedAt) {
        return '';
      }

      const date =
        new Date(
          completedAt,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return '';
      }

      return date.toLocaleDateString(
        undefined,
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      );
    };

  const formatCompletedTime =
    completedAt => {
      if (!completedAt) {
        return '';
      }

      const date =
        new Date(
          completedAt,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return '';
      }

      return date.toLocaleTimeString(
        undefined,
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      );
    };

  const renderHistoryCard = (
    item,
    index,
  ) => {
    const exerciseName =
      getExerciseName(item);

    const key =
      item?.id ||
      `${item?.workoutId}-${item?.exerciseIndex}-${index}`;

    return (
      <View
        key={key}
        style={
          styles.historyCard
        }>

        <View
          style={
            styles.cardHeader
          }>

          <View
            style={
              styles.exerciseIconContainer
            }>
            <Ionicons
              name={getExerciseIcon(
                item,
              )}
              size={23}
              color={BLUE}
            />
          </View>

          <View
            style={
              styles.exerciseInfo
            }>

            <Text
              style={
                styles.exerciseName
              }
              numberOfLines={2}>
              {exerciseName}
            </Text>

            <View
              style={
                styles.completedTextRow
              }>

              <Ionicons
                name="checkmark-circle"
                size={13}
                color={BLUE}
              />

              <Text
                style={
                  styles.completedText
                }>
                Completed
              </Text>

            </View>

          </View>

          <View
            style={
              styles.completedBadge
            }>

            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.completedBadgeText
              }>
              DONE
            </Text>

          </View>

        </View>

        <View
          style={
            styles.cardDivider
          }
        />

        <View
          style={
            styles.cardDetails
          }>

          <View
            style={
              styles.cardDetailItem
            }>

            <Ionicons
              name="layers-outline"
              size={14}
              color={BLUE}
            />

            <Text
              style={
                styles.cardDetailText
              }>
              {item?.sets || 0} sets
            </Text>

          </View>

          <View
            style={
              styles.cardDetailItem
            }>

            <Ionicons
              name="repeat-outline"
              size={14}
              color={BLUE}
            />

            <Text
              style={
                styles.cardDetailText
              }>
              {item?.reps || 0} reps
            </Text>

          </View>

          <View
            style={
              styles.cardDetailItem
            }>

            <Ionicons
              name="calendar-outline"
              size={14}
              color={BLUE}
            />

            <Text
              style={
                styles.cardDetailText
              }>
              {formatCompletedDate(
                item?.completedAt,
              )}
            </Text>

          </View>

        </View>

        {formatCompletedTime(
          item?.completedAt,
        ) ? (
          <View
            style={
              styles.timeRow
            }>

            <Ionicons
              name="time-outline"
              size={13}
              color="#89938E"
            />

            <Text
              style={
                styles.timeText
              }>
              Completed at{' '}
              {formatCompletedTime(
                item?.completedAt,
              )}
            </Text>

          </View>
        ) : null}

      </View>
    );
  };

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
              size={22}
              color="#26332D"
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
              Workout History
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Your completed exercises
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <Ionicons
              name="time-outline"
              size={23}
              color={BLUE}
            />

          </View>

        </View>

        <View
          style={
            styles.summaryCard
          }>

          <View
            style={
              styles.summaryTop
            }>

            <View>
              <Text
                style={
                  styles.summaryTitle
                }>
                Activity Summary
              </Text>

              <Text
                style={
                  styles.summarySubtitle
                }>
                Your workout completion overview
              </Text>
            </View>

            <View
              style={
                styles.summaryIcon
              }>

              <Ionicons
                name="fitness-outline"
                size={23}
                color={BLUE}
              />

            </View>

          </View>

          <View
            style={
              styles.summaryStats
            }>

            <View
              style={
                styles.summaryStat
              }>

              <Text
                style={
                  styles.summaryNumber
                }>
                {getTotalCompleted}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }>
                TOTAL
              </Text>

            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View
              style={
                styles.summaryStat
              }>

              <Text
                style={
                  styles.summaryNumber
                }>
                {getWeekCompleted}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }>
                THIS WEEK
              </Text>

            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View
              style={
                styles.summaryStat
              }>

              <Text
                style={
                  styles.summaryNumber
                }>
                {getMonthCompleted}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }>
                THIS MONTH
              </Text>

            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View
              style={
                styles.summaryStat
              }>

              <View
                style={
                  styles.summaryCheck
                }>

                <Ionicons
                  name="checkmark"
                  size={15}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.summaryLabel
                }>
                COMPLETED
              </Text>

            </View>

          </View>

        </View>

        <View
          style={
            styles.filterContainer
          }>

          {[
            'All',
            'Week',
            'Month',
          ].map(filter => {
            const selected =
              selectedFilter ===
              filter;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selected &&
                    styles.filterButtonSelected,
                ]}
                onPress={() =>
                  setSelectedFilter(
                    filter,
                  )
                }
                activeOpacity={0.8}>

                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.filterTextSelected,
                  ]}>
                  {filter}
                </Text>

              </TouchableOpacity>
            );
          })}

        </View>

        <View
          style={
            styles.sectionHeader
          }>

          <View
            style={
              styles.blueLine
            }
          />

          <View>

            <Text
              style={
                styles.sectionTitle
              }>
              Completed Exercises
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Exercises you have completed
            </Text>

          </View>

        </View>

        {loading ? (
          <View
            style={
              styles.loadingContainer
            }>

            <ActivityIndicator
              size="large"
              color={BLUE}
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading workout history...
            </Text>

          </View>
        ) : filteredHistory.length ===
          0 ? (
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
                size={35}
                color={BLUE}
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No Completed Exercises
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Complete an exercise from
              your workout and it will
              appear here.
            </Text>

            <TouchableOpacity
              style={
                styles.startWorkoutButton
              }
              onPress={() =>
                navigation.navigate(
                  'MemberWorkout',
                )
              }
              activeOpacity={0.85}>

              <Ionicons
                name="play"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.startWorkoutText
                }>
                Start Workout
              </Text>

            </TouchableOpacity>

          </View>
        ) : (
          filteredHistory.map(
            renderHistoryCard,
          )
        )}

        <View
          style={
            styles.bottomMessage
          }>

          <View
            style={
              styles.bottomMessageIcon
            }>

            <Ionicons
              name="sparkles-outline"
              size={20}
              color={BLUE}
            />

          </View>

          <View
            style={
              styles.bottomMessageInfo
            }>

            <Text
              style={
                styles.bottomMessageTitle
              }>
              Keep going!
            </Text>

            <Text
              style={
                styles.bottomMessageText
              }>
              Every completed exercise is
              saved to your workout history.
            </Text>

          </View>

        </View>

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
};

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F7F9F8',
    },

    scrollContent: {
      paddingHorizontal: 17,
      paddingTop: 15,
      paddingBottom: 35,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 17,
    },

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E7E4',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    headerInfo: {
      flex: 1,
    },

    headerTitle: {
      color: '#202D27',
      fontSize: 20,
      fontWeight: '800',
    },

    headerSubtitle: {
      color: '#89938E',
      fontSize: 11,
      marginTop: 3,
    },

    headerIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    summaryCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 19,
      padding: 17,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
    },

    summaryTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    summaryTitle: {
      color: '#26332D',
      fontSize: 17,
      fontWeight: '800',
    },

    summarySubtitle: {
      color: '#89938E',
      fontSize: 10,
      marginTop: 4,
    },

    summaryIcon: {
      width: 47,
      height: 47,
      borderRadius: 14,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    summaryStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 19,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#EEF1EF',
    },

    summaryStat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    summaryNumber: {
      color: BLUE,
      fontSize: 20,
      fontWeight: '800',
    },

    summaryLabel: {
      color: '#89938E',
      fontSize: 9,
      marginTop: 3,
      textAlign: 'center',
    },

    summaryDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#E4E9E6',
    },

    summaryCheck: {
      width: 25,
      height: 25,
      borderRadius: 8,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    filterContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      padding: 4,
      flexDirection: 'row',
      marginBottom: 18,
    },

    filterButton: {
      flex: 1,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    filterButtonSelected: {
      backgroundColor: BLUE,
    },

    filterText: {
      color: '#89938E',
      fontSize: 11,
      fontWeight: '700',
    },

    filterTextSelected: {
      color: '#FFFFFF',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    blueLine: {
      width: 4,
      height: 35,
      borderRadius: 4,
      backgroundColor: BLUE,
      marginRight: 10,
    },

    sectionTitle: {
      color: '#26332D',
      fontSize: 15,
      fontWeight: '800',
    },

    sectionSubtitle: {
      color: '#89938E',
      fontSize: 10,
      marginTop: 3,
    },

    historyCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      padding: 13,
      marginBottom: 10,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.035,
      shadowRadius: 5,
      elevation: 1,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    exerciseIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: '#F1F4FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    exerciseInfo: {
      flex: 1,
      paddingRight: 8,
    },

    exerciseName: {
      color: '#26332D',
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 19,
    },

    completedTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },

    completedText: {
      color: '#8A938F',
      fontSize: 9,
      fontWeight: '600',
      marginLeft: 4,
    },

    completedBadge: {
      backgroundColor: BLUE,
      borderRadius: 9,
      paddingHorizontal: 8,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },

    completedBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '800',
      marginLeft: 3,
    },

    cardDivider: {
      height: 1,
      backgroundColor: '#EEF1EF',
      marginTop: 12,
      marginBottom: 10,
    },

    cardDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    cardDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      marginRight: 8,
    },

    cardDetailText: {
      color: '#69736E',
      fontSize: 9,
      fontWeight: '600',
      marginLeft: 4,
    },

    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },

    timeText: {
      color: '#89938E',
      fontSize: 9,
      marginLeft: 4,
    },

    loadingContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      paddingVertical: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      color: '#89938E',
      fontSize: 11,
      marginTop: 12,
    },

    emptyCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      padding: 22,
      alignItems: 'center',
    },

    emptyIcon: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    emptyTitle: {
      color: '#26332D',
      fontSize: 17,
      fontWeight: '800',
    },

    emptyText: {
      color: '#89938E',
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 17,
      marginTop: 5,
      marginBottom: 15,
    },

    startWorkoutButton: {
      height: 43,
      paddingHorizontal: 18,
      borderRadius: 11,
      backgroundColor: BLUE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    startWorkoutText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
      marginLeft: 6,
    },

    bottomMessage: {
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#E1E6E3',
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    bottomMessageIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    bottomMessageInfo: {
      flex: 1,
      marginLeft: 9,
    },

    bottomMessageTitle: {
      color: '#26332D',
      fontSize: 11,
      fontWeight: '800',
    },

    bottomMessageText: {
      color: '#89938E',
      fontSize: 10,
      lineHeight: 15,
      marginTop: 2,
    },

    bottomSpace: {
      height: 25,
    },
  });

export default WorkoutHistoryScreen;
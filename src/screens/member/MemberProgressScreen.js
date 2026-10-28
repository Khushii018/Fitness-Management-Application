import React, {useState} from 'react';

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

const MemberProgressScreen = ({navigation}) => {
  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const reduxAssessments = useSelector(
    state =>
      state.trainer?.fitnessAssessments || [],
  );

  const [selectedSection, setSelectedSection] =
    useState('Overview');

  const currentEmail =
    authUser?.email || '';

  const currentMobile =
    authUser?.mobile || '';

  const reduxMember = members.find(member => {
    if (
      currentEmail &&
      member?.email &&
      String(member.email)
        .toLowerCase() ===
        String(currentEmail)
          .toLowerCase()
    ) {
      return true;
    }

    if (
      currentMobile &&
      member?.mobile &&
      String(member.mobile) ===
        String(currentMobile)
    ) {
      return true;
    }

    return false;
  });

  const memberId =
    reduxMember?.id ||
    reduxMember?.memberId ||
    authUser?.id ||
    authUser?.memberId ||
    null;

  const allAssessments = Array.isArray(
    reduxAssessments,
  )
    ? reduxAssessments
    : [];

  const memberAssessments =
    allAssessments.filter(
      assessment => {
        if (!memberId) {
          if (
            currentEmail &&
            assessment?.memberEmail
          ) {
            return (
              String(
                assessment.memberEmail,
              ).toLowerCase() ===
              String(
                currentEmail,
              ).toLowerCase()
            );
          }

          return false;
        }

        return (
          String(
            assessment?.memberId,
          ) === String(memberId)
        );
      },
    );

  const latestAssessment =
    memberAssessments.length > 0
      ? memberAssessments[
          memberAssessments.length - 1
        ]
      : null;

  const previousAssessment =
    memberAssessments.length > 1
      ? memberAssessments[
          memberAssessments.length - 2
        ]
      : null;

  const getAssessmentValue = value => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ) {
      return 'Not added';
    }

    return String(value);
  };

  const weight = getAssessmentValue(
    latestAssessment?.weight,
  );

  const bodyFat = getAssessmentValue(
    latestAssessment?.bodyFat,
  );

  const height = getAssessmentValue(
    latestAssessment?.height,
  );

  const bmi = getAssessmentValue(
    latestAssessment?.bmi,
  );

  const chest = getAssessmentValue(
    latestAssessment?.chest,
  );

  const waist = getAssessmentValue(
    latestAssessment?.waist,
  );

  const arms = getAssessmentValue(
    latestAssessment?.arms,
  );

  const thighs = getAssessmentValue(
    latestAssessment?.thighs,
  );

  const strength = getAssessmentValue(
    latestAssessment?.strength,
  );

  const flexibility = getAssessmentValue(
    latestAssessment?.flexibility,
  );

  const cardioLevel = getAssessmentValue(
    latestAssessment?.cardioLevel,
  );

  const goal = getAssessmentValue(
    latestAssessment?.goal,
  );

  const formatNumber = value => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'Not added';
    }

    return String(value);
  };

  const getNumericValue = value => {
    if (
      !value ||
      value === 'Not added'
    ) {
      return null;
    }

    const number = parseFloat(
      String(value).replace(
        /[^0-9.]/g,
        '',
      ),
    );

    return isNaN(number)
      ? null
      : number;
  };

  const currentWeight =
    getNumericValue(
      latestAssessment?.weight,
    );

  const previousWeight =
    getNumericValue(
      previousAssessment?.weight,
    );

  const currentBodyFat =
    getNumericValue(
      latestAssessment?.bodyFat,
    );

  const previousBodyFat =
    getNumericValue(
      previousAssessment?.bodyFat,
    );

  const currentBMI =
    getNumericValue(
      latestAssessment?.bmi,
    );

  const previousBMI =
    getNumericValue(
      previousAssessment?.bmi,
    );

  const getChange = (
    current,
    previous,
  ) => {
    if (
      current === null ||
      previous === null
    ) {
      return null;
    }

    const change =
      current - previous;

    if (change === 0) {
      return 'No change';
    }

    if (change > 0) {
      return `+${change.toFixed(1)}`;
    }

    return change.toFixed(1);
  };

  const weightChange = getChange(
    currentWeight,
    previousWeight,
  );

  const bodyFatChange = getChange(
    currentBodyFat,
    previousBodyFat,
  );

  const bmiChange = getChange(
    currentBMI,
    previousBMI,
  );

  const getChangeColor = change => {
    if (!change) {
      return '#777777';
    }

    if (change === 'No change') {
      return '#777777';
    }

    return '#4169D8';
  };

  const progressCards = [
    {
      id: 'weight',
      title: 'Weight',
      value: formatNumber(weight),
      icon: 'scale-outline',
      change: weightChange
        ? `${weightChange} kg`
        : latestAssessment
        ? 'Current'
        : 'Not added',
      description:
        'Track your weight changes',
    },

    {
      id: 'bodyFat',
      title: 'Body Fat',
      value: formatNumber(bodyFat),
      icon: 'body-outline',
      change: bodyFatChange
        ? `${bodyFatChange}%`
        : latestAssessment
        ? 'Current'
        : 'Not added',
      description:
        'Monitor body composition',
    },

    {
      id: 'bmi',
      title: 'BMI',
      value: formatNumber(bmi),
      icon: 'calculator-outline',
      change: bmiChange
        ? bmiChange
        : latestAssessment
        ? 'Current'
        : 'Not added',
      description:
        'Track your BMI progress',
    },

    {
      id: 'measurements',
      title: 'Measurements',
      value: latestAssessment
        ? 'View'
        : 'Not added',
      icon: 'resize-outline',
      change: latestAssessment
        ? '4 areas'
        : 'Not added',
      description:
        'Chest, waist, arms & thighs',
    },

    {
      id: 'strength',
      title: 'Strength',
      value: formatNumber(strength),
      icon: 'barbell-outline',
      change: latestAssessment
        ? 'Current'
        : 'Not added',
      description:
        'Monitor strength level',
    },

    {
      id: 'photos',
      title: 'Photos',
      value: 'View',
      icon: 'camera-outline',
      change: 'Progress',
      description:
        'Track visual progress',
    },
  ];

  const renderProgressCard = card => {
    return (
      <TouchableOpacity
        key={card.id}
        style={styles.progressCard}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedSection(card.id);
        }}>

        <View
          style={styles.cardIcon}>

          <Ionicons
            name={card.icon}
            size={23}
            color="#4169D8"
          />

        </View>

        <Text
          style={styles.cardTitle}>
          {card.title}
        </Text>

        <Text
          style={[
            styles.cardValue,
            card.value === 'Not added' &&
              styles.notAddedValue,
          ]}>
          {card.value}
        </Text>

        <Text
          style={[
            styles.cardChange,
            {
              color: getChangeColor(
                card.change,
              ),
            },
            card.change === 'Not added' &&
              styles.notAddedChange,
          ]}>
          {card.change}
        </Text>

      </TouchableOpacity>
    );
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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }>

        <View
          style={styles.header}>

          <View>

            <Text
              style={
                styles.headerTitle
              }>
              Progress
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Track your fitness journey
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <Ionicons
              name="stats-chart-outline"
              size={25}
              color="#4169D8"
            />

          </View>

        </View>

        <View
          style={styles.goalCard}>

          <View
            style={styles.goalIcon}>

            <Ionicons
              name="flag-outline"
              size={24}
              color="#4169D8"
            />

          </View>

          <View
            style={styles.goalContent}>

            <Text
              style={
                styles.goalLabel
              }>
              Current Goal
            </Text>

            <Text
              style={[
                styles.goalValue,
                goal === 'Not added' &&
                  styles.notAddedValue,
              ]}>
              {goal}
            </Text>

          </View>

          <View
            style={
              latestAssessment
                ? styles.assessmentBadge
                : styles.notAddedBadge
            }>

            <Ionicons
              name={
                latestAssessment
                  ? 'checkmark-circle'
                  : 'remove-circle-outline'
              }
              size={16}
              color={
                latestAssessment
                  ? '#0BAA65'
                  : '#777777'
              }
            />

            <Text
              style={
                latestAssessment
                  ? styles.assessmentBadgeText
                  : styles.notAddedBadgeText
              }>
              {latestAssessment
                ? 'Assessed'
                : 'Not added'}
            </Text>

          </View>

        </View>

        <View
          style={
            styles.sectionHeader
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Progress Overview
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }>
            Your latest results
          </Text>

        </View>

        <View
          style={
            styles.progressGrid
          }>

          {progressCards.map(
            renderProgressCard,
          )}

        </View>

        {selectedSection ===
          'measurements' && (
          <View
            style={
              styles.detailCard
            }>

            <View
              style={
                styles.detailHeader
              }>

              <View
                style={
                  styles.detailIcon
                }>

                <Ionicons
                  name="resize-outline"
                  size={21}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.detailHeaderContent
                }>

                <Text
                  style={
                    styles.detailTitle
                  }>
                  Measurements
                </Text>

                <Text
                  style={
                    styles.detailSubtitle
                  }>
                  Latest body measurements
                </Text>

              </View>

            </View>

            <View
              style={
                styles.measurementGrid
              }>

              <View
                style={
                  styles.measurementItem
                }>

                <Text
                  style={
                    styles.measurementLabel
                  }>
                  Chest
                </Text>

                <Text
                  style={[
                    styles.measurementValue,
                    chest === 'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {formatNumber(
                    chest,
                  )}
                </Text>

              </View>

              <View
                style={
                  styles.measurementItem
                }>

                <Text
                  style={
                    styles.measurementLabel
                  }>
                  Waist
                </Text>

                <Text
                  style={[
                    styles.measurementValue,
                    waist === 'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {formatNumber(
                    waist,
                  )}
                </Text>

              </View>

              <View
                style={
                  styles.measurementItem
                }>

                <Text
                  style={
                    styles.measurementLabel
                  }>
                  Arms
                </Text>

                <Text
                  style={[
                    styles.measurementValue,
                    arms === 'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {formatNumber(
                    arms,
                  )}
                </Text>

              </View>

              <View
                style={
                  styles.measurementItem
                }>

                <Text
                  style={
                    styles.measurementLabel
                  }>
                  Thighs
                </Text>

                <Text
                  style={[
                    styles.measurementValue,
                    thighs === 'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {formatNumber(
                    thighs,
                  )}
                </Text>

              </View>

            </View>

          </View>
        )}

        {selectedSection ===
          'strength' && (
          <View
            style={
              styles.detailCard
            }>

            <View
              style={
                styles.detailHeader
              }>

              <View
                style={
                  styles.detailIcon
                }>

                <Ionicons
                  name="barbell-outline"
                  size={21}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.detailHeaderContent
                }>

                <Text
                  style={
                    styles.detailTitle
                  }>
                  Strength
                </Text>

                <Text
                  style={
                    styles.detailSubtitle
                  }>
                  Current fitness performance
                </Text>

              </View>

            </View>

            <View
              style={
                styles.performanceRow
              }>

              <View
                style={
                  styles.performanceItem
                }>

                <Text
                  style={
                    styles.performanceLabel
                  }>
                  Strength
                </Text>

                <Text
                  style={[
                    styles.performanceValue,
                    strength === 'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {strength}
                </Text>

              </View>

              <View
                style={
                  styles.performanceItem
                }>

                <Text
                  style={
                    styles.performanceLabel
                  }>
                  Flexibility
                </Text>

                <Text
                  style={[
                    styles.performanceValue,
                    flexibility ===
                      'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {flexibility}
                </Text>

              </View>

              <View
                style={
                  styles.performanceItem
                }>

                <Text
                  style={
                    styles.performanceLabel
                  }>
                  Cardio
                </Text>

                <Text
                  style={[
                    styles.performanceValue,
                    cardioLevel ===
                      'Not added' &&
                      styles.notAddedValue,
                  ]}>
                  {cardioLevel}
                </Text>

              </View>

            </View>

          </View>
        )}

        {selectedSection ===
          'photos' && (
          <View
            style={
              styles.detailCard
            }>

            <View
              style={
                styles.detailHeader
              }>

              <View
                style={
                  styles.detailIcon
                }>

                <Ionicons
                  name="camera-outline"
                  size={21}
                  color="#4169D8"
                />

              </View>

              <View
                style={
                  styles.detailHeaderContent
                }>

                <Text
                  style={
                    styles.detailTitle
                  }>
                  Progress Photos
                </Text>

                <Text
                  style={
                    styles.detailSubtitle
                  }>
                  Compare your visual progress
                </Text>

              </View>

            </View>

            <View
              style={
                styles.photoEmpty
              }>

              <View
                style={
                  styles.photoIcon
                }>

                <Ionicons
                  name="images-outline"
                  size={32}
                  color="#4169D8"
                />

              </View>

              <Text
                style={
                  styles.photoTitle
                }>
                No Progress Photos
              </Text>

              <Text
                style={
                  styles.photoText
                }>
                Your progress photos will
                appear here when available.
              </Text>

            </View>

          </View>
        )}

        <View
          style={
            styles.metricsCard
          }>

          <View
            style={
              styles.metricsHeader
            }>

            <View>

              <Text
                style={
                  styles.metricsTitle
                }>
                Current Measurements
              </Text>

              <Text
                style={
                  styles.metricsSubtitle
                }>
                Latest assessment data
              </Text>

            </View>

            <Ionicons
              name="fitness-outline"
              size={22}
              color="#4169D8"
            />

          </View>

          <View
            style={
              styles.metricsRow
            }>

            <View
              style={
                styles.metricItem
              }>

              <Text
                style={
                  styles.metricLabel
                }>
                Weight
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  weight === 'Not added' &&
                    styles.notAddedValue,
                ]}>
                {formatNumber(
                  weight,
                )}
              </Text>

            </View>

            <View
              style={
                styles.verticalDivider
              }
            />

            <View
              style={
                styles.metricItem
              }>

              <Text
                style={
                  styles.metricLabel
                }>
                Height
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  height === 'Not added' &&
                    styles.notAddedValue,
                ]}>
                {formatNumber(
                  height,
                )}
              </Text>

            </View>

            <View
              style={
                styles.verticalDivider
              }
            />

            <View
              style={
                styles.metricItem
              }>

              <Text
                style={
                  styles.metricLabel
                }>
                BMI
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  bmi === 'Not added' &&
                    styles.notAddedValue,
                ]}>
                {formatNumber(
                  bmi,
                )}
              </Text>

            </View>

          </View>

        </View>

        <View
          style={
            styles.lastAssessmentCard
          }>

          <View
            style={
              styles.lastAssessmentIcon
            }>

            <Ionicons
              name="clipboard-outline"
              size={22}
              color="#FFFFFF"
            />

          </View>

          <View
            style={
              styles.lastAssessmentContent
            }>

            <Text
              style={
                styles.lastAssessmentTitle
              }>
              Fitness Assessment
            </Text>

            <Text
              style={
                styles.lastAssessmentText
              }>
              {latestAssessment
                ? 'Your latest fitness assessment is available.'
                : 'Complete a fitness assessment to update your progress.'}
            </Text>

          </View>

          {latestAssessment && (
            <View
              style={
                styles.completedCircle
              }>

              <Ionicons
                name="checkmark"
                size={18}
                color="#0BAA65"
              />

            </View>
          )}

        </View>

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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333333',
  },

  headerSubtitle: {
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: '#D6E0FF',
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  goalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  goalContent: {
    flex: 1,
  },

  goalLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 3,
  },

  goalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  assessmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7F0',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  assessmentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A8B55',
    marginLeft: 4,
  },

  notAddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F4',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  notAddedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777777',
    marginLeft: 4,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  progressCard: {
    width: '31.5%',
    minHeight: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 11,
    marginBottom: 12,
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
  },

  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  notAddedValue: {
    color: '#999999',
    fontSize: 14,
  },

  cardChange: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
  },

  notAddedChange: {
    color: '#999999',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    marginTop: 8,
    marginBottom: 14,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  detailHeaderContent: {
    flex: 1,
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  detailSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  measurementItem: {
    width: '48%',
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  measurementLabel: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 4,
  },

  measurementValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  performanceItem: {
    width: '31%',
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    padding: 11,
  },

  performanceLabel: {
    fontSize: 10,
    color: '#777777',
    marginBottom: 5,
  },

  performanceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  photoEmpty: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  photoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  photoText: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
    maxWidth: 270,
  },

  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
  },

  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  metricsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  metricsSubtitle: {
    fontSize: 11,
    color: '#777777',
    marginTop: 3,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metricItem: {
    flex: 1,
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 5,
  },

  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D9DDE3',
  },

  lastAssessmentCard: {
    backgroundColor: '#4169D8',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  lastAssessmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  lastAssessmentContent: {
    flex: 1,
  },

  lastAssessmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  lastAssessmentText: {
    fontSize: 11,
    color: '#E9F0FF',
    marginTop: 4,
    lineHeight: 16,
  },

  completedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MemberProgressScreen;
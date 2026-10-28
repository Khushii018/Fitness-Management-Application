import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Ionicons from '@react-native-vector-icons/ionicons';

import {useSelector} from 'react-redux';

const MemberDetailsScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] =
    useState('Overview');

  const [selectedWorkout, setSelectedWorkout] =
    useState(null);

  const [workoutModalVisible, setWorkoutModalVisible] =
    useState(false);

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const workoutPlans = useSelector(
    state => state.trainer?.workoutPlans || [],
  );

  const dietPlans = useSelector(
    state => state.trainer?.dietPlans || [],
  );

  const fitnessAssessments = useSelector(
    state => state.trainer?.fitnessAssessments || [],
  );

  const memberId = route?.params?.memberId;

  const selectedMember = members.find(
    item =>
      String(item?.id) ===
      String(memberId),
  );

  const allAssessments = Array.isArray(
    fitnessAssessments,
  )
    ? fitnessAssessments
    : [];

  const memberAssessments =
    allAssessments.filter(
      assessment =>
        String(
          assessment?.memberId,
        ) === String(memberId),
    );

  const latestFitnessAssessment =
    memberAssessments.length > 0
      ? memberAssessments[
          memberAssessments.length - 1
        ]
      : null;

  const calculateBMI = (
    weightValue,
    heightValue,
  ) => {
    const parsedWeight =
      parseFloat(
        String(
          weightValue || '',
        ).replace(/[^0-9.]/g, ''),
      );

    const parsedHeight =
      parseFloat(
        String(
          heightValue || '',
        ).replace(/[^0-9.]/g, ''),
      );

    if (
      !isNaN(parsedWeight) &&
      !isNaN(parsedHeight) &&
      parsedWeight > 0 &&
      parsedHeight > 0
    ) {
      const heightInMeters =
        parsedHeight / 100;

      return (
        parsedWeight /
        (heightInMeters *
          heightInMeters)
      )
        .toFixed(1)
        .toString();
    }

    return '';
  };

  const rawHeight =
    latestFitnessAssessment?.height ||
    selectedMember?.height ||
    selectedMember?.heightCm ||
    '';

  const rawWeight =
    latestFitnessAssessment?.weight ||
    selectedMember?.weight ||
    selectedMember?.weightKg ||
    '';

  const rawGoal =
    latestFitnessAssessment?.goal ||
    selectedMember?.goal ||
    selectedMember?.fitnessGoal ||
    '';

  const calculatedBMI =
    calculateBMI(
      rawWeight,
      rawHeight,
    );

  const rawBMI =
    latestFitnessAssessment?.bmi ||
    selectedMember?.bmi ||
    calculatedBMI ||
    '';

  const member = {
    id:
      selectedMember?.id ||
      memberId ||
      '1',

    name:
      selectedMember?.name ||
      selectedMember?.fullName ||
      route?.params?.memberName ||
      'John Doe',

    email:
      selectedMember?.email ||
      'john.doe@gmail.com',

    mobile:
      selectedMember?.mobile ||
      '+91 98765 43210',

    age:
      selectedMember?.age ||
      '28',

    height:
      rawHeight || '175 cm',

    weight:
      rawWeight || '78 kg',

    goal:
      rawGoal || 'Weight Loss',

    activityLevel:
      selectedMember?.activityLevel ||
      'Active',

    status:
      selectedMember?.status ||
      'Active',

    membership:
      selectedMember?.membership ||
      'Premium',

    expiryDate:
      selectedMember?.expiryDate ||
      '25 Dec 2026',

    bmi:
      rawBMI || '23.5',

    attendance:
      selectedMember?.attendance ||
      '16 / 22',
  };

  const isFitnessAssessmentCompleted =
    latestFitnessAssessment?.status ===
      'Completed' ||
    latestFitnessAssessment?.completed ===
      true ||
    latestFitnessAssessment?.isCompleted ===
      true;

  const allWorkoutPlans = Array.isArray(
    workoutPlans,
  )
    ? workoutPlans
    : [];

  const memberWorkoutPlans =
    allWorkoutPlans.filter(plan => {
      if (
        plan?.memberId == null ||
        member?.id == null
      ) {
        return false;
      }

      return (
        String(plan.memberId) ===
        String(member.id)
      );
    });

  const memberDietPlans =
    Array.isArray(dietPlans)
      ? dietPlans.filter(
          plan =>
            String(
              plan?.memberId,
            ) ===
            String(member.id),
        )
      : [];

  const activeDietPlan =
    memberDietPlans.length > 0
      ? memberDietPlans[
          memberDietPlans.length - 1
        ]
      : null;

  const tabs = [
    'Overview',
    'Workout',
    'Progress',
    'Diet',
  ];

  const getInitials = name => {
    if (!name) {
      return 'JD';
    }

    const parts = name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const openWorkoutDetails = plan => {
    setSelectedWorkout(plan);
    setWorkoutModalVisible(true);
  };

  const closeWorkoutDetails = () => {
    setWorkoutModalVisible(false);
    setSelectedWorkout(null);
  };

  const renderOverview = () => {
    return (
      <>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Weight
            </Text>

            <Text style={styles.statValue}>
              {member.weight}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Height
            </Text>

            <Text style={styles.statValue}>
              {member.height}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Goal
            </Text>

            <Text
              style={styles.statValue}
              numberOfLines={1}>
              {member.goal}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              BMI
            </Text>

            <Text style={styles.statValue}>
              {member.bmi}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Fitness Assessment
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'FitnessAssessment',
                  {
                    memberId: member.id,
                    memberName: member.name,
                  },
                )
              }
              activeOpacity={0.8}>
              <Text style={styles.viewText}>
                {isFitnessAssessmentCompleted
                  ? 'View'
                  : 'Assess'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.assessmentContent
            }>
            <View
              style={[
                styles.assessmentCircle,
                isFitnessAssessmentCompleted &&
                  styles.assessmentCircleCompleted,
              ]}>
              {isFitnessAssessmentCompleted ? (
                <Ionicons
                  name="checkmark"
                  size={23}
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="clipboard-outline"
                  size={24}
                  color="#4169D8"
                />
              )}
            </View>

            <View
              style={
                styles.assessmentInfo
              }>
              <Text
                style={
                  styles.assessmentTitle
                }>
                {isFitnessAssessmentCompleted
                  ? 'Assessment Completed'
                  : 'Assessment Pending'}
              </Text>

              <Text
                style={
                  styles.assessmentSubtitle
                }>
                {isFitnessAssessmentCompleted
                  ? 'Fitness assessment is completed for this member.'
                  : 'Complete the fitness assessment for this member.'}
              </Text>
            </View>
          </View>

          {latestFitnessAssessment ? (
            <View
              style={
                styles.assessmentDetails
              }>
              <View
                style={
                  styles.assessmentDetailItem
                }>
                <Text
                  style={
                    styles.assessmentDetailLabel
                  }>
                  Weight
                </Text>

                <Text
                  style={
                    styles.assessmentDetailValue
                  }>
                  {latestFitnessAssessment.weight ||
                    '-'}
                </Text>
              </View>

              <View
                style={
                  styles.assessmentDetailItem
                }>
                <Text
                  style={
                    styles.assessmentDetailLabel
                  }>
                  Height
                </Text>

                <Text
                  style={
                    styles.assessmentDetailValue
                  }>
                  {latestFitnessAssessment.height ||
                    '-'}
                </Text>
              </View>

              <View
                style={
                  styles.assessmentDetailItem
                }>
                <Text
                  style={
                    styles.assessmentDetailLabel
                  }>
                  BMI
                </Text>

                <Text
                  style={
                    styles.assessmentDetailValue
                  }>
                  {latestFitnessAssessment.bmi ||
                    '-'}
                </Text>
              </View>

              <View
                style={
                  styles.assessmentDetailItem
                }>
                <Text
                  style={
                    styles.assessmentDetailLabel
                  }>
                  Goal
                </Text>

                <Text
                  style={
                    styles.assessmentDetailValue
                  }
                  numberOfLines={1}>
                  {latestFitnessAssessment.goal ||
                    '-'}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Membership
            </Text>

            {member.status ? (
              <View style={styles.activeBadge}>
                <View
                  style={styles.activeDot}
                />

                <Text
                  style={styles.activeText}>
                  {member.status}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={
              styles.membershipContent
            }>
            <View
              style={
                styles.membershipIcon
              }>
              <Ionicons
                name="card-outline"
                size={25}
                color="#4169D8"
              />
            </View>

            <View
              style={
                styles.membershipInfo
              }>
              <Text
                style={
                  styles.membershipName
                }>
                {member.membership || '-'}
              </Text>

              <Text
                style={
                  styles.membershipSubtitle
                }>
                Membership Plan
              </Text>
            </View>
          </View>

          {member.expiryDate ? (
            <View
              style={
                styles.membershipBottom
              }>
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
                  {member.expiryDate}
                </Text>
              </View>

              <View
                style={
                  styles.membershipStatus
                }>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#20A464"
                />

                <Text
                  style={
                    styles.membershipStatusText
                  }>
                  Active
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {member.attendance ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Attendance
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    'Attendance',
                    {
                      memberId: member.id,
                      memberName:
                        member.name,
                    },
                  )
                }
                activeOpacity={0.8}>
                <Text
                  style={
                    styles.viewText
                  }>
                  View
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.attendanceContent
              }>
              <View
                style={
                  styles.attendanceIcon
                }>
                <Ionicons
                  name="calendar-outline"
                  size={25}
                  color="#4169D8"
                />
              </View>

              <View
                style={
                  styles.attendanceInfo
                }>
                <Text
                  style={
                    styles.attendanceValue
                  }>
                  {member.attendance}
                </Text>

                <Text
                  style={
                    styles.attendanceLabel
                  }>
                  Attendance
                </Text>
              </View>

              <View
                style={
                  styles.attendanceProgressContainer
                }>
                <View
                  style={
                    styles.attendanceProgressBackground
                  }>
                  <View
                    style={[
                      styles.attendanceProgress,
                      {
                        width: `${parseFloat(
                          String(
                            member.attendance,
                          ).replace(
                            /[^0-9.-]/g,
                            '',
                          ),
                        ) || 0}%`,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={
                    styles.attendancePercentage
                  }>
                  {member.attendance}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() =>
            setSelectedTab('Progress')
          }
          activeOpacity={0.8}>
          <Text
            style={
              styles.viewMoreText
            }>
            View More
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </>
    );
  };

  const renderWorkoutPlan = plan => {
    const exerciseCount =
      Array.isArray(
        plan.exercises,
      )
        ? plan.exercises.length
        : 0;

    return (
      <TouchableOpacity
        key={plan.id}
        style={
          styles.workoutPlanCard
        }
        onPress={() =>
          openWorkoutDetails(plan)
        }
        activeOpacity={0.8}>
        <View
          style={styles.planIcon}>
          <Ionicons
            name="barbell-outline"
            size={27}
            color="#4169D8"
          />
        </View>

        <View
          style={styles.planInfo}>
          <Text
            style={styles.planTitle}
            numberOfLines={1}>
            {plan.planName ||
              'Workout Plan'}
          </Text>

          <Text
            style={
              styles.planSubtitle
            }>
            {exerciseCount} exercises •{' '}
            {plan.duration ||
              'Not specified'}
          </Text>

          <View
            style={
              styles.difficultyRow
            }>
            <View
              style={
                styles.difficultyBadge
              }>
              <Text
                style={
                  styles.difficultyText
                }>
                {plan.difficulty ||
                  'Beginner'}
              </Text>
            </View>

            <View
              style={
                styles.activePlanBadge
              }>
              <View
                style={
                  styles.activePlanDot
                }
              />

              <Text
                style={
                  styles.activePlanText
                }>
                {plan.status ||
                  'Active'}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#999999"
        />
      </TouchableOpacity>
    );
  };

  const renderWorkout = () => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Workout Plans
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'WorkoutPlans',
                {
                  memberId: member.id,
                  memberName: member.name,
                },
              )
            }
            activeOpacity={0.8}>
            <Text
              style={
                styles.viewText
              }>
              Manage
            </Text>
          </TouchableOpacity>
        </View>

        {memberWorkoutPlans.length >
        0 ? (
          <View>
            {memberWorkoutPlans.map(
              renderWorkoutPlan,
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyWorkout
            }>
            <View
              style={
                styles.emptyWorkoutIcon
              }>
              <Ionicons
                name="barbell-outline"
                size={34}
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
              No workout plan has
              been created for this
              member yet.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={
            styles.primaryButton
          }
          onPress={() =>
            navigation.navigate(
              'WorkoutPlans',
              {
                memberId: member.id,
                memberName: member.name,
              },
            )
          }
          activeOpacity={0.8}>
          <Ionicons
            name="add"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.primaryButtonText
            }>
            Create Workout Plan
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProgress = () => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Progress
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'TrainerProgress',
                {
                  memberId: member.id,
                  memberName: member.name,
                },
              )
            }
            activeOpacity={0.8}>
            <Text
              style={
                styles.viewText
              }>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={styles.progressRow}>
          <View
            style={
              styles.progressBox
            }>
            <Ionicons
              name="scale-outline"
              size={25}
              color="#4169D8"
            />

            <Text
              style={
                styles.progressValue
              }>
              {member.weight || '-'}
            </Text>

            <Text
              style={
                styles.progressLabel
              }>
              Current Weight
            </Text>
          </View>

          <View
            style={
              styles.progressBox
            }>
            <Ionicons
              name="body-outline"
              size={25}
              color="#4169D8"
            />

            <Text
              style={
                styles.progressValue
              }>
              {latestFitnessAssessment?.bodyFat ||
                '-'}
            </Text>

            <Text
              style={
                styles.progressLabel
              }>
              Body Fat
            </Text>
          </View>

          <View
            style={
              styles.progressBox
            }>
            <Ionicons
              name="fitness-outline"
              size={25}
              color="#4169D8"
            />

            <Text
              style={
                styles.progressValue
              }>
              {member.bmi || '-'}
            </Text>

            <Text
              style={
                styles.progressLabel
              }>
              BMI
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.primaryButton
          }
          onPress={() =>
            navigation.navigate(
              'TrainerProgress',
              {
                memberId: member.id,
                memberName: member.name,
              },
            )
          }
          activeOpacity={0.8}>
          <Text
            style={
              styles.primaryButtonText
            }>
            View Progress
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDiet = () => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Diet Plan
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'DietPlan',
                {
                  memberId: member.id,
                  memberName: member.name,
                },
              )
            }
            activeOpacity={0.8}>
            <Text
              style={
                styles.viewText
              }>
              {activeDietPlan
                ? 'Manage'
                : 'Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeDietPlan ? (
          <>
            <View
              style={styles.planCard}>
              <View
                style={
                  styles.dietIcon
                }>
                <Ionicons
                  name="restaurant-outline"
                  size={26}
                  color="#4169D8"
                />
              </View>

              <View
                style={
                  styles.planInfo
                }>
                <Text
                  style={
                    styles.planTitle
                  }
                  numberOfLines={2}>
                  {activeDietPlan.planName}
                </Text>

                {activeDietPlan.calories ? (
                  <Text
                    style={
                      styles.planSubtitle
                    }>
                    {
                      activeDietPlan.calories
                    }{' '}
                    Calories / Day
                  </Text>
                ) : null}

                <View
                  style={
                    styles.dietDetailsRow
                  }>
                  {activeDietPlan.goal ? (
                    <Text
                      style={
                        styles.dietDetailText
                      }>
                      {
                        activeDietPlan.goal
                      }
                    </Text>
                  ) : null}

                  {activeDietPlan.goal &&
                  activeDietPlan.dietType ? (
                    <Text
                      style={
                        styles.dietDetailDot
                      }>
                      •
                    </Text>
                  ) : null}

                  {activeDietPlan.dietType ? (
                    <Text
                      style={
                        styles.dietDetailText
                      }>
                      {
                        activeDietPlan.dietType
                      }
                    </Text>
                  ) : null}
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color="#999999"
              />
            </View>

            {activeDietPlan.activityLevel ? (
              <View
                style={
                  styles.dietInfoRow
                }>
                <View
                  style={
                    styles.dietInfoIcon
                  }>
                  <Ionicons
                    name="fitness-outline"
                    size={19}
                    color="#4169D8"
                  />
                </View>

                <View
                  style={
                    styles.dietInfoContent
                  }>
                  <Text
                    style={
                      styles.dietInfoLabel
                    }>
                    Activity Level
                  </Text>

                  <Text
                    style={
                      styles.dietInfoValue
                    }>
                    {
                      activeDietPlan.activityLevel
                    }
                  </Text>
                </View>
              </View>
            ) : null}

            {activeDietPlan.restrictions ? (
              <View
                style={
                  styles.dietInfoRow
                }>
                <View
                  style={
                    styles.dietInfoIcon
                  }>
                  <Ionicons
                    name="warning-outline"
                    size={19}
                    color="#4169D8"
                  />
                </View>

                <View
                  style={
                    styles.dietInfoContent
                  }>
                  <Text
                    style={
                      styles.dietInfoLabel
                    }>
                    Restrictions
                  </Text>

                  <Text
                    style={
                      styles.dietInfoValue
                    }>
                    {
                      activeDietPlan.restrictions
                    }
                  </Text>
                </View>
              </View>
            ) : null}

            {Array.isArray(
              activeDietPlan.meals,
            ) ? (
              <View
                style={
                  styles.dietMealsContainer
                }>
                <Text
                  style={
                    styles.dietMealsTitle
                  }>
                  Meals
                </Text>

                {activeDietPlan.meals.map(
                  (meal, index) => {
                    const foods =
                      Array.isArray(
                        meal.foods,
                      )
                        ? meal.foods.filter(
                            food =>
                              food?.name?.trim() ||
                              food?.quantity?.trim(),
                          )
                        : [];

                    if (
                      foods.length ===
                      0
                    ) {
                      return null;
                    }

                    return (
                      <View
                        key={
                          meal.id ||
                          `${meal.name}-${index}`
                        }
                        style={
                          styles.storedMeal
                        }>
                        <View
                          style={
                            styles.storedMealHeader
                          }>
                          <View
                            style={
                              styles.storedMealIcon
                            }>
                            <Ionicons
                              name={
                                index === 0
                                  ? 'sunny-outline'
                                  : index === 1
                                  ? 'restaurant-outline'
                                  : index === 2
                                  ? 'moon-outline'
                                  : 'cafe-outline'
                              }
                              size={18}
                              color="#4169D8"
                            />
                          </View>

                          <Text
                            style={
                              styles.storedMealTitle
                            }>
                            {meal.name ||
                              `Meal ${
                                index + 1
                              }`}
                          </Text>
                        </View>

                        {foods.map(
                          (
                            food,
                            foodIndex,
                          ) => (
                            <View
                              key={
                                food.id ||
                                `${food.name}-${foodIndex}`
                              }
                              style={
                                styles.foodRow
                              }>
                              <View
                                style={
                                  styles.foodDot
                                }
                              />

                              <Text
                                style={
                                  styles.foodName
                                }>
                                {food.name ||
                                  '-'}
                              </Text>

                              <Text
                                style={
                                  styles.foodQuantity
                                }>
                                {food.quantity ||
                                  ''}
                              </Text>
                            </View>
                          ),
                        )}
                      </View>
                    );
                  },
                )}
              </View>
            ) : null}
          </>
        ) : (
          <View
            style={
              styles.emptyDiet
            }>
            <View
              style={
                styles.emptyDietIcon
              }>
              <Ionicons
                name="restaurant-outline"
                size={34}
                color="#4169D8"
              />
            </View>

            <Text
              style={
                styles.emptyDietTitle
              }>
              No Diet Plan
            </Text>

            <Text
              style={
                styles.emptyDietText
              }>
              No diet plan has been
              created for this member
              yet.
            </Text>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                navigation.navigate(
                  'DietPlan',
                  {
                    memberId: member.id,
                    memberName: member.name,
                  },
                )
              }
              activeOpacity={0.8}>
              <Ionicons
                name="add"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }>
                Create Diet Plan
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSelectedTab = () => {
    if (
      selectedTab ===
      'Overview'
    ) {
      return renderOverview();
    }

    if (
      selectedTab ===
      'Workout'
    ) {
      return renderWorkout();
    }

    if (
      selectedTab ===
      'Progress'
    ) {
      return renderProgress();
    }

    if (
      selectedTab ===
      'Diet'
    ) {
      return renderDiet();
    }

    return renderOverview();
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top,
        },
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
              size={24}
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
              Member Details
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              View member information
            </Text>
          </View>
        </View>

        <View
          style={styles.profileCard}>
          <View
            style={styles.avatar}>
            <Text
              style={
                styles.avatarText
              }>
              {getInitials(
                member.name,
              )}
            </Text>
          </View>

          <View
            style={
              styles.profileInfo
            }>
            <Text
              style={
                styles.profileName
              }
              numberOfLines={1}>
              {member.name}
            </Text>

            <Text
              style={
                styles.profileGoal
              }>
              {member.goal}
            </Text>

            <View
              style={
                styles.statusRow
              }>
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }>
                {member.status}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={styles.contactCard}>
          <View
            style={
              styles.contactItem
            }>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#4169D8"
            />

            <Text
              style={
                styles.contactText
              }
              numberOfLines={1}>
              {member.email}
            </Text>
          </View>

          <View
            style={
              styles.contactItem
            }>
            <Ionicons
              name="call-outline"
              size={18}
              color="#4169D8"
            />

            <Text
              style={
                styles.contactText
              }>
              {member.mobile}
            </Text>
          </View>

          <View
            style={
              styles.contactItem
            }>
            <Ionicons
              name="person-outline"
              size={18}
              color="#4169D8"
            />

            <Text
              style={
                styles.contactText
              }>
              Age: {member.age}
            </Text>
          </View>

          <View
            style={
              styles.contactItem
            }>
            <Ionicons
              name="barbell-outline"
              size={18}
              color="#4169D8"
            />

            <Text
              style={
                styles.contactText
              }>
              Activity: {member.activityLevel}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.tabsContainer
          }>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab ===
                  tab &&
                  styles.activeTab,
              ]}
              onPress={() =>
                setSelectedTab(tab)
              }
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab ===
                    tab &&
                    styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderSelectedTab()}
      </ScrollView>

      <Modal
        visible={
          workoutModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeWorkoutDetails
        }>
        <View
          style={
            styles.modalOverlay
          }>
          <View
            style={
              styles.workoutModal
            }>
            <View
              style={
                styles.modalHeader
              }>
              <Text
                style={
                  styles.modalTitle
                }>
                Workout Details
              </Text>

              <TouchableOpacity
                onPress={
                  closeWorkoutDetails
                }
                activeOpacity={0.8}>
                <Ionicons
                  name="close"
                  size={26}
                  color="#333333"
                />
              </TouchableOpacity>
            </View>

            {selectedWorkout ? (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingBottom: 10,
                }}>
                <View
                  style={
                    styles.modalPlanIcon
                  }>
                  <Ionicons
                    name="barbell-outline"
                    size={34}
                    color="#4169D8"
                  />
                </View>

                <Text
                  style={
                    styles.modalPlanName
                  }>
                  {selectedWorkout.planName ||
                    'Workout Plan'}
                </Text>

                {selectedWorkout.description ? (
                  <Text
                    style={
                      styles.modalDescription
                    }>
                    {
                      selectedWorkout.description
                    }
                  </Text>
                ) : null}

                <View
                  style={
                    styles.modalInfoGrid
                  }>
                  <View
                    style={
                      styles.modalInfoBox
                    }>
                    <Text
                      style={
                        styles.modalInfoLabel
                      }>
                      Duration
                    </Text>

                    <Text
                      style={
                        styles.modalInfoValue
                      }>
                      {selectedWorkout.duration ||
                        'Not specified'}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.modalInfoBox
                    }>
                    <Text
                      style={
                        styles.modalInfoLabel
                      }>
                      Difficulty
                    </Text>

                    <Text
                      style={
                        styles.modalInfoValue
                      }>
                      {selectedWorkout.difficulty ||
                        'Beginner'}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.modalInfoBox
                    }>
                    <Text
                      style={
                        styles.modalInfoLabel
                      }>
                      Status
                    </Text>

                    <Text
                      style={
                        styles.modalInfoValue
                      }>
                      {selectedWorkout.status ||
                        'Active'}
                    </Text>
                  </View>
                </View>

                {Array.isArray(
                  selectedWorkout.exercises,
                ) &&
                selectedWorkout
                  .exercises.length >
                  0 ? (
                  <View
                    style={
                      styles.exerciseSection
                    }>
                    <Text
                      style={
                        styles.exerciseSectionTitle
                      }>
                      Exercises
                    </Text>

                    {selectedWorkout.exercises.map(
                      (
                        exercise,
                        index,
                      ) => (
                        <View
                          key={
                            exercise.id ||
                            `${exercise.name}-${index}`
                          }
                          style={
                            styles.exerciseCard
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

                          <View
                            style={
                              styles.exerciseInfo
                            }>
                            <Text
                              style={
                                styles.exerciseName
                              }>
                              {exercise.name ||
                                `Exercise ${
                                  index + 1
                                }`}
                            </Text>

                            <Text
                              style={
                                styles.exerciseDetails
                              }>
                              {exercise.sets
                                ? `${exercise.sets} sets`
                                : ''}

                              {exercise.sets &&
                              exercise.reps
                                ? ' • '
                                : ''}

                              {exercise.reps
                                ? `${exercise.reps} reps`
                                : ''}

                              {exercise.rest
                                ? ` • ${exercise.rest} rest`
                                : ''}
                            </Text>
                          </View>
                        </View>
                      ),
                    )}
                  </View>
                ) : null}

                {selectedWorkout.trainerNotes ? (
                  <View
                    style={
                      styles.notesBox
                    }>
                    <Text
                      style={
                        styles.notesTitle
                      }>
                      Trainer Notes
                    </Text>

                    <Text
                      style={
                        styles.notesText
                      }>
                      {
                        selectedWorkout.trainerNotes
                      }
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#4169D8',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333333',
  },

  profileGoal: {
    fontSize: 13,
    color: '#4169D8',
    marginTop: 4,
    fontWeight: '600',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20A464',
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    color: '#20A464',
    fontWeight: '600',
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  contactText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    marginLeft: 10,
  },

  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },

  activeTab: {
    backgroundColor: '#4169D8',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },

  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 6,
  },

  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    maxWidth: 75,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E1E4E8',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },

  viewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4169D8',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F1',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#20A464',
    marginRight: 5,
  },

  activeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#20A464',
  },

  assessmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assessmentCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  assessmentCircleCompleted: {
    backgroundColor: '#4169D8',
  },

  assessmentInfo: {
    flex: 1,
  },

  assessmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  assessmentSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
    lineHeight: 17,
  },

  assessmentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E1E4E8',
  },

  assessmentDetailItem: {
    width: '50%',
    marginBottom: 12,
  },

  assessmentDetailLabel: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 3,
  },

  assessmentDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  membershipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  membershipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  membershipInfo: {
    flex: 1,
  },

  membershipName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  membershipSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  membershipBottom: {
    borderTopWidth: 1,
    borderTopColor: '#E1E4E8',
    marginTop: 15,
    paddingTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 11,
    color: '#777777',
  },

  smallValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginTop: 3,
  },

  membershipStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  membershipStatusText: {
    fontSize: 12,
    color: '#20A464',
    fontWeight: '600',
    marginLeft: 5,
  },

  attendanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  attendanceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  attendanceInfo: {
    width: 75,
  },

  attendanceValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },

  attendanceLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 3,
  },

  attendanceProgressContainer: {
    flex: 1,
    marginLeft: 10,
  },

  attendanceProgressBackground: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E8EBEF',
    overflow: 'hidden',
  },

  attendanceProgress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4169D8',
  },

  attendancePercentage: {
    fontSize: 11,
    color: '#777777',
    marginTop: 5,
    textAlign: 'right',
  },

  viewMoreButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  viewMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },

  workoutPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },

  planIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  planInfo: {
    flex: 1,
    marginRight: 8,
  },

  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  planSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  difficultyBadge: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },

  activePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  activePlanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#20A464',
    marginRight: 4,
  },

  activePlanText: {
    fontSize: 10,
    color: '#20A464',
    fontWeight: '600',
  },

  emptyWorkout: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  emptyWorkoutIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyWorkoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  emptyWorkoutText: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },

  primaryButton: {
    height: 46,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 6,
  },

  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },

  progressBox: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },

  progressValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginTop: 7,
  },

  progressLabel: {
    fontSize: 10,
    color: '#777777',
    textAlign: 'center',
    marginTop: 4,
  },

  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },

  dietIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  dietDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  dietDetailText: {
    fontSize: 11,
    color: '#555555',
  },

  dietDetailDot: {
    fontSize: 11,
    color: '#999999',
    marginHorizontal: 5,
  },

  dietInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  dietInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  dietInfoContent: {
    flex: 1,
  },

  dietInfoLabel: {
    fontSize: 11,
    color: '#777777',
  },

  dietInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginTop: 3,
  },

  dietMealsContainer: {
    marginTop: 17,
  },

  dietMealsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },

  storedMeal: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 9,
  },

  storedMealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  storedMealIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  storedMealTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },

  foodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4169D8',
    marginRight: 8,
  },

  foodName: {
    flex: 1,
    fontSize: 12,
    color: '#555555',
  },

  foodQuantity: {
    fontSize: 11,
    color: '#777777',
  },

  emptyDiet: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  emptyDietIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyDietTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  emptyDietText: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  workoutModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333333',
  },

  modalPlanIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },

  modalPlanName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginTop: 12,
  },

  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },

  modalInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  modalInfoBox: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 13,
  },

  modalInfoLabel: {
    fontSize: 11,
    color: '#777777',
  },

  modalInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginTop: 5,
  },

  exerciseSection: {
    marginTop: 20,
  },

  exerciseSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },

  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  exerciseNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  exerciseNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  exerciseDetails: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
  },

  notesBox: {
    backgroundColor: '#EAF0FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 15,
  },

  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 5,
  },

  notesText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
  },
});

export default MemberDetailsScreen;
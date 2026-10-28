import React, {useCallback, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {useFocusEffect} from '@react-navigation/native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

const BLUE = '#4169D8';
const GREEN = '#22C55E';
const DARK = '#111827';
const TEXT = '#1F2937';
const MUTED = '#6B7280';
const LIGHT_BG = '#F6F7F9';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

const MemberDietPlanScreen = () => {
  const [specificDietPlans, setSpecificDietPlans] =
    useState([]);

  const [globalDietPlans, setGlobalDietPlans] =
    useState([]);

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  const [memberName, setMemberName] =
    useState('');

  const [planType, setPlanType] =
    useState('specific');

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const reduxMemberDietPlans = useSelector(
    state => state.member?.dietPlans || [],
  );

  const reduxTrainerDietPlans = useSelector(
    state => state.trainer?.dietPlans || [],
  );

  const loadMemberDietPlans = () => {
    try {
      
      const members = Array.isArray(reduxMembers)
        ? reduxMembers
        : [];

      const loggedInUser = authUser;

      if (!loggedInUser) {
        setSpecificDietPlans([]);
        setGlobalDietPlans([]);
        setSelectedPlan(null);
        setMemberName('');
        return;
      }

      let currentMember = null;

      if (loggedInUser.id) {
        currentMember = members.find(
          member =>
            String(
              member?.id ||
                member?.memberId ||
                '',
            ) ===
            String(loggedInUser.id),
        );
      }

      if (
        !currentMember &&
        loggedInUser.memberId
      ) {
        currentMember = members.find(
          member =>
            String(
              member?.id ||
                member?.memberId ||
                '',
            ) ===
            String(loggedInUser.memberId),
        );
      }

      if (
        !currentMember &&
        loggedInUser.email
      ) {
        currentMember = members.find(
          member =>
            String(
              member?.email || '',
            )
              .trim()
              .toLowerCase() ===
            String(
              loggedInUser.email || '',
            )
              .trim()
              .toLowerCase(),
        );
      }

      if (
        !currentMember &&
        loggedInUser.mobile
      ) {
        currentMember = members.find(
          member =>
            String(
              member?.mobile || '',
            ).trim() ===
            String(
              loggedInUser.mobile || '',
            ).trim(),
        );
      }

      const memberId =
        currentMember?.id ||
        currentMember?.memberId ||
        loggedInUser.memberId ||
        loggedInUser.id ||
        null;

      const name =
        currentMember?.name ||
        currentMember?.fullName ||
        currentMember?.memberName ||
        loggedInUser.fullName ||
        loggedInUser.name ||
        'Member';

      setMemberName(name);

      if (!memberId) {
        setSpecificDietPlans([]);
        setGlobalDietPlans([]);
        setSelectedPlan(null);
        return;
      }

      const memberTrainerIds = [
        currentMember?.trainerId,
        ...(Array.isArray(
          currentMember?.trainerIds,
        )
          ? currentMember.trainerIds
          : []),
        loggedInUser?.trainerId,
        ...(Array.isArray(
          loggedInUser?.trainerIds,
        )
          ? loggedInUser.trainerIds
          : []),
      ]
        .filter(Boolean)
        .map(String);

      const specificPlans =
        Array.isArray(
          reduxMemberDietPlans,
        )
          ? reduxMemberDietPlans.filter(
              plan => {
                const planMemberId =
                  String(
                    plan?.memberId || '',
                  );

                return (
                  planMemberId ===
                  String(memberId)
                );
              },
            )
          : [];

      const trainerPlans =
        Array.isArray(
          reduxTrainerDietPlans,
        )
          ? reduxTrainerDietPlans
          : [];

      const globalPlans =
        trainerPlans.filter(plan => {
          const isGlobal =
            plan?.type === 'global' ||
            plan?.scope === 'global';

          if (!isGlobal) {
            return false;
          }

          if (
            memberTrainerIds.length === 0
          ) {
            return false;
          }

          return memberTrainerIds.includes(
            String(
              plan?.trainerId || '',
            ),
          );
        });

      const uniqueSpecificPlans =
        specificPlans.filter(
          (plan, index, array) =>
            index ===
            array.findIndex(
              item =>
                String(
                  item?.id || '',
                ) ===
                String(
                  plan?.id || '',
                ),
            ),
        );

      const uniqueGlobalPlans =
        globalPlans.filter(
          (plan, index, array) =>
            index ===
            array.findIndex(
              item =>
                String(
                  item?.id || '',
                ) ===
                String(
                  plan?.id || '',
                ),
            ),
        );

      const sortedSpecificPlans =
        [...uniqueSpecificPlans].sort(
          (a, b) =>
            new Date(
              b?.createdAt || 0,
            ) -
            new Date(
              a?.createdAt || 0,
            ),
        );

      const sortedGlobalPlans =
        [...uniqueGlobalPlans].sort(
          (a, b) =>
            new Date(
              b?.createdAt || 0,
            ) -
            new Date(
              a?.createdAt || 0,
            ),
        );

      setSpecificDietPlans(
        sortedSpecificPlans,
      );

      setGlobalDietPlans(
        sortedGlobalPlans,
      );

      const activePlans =
        planType === 'global'
          ? sortedGlobalPlans
          : sortedSpecificPlans;

      if (activePlans.length > 0) {
        setSelectedPlan(
          previousPlan => {
            const existingPlan =
              activePlans.find(
                plan =>
                  String(
                    plan?.id || '',
                  ) ===
                  String(
                    previousPlan?.id || '',
                  ),
              );

            return (
              existingPlan ||
              activePlans[0]
            );
          },
        );
      } else {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.log(
        'Load member diet plans error:',
        error,
      );

      setSpecificDietPlans([]);
      setGlobalDietPlans([]);
      setSelectedPlan(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMemberDietPlans();
    }, [
      authUser,
      reduxMembers,
      reduxMemberDietPlans,
      reduxTrainerDietPlans,
      planType,
    ]),
  );

  const getPlanName = plan =>
    plan?.planName ||
    plan?.name ||
    plan?.title ||
    'Diet Plan';

  const getGoal = plan =>
    plan?.goal ||
    plan?.fitnessGoal ||
    'General Fitness';

  const getCalories = plan =>
    plan?.calories ||
    plan?.dailyCalories ||
    '—';

  const getDietType = plan =>
    plan?.dietType ||
    plan?.diet ||
    '—';

  const getActivityLevel = plan =>
    plan?.activityLevel ||
    plan?.activity ||
    '—';

  const getRestrictions = plan =>
    plan?.restrictions ||
    plan?.allergies ||
    '';

  const getNotes = plan =>
    plan?.trainerNotes ||
    plan?.notes ||
    '';

  const getMeals = plan => {
    if (Array.isArray(plan?.meals)) {
      return plan.meals;
    }

    if (Array.isArray(plan?.mealPlan)) {
      return plan.mealPlan;
    }

    if (
      Array.isArray(plan?.mealPlans)
    ) {
      return plan.mealPlans;
    }

    return [];
  };

  const getMealName = (
    meal,
    index,
  ) =>
    meal?.type ||
    meal?.mealName ||
    meal?.name ||
    meal?.title ||
    `Meal ${index + 1}`;

  const getMealTime = meal =>
    meal?.time ||
    meal?.mealTime ||
    '';

  const getFoods = meal => {
    if (Array.isArray(meal?.foods)) {
      return meal.foods;
    }

    if (Array.isArray(meal?.items)) {
      return meal.items;
    }

    if (
      Array.isArray(
        meal?.foodItems,
      )
    ) {
      return meal.foodItems;
    }

    return [];
  };

  const getFoodName = food => {
    if (typeof food === 'string') {
      return food;
    }

    return (
      food?.name ||
      food?.food ||
      food?.item ||
      food?.foodName ||
      ''
    );
  };

  const getFoodQuantity = food => {
    if (
      typeof food === 'object' &&
      food?.quantity
    ) {
      return String(food.quantity);
    }

    return '';
  };

  const getMealIcon = type => {
    const value =
      String(type || '').toLowerCase();

    if (
      value.includes('breakfast')
    ) {
      return 'sunny-outline';
    }

    if (value.includes('lunch')) {
      return 'restaurant-outline';
    }

    if (value.includes('snack')) {
      return 'cafe-outline';
    }

    if (value.includes('dinner')) {
      return 'moon-outline';
    }

    return 'restaurant-outline';
  };

  const formatDate = date => {
    if (!date) {
      return '—';
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return '—';
    }

    return parsed.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  const handlePlanTypeChange =
    type => {
      setPlanType(type);

      const plans =
        type === 'global'
          ? globalDietPlans
          : specificDietPlans;

      if (plans.length > 0) {
        setSelectedPlan(
          plans[0],
        );
      } else {
        setSelectedPlan(null);
      }
    };

  const renderMeal = (
    meal,
    index,
  ) => {
    if (!meal) {
      return null;
    }

    const mealName =
      getMealName(
        meal,
        index,
      );

    const mealTime =
      getMealTime(meal);

    const foods =
      getFoods(meal);

    return (
      <View
        key={`${mealName}-${index}`}
        style={styles.mealCard}>

        <View
          style={styles.mealHeader}>

          <View
            style={styles.mealIcon}>

            <Ionicons
              name={getMealIcon(
                mealName,
              )}
              size={22}
              color={BLUE}
            />

          </View>

          <View
            style={
              styles.mealTitleContainer
            }>

            <Text
              style={styles.mealName}>
              {mealName}
            </Text>

            {mealTime ? (
              <View
                style={
                  styles.timeRow
                }>

                <Ionicons
                  name="time-outline"
                  size={14}
                  color={MUTED}
                />

                <Text
                  style={
                    styles.mealTime
                  }>
                  {mealTime}
                </Text>

              </View>
            ) : null}

          </View>

        </View>

        {foods.length > 0 ? (
          <View
            style={
              styles.foodList
            }>

            {foods.map(
              (
                food,
                foodIndex,
              ) => {

                const foodName =
                  getFoodName(
                    food,
                  );

                const quantity =
                  getFoodQuantity(
                    food,
                  );

                if (!foodName) {
                  return null;
                }

                return (
                  <View
                    key={`${foodName}-${foodIndex}`}
                    style={
                      styles.foodRow
                    }>

                    <View
                      style={
                        styles.foodCheck
                      }>

                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={BLUE}
                      />

                    </View>

                    <Text
                      style={
                        styles.foodText
                      }>
                      {foodName}
                    </Text>

                    {quantity ? (
                      <Text
                        style={
                          styles.quantityText
                        }>
                        {quantity}
                      </Text>
                    ) : null}

                  </View>
                );
              },
            )}

          </View>
        ) : (
          <Text
            style={
              styles.mealDescription
            }>
            No food items added.
          </Text>
        )}

        {meal?.description ? (
          <Text
            style={
              styles.mealDescription
            }>
            {meal.description}
          </Text>
        ) : null}

        {meal?.calories ? (
          <View
            style={
              styles.calorieRow
            }>

            <Ionicons
              name="flame-outline"
              size={16}
              color={BLUE}
            />

            <Text
              style={
                styles.calorieText
              }>
              {meal.calories} calories
            </Text>

          </View>
        ) : null}

      </View>
    );
  };

  const renderPlan = () => {
    if (!selectedPlan) {
      return null;
    }

    const meals =
      getMeals(selectedPlan);

    const restrictions =
      getRestrictions(
        selectedPlan,
      );

    const notes =
      getNotes(selectedPlan);

    return (
      <>

        <View
          style={
            styles.sourceBadgeContainer
          }>

          <Ionicons
            name={
              planType === 'global'
                ? 'globe-outline'
                : 'person-outline'
            }
            size={15}
            color={BLUE}
          />

          <Text
            style={
              styles.sourceBadgeText
            }>
            {planType === 'global'
              ? "Trainer's Global Diet"
              : 'Diet Assigned to You'}
          </Text>

        </View>

        <View
          style={styles.heroCard}>

          <View
            style={styles.heroTop}>

            <View
              style={styles.heroIcon}>

              <Ionicons
                name="nutrition-outline"
                size={28}
                color={WHITE}
              />

            </View>

            <View
              style={styles.heroInfo}>

              <Text
                style={
                  styles.heroTitle
                }>
                {getPlanName(
                  selectedPlan,
                )}
              </Text>

              <View
                style={styles.goalRow}>

                <Ionicons
                  name="flag-outline"
                  size={14}
                  color={BLUE}
                />

                <Text
                  style={
                    styles.heroGoal
                  }>
                  {getGoal(
                    selectedPlan,
                  )}
                </Text>

              </View>

            </View>

            <View
              style={
                styles.activeBadge
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
                {selectedPlan?.status ||
                  'Active'}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.heroDivider
            }
          />

          <View
            style={
              styles.statsRow
            }>

            <View
              style={
                styles.statItem
              }>

              <View
                style={
                  styles.statIcon
                }>

                <Ionicons
                  name="flame-outline"
                  size={19}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.statLabel
                }>
                Calories
              </Text>

              <Text
                style={
                  styles.statValue
                }>
                {getCalories(
                  selectedPlan,
                )}
              </Text>

            </View>

            <View
              style={
                styles.statDivider
              }
            />

            <View
              style={
                styles.statItem
              }>

              <View
                style={
                  styles.statIcon
                }>

                <Ionicons
                  name="restaurant-outline"
                  size={19}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.statLabel
                }>
                Diet Type
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.statValueSmall
                }>
                {getDietType(
                  selectedPlan,
                )}
              </Text>

            </View>

            <View
              style={
                styles.statDivider
              }
            />

            <View
              style={
                styles.statItem
              }>

              <View
                style={
                  styles.statIcon
                }>

                <Ionicons
                  name="fitness-outline"
                  size={19}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.statLabel
                }>
                Activity
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.statValueSmall
                }>
                {getActivityLevel(
                  selectedPlan,
                )}
              </Text>

            </View>

          </View>

        </View>

        <View
          style={styles.goalCard}>

          <View
            style={styles.goalIcon}>

            <Ionicons
              name="flag-outline"
              size={22}
              color={BLUE}
            />

          </View>

          <View
            style={styles.goalInfo}>

            <Text
              style={
                styles.goalLabel
              }>
              FITNESS GOAL
            </Text>

            <Text
              style={
                styles.goalValue
              }>
              {getGoal(
                selectedPlan,
              )}
            </Text>

          </View>

        </View>

        {restrictions ? (
          <View
            style={
              styles.restrictionCard
            }>

            <View
              style={
                styles.warningIcon
              }>

              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={BLUE}
              />

            </View>

            <Text
              style={
                styles.restrictionText
              }>
              {restrictions}
            </Text>

          </View>
        ) : null}

        <View
          style={
            styles.sectionHeader
          }>

          <View>

            <Text
              style={
                styles.sectionTitle
              }>
              Daily Meals
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Follow your planned meals
            </Text>

          </View>

          <View
            style={
              styles.mealCount
            }>

            <Text
              style={
                styles.mealCountText
              }>
              {meals.length}
            </Text>

          </View>

        </View>

        {meals.length > 0
          ? meals.map(
              renderMeal,
            )
          : (
            <View
              style={
                styles.emptyMealCard
              }>

              <View
                style={
                  styles.emptyMealIcon
                }>

                <Ionicons
                  name="restaurant-outline"
                  size={30}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.emptyMealTitle
                }>
                No Meals Added
              </Text>

              <Text
                style={
                  styles.emptyMealText
                }>
                No meals have been added
                to this diet plan yet.
              </Text>

            </View>
          )}

        {notes ? (
          <>
            <View
              style={[
                styles.sectionHeader,
                {
                  marginTop: 10,
                },
              ]}>

              <Text
                style={
                  styles.sectionTitle
                }>
                Trainer Notes
              </Text>

            </View>

            <View
              style={
                styles.notesCard
              }>

              <View
                style={
                  styles.notesIcon
                }>

                <Ionicons
                  name="document-text-outline"
                  size={21}
                  color={BLUE}
                />

              </View>

              <Text
                style={
                  styles.notesText
                }>
                {notes}
              </Text>

            </View>
          </>
        ) : null}

        <View
          style={
            styles.createdCard
          }>

          <Ionicons
            name="calendar-outline"
            size={14}
            color={MUTED}
          />

          <Text
            style={
              styles.createdText
            }>
            Created on{' '}
            {formatDate(
              selectedPlan?.createdAt,
            )}
          </Text>

        </View>

      </>
    );
  };

  const renderEmptyGlobal =
    () => (
      <View
        style={
          styles.emptyContainer
        }>

        <View
          style={
            styles.emptyIcon
          }>

          <Ionicons
            name="globe-outline"
            size={42}
            color={BLUE}
          />

        </View>

        <Text
          style={
            styles.emptyTitle
          }>
          No Global Diet Plan
        </Text>

        <Text
          style={
            styles.emptyDescription
          }>
          Your trainer has not created a global
          diet plan yet.
          {'\n'}
          Once your trainer creates one, it will
          appear here.
        </Text>

      </View>
    );

  const renderEmptySpecific =
    () => (
      <View
        style={
          styles.emptyContainer
        }>

        <View
          style={
            styles.emptyIcon
          }>

          <Ionicons
            name="person-outline"
            size={42}
            color={BLUE}
          />

        </View>

        <Text
          style={
            styles.emptyTitle
          }>
          No Personal Diet Plan
        </Text>

        <Text
          style={
            styles.emptyDescription
          }>
          Your trainer has not assigned a
          personal diet plan to you yet.
        </Text>

      </View>
    );

  const activePlans =
    planType === 'global'
      ? globalDietPlans
      : specificDietPlans;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <View
        style={styles.header}>

        <View
          style={styles.headerLeft}>

          <Text
            style={
              styles.headerTitle
            }>
            Diet Plan
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }>
            {memberName
              ? `Nutrition plan for ${memberName}`
              : 'Your nutrition plan'}
          </Text>

        </View>

        <View
          style={
            styles.headerIcon
          }>

          <Ionicons
            name="nutrition-outline"
            size={24}
            color={BLUE}
          />

        </View>

      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }>

        <View
          style={
            styles.planTypeContainer
          }>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.planTypeButton,
              planType === 'global' &&
                styles.planTypeButtonActive,
            ]}
            onPress={() =>
              handlePlanTypeChange(
                'global',
              )
            }>

            <Ionicons
              name="globe-outline"
              size={17}
              color={
                planType === 'global'
                  ? WHITE
                  : MUTED
              }
            />

            <Text
              style={[
                styles.planTypeText,
                planType === 'global' &&
                  styles.planTypeTextActive,
              ]}>
              Global Diet
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.planTypeButton,
              planType === 'specific' &&
                styles.planTypeButtonActive,
            ]}
            onPress={() =>
              handlePlanTypeChange(
                'specific',
              )
            }>

            <Ionicons
              name="person-outline"
              size={17}
              color={
                planType === 'specific'
                  ? WHITE
                  : MUTED
              }
            />

            <Text
              style={[
                styles.planTypeText,
                planType === 'specific' &&
                  styles.planTypeTextActive,
              ]}>
              My Diet
            </Text>

          </TouchableOpacity>

        </View>

        <View
          style={
            styles.planTypeInfo
          }>

          <Ionicons
            name={
              planType === 'global'
                ? 'globe-outline'
                : 'person-outline'
            }
            size={16}
            color={BLUE}
          />

          <Text
            style={
              styles.planTypeInfoText
            }>
            {planType === 'global'
              ? "Diet plan created by your trainer for their members"
              : 'Diet plan assigned specifically to you'}
          </Text>

        </View>

        {activePlans.length > 0 ? (
          <>
            {activePlans.length > 1 ? (
              <View
                style={
                  styles.planListSection
                }>

                <View
                  style={
                    styles.sectionHeader
                  }>

                  <View>

                    <Text
                      style={
                        styles.sectionTitle
                      }>
                      {planType ===
                      'global'
                        ? 'Global Diet Plans'
                        : 'My Diet Plans'}
                    </Text>

                    <Text
                      style={
                        styles.sectionSubtitle
                      }>
                      Select a plan to view
                      details
                    </Text>

                  </View>

                  <View
                    style={
                      styles.planCount
                    }>

                    <Text
                      style={
                        styles.planCountText
                      }>
                      {
                        activePlans.length
                      }
                    </Text>

                  </View>

                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.planSelector
                  }>

                  {activePlans.map(
                    plan => {

                      const isSelected =
                        String(
                          plan?.id || '',
                        ) ===
                        String(
                          selectedPlan?.id ||
                            '',
                        );

                      return (
                        <TouchableOpacity
                          key={String(
                            plan?.id || '',
                          )}
                          activeOpacity={0.85}
                          style={[
                            styles.planSelectorItem,
                            isSelected &&
                              styles.planSelectorItemActive,
                          ]}
                          onPress={() =>
                            setSelectedPlan(
                              plan,
                            )
                          }>

                          <Ionicons
                            name={
                              planType ===
                              'global'
                                ? 'globe-outline'
                                : 'nutrition-outline'
                            }
                            size={17}
                            color={
                              isSelected
                                ? WHITE
                                : BLUE
                            }
                          />

                          <Text
                            numberOfLines={1}
                            style={[
                              styles.planSelectorText,
                              isSelected &&
                                styles.planSelectorTextActive,
                            ]}>
                            {getPlanName(
                              plan,
                            )}
                          </Text>

                        </TouchableOpacity>
                      );
                    },
                  )}

                </ScrollView>

              </View>
            ) : null}

            {renderPlan()}
          </>
        ) : planType === 'global' ? (
          renderEmptyGlobal()
        ) : (
          renderEmptySpecific()
        )}

      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  header: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 5,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },

  planTypeContainer: {
    backgroundColor: WHITE,
    borderRadius: 13,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    marginBottom: 10,
  },

  planTypeButton: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  planTypeButtonActive: {
    backgroundColor: BLUE,
  },

  planTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
  },

  planTypeTextActive: {
    color: WHITE,
  },

  planTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },

  planTypeInfoText: {
    flex: 1,
    fontSize: 12,
    color: TEXT,
    marginLeft: 8,
    lineHeight: 17,
  },

  sourceBadgeContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 10,
  },

  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
    marginLeft: 6,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
  },

  planListSection: {
    marginBottom: 8,
  },

  planCount: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  planCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: BLUE,
  },

  planSelector: {
    paddingBottom: 16,
  },

  planSelectorItem: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 22,
    paddingHorizontal: 15,
    marginRight: 9,
    maxWidth: 210,
  },

  planSelectorItemActive: {
    backgroundColor:BLUE,
    borderColor: BLUE,
  },

  planSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
    marginLeft: 7,
  },

  planSelectorTextActive: {
    color: WHITE,
  },

  heroCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: BORDER,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  heroInfo: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: DARK,
  },

  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  heroGoal: {
    fontSize: 12,
    fontWeight: '600',
    color: BLUE,
    marginLeft: 5,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8EF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginRight: 5,
  },

  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: GREEN,
    textTransform: 'capitalize',
  },

  heroDivider: {
    height: 1,
    backgroundColor: '#F0F1F2',
    marginVertical: 17,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  statDivider: {
    width: 1,
    backgroundColor: '#EEF0F2',
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  statLabel: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 3,
  },

  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },

  statValueSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
    minHeight: 30,
  },

  goalCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 22,
  },

  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  goalInfo: {
    flex: 1,
  },

  goalLabel: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 4,
  },

  goalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
  },

  restrictionCard: {
    backgroundColor: WHITE,
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 22,
  },

  warningIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  restrictionText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    lineHeight: 21,
    paddingTop: 7,
  },

  mealCount: {
    minWidth: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mealCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: BLUE,
  },

  mealCard: {
    backgroundColor: WHITE,
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mealIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  mealTitleContainer: {
    flex: 1,
  },

  mealName: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  mealTime: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 4,
  },

  foodList: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F2',
  },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  foodCheck: {
    width: 21,
    height: 21,
    borderRadius: 7,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  foodText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    lineHeight: 20,
  },

  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    marginLeft: 10,
  },

  mealDescription: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
    marginTop: 14,
  },

  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F2',
  },

  calorieText: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
    marginLeft: 6,
  },

  notesCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },

  notesIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  notesText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    lineHeight: 21,
  },

  createdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 5,
  },

  createdText: {
    fontSize: 11,
    color: MUTED,
    marginLeft: 5,
  },

  emptyMealCard: {
    backgroundColor: WHITE,
    borderRadius: 17,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 15,
  },

  emptyMealIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyMealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
    marginBottom: 5,
  },

  emptyMealText: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 19,
  },

  emptyContainer: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 20,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default MemberDietPlanScreen;
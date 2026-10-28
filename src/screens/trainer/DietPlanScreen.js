import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import Ionicons from '@react-native-vector-icons/ionicons';

import {useDispatch, useSelector} from 'react-redux';

import {addDietPlan} from '../../redux/slices/trainerSlice';

const DietPlanScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const trainer = useSelector(
    state => state.auth?.user || null,
  );

  const [planScope, setPlanScope] = useState('global');

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [planName, setPlanName] = useState('');
  const [goal, setGoal] = useState('');
  const [calories, setCalories] = useState('');
  const [dietType, setDietType] = useState('');
  const [activityLevel, setActivityLevel] =
    useState('');
  const [restrictions, setRestrictions] =
    useState('');
  const [notes, setNotes] = useState('');

  const [memberModalVisible, setMemberModalVisible] =
    useState(false);

  const [goalModalVisible, setGoalModalVisible] =
    useState(false);

  const [
    dietTypeModalVisible,
    setDietTypeModalVisible,
  ] = useState(false);

  const [
    activityModalVisible,
    setActivityModalVisible,
  ] = useState(false);

  const [meals, setMeals] = useState([
    {
      id: 1,
      type: 'Breakfast',
      time: '8:00 AM',
      foods: [
        {
          id: 1,
          name: '',
          quantity: '',
        },
      ],
    },
    {
      id: 2,
      type: 'Lunch',
      time: '1:00 PM',
      foods: [
        {
          id: 1,
          name: '',
          quantity: '',
        },
      ],
    },
    {
      id: 3,
      type: 'Snacks',
      time: '5:00 PM',
      foods: [
        {
          id: 1,
          name: '',
          quantity: '',
        },
      ],
    },
    {
      id: 4,
      type: 'Dinner',
      time: '8:00 PM',
      foods: [
        {
          id: 1,
          name: '',
          quantity: '',
        },
      ],
    },
  ]);

  const goals = [
    'Weight Loss',
    'Weight Gain',
    'Muscle Gain',
    'Fat Loss',
    'Maintenance',
    'General Fitness',
  ];

  const dietTypes = [
    'Balanced',
    'Vegetarian',
    'Vegan',
    'High Protein',
    'Low Carb',
    'Keto',
  ];

  const activityLevels = [
    'Sedentary',
    'Lightly Active',
    'Moderately Active',
    'Very Active',
    'Extremely Active',
  ];

  const isGlobal = planScope === 'global';

  const step1Complete =
    isGlobal || !!selectedMember;

  const step2Complete =
    !!planName.trim() &&
    !!goal &&
    !!calories.trim() &&
    !!dietType &&
    !!activityLevel;

  const step3Complete = meals.some(meal =>
    meal.foods.some(
      food =>
        food.name.trim() ||
        food.quantity.trim(),
    ),
  );

  const getMemberName = member => {
    return (
      member?.fullName ||
      member?.name ||
      member?.memberName ||
      'Unnamed Member'
    );
  };

  const getMemberEmail = member => {
    return (
      member?.email ||
      member?.mobile ||
      ''
    );
  };

  const getTrainerId = () => {
    return trainer?.id
      ? String(trainer.id)
      : null;
  };

  const updateMealFood = (
    mealId,
    foodId,
    field,
    value,
  ) => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id !== mealId) {
          return meal;
        }

        return {
          ...meal,
          foods: meal.foods.map(food =>
            food.id === foodId
              ? {
                  ...food,
                  [field]: value,
                }
              : food,
          ),
        };
      }),
    );
  };

  const addFood = mealId => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id !== mealId) {
          return meal;
        }

        return {
          ...meal,
          foods: [
            ...meal.foods,
            {
              id:
                Date.now() +
                Math.random(),
              name: '',
              quantity: '',
            },
          ],
        };
      }),
    );
  };

  const removeFood = (
    mealId,
    foodId,
  ) => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id !== mealId) {
          return meal;
        }

        if (meal.foods.length === 1) {
          return meal;
        }

        return {
          ...meal,
          foods: meal.foods.filter(
            food =>
              food.id !== foodId,
          ),
        };
      }),
    );
  };

  const selectMember = member => {
    setSelectedMember(member);
    setMemberModalVisible(false);
  };

  const selectGoal = value => {
    setGoal(value);
    setGoalModalVisible(false);
  };

  const selectDietType = value => {
    setDietType(value);
    setDietTypeModalVisible(false);
  };

  const selectActivityLevel = value => {
    setActivityLevel(value);
    setActivityModalVisible(false);
  };

  const handleScopeChange = scope => {
    setPlanScope(scope);

    if (scope === 'global') {
      setSelectedMember(null);
    }
  };

  const handleSavePlan = () => {
    const trainerId = getTrainerId();

    if (!trainerId) {
      Alert.alert(
        'Trainer ID Missing',
        'Your trainer account does not have a valid ID.',
      );
      return;
    }

    if (
      planScope === 'specific' &&
      !selectedMember
    ) {
      Alert.alert(
        'Select Member',
        'Please select a member for this diet plan.',
      );
      return;
    }

    if (!planName.trim()) {
      Alert.alert(
        'Plan Name Required',
        'Please enter a diet plan name.',
      );
      return;
    }

    if (!goal) {
      Alert.alert(
        'Select Goal',
        'Please select a fitness goal.',
      );
      return;
    }

    if (!calories.trim()) {
      Alert.alert(
        'Calories Required',
        'Please enter the daily calorie target.',
      );
      return;
    }

    if (!dietType) {
      Alert.alert(
        'Select Diet Type',
        'Please select a dietary preference.',
      );
      return;
    }

    if (!activityLevel) {
      Alert.alert(
        'Select Activity Level',
        'Please select an activity level.',
      );
      return;
    }

    const cleanedMeals = meals.map(meal => ({
      ...meal,
      foods: meal.foods.filter(
        food =>
          food.name.trim() ||
          food.quantity.trim(),
      ),
    }));

    const hasFood = cleanedMeals.some(
      meal => meal.foods.length > 0,
    );

    if (!hasFood) {
      Alert.alert(
        'Meal Plan Required',
        'Please add at least one food item.',
      );
      return;
    }

    try {
      const memberId =
        planScope === 'specific'
          ? String(selectedMember?.id || '')
          : null;

      if (
        planScope === 'specific' &&
        !memberId
      ) {
        Alert.alert(
          'Member ID Missing',
          'The selected member does not have a valid ID.',
        );
        return;
      }

      const now = new Date().toISOString();

      const dietPlan = {
        id:
          `diet-${planScope}-` +
          Date.now().toString() +
          Math.random()
            .toString(36)
            .substring(2),

        trainerId,

        type:
          planScope === 'global'
            ? 'global'
            : 'specific',

        scope:
          planScope === 'global'
            ? 'global'
            : 'specific',

        memberId,

        memberName:
          planScope === 'specific'
            ? getMemberName(selectedMember)
            : null,

        memberEmail:
          planScope === 'specific'
            ? selectedMember?.email || ''
            : null,

        memberMobile:
          planScope === 'specific'
            ? selectedMember?.mobile || ''
            : null,

        planName: planName.trim(),

        goal,

        calories: calories.trim(),

        dietType,

        activityLevel,

        restrictions:
          restrictions.trim(),

        meals: cleanedMeals,

        notes: notes.trim(),

        createdAt: now,

        updatedAt: now,

        status: 'Active',
      };

      dispatch(addDietPlan(dietPlan));

      Alert.alert(
        'Diet Plan Saved',
        planScope === 'global'
          ? 'The global diet plan has been successfully created for your members.'
          : 'The diet plan has been successfully created for the selected member.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Save diet plan error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save the diet plan.',
      );
    }
  };

  const getMealIcon = type => {
    if (type === 'Breakfast') {
      return 'sunny-outline';
    }

    if (type === 'Lunch') {
      return 'restaurant-outline';
    }

    if (type === 'Dinner') {
      return 'moon-outline';
    }

    return 'cafe-outline';
  };

  const renderOptionModal = (
    visible,
    setVisible,
    title,
    options,
    selectedValue,
    onSelect,
  ) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(false)
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {title}
              </Text>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() =>
                  setVisible(false)
                }>
                <Ionicons
                  name="close"
                  size={22}
                  color="#333333"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}>
              {options.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    selectedValue === option &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    onSelect(option)
                  }>
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedValue === option &&
                        styles.selectedOptionText,
                    ]}>
                    {option}
                  </Text>

                  {selectedValue === option && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#4169D8"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={0}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }>
              <Ionicons
                name="arrow-back"
                size={23}
                color="#333333"
              />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Diet Plan
              </Text>

              <Text style={styles.subtitle}>
                Create a nutrition plan
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }>
            <View style={styles.scopeSection}>
              <Text style={styles.scopeTitle}>
                Create For
              </Text>

              <View style={styles.scopeContainer}>
                <TouchableOpacity
                  style={[
                    styles.scopeButton,
                    planScope === 'global' &&
                      styles.scopeButtonActive,
                  ]}
                  onPress={() =>
                    handleScopeChange('global')
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="globe-outline"
                    size={19}
                    color={
                      planScope === 'global'
                        ? '#FFFFFF'
                        : '#666666'
                    }
                  />

                  <Text
                    style={[
                      styles.scopeButtonText,
                      planScope === 'global' &&
                        styles.scopeButtonTextActive,
                    ]}>
                    Global
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.scopeButton,
                    planScope === 'specific' &&
                      styles.scopeButtonActive,
                  ]}
                  onPress={() =>
                    handleScopeChange('specific')
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={
                      planScope === 'specific'
                        ? '#FFFFFF'
                        : '#666666'
                    }
                  />

                  <Text
                    style={[
                      styles.scopeButtonText,
                      planScope === 'specific' &&
                        styles.scopeButtonTextActive,
                    ]}>
                    Specific Member
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.scopeDescription}>
                {isGlobal
                  ? 'This plan can be used by all members of this trainer.'
                  : 'This plan will be assigned only to the selected member.'}
              </Text>
            </View>

            <View style={styles.stepsCard}>
              {!isGlobal && (
                <>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        step1Complete &&
                          styles.stepCircleActive,
                      ]}>
                      <Text
                        style={[
                          styles.stepNumber,
                          step1Complete &&
                            styles.stepNumberActive,
                        ]}>
                        1
                      </Text>
                    </View>

                    <Text style={styles.stepText}>
                      Member
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepLine,
                      step1Complete &&
                        styles.stepLineActive,
                    ]}
                  />
                </>
              )}

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step2Complete &&
                      styles.stepCircleActive,
                  ]}>
                  <Text
                    style={[
                      styles.stepNumber,
                      step2Complete &&
                        styles.stepNumberActive,
                    ]}>
                    {isGlobal ? '1' : '2'}
                  </Text>
                </View>

                <Text style={styles.stepText}>
                  Plan Details
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  step2Complete &&
                    styles.stepLineActive,
                ]}
              />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step3Complete &&
                      styles.stepCircleActive,
                  ]}>
                  <Text
                    style={[
                      styles.stepNumber,
                      step3Complete &&
                        styles.stepNumberActive,
                    ]}>
                    {isGlobal ? '2' : '3'}
                  </Text>
                </View>

                <Text style={styles.stepText}>
                  Meals
                </Text>
              </View>
            </View>

            {planScope === 'specific' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Select Member
                </Text>

                <TouchableOpacity
                  style={styles.memberSelector}
                  onPress={() =>
                    setMemberModalVisible(true)
                  }>
                  <View style={styles.memberIcon}>
                    <Ionicons
                      name="person-outline"
                      size={21}
                      color="#4169D8"
                    />
                  </View>

                  <View style={styles.memberInfo}>
                    <Text
                      style={[
                        styles.memberLabel,
                        !selectedMember &&
                          styles.placeholderText,
                      ]}>
                      {selectedMember
                        ? getMemberName(
                            selectedMember,
                          )
                        : 'Select a member'}
                    </Text>

                    <Text
                      style={styles.memberSubtext}>
                      {selectedMember
                        ? getMemberEmail(
                            selectedMember,
                          )
                        : 'Choose member for this diet plan'}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Plan Details
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Diet Plan Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter diet plan name"
                  placeholderTextColor="#999999"
                  value={planName}
                  onChangeText={setPlanName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Fitness Goal
                </Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() =>
                    setGoalModalVisible(true)
                  }>
                  <Text
                    style={[
                      styles.selectText,
                      !goal &&
                        styles.placeholderText,
                    ]}>
                    {goal || 'Select goal'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Daily Calories
                </Text>

                <View
                  style={styles.inputWithUnit}>
                  <TextInput
                    style={styles.calorieInput}
                    placeholder="e.g. 2000"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                  />

                  <Text style={styles.unitText}>
                    kcal/day
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Dietary Preference
                </Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() =>
                    setDietTypeModalVisible(
                      true,
                    )
                  }>
                  <Text
                    style={[
                      styles.selectText,
                      !dietType &&
                        styles.placeholderText,
                    ]}>
                    {dietType ||
                      'Select diet type'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Activity Level
                </Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() =>
                    setActivityModalVisible(true)
                  }>
                  <Text
                    style={[
                      styles.selectText,
                      !activityLevel &&
                        styles.placeholderText,
                    ]}>
                    {activityLevel ||
                      'Select activity level'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Allergies / Restrictions
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nuts, lactose, gluten..."
                  placeholderTextColor="#999999"
                  value={restrictions}
                  onChangeText={setRestrictions}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Meal Plan
              </Text>

              {meals.map(meal => (
                <View
                  key={meal.id}
                  style={styles.mealCard}>
                  <View
                    style={styles.mealHeader}>
                    <View
                      style={
                        styles.mealTitleContainer
                      }>
                      <View style={styles.mealIcon}>
                        <Ionicons
                          name={getMealIcon(
                            meal.type,
                          )}
                          size={21}
                          color="#4169D8"
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.mealTitle
                          }>
                          {meal.type}
                        </Text>

                        <Text
                          style={
                            styles.mealTime
                          }>
                          {meal.time}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-up"
                      size={20}
                      color="#777777"
                    />
                  </View>

                  <View
                    style={styles.mealDivider}
                  />

                  {meal.foods.map(
                    (food, index) => (
                      <View
                        key={food.id}
                        style={styles.foodRow}>
                        <View
                          style={
                            styles.foodNumber
                          }>
                          <Text
                            style={
                              styles.foodNumberText
                            }>
                            {index + 1}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.foodInputs
                          }>
                          <TextInput
                            style={
                              styles.foodNameInput
                            }
                            placeholder="Food item"
                            placeholderTextColor="#999999"
                            value={food.name}
                            onChangeText={value =>
                              updateMealFood(
                                meal.id,
                                food.id,
                                'name',
                                value,
                              )
                            }
                          />

                          <TextInput
                            style={
                              styles.quantityInput
                            }
                            placeholder="Quantity"
                            placeholderTextColor="#999999"
                            value={
                              food.quantity
                            }
                            onChangeText={value =>
                              updateMealFood(
                                meal.id,
                                food.id,
                                'quantity',
                                value,
                              )
                            }
                          />
                        </View>

                        <TouchableOpacity
                          style={
                            styles.deleteButton
                          }
                          onPress={() =>
                            removeFood(
                              meal.id,
                              food.id,
                            )
                          }>
                          <Ionicons
                            name="trash-outline"
                            size={19}
                            color="#D9534F"
                          />
                        </TouchableOpacity>
                      </View>
                    ),
                  )}

                  <TouchableOpacity
                    style={
                      styles.addFoodButton
                    }
                    onPress={() =>
                      addFood(meal.id)
                    }>
                    <Ionicons
                      name="add-circle-outline"
                      size={19}
                      color="#4169D8"
                    />

                    <Text
                      style={
                        styles.addFoodText
                      }>
                      Add Food
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Trainer Notes
              </Text>

              <TextInput
                style={styles.notesInput}
                placeholder="Add nutrition guidelines, restrictions or notes..."
                placeholderTextColor="#999999"
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePlan}
              activeOpacity={0.85}>
              

              <Text
                style={styles.saveButtonText}>
                {isGlobal
                  ? 'Save Global Diet Plan'
                  : 'Save Member Diet Plan'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={memberModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMemberModalVisible(false)
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Member
              </Text>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() =>
                  setMemberModalVisible(false)
                }>
                <Ionicons
                  name="close"
                  size={22}
                  color="#333333"
                />
              </TouchableOpacity>
            </View>

            {members.length === 0 ? (
              <View style={styles.emptyMembers}>
                <Ionicons
                  name="people-outline"
                  size={38}
                  color="#4169D8"
                />

                <Text
                  style={
                    styles.emptyMembersTitle
                  }>
                  No Members Found
                </Text>

                <Text
                  style={
                    styles.emptyMembersText
                  }>
                  Add a member before creating
                  a specific diet plan.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }>
                {members.map(member => {
                  const isSelected =
                    selectedMember === member;

                  return (
                    <TouchableOpacity
                      key={String(member.id)}
                      style={[
                        styles.memberOption,
                        isSelected &&
                          styles.selectedOption,
                      ]}
                      onPress={() =>
                        selectMember(member)
                      }>
                      <View
                        style={
                          styles.optionIcon
                        }>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#4169D8"
                        />
                      </View>

                      <View
                        style={
                          styles.memberOptionInfo
                        }>
                        <Text
                          style={
                            styles.memberOptionName
                          }>
                          {getMemberName(member)}
                        </Text>

                        <Text
                          style={
                            styles.memberOptionEmail
                          }>
                          {getMemberEmail(member)}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={21}
                          color="#4169D8"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {renderOptionModal(
        goalModalVisible,
        setGoalModalVisible,
        'Select Fitness Goal',
        goals,
        goal,
        selectGoal,
      )}

      {renderOptionModal(
        dietTypeModalVisible,
        setDietTypeModalVisible,
        'Dietary Preference',
        dietTypes,
        dietType,
        selectDietType,
      )}

      {renderOptionModal(
        activityModalVisible,
        setActivityModalVisible,
        'Activity Level',
        activityLevels,
        activityLevel,
        selectActivityLevel,
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EA',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },

  scopeSection: {
    marginBottom: 20,
  },

  scopeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },

  scopeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
  },

  scopeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  scopeButtonActive: {
    backgroundColor: '#4169D8',
  },

  scopeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
  },

  scopeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  scopeDescription: {
    fontSize: 11,
    color: '#888888',
    marginTop: 8,
    lineHeight: 16,
  },

  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E3E6EB',
  },

  stepItem: {
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#C9D6FF',
  },

  stepCircleActive: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  stepNumber: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
  },

  stepNumberActive: {
    color: '#FFFFFF',
  },

  stepText: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  stepLine: {
    height: 2,
    backgroundColor: '#D9DDE3',
    width: 22,
    marginBottom: 23,
  },

  stepLineActive: {
    backgroundColor: '#4169D8',
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },

  memberSelector: {
    minHeight: 75,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  memberInfo: {
    flex: 1,
  },

  memberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },

  memberSubtext: {
    fontSize: 11,
    color: '#888888',
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 7,
  },

  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    paddingHorizontal: 14,
    color: '#333333',
    fontSize: 14,
  },

  selectInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 13,
    color: '#333333',
  },

  placeholderText: {
    color: '#999999',
  },

  inputWithUnit: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
  },

  calorieInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: '#333333',
    fontSize: 14,
  },

  unitText: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '600',
  },

  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    padding: 15,
    marginBottom: 15,
  },

  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mealIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },

  mealTime: {
    fontSize: 11,
    color: '#888888',
  },

  mealDivider: {
    height: 1,
    backgroundColor: '#ECEEF1',
    marginVertical: 14,
  },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  foodNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  foodNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4169D8',
  },

  foodInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },

  foodNameInput: {
    flex: 1.4,
    height: 44,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    paddingHorizontal: 11,
    fontSize: 13,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },

  quantityInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    paddingHorizontal: 11,
    fontSize: 13,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },

  deleteButton: {
    width: 34,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 5,
  },

  addFoodButton: {
    height: 42,
    borderRadius: 9,
    backgroundColor: '#EAF0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  addFoodText: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  notesInput: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    padding: 14,
    fontSize: 13,
    color: '#333333',
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    paddingHorizontal: 15,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '75%',
    padding: 15,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    marginBottom: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOption: {
    minHeight: 52,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },

  selectedOption: {
    backgroundColor: '#EAF0FF',
  },

  modalOptionText: {
    fontSize: 14,
    color: '#444444',
  },

  selectedOptionText: {
    color: '#4169D8',
    fontWeight: '700',
  },

  memberOption: {
    minHeight: 65,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  memberOptionInfo: {
    flex: 1,
  },

  memberOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },

  memberOptionEmail: {
    fontSize: 11,
    color: '#888888',
  },

  emptyMembers: {
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 15,
  },

  emptyMembersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginTop: 10,
    marginBottom: 5,
  },

  emptyMembersText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
});

export default DietPlanScreen;
import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {addWorkoutPlan} from '../../redux/slices/trainerSlice';

const BLUE = '#4169D8';
const GREEN = '#22C55E';

const CreateWorkoutPlanScreen = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const trainer = useSelector(
    state => state.auth?.user || null,
  );

  const routeMemberId =
    route?.params?.memberId;

  const routeMemberName =
    route?.params?.memberName;

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [planType, setPlanType] =
    useState('specific');

  const [memberModalVisible, setMemberModalVisible] =
    useState(false);

  const [difficultyModalVisible, setDifficultyModalVisible] =
    useState(false);

  const [planName, setPlanName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [duration, setDuration] =
    useState('');

  const [difficulty, setDifficulty] =
    useState('Moderate');

  const [trainerNotes, setTrainerNotes] =
    useState('');

  const getTrainerId = trainer => {
    return trainer?.id
      ? String(trainer.id)
      : null;
  };

  const currentTrainerId = getTrainerId(trainer);

  const createExerciseId = () => {
    return `exercise-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
  };

  const [exercises, setExercises] = useState([
    {
      id: createExerciseId(),
      name: '',
      sets: '',
      reps: '',
      rest: '',
    },
  ]);

  const difficulties = [
    'Beginner',
    'Moderate',
    'Advanced',
  ];

  const getTrainerIds = record => {
    if (
      Array.isArray(record?.trainerIds) &&
      record.trainerIds.length > 0
    ) {
      return record.trainerIds.map(String);
    }

    if (record?.trainerId) {
      return [String(record.trainerId)];
    }

    if (record?.createdByTrainerId) {
      return [
        String(record.createdByTrainerId),
      ];
    }

    return [];
  };

  const belongsToTrainer = (
    member,
    trainerId,
  ) => {
    if (!member || !trainerId) {
      return false;
    }

    const memberTrainerIds =
      getTrainerIds(member);

    if (
      memberTrainerIds.some(
        id =>
          String(id) ===
          String(trainerId),
      )
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (planType !== 'specific') {
      setSelectedMember(null);
      return;
    }

    if (
      !routeMemberId ||
      members.length === 0
    ) {
      return;
    }

    const member = members.find(
      item =>
        String(
          item?.id || '',
        ) ===
        String(routeMemberId),
    );

    if (
      member &&
      belongsToTrainer(
        member,
        currentTrainerId,
      )
    ) {
      setSelectedMember(member);
    } else {
      setSelectedMember(null);
    }
  }, [
    planType,
    routeMemberId,
    members,
    currentTrainerId,
  ]);

  const handlePlanTypeChange =
    type => {
      setPlanType(type);

      if (type === 'global') {
        setSelectedMember(null);
        setMemberModalVisible(false);
      }
    };

  const handleSelectMember =
    member => {
      if (
        !belongsToTrainer(
          member,
          currentTrainerId,
        )
      ) {
        Alert.alert(
          'Member Access',
          'You can only select members assigned to you.',
        );

        return;
      }

      setSelectedMember(member);
      setMemberModalVisible(false);
    };

  const addExercise = () => {
    setExercises(
      previousExercises => [
        ...previousExercises,
        {
          id: createExerciseId(),
          name: '',
          sets: '',
          reps: '',
          rest: '',
        },
      ],
    );
  };

  const removeExercise = id => {
    if (exercises.length === 1) {
      Alert.alert(
        'Exercise Required',
        'At least one exercise is required.',
      );

      return;
    }

    setExercises(
      previousExercises =>
        previousExercises.filter(
          exercise =>
            exercise.id !== id,
        ),
    );
  };

  const updateExercise = (
    id,
    field,
    value,
  ) => {
    setExercises(
      previousExercises =>
        previousExercises.map(
          exercise => {
            if (
              exercise.id !== id
            ) {
              return exercise;
            }

            return {
              ...exercise,
              [field]: value,
            };
          },
        ),
    );
  };

  const handleDifficultySelect =
    value => {
      setDifficulty(value);
      setDifficultyModalVisible(
        false,
      );
    };

  const resetWorkoutForm = () => {
    setSelectedMember(null);
    setPlanType('specific');
    setPlanName('');
    setDescription('');
    setDuration('');
    setDifficulty('Moderate');
    setTrainerNotes('');

    setExercises([
      {
        id: createExerciseId(),
        name: '',
        sets: '',
        reps: '',
        rest: '',
      },
    ]);

    setMemberModalVisible(false);
    setDifficultyModalVisible(false);
  };

  const step1Complete =
    planType === 'global' ||
    !!selectedMember;

  const step2Complete =
    !!planName.trim() &&
    !!duration.trim() &&
    !!difficulty;

  const step3Complete =
    exercises.some(
      exercise =>
        String(
          exercise?.name || '',
        ).trim() !== '',
    );

  const handleSave = () => {
    if (!currentTrainerId) {
      Alert.alert(
        'Trainer Error',
        'Unable to identify the logged-in trainer.',
      );

      return;
    }

    if (
      planType === 'specific' &&
      (!selectedMember ||
        !belongsToTrainer(
          selectedMember,
          currentTrainerId,
        ))
    ) {
      Alert.alert(
        'Member Access',
        'You can only assign workout plans to members assigned to you.',
      );

      return;
    }

    if (
      planType === 'specific' &&
      !selectedMember
    ) {
      Alert.alert(
        'Select Member',
        'Please select a member.',
      );

      return;
    }

    if (!planName.trim()) {
      Alert.alert(
        'Workout Name',
        'Please enter workout plan name.',
      );

      return;
    }

    if (!duration.trim()) {
      Alert.alert(
        'Duration',
        'Please enter workout duration.',
      );

      return;
    }

    const validExercises =
      exercises
        .filter(
          exercise =>
            String(
              exercise?.name || '',
            ).trim() !== '',
        )
        .map(
          (
            exercise,
            index,
          ) => ({
            id:
              exercise?.id ||
              createExerciseId(),

            exerciseIndex:
              index,

            name: String(
              exercise?.name ||
                '',
            ).trim(),

            sets: String(
              exercise?.sets ||
                '',
            ).trim(),

            reps: String(
              exercise?.reps ||
                '',
            ).trim(),

            rest: String(
              exercise?.rest ||
                '',
            ).trim(),
          }),
        );

    if (
      validExercises.length ===
      0
    ) {
      Alert.alert(
        'Exercises Required',
        'Please add at least one exercise.',
      );

      return;
    }

    const workoutId =
      `workout-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;

    const memberId =
      planType === 'specific'
        ? String(
            selectedMember?.id ||
              '',
          )
        : null;

    if (
      planType === 'specific' &&
      !memberId
    ) {
      Alert.alert(
        'Member Error',
        'The selected member does not have a valid ID.',
      );

      return;
    }

    const workoutPlan = {
      id: workoutId,

      memberId,

      trainerId:
        String(currentTrainerId),

      trainerIds: [
        String(currentTrainerId),
      ],

      createdByTrainerId:
        String(currentTrainerId),

      type: planType,

      scope:
        planType === 'global'
          ? 'global'
          : 'specific',

      memberName:
        planType === 'specific'
          ? selectedMember?.name ||
            selectedMember?.fullName ||
            selectedMember?.username ||
            routeMemberName ||
            ''
          : null,

      memberEmail:
        planType === 'specific'
          ? selectedMember?.email ||
            selectedMember?.memberEmail ||
            ''
          : '',

      memberMobile:
        planType === 'specific'
          ? selectedMember?.mobile ||
            ''
          : '',

      planName:
        planName.trim(),

      description:
        description.trim(),

      duration:
        duration.trim(),

      difficulty,

      exercises:
        validExercises,

      trainerNotes:
        trainerNotes.trim(),

      createdAt:
        new Date().toISOString(),

      status: 'Active',
    };

    try {
      dispatch(
        addWorkoutPlan(workoutPlan),
      );

      Alert.alert(
        'Success',
        planType === 'global'
          ? 'Global workout plan created successfully.'
          : 'Workout plan assigned successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetWorkoutForm();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.log(
        'Save workout plan error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save workout plan. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>
        <View style={styles.screen}>
          
            <View
              style={styles.header}>
              <TouchableOpacity
                style={
                  styles.backButton
                }
                onPress={() =>
                  navigation.goBack()
                }>
                <Ionicons
                  name="arrow-back"
                  size={23}
                  color="#333333"
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerInfo
                }>
                <Text
                  style={styles.title}>
                  Create Workout Plan
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }>
                  Create a workout plan
                  for your members
                </Text>
              </View>
            </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.container
            }>

            <View
              style={
                styles.planTypeContainer
              }>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.planTypeButton,
                  planType ===
                    'global' &&
                    styles.planTypeButtonActive,
                ]}
                onPress={() =>
                  handlePlanTypeChange(
                    'global',
                  )
                }>
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color={
                    planType ===
                    'global'
                      ? '#FFFFFF'
                      : '#777777'
                  }
                />

                <Text
                  style={[
                    styles.planTypeText,
                    planType ===
                      'global' &&
                      styles.planTypeTextActive,
                  ]}>
                  Global Exercise
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.planTypeButton,
                  planType ===
                    'specific' &&
                    styles.planTypeButtonActive,
                ]}
                onPress={() =>
                  handlePlanTypeChange(
                    'specific',
                  )
                }>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={
                    planType ===
                    'specific'
                      ? '#FFFFFF'
                      : '#777777'
                  }
                />

                <Text
                  style={[
                    styles.planTypeText,
                    planType ===
                      'specific' &&
                      styles.planTypeTextActive,
                  ]}>
                  Specific Member
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.scopeInfo
              }>
              <Ionicons
                name={
                  planType ===
                  'global'
                    ? 'globe-outline'
                    : 'person-outline'
                }
                size={17}
                color={BLUE}
              />

              <Text
                style={
                  styles.scopeInfoText
                }>
                {planType ===
                'global'
                  ? 'This workout will be available to all members assigned to you.'
                  : 'This workout will be assigned only to the selected member.'}
              </Text>
            </View>

            <View
              style={styles.stepCard}>
              <View
                style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step1Complete &&
                      styles.stepCircleActive,
                  ]}>
                  {step1Complete ? (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.stepNumber
                      }>
                      1
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.stepText
                  }>
                  {planType ===
                  'global'
                    ? 'Scope'
                    : 'Member'}
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  step1Complete &&
                    styles.stepLineActive,
                ]}
              />

              <View
                style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step2Complete &&
                      styles.stepCircleActive,
                  ]}>
                  {step2Complete ? (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.stepNumber
                      }>
                      2
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.stepText
                  }>
                  Details
                </Text>
              </View>

              <View
                style={[
                  styles.stepLine,
                  step2Complete &&
                    styles.stepLineActive,
                ]}
              />

              <View
                style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step3Complete &&
                      styles.stepCircleActive,
                  ]}>
                  {step3Complete ? (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.stepNumber
                      }>
                      3
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.stepText
                  }>
                  Exercises
                </Text>
              </View>
            </View>

            {planType ===
            'specific' ? (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }>
                  Select Member
                </Text>

                <TouchableOpacity
                  style={
                    styles.selector
                  }
                  onPress={() =>
                    setMemberModalVisible(
                      true,
                    )
                  }>
                  <View
                    style={
                      styles.selectorIcon
                    }>
                    <Ionicons
                      name="person-outline"
                      size={21}
                      color={BLUE}
                    />
                  </View>

                  <View
                    style={
                      styles.selectorContent
                    }>
                    <Text
                      style={
                        styles.selectorLabel
                      }>
                      MEMBER
                    </Text>

                    <Text
                      style={
                        selectedMember
                          ? styles.selectorValue
                          : styles.placeholder
                      }>
                      {selectedMember
                        ? selectedMember.name ||
                          selectedMember.fullName ||
                          selectedMember.username ||
                          'Selected Member'
                        : 'Select a member'}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#7D8795"
                  />
                </TouchableOpacity>
              </>
            ) : null}

            <Text
              style={[
                styles.sectionTitle,
                {
                  marginTop:
                    planType ===
                    'global'
                      ? 8
                      : 22,
                },
              ]}>
              Workout Details
            </Text>

            <View
              style={styles.card}>
              <Text
                style={
                  styles.inputLabel
                }>
                WORKOUT PLAN NAME
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Full Body Strength"
                placeholderTextColor="#9AA3AF"
                value={planName}
                onChangeText={
                  setPlanName
                }
              />

              <Text
                style={
                  styles.inputLabel
                }>
                DESCRIPTION
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                placeholder="Describe the workout plan"
                placeholderTextColor="#9AA3AF"
                value={description}
                onChangeText={
                  setDescription
                }
                multiline
              />

              <Text
                style={
                  styles.inputLabel
                }>
                DURATION
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. 45 min"
                placeholderTextColor="#9AA3AF"
                value={duration}
                onChangeText={
                  setDuration
                }
              />

              <Text
                style={
                  styles.inputLabel
                }>
                DIFFICULTY
              </Text>

              <TouchableOpacity
                style={
                  styles.inputSelector
                }
                onPress={() =>
                  setDifficultyModalVisible(
                    true,
                  )
                }>
                <Text
                  style={
                    styles.inputSelectorText
                  }>
                  {difficulty}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={19}
                  color="#7D8795"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.sectionRow
              }>
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }>
                  Exercises
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }>
                  Add exercises to this
                  workout plan
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.addButton
                }
                onPress={
                  addExercise
                }>
               

                <Text
                  style={
                    styles.addButtonText
                  }>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {exercises.map(
              (
                exercise,
                index,
              ) => (
                <View
                  key={exercise.id}
                  style={
                    styles.exerciseCard
                  }>
                  <View
                    style={
                      styles.exerciseHeader
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
                        styles.exerciseHeaderTitle
                      }>
                      Exercise {index + 1}
                    </Text>

                    {exercises.length >
                    1 ? (
                      <TouchableOpacity
                        onPress={() =>
                          removeExercise(
                            exercise.id,
                          )
                        }>
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#E05252"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <Text
                    style={
                      styles.inputLabel
                    }>
                    EXERCISE NAME
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    placeholder="e.g. Bench Press"
                    placeholderTextColor="#9AA3AF"
                    value={
                      exercise.name
                    }
                    onChangeText={value =>
                      updateExercise(
                        exercise.id,
                        'name',
                        value,
                      )
                    }
                  />

                  <View
                    style={
                      styles.rowInputs
                    }>
                    <View
                      style={
                        styles.smallInputWrapper
                      }>
                      <Text
                        style={
                          styles.inputLabel
                        }>
                        SETS
                      </Text>

                      <TextInput
                        style={
                          styles.input
                        }
                        placeholder="3"
                        placeholderTextColor="#9AA3AF"
                        keyboardType="numeric"
                        value={
                          exercise.sets
                        }
                        onChangeText={value =>
                          updateExercise(
                            exercise.id,
                            'sets',
                            value,
                          )
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.smallInputWrapper
                      }>
                      <Text
                        style={
                          styles.inputLabel
                        }>
                        REPS
                      </Text>

                      <TextInput
                        style={
                          styles.input
                        }
                        placeholder="12"
                        placeholderTextColor="#9AA3AF"
                        keyboardType="numeric"
                        value={
                          exercise.reps
                        }
                        onChangeText={value =>
                          updateExercise(
                            exercise.id,
                            'reps',
                            value,
                          )
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.smallInputWrapper
                      }>
                      <Text
                        style={
                          styles.inputLabel
                        }>
                        REST
                      </Text>

                      <TextInput
                        style={
                          styles.input
                        }
                        placeholder="60"
                        placeholderTextColor="#9AA3AF"
                        keyboardType="numeric"
                        value={
                          exercise.rest
                        }
                        onChangeText={value =>
                          updateExercise(
                            exercise.id,
                            'rest',
                            value,
                          )
                        }
                      />
                    </View>
                  </View>
                </View>
              ),
            )}

            <Text
              style={[
                styles.sectionTitle,
                {marginTop: 22},
              ]}>
              Trainer Notes
            </Text>

            <View
              style={styles.card}>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                ]}
                placeholder="Add instructions for the member..."
                placeholderTextColor="#9AA3AF"
                value={trainerNotes}
                onChangeText={
                  setTrainerNotes
                }
                multiline
              />
            </View>

            <TouchableOpacity
              style={
                styles.saveButton
              }
              onPress={handleSave}
              activeOpacity={0.85}>
             

              <Text
                style={
                  styles.saveButtonText
                }>
                {planType ===
                'global'
                  ? 'Create Global Workout'
                  : 'Save Workout Plan'}
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.bottomSpace
              }
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={
          planType ===
            'specific' &&
          memberModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setMemberModalVisible(
            false,
          )
        }>
        <Pressable
          style={
            styles.modalOverlay2
          }
          onPress={() =>
            setMemberModalVisible(
              false,
            )
          }>
          <Pressable
            style={styles.modalCard}
            onPress={() => {}}>
            <View
              style={
                styles.modalHandle
              }
            />

            <Text
              style={
                styles.modalTitle
              }>
              Select Member
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }>
              {members.filter(
                member =>
                  belongsToTrainer(
                    member,
                    currentTrainerId,
                  ),
              ).length === 0 ? (
                <View
                  style={
                    styles.emptyModal
                  }>
                  <Ionicons
                    name="people-outline"
                    size={38}
                    color="#A0A8B5"
                  />

                  <Text
                    style={
                      styles.emptyModalText
                    }>
                    No members available
                  </Text>
                </View>
              ) : (
                members
                  .filter(
                    member =>
                      belongsToTrainer(
                        member,
                        currentTrainerId,
                      ),
                  )
                  .map(
                    member => {
                      const memberId =
                        member?.id;

                      const name =
                        member?.name ||
                        member?.fullName ||
                        member?.username ||
                        'Member';

                      const isSelected =
                        String(
                          selectedMember?.id ||
                            '',
                        ) ===
                        String(
                          memberId ||
                            '',
                        );

                      return (
                        <TouchableOpacity
                          key={String(
                            memberId,
                          )}
                          style={[
                            styles.memberOption,
                            isSelected &&
                              styles.memberOptionSelected,
                          ]}
                          onPress={() =>
                            handleSelectMember(
                              member,
                            )
                          }>
                          <View
                            style={
                              styles.memberAvatar
                            }>
                            <Text
                              style={
                                styles.memberAvatarText
                              }>
                              {name
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.memberOptionContent
                            }>
                            <Text
                              style={
                                styles.memberOptionName
                              }>
                              {name}
                            </Text>

                            <Text
                              style={
                                styles.memberOptionEmail
                              }>
                              {member?.email ||
                                member?.memberEmail ||
                                'No email'}
                            </Text>
                          </View>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={
                                BLUE
                              }
                            />
                          ) : null}
                        </TouchableOpacity>
                      );
                    },
                  )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={
          difficultyModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDifficultyModalVisible(
            false,
          )
        }>
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setDifficultyModalVisible(
              false,
            )
          }>
          <Pressable
            style={
              styles.difficultyModal
            }
            onPress={() => {}}>
            <Text
              style={
                styles.modalTitle
              }>
              Select Difficulty
            </Text>

            {difficulties.map(
              item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.difficultyOption,
                    difficulty ===
                      item &&
                      styles.difficultyOptionSelected,
                  ]}
                  onPress={() =>
                    handleDifficultySelect(
                      item,
                    )
                  }>
                  <Text
                    style={[
                      styles.difficultyText,
                      difficulty ===
                        item &&
                        styles.difficultyTextSelected,
                    ]}>
                    {item}
                  </Text>

                  {difficulty ===
                  item ? (
                    <Ionicons
                      name="checkmark"
                      size={21}
                      color={BLUE}
                    />
                  ) : null}
                </TouchableOpacity>
              ),
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  container: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 35,
  },

  header: {
    minHeight:78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6EB',
    marginBottom: 18,
    backgroundColor:'#FFFFFF',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F1F3F7',
    borderWidth: 1,
    borderColor: '#E1E6EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#202733',
  },

  subtitle: {
    fontSize: 11,
    color: '#8B95A3',
    marginTop: 3,
  },

  planTypeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    marginBottom: 10,
  },

  planTypeButton: {
    flex: 1,
    height: 43,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#777777',
  },

  planTypeTextActive: {
    color: '#FFFFFF',
  },

  scopeInfo: {
    backgroundColor: '#EEF3FF',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  scopeInfoText: {
    flex: 1,
    color: '#46515F',
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  stepItem: {
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF1F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  stepCircleActive: {
    backgroundColor: BLUE,
  },

  stepNumber: {
    color: '#7C8795',
    fontSize: 12,
    fontWeight: '900',
  },

  stepText: {
    color: '#6F7A89',
    fontSize: 9,
    fontWeight: '700',
  },

  stepLine: {
    height: 2,
    flex: 0.55,
    backgroundColor: '#E7EAF0',
    marginBottom: 23,
  },

  stepLineActive: {
    backgroundColor: BLUE,
  },

  sectionTitle: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 11,
  },

  sectionSubtitle: {
    color: '#8B95A3',
    fontSize: 10,
    marginTop: -7,
    marginBottom: 12,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },

  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  selectorIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EDF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  selectorContent: {
    flex: 1,
  },

  selectorLabel: {
    color: '#929BA8',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  selectorValue: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '800',
  },

  placeholder: {
    color: '#9AA3AF',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    padding: 15,
  },

  inputLabel: {
    color: '#8C96A4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    borderRadius: 12,
    paddingHorizontal: 13,
    color: '#202733',
    fontSize: 13,
    backgroundColor: '#FBFCFE',
    marginBottom: 10,
  },

  multilineInput: {
    height: 78,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  inputSelector: {
    height: 47,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: '#FBFCFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  inputSelectorText: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '700',
  },

  addButton: {
    height: 39,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E6EF',
    padding: 15,
    marginBottom: 12,
  },

  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  exerciseNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#EDF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  exerciseNumberText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
  },

  exerciseHeaderTitle: {
    flex: 1,
    color: '#202733',
    fontSize: 14,
    fontWeight: '800',
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },

  smallInputWrapper: {
    flex: 1,
  },

  saveButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: BLUE,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  bottomSpace: {
    height: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.42)',
    justifyContent: 'center',
  },

  modalOverlay2: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '75%',
    paddingHorizontal: 17,
    paddingTop: 10,
    paddingBottom: 25,
  },

  modalHandle: {
    width: 45,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D9DEE7',
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
  },

  memberOption: {
    minHeight: 68,
    borderRadius: 14,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },

  memberOptionSelected: {
    borderColor: BLUE,
    backgroundColor: '#F4F6FF',
  },

  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EDF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  memberAvatarText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '900',
  },

  memberOptionContent: {
    flex: 1,
  },

  memberOptionName: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '800',
  },

  memberOptionEmail: {
    color: '#8B95A3',
    fontSize: 10,
    marginTop: 3,
  },

  emptyModal: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyModalText: {
    color: '#8B95A3',
    fontSize: 12,
    marginTop: 10,
  },

  difficultyModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: 25,
    padding: 18,
  },

  difficultyOption: {
    height: 49,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  difficultyOptionSelected: {
    backgroundColor: '#EDF2FF',
  },

  difficultyText: {
    color: '#46515F',
    fontSize: 13,
    fontWeight: '700',
  },

  difficultyTextSelected: {
    color: BLUE,
    fontWeight: '900',
  },
});

export default CreateWorkoutPlanScreen;
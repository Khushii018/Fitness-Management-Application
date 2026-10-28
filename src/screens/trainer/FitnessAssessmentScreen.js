import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Alert,
  Platform,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {setFitnessAssessments} from '../../redux/slices/trainerSlice';

const FitnessAssessmentScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const members = useSelector(
    state => state.trainer.members,
  );

  const fitnessAssessments = useSelector(
    state => state.trainer.fitnessAssessments,
  );

  const routeMemberId =
    route?.params?.memberId;

  const routeMemberName =
    route?.params?.memberName;

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [memberModalVisible, setMemberModalVisible] =
    useState(false);

  const [dropdownVisible, setDropdownVisible] =
    useState(false);

  const [activeDropdown, setActiveDropdown] =
    useState('');

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  const [flexibility, setFlexibility] =
    useState('');

  const [strength, setStrength] =
    useState('');

  const [cardioLevel, setCardioLevel] =
    useState('');

  const [goal, setGoal] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const step1Complete =
    !!selectedMember;

  const step2Complete =
    !!weight.trim() &&
    !!height.trim() &&
    !!bmi.trim() &&
    !!bodyFat.trim() &&
    !!chest.trim() &&
    !!waist.trim() &&
    !!arms.trim() &&
    !!thighs.trim() &&
    !!flexibility &&
    !!strength &&
    !!cardioLevel &&
    !!goal;

  const isAssessmentComplete =
    step1Complete &&
    step2Complete &&
    !!notes.trim();

  const dropdownOptions = {
    flexibility: [
      'Poor',
      'Average',
      'Good',
      'Excellent',
    ],

    strength: [
      'Beginner',
      'Intermediate',
      'Advanced',
      'Excellent',
    ],

    cardioLevel: [
      'Low',
      'Moderate',
      'Good',
      'Excellent',
    ],

    goal: [
      'Weight Loss',
      'Muscle Gain',
      'Strength',
      'Endurance',
      'General Fitness',
    ],
  };

  useEffect(() => {
    if (
      !routeMemberId ||
      members.length === 0
    ) {
      return;
    }

    const member = members.find(
      item =>
        String(item.id) ===
        String(routeMemberId),
    );

    if (member) {
      setSelectedMember(member);
    }
  }, [routeMemberId, members]);

  const calculateBMI = (
    weightValue,
    heightValue,
  ) => {
    const parsedWeight =
      parseFloat(weightValue);

    const parsedHeight =
      parseFloat(heightValue) / 100;

    if (
      !isNaN(parsedWeight) &&
      !isNaN(parsedHeight) &&
      parsedWeight > 0 &&
      parsedHeight > 0
    ) {
      return (
        parsedWeight /
        (parsedHeight * parsedHeight)
      )
        .toFixed(1)
        .toString();
    }

    return '';
  };

  const handleWeightChange = value => {
    setWeight(value);

    const calculatedBMI =
      calculateBMI(
        value,
        height,
      );

    setBmi(calculatedBMI);
  };

  const handleHeightChange = value => {
    setHeight(value);

    const calculatedBMI =
      calculateBMI(
        weight,
        value,
      );

    setBmi(calculatedBMI);
  };

  const handleSelectMember = member => {
    setSelectedMember(member);
    setMemberModalVisible(false);
  };

  const openDropdown = type => {
    setActiveDropdown(type);
    setDropdownVisible(true);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
    setActiveDropdown('');
  };

  const handleDropdownSelect = value => {
    if (activeDropdown === 'flexibility') {
      setFlexibility(value);
    }

    if (activeDropdown === 'strength') {
      setStrength(value);
    }

    if (activeDropdown === 'cardioLevel') {
      setCardioLevel(value);
    }

    if (activeDropdown === 'goal') {
      setGoal(value);
    }

    closeDropdown();
  };

  const getDropdownTitle = () => {
    if (
      activeDropdown ===
      'flexibility'
    ) {
      return 'Select Flexibility';
    }

    if (
      activeDropdown ===
      'strength'
    ) {
      return 'Select Strength';
    }

    if (
      activeDropdown ===
      'cardioLevel'
    ) {
      return 'Select Cardio Level';
    }

    if (
      activeDropdown ===
      'goal'
    ) {
      return 'Select Goal';
    }

    return 'Select';
  };

  const handleSave = () => {
    if (!isAssessmentComplete) {
      Alert.alert(
        'Incomplete Assessment',
        'Please complete all Fitness Assessment fields before saving.',
      );

      return;
    }

    const assessment = {
      id:
        `${Date.now()}-${Math.random()}`,

      memberId:
        selectedMember.id,

      memberName:
        selectedMember.name ||
        selectedMember.fullName ||
        routeMemberName ||
        'Member',

      memberEmail:
        selectedMember.email || '',

      weight:
        weight.trim(),

      height:
        height.trim(),

      bmi:
        bmi.trim(),

      bodyFat:
        bodyFat.trim(),

      chest:
        chest.trim(),

      waist:
        waist.trim(),

      arms:
        arms.trim(),

      thighs:
        thighs.trim(),

      flexibility,

      strength,

      cardioLevel,

      goal,

      notes:
        notes.trim(),

      status:
        'Completed',

      completed:
        true,

      completedAt:
        new Date().toISOString(),

      createdAt:
        new Date().toISOString(),
    };

    try {
      const existingAssessments =
        Array.isArray(
          fitnessAssessments,
        )
          ? fitnessAssessments
          : [];

      const updatedAssessments = [
        ...existingAssessments,
        assessment,
      ];

      dispatch(
        setFitnessAssessments(
          updatedAssessments,
        ),
      );

      navigation.goBack();
    } catch (error) {
      console.log(
        'Save fitness assessment error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save assessment. Please try again.',
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
        'bottom',
      ]}>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>

        <View style={styles.screen}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.container
            }>

            <View style={styles.header}>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  navigation.goBack()
                }
                activeOpacity={0.8}>

                <Ionicons
                  name="arrow-back"
                  size={23}
                  color="#333333"
                />

              </TouchableOpacity>

              <View
                style={styles.headerInfo}>

                <Text style={styles.title}>
                  Fitness Assessment
                </Text>

                <Text style={styles.subtitle}>
                  Assess member fitness and health
                </Text>

              </View>

            </View>

            <View style={styles.stepCard}>

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
                  Select Member
                </Text>

              </View>

              <View
                style={[
                  styles.stepLine,
                  step1Complete &&
                    styles.stepLineActive,
                ]}
              />

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
                    2
                  </Text>

                </View>

                <Text style={styles.stepText}>
                  Assessment
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
                    isAssessmentComplete &&
                      styles.stepCircleActive,
                  ]}>

                  {isAssessmentComplete ? (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isAssessmentComplete &&
                          styles.stepNumberActive,
                      ]}>
                      3
                    </Text>
                  )}

                </View>

                <Text style={styles.stepText}>
                  Save
                </Text>

              </View>

            </View>

            <Text style={styles.sectionTitle}>
              Select Member
            </Text>

            <TouchableOpacity
              style={styles.memberSelector}
              activeOpacity={0.8}
              onPress={() =>
                setMemberModalVisible(true)
              }>

              <View style={styles.memberIcon}>

                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#4169D8"
                />

              </View>

              <Text
                style={[
                  styles.memberSelectorText,
                  selectedMember &&
                    styles.selectedMemberText,
                ]}
                numberOfLines={1}>

                {selectedMember
                  ? selectedMember.name ||
                    selectedMember.fullName
                  : routeMemberName ||
                    'Select Member'}

              </Text>

              <Ionicons
                name="chevron-down"
                size={19}
                color="#777777"
              />

            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              Measurements
            </Text>

            <View
              style={styles.measurementCard}>

              <View style={styles.columns}>

                <View style={styles.column}>

                  <Text
                    style={styles.inputLabel}>
                    Weight
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={
                        handleWeightChange
                      }
                      placeholder="82"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      kg
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Height
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={height}
                      onChangeText={
                        handleHeightChange
                      }
                      placeholder="175"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      cm
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    BMI
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      styles.disabledInput,
                    ]}>

                    <TextInput
                      style={styles.input}
                      value={bmi}
                      editable={false}
                      placeholder="26.8"
                      placeholderTextColor="#AAAAAA"
                    />

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Body Fat
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={bodyFat}
                      onChangeText={
                        setBodyFat
                      }
                      placeholder="23"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      %
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Chest
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={chest}
                      onChangeText={
                        setChest
                      }
                      placeholder="98"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      cm
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Waist
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={waist}
                      onChangeText={
                        setWaist
                      }
                      placeholder="88"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      cm
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Arms
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={arms}
                      onChangeText={
                        setArms
                      }
                      placeholder="34"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      cm
                    </Text>

                  </View>

                  <Text
                    style={styles.inputLabel}>
                    Thighs
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <TextInput
                      style={styles.input}
                      value={thighs}
                      onChangeText={
                        setThighs
                      }
                      placeholder="55"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />

                    <Text
                      style={styles.unit}>
                      cm
                    </Text>

                  </View>

                </View>

                <View style={styles.column}>

                  <Text
                    style={styles.inputLabel}>
                    Flexibility
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.selectInput
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      openDropdown(
                        'flexibility',
                      )
                    }>

                    <Text
                      style={[
                        styles.selectText,
                        flexibility &&
                          styles.selectedSelectText,
                      ]}
                      numberOfLines={1}>

                      {flexibility ||
                        'Select'}

                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#777777"
                    />

                  </TouchableOpacity>

                  <Text
                    style={styles.inputLabel}>
                    Strength
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.selectInput
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      openDropdown(
                        'strength',
                      )
                    }>

                    <Text
                      style={[
                        styles.selectText,
                        strength &&
                          styles.selectedSelectText,
                      ]}
                      numberOfLines={1}>

                      {strength ||
                        'Select'}

                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#777777"
                    />

                  </TouchableOpacity>

                  <Text
                    style={styles.inputLabel}>
                    Cardio Level
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.selectInput
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      openDropdown(
                        'cardioLevel',
                      )
                    }>

                    <Text
                      style={[
                        styles.selectText,
                        cardioLevel &&
                          styles.selectedSelectText,
                      ]}
                      numberOfLines={1}>

                      {cardioLevel ||
                        'Select'}

                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#777777"
                    />

                  </TouchableOpacity>

                  <Text
                    style={styles.inputLabel}>
                    Goal
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.selectInput
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      openDropdown('goal')
                    }>

                    <Text
                      style={[
                        styles.selectText,
                        goal &&
                          styles.selectedSelectText,
                      ]}
                      numberOfLines={1}>

                      {goal ||
                        'Select'}

                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#777777"
                    />

                  </TouchableOpacity>

                  <Text
                    style={styles.inputLabel}>
                    Notes
                  </Text>

                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes"
                    placeholderTextColor="#AAAAAA"
                    multiline
                    textAlignVertical="top"
                  />

                </View>

              </View>

            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}>

             

              <Text
                style={styles.saveButtonText}>
                Save Assessment
              </Text>

            </TouchableOpacity>

          </ScrollView>

          <Modal
            visible={memberModalVisible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() =>
              setMemberModalVisible(false)
            }>

            <View style={styles.modalOverlay}>

              <Pressable
                style={styles.modalBackground}
                onPress={() =>
                  setMemberModalVisible(false)
                }
              />

              <View
                style={[
                  styles.memberModal,
                  {
                    paddingBottom:
                      Math.max(
                        insets.bottom + 20,
                        30,
                      ),
                  },
                ]}>

                <View
                  style={styles.modalHandle}
                />

                <View
                  style={styles.modalHeader}>

                  <View>

                    <Text
                      style={styles.modalTitle}>
                      Select Member
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }>
                      Select from your My Members
                    </Text>

                  </View>

                  <TouchableOpacity
                    style={
                      styles.modalCloseButton
                    }
                    onPress={() =>
                      setMemberModalVisible(
                        false,
                      )
                    }
                    activeOpacity={0.8}>

                    <Ionicons
                      name="close"
                      size={22}
                      color="#333333"
                    />

                  </TouchableOpacity>

                </View>

                {members.length > 0 ? (

                  <ScrollView
                    showsVerticalScrollIndicator={
                      false
                    }
                    style={styles.memberList}
                    contentContainerStyle={
                      styles.memberListContent
                    }>

                    {members.map(member => {

                      const isSelected =
                        selectedMember &&
                        String(
                          selectedMember.id,
                        ) ===
                          String(member.id);

                      return (
                        <TouchableOpacity
                          key={member.id}
                          style={[
                            styles.memberOption,
                            isSelected &&
                              styles.selectedMemberOption,
                          ]}
                          onPress={() =>
                            handleSelectMember(
                              member,
                            )
                          }
                          activeOpacity={0.8}>

                          <View
                            style={
                              styles.memberAvatar
                            }>

                            <Text
                              style={
                                styles.memberAvatarText
                              }>

                              {(
                                member.name ||
                                member.fullName ||
                                'M'
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </Text>

                          </View>

                          <View
                            style={
                              styles.memberOptionInfo
                            }>

                            <Text
                              style={
                                styles.memberOptionName
                              }>
                              {member.name ||
                                member.fullName ||
                                'Member'}
                            </Text>

                            <Text
                              style={
                                styles.memberOptionEmail
                              }>
                              {member.email ||
                                'No email available'}
                            </Text>

                          </View>

                          {isSelected && (
                            <View
                              style={
                                styles.selectedCheck
                              }>

                              <Ionicons
                                name="checkmark"
                                size={19}
                                color="#FFFFFF"
                              />

                            </View>
                          )}

                        </TouchableOpacity>
                      );
                    })}

                  </ScrollView>

                ) : (

                  <View
                    style={
                      styles.noMembersContainer
                    }>

                    <View
                      style={
                        styles.noMembersIcon
                      }>

                      <Ionicons
                        name="people-outline"
                        size={38}
                        color="#4169D8"
                      />

                    </View>

                    <Text
                      style={
                        styles.noMembersTitle
                      }>
                      No Members Found
                    </Text>

                    <Text
                      style={
                        styles.noMembersText
                      }>
                      Add members to your My Members
                      list before creating a fitness
                      assessment.
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.goToMembersButton
                      }
                      onPress={() => {
                        setMemberModalVisible(
                          false,
                        );

                        navigation.navigate(
                          'Members',
                        );
                      }}
                      activeOpacity={0.8}>

                      <Ionicons
                        name="person-add-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.goToMembersText
                        }>
                        Add Member
                      </Text>

                    </TouchableOpacity>

                  </View>

                )}

              </View>

            </View>

          </Modal>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={
              closeDropdown
            }>

            <Pressable
              style={styles.dropdownOverlay}
              onPress={closeDropdown}>

              <Pressable
                style={styles.dropdownModal}
                onPress={event =>
                  event.stopPropagation()
                }>

                <View
                  style={
                    styles.dropdownHeader
                  }>

                  <Text
                    style={
                      styles.dropdownTitle
                    }>
                    {getDropdownTitle()}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.dropdownCloseButton
                    }
                    onPress={
                      closeDropdown
                    }
                    activeOpacity={0.8}>

                    <Ionicons
                      name="close"
                      size={21}
                      color="#333333"
                    />

                  </TouchableOpacity>

                </View>

                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }>

                  {(
                    dropdownOptions[
                      activeDropdown
                    ] || []
                  ).map(option => {

                    const selected =
                      activeDropdown ===
                        'flexibility'
                        ? flexibility ===
                          option
                        : activeDropdown ===
                          'strength'
                        ? strength ===
                          option
                        : activeDropdown ===
                          'cardioLevel'
                        ? cardioLevel ===
                          option
                        : goal === option;

                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.dropdownOption,
                          selected &&
                            styles.selectedDropdownOption,
                        ]}
                        onPress={() =>
                          handleDropdownSelect(
                            option,
                          )
                        }
                        activeOpacity={0.8}>

                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selected &&
                              styles.selectedDropdownOptionText,
                          ]}>
                          {option}
                        </Text>

                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={19}
                            color="#4169D8"
                          />
                        )}

                      </TouchableOpacity>
                    );
                  })}

                </ScrollView>

              </Pressable>

            </Pressable>

          </Modal>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    color: '#333333',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 3,
  },

  subtitle: {
    color: '#777777',
    fontSize: 12,
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E6EB',
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  stepItem: {
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF0FF',
    borderWidth: 1,
    borderColor: '#C9D6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  stepCircleActive: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  stepNumber: {
    color: '#4169D8',
    fontSize: 14,
    fontWeight: '700',
  },

  stepNumberActive: {
    color: '#FFFFFF',
  },

  stepText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  stepLine: {
    height: 2,
    backgroundColor: '#D9DDE3',
    width: 26,
    marginBottom: 22,
  },

  stepLineActive: {
    backgroundColor: '#4169D8',
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },

  memberSelector: {
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  memberSelectorText: {
    flex: 1,
    color: '#999999',
    fontSize: 13,
  },

  selectedMemberText: {
    color: '#333333',
    fontWeight: '600',
  },

  measurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E6EB',
    padding: 14,
    marginBottom: 18,
  },

  columns: {
    flexDirection: 'row',
    gap: 12,
  },

  column: {
    flex: 1,
  },

  inputLabel: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },

  inputContainer: {
    minHeight: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 8,
  },

  disabledInput: {
    backgroundColor: '#F1F3F6',
  },

  input: {
    flex: 1,
    color: '#333333',
    fontSize: 13,
    paddingVertical: 0,
  },

  unit: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },

  selectInput: {
    minHeight: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    marginBottom: 8,
  },

  selectText: {
    flex: 1,
    color: '#888888',
    fontSize: 12,
    marginRight: 6,
  },

  selectedSelectText: {
    color: '#333333',
    fontWeight: '600',
  },

  notesInput: {
    height: 105,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    color: '#333333',
    fontSize: 12,
    paddingHorizontal: 11,
    paddingTop: 10,
    textAlignVertical: 'top',
  },

  saveButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  memberModal: {
    backgroundColor: '#F7F8FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingTop: 12,
    paddingHorizontal: 18,
  },

  modalHandle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0D3D8',
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  modalSubtitle: {
    color: '#777777',
    fontSize: 12,
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberList: {
    maxHeight: 480,
  },

  memberListContent: {
    paddingBottom: 10,
  },

  memberOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EB',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  selectedMemberOption: {
    borderColor: '#4169D8',
    backgroundColor: '#F3F6FF',
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  memberAvatarText: {
    color: '#4169D8',
    fontSize: 18,
    fontWeight: '700',
  },

  memberOptionInfo: {
    flex: 1,
  },

  memberOptionName: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },

  memberOptionEmail: {
    color: '#777777',
    fontSize: 11,
  },

  selectedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  noMembersContainer: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 18,
  },

  noMembersIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  noMembersTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
  },

  noMembersText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },

  goToMembersButton: {
    minHeight: 46,
    paddingHorizontal: 19,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goToMembersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 7,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  dropdownTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: '700',
  },

  dropdownCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownOption: {
    minHeight: 52,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  selectedDropdownOption: {
    backgroundColor: '#EAF0FF',
  },

  dropdownOptionText: {
    color: '#444444',
    fontSize: 13,
    fontWeight: '600',
  },

  selectedDropdownOptionText: {
    color: '#4169D8',
    fontWeight: '700',
  },
});

export default FitnessAssessmentScreen;
import React, {useEffect, useMemo, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useDispatch, useSelector} from 'react-redux';

import {setFitnessAssessments} from '../../redux/slices/trainerSlice';

const TrainerProgressScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

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

  const [selectedTab, setSelectedTab] =
    useState('Overview');

  const [memberModalVisible, setMemberModalVisible] =
    useState(false);

  const [note, setNote] = useState('');

  useEffect(() => {
    loadFitnessAssessments();
  }, []);

  useEffect(() => {
    if (!Array.isArray(members)) {
      return;
    }

    if (routeMemberId) {
      const routeMember = members.find(
        member =>
          String(member.id) ===
          String(routeMemberId),
      );

      if (routeMember) {
        setSelectedMember(routeMember);
        return;
      }
    }

    if (routeMemberName) {
      const routeMember = members.find(
        member =>
          (
            member.name ||
            member.fullName ||
            ''
          ).toLowerCase() ===
          routeMemberName.toLowerCase(),
      );

      if (routeMember) {
        setSelectedMember(routeMember);
        return;
      }
    }

    if (
      Array.isArray(fitnessAssessments) &&
      fitnessAssessments.length > 0
    ) {
      const latestAssessment =
        fitnessAssessments[
          fitnessAssessments.length - 1
        ];

      const assessmentMember = members.find(
        member =>
          String(member.id) ===
          String(latestAssessment.memberId),
      );

      if (assessmentMember) {
        setSelectedMember(assessmentMember);
        return;
      }

      setSelectedMember({
        id: latestAssessment.memberId,
        name: latestAssessment.memberName,
        email: latestAssessment.memberEmail,
      });

      return;
    }

    if (members.length > 0) {
      setSelectedMember(members[0]);
    }
  }, [
    members,
    fitnessAssessments,
    routeMemberId,
    routeMemberName,
  ]);

  const loadFitnessAssessments = async () => {
    try {
      const storedAssessments =
        await AsyncStorage.getItem(
          'fitnessAssessments',
        );

      if (storedAssessments) {
        const parsedAssessments =
          JSON.parse(storedAssessments);

        if (Array.isArray(parsedAssessments)) {
          dispatch(
            setFitnessAssessments(
              parsedAssessments,
            ),
          );
        }
      }
    } catch (error) {
      console.log(
        'Load fitness assessments error:',
        error,
      );
    }
  };

  const memberAssessments = useMemo(() => {
    if (
      !selectedMember ||
      !Array.isArray(fitnessAssessments)
    ) {
      return [];
    }

    return fitnessAssessments
      .filter(
        assessment =>
          String(assessment.memberId) ===
          String(selectedMember.id),
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0),
      );
  }, [
    selectedMember,
    fitnessAssessments,
  ]);

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

  const getMemberName = () => {
    if (selectedMember) {
      return (
        selectedMember.name ||
        selectedMember.fullName ||
        'Member'
      );
    }

    if (routeMemberName) {
      return routeMemberName;
    }

    return 'Select Member';
  };

  const getAssessmentDate = assessment => {
    if (!assessment?.createdAt) {
      return 'No date';
    }

    const date = new Date(
      assessment.createdAt,
    );

    if (isNaN(date.getTime())) {
      return 'No date';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  const getNumber = value => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return null;
    }

    const number = parseFloat(
      String(value).replace(
        /[^0-9.-]/g,
        '',
      ),
    );

    return isNaN(number)
      ? null
      : number;
  };

  const formatDifference = (
    current,
    previous,
    unit,
  ) => {
    const currentNumber =
      getNumber(current);

    const previousNumber =
      getNumber(previous);

    if (
      currentNumber === null ||
      previousNumber === null
    ) {
      return '--';
    }

    const difference =
      currentNumber - previousNumber;

    if (difference === 0) {
      return `0 ${unit}`;
    }

    const sign =
      difference > 0 ? '+' : '';

    return `${sign}${difference.toFixed(
      1,
    )} ${unit}`;
  };

  const isPositiveChange = (
    label,
    current,
    previous,
  ) => {
    const currentNumber =
      getNumber(current);

    const previousNumber =
      getNumber(previous);

    if (
      currentNumber === null ||
      previousNumber === null
    ) {
      return false;
    }

    const difference =
      currentNumber - previousNumber;

    if (difference === 0) {
      return false;
    }

    if (
      label === 'Weight' ||
      label === 'Body Fat' ||
      label === 'Waist' ||
      label === 'Chest'
    ) {
      return difference < 0;
    }

    return difference > 0;
  };

  const progressData = latestAssessment
    ? [
        {
          label: 'Weight',
          start:
            previousAssessment?.weight
              ? `${previousAssessment.weight} KG`
              : '--',
          current:
            latestAssessment.weight
              ? `${latestAssessment.weight} KG`
              : '--',
          change: formatDifference(
            latestAssessment.weight,
            previousAssessment?.weight,
            'KG',
          ),
          positive: isPositiveChange(
            'Weight',
            latestAssessment.weight,
            previousAssessment?.weight,
          ),
        },
        {
          label: 'Body Fat',
          start:
            previousAssessment?.bodyFat
              ? `${previousAssessment.bodyFat}%`
              : '--',
          current:
            latestAssessment.bodyFat
              ? `${latestAssessment.bodyFat}%`
              : '--',
          change: formatDifference(
            latestAssessment.bodyFat,
            previousAssessment?.bodyFat,
            '%',
          ),
          positive: isPositiveChange(
            'Body Fat',
            latestAssessment.bodyFat,
            previousAssessment?.bodyFat,
          ),
        },
        {
          label: 'Chest',
          start:
            previousAssessment?.chest
              ? `${previousAssessment.chest} CM`
              : '--',
          current:
            latestAssessment.chest
              ? `${latestAssessment.chest} CM`
              : '--',
          change: formatDifference(
            latestAssessment.chest,
            previousAssessment?.chest,
            'CM',
          ),
          positive: isPositiveChange(
            'Chest',
            latestAssessment.chest,
            previousAssessment?.chest,
          ),
        },
        {
          label: 'Waist',
          start:
            previousAssessment?.waist
              ? `${previousAssessment.waist} CM`
              : '--',
          current:
            latestAssessment.waist
              ? `${latestAssessment.waist} CM`
              : '--',
          change: formatDifference(
            latestAssessment.waist,
            previousAssessment?.waist,
            'CM',
          ),
          positive: isPositiveChange(
            'Waist',
            latestAssessment.waist,
            previousAssessment?.waist,
          ),
        },
      ]
    : [];

  const handleSelectMember = member => {
    setSelectedMember(member);
    setMemberModalVisible(false);
  };

  const handleAddNote = () => {
    if (!note.trim()) {
      return;
    }

    console.log(
      'Progress Note:',
      note,
    );

    setNote('');
  };

  const renderOverview = () => {
    if (!latestAssessment) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="analytics-outline"
              size={42}
              color="#4169D8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Fitness Assessment
          </Text>

          <Text style={styles.emptyText}>
            No fitness assessment has been
            saved for this member yet.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              navigation.navigate(
                'FitnessAssessment',
                {
                  memberId:
                    selectedMember?.id,
                  memberName:
                    getMemberName(),
                },
              )
            }
            activeOpacity={0.8}>
            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.emptyButtonText}>
              Create Assessment
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Progress Summary
            </Text>

            <Text style={styles.assessmentDate}>
              {getAssessmentDate(
                latestAssessment,
              )}
            </Text>
          </View>

          {progressData.map(
            (item, index) => (
              <View
                key={item.label}
                style={[
                  styles.progressRow,
                  index ===
                    progressData.length - 1 &&
                    styles.lastProgressRow,
                ]}>
                <Text
                  style={
                    styles.progressLabel
                  }>
                  {item.label}
                </Text>

                <Text
                  style={styles.startValue}>
                  {item.start}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#4169D8"
                />

                <Text
                  style={
                    styles.currentValue
                  }>
                  {item.current}
                </Text>

                <Text
                  style={[
                    styles.changeValue,
                    item.positive &&
                      styles.positiveValue,
                  ]}>
                  {item.change}
                </Text>
              </View>
            ),
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Current Status
          </Text>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>
                Goal
              </Text>

              <Text style={styles.statusValue}>
                {latestAssessment.goal ||
                  'Not selected'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>
                Weight
              </Text>

              <Text style={styles.statusValue}>
                {latestAssessment.weight
                  ? `${latestAssessment.weight} kg`
                  : '--'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>
                Body Fat
              </Text>

              <Text style={styles.statusValue}>
                {latestAssessment.bodyFat
                  ? `${latestAssessment.bodyFat}%`
                  : '--'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>
                BMI
              </Text>

              <Text style={styles.statusValue}>
                {latestAssessment.bmi ||
                  '--'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Fitness Level
          </Text>

          <View style={styles.fitnessRow}>
            <View style={styles.fitnessIcon}>
              <Ionicons
                name="fitness-outline"
                size={23}
                color="#4169D8"
              />
            </View>

            <View style={styles.fitnessInfo}>
              <Text style={styles.fitnessLabel}>
                Strength
              </Text>

              <Text style={styles.fitnessValue}>
                {latestAssessment.strength ||
                  'Not selected'}
              </Text>
            </View>
          </View>

          <View style={styles.fitnessRow}>
            <View style={styles.fitnessIcon}>
              <Ionicons
                name="heart-outline"
                size={23}
                color="#4169D8"
              />
            </View>

            <View style={styles.fitnessInfo}>
              <Text style={styles.fitnessLabel}>
                Cardio Level
              </Text>

              <Text style={styles.fitnessValue}>
                {latestAssessment.cardioLevel ||
                  'Not selected'}
              </Text>
            </View>
          </View>

          <View style={styles.fitnessRow}>
            <View style={styles.fitnessIcon}>
              <Ionicons
                name="body-outline"
                size={23}
                color="#4169D8"
              />
            </View>

            <View style={styles.fitnessInfo}>
              <Text style={styles.fitnessLabel}>
                Flexibility
              </Text>

              <Text style={styles.fitnessValue}>
                {latestAssessment.flexibility ||
                  'Not selected'}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderMeasurements = () => {
    if (!latestAssessment) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="body-outline"
              size={42}
              color="#4169D8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Measurements Available
          </Text>

          <Text style={styles.emptyText}>
            Save a fitness assessment for
            this member to see measurements
            here.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              navigation.navigate(
                'FitnessAssessment',
                {
                  memberId:
                    selectedMember?.id,
                  memberName:
                    getMemberName(),
                },
              )
            }
            activeOpacity={0.8}>
            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.emptyButtonText}>
              Create Assessment
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Measurements
            </Text>

            <Text style={styles.assessmentDate}>
              {getAssessmentDate(
                latestAssessment,
              )}
            </Text>
          </View>

          <View style={styles.measurementGrid}>
            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Weight
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.weight
                  ? `${latestAssessment.weight} kg`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Height
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.height
                  ? `${latestAssessment.height} cm`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                BMI
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.bmi ||
                  '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Body Fat
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.bodyFat
                  ? `${latestAssessment.bodyFat}%`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Chest
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.chest
                  ? `${latestAssessment.chest} cm`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Waist
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.waist
                  ? `${latestAssessment.waist} cm`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Arms
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.arms
                  ? `${latestAssessment.arms} cm`
                  : '--'}
              </Text>
            </View>

            <View style={styles.measurementItem}>
              <Text
                style={
                  styles.measurementLabel
                }>
                Thighs
              </Text>

              <Text
                style={
                  styles.measurementValue
                }>
                {latestAssessment.thighs
                  ? `${latestAssessment.thighs} cm`
                  : '--'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Fitness Assessment
          </Text>

          <View style={styles.assessmentInfoRow}>
            <Text style={styles.assessmentLabel}>
              Flexibility
            </Text>

            <Text style={styles.assessmentValue}>
              {latestAssessment.flexibility ||
                'Not selected'}
            </Text>
          </View>

          <View style={styles.assessmentInfoRow}>
            <Text style={styles.assessmentLabel}>
              Strength
            </Text>

            <Text style={styles.assessmentValue}>
              {latestAssessment.strength ||
                'Not selected'}
            </Text>
          </View>

          <View style={styles.assessmentInfoRow}>
            <Text style={styles.assessmentLabel}>
              Cardio Level
            </Text>

            <Text style={styles.assessmentValue}>
              {latestAssessment.cardioLevel ||
                'Not selected'}
            </Text>
          </View>

          <View style={styles.assessmentInfoRow}>
            <Text style={styles.assessmentLabel}>
              Goal
            </Text>

            <Text style={styles.assessmentValue}>
              {latestAssessment.goal ||
                'Not selected'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() =>
            navigation.navigate(
              'FitnessAssessment',
              {
                memberId:
                  selectedMember?.id,
                memberName:
                  getMemberName(),
              },
            )
          }
          activeOpacity={0.8}>
          <Ionicons
            name="create-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.updateButtonText}>
            Add New Assessment
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderCompare = () => {
    if (!latestAssessment) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="git-compare-outline"
              size={42}
              color="#4169D8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Assessment Data
          </Text>

          <Text style={styles.emptyText}>
            Create an assessment first to
            compare progress.
          </Text>
        </View>
      );
    }

    if (!previousAssessment) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="git-compare-outline"
              size={42}
              color="#4169D8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            One Assessment Available
          </Text>

          <Text style={styles.emptyText}>
            Create another fitness assessment
            for this member to compare
            starting and current progress.
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Previous vs Current
          </Text>

          {progressData.map(item => (
            <View
              key={item.label}
              style={styles.compareRow}>
              <Text style={styles.compareLabel}>
                {item.label}
              </Text>

              <View style={styles.compareValues}>
                <View style={styles.compareBox}>
                  <Text style={styles.compareSmall}>
                    Previous
                  </Text>

                  <Text
                    style={
                      styles.compareNumber
                    }>
                    {item.start}
                  </Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#4169D8"
                />

                <View style={styles.compareBox}>
                  <Text style={styles.compareSmall}>
                    Current
                  </Text>

                  <Text
                    style={
                      styles.compareNumber
                    }>
                    {item.current}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.compareChange,
                    item.positive &&
                      styles.comparePositive,
                  ]}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Assessment Period
          </Text>

          <View style={styles.periodRow}>
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>
                Previous
              </Text>

              <Text style={styles.periodValue}>
                {getAssessmentDate(
                  previousAssessment,
                )}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={22}
              color="#4169D8"
            />

            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>
                Current
              </Text>

              <Text style={styles.periodValue}>
                {getAssessmentDate(
                  latestAssessment,
                )}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderNotes = () => {
    const assessmentsWithNotes =
      memberAssessments.filter(
        assessment =>
          assessment.notes &&
          assessment.notes.trim(),
      );

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Assessment Notes
          </Text>

          {assessmentsWithNotes.length > 0 ? (
            assessmentsWithNotes
              .slice()
              .reverse()
              .map(assessment => (
                <View
                  key={assessment.id}
                  style={styles.noteItem}>
                  <View style={styles.noteIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={21}
                      color="#4169D8"
                    />
                  </View>

                  <View
                    style={styles.noteContent}>
                    <Text
                      style={styles.noteDate}>
                      {getAssessmentDate(
                        assessment,
                      )}
                    </Text>

                    <Text
                      style={styles.noteText}>
                      {assessment.notes}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.noNotes}>
              <Ionicons
                name="document-text-outline"
                size={34}
                color="#999999"
              />

              <Text style={styles.noNotesText}>
                No assessment notes available.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Add Progress Note
          </Text>

          <TextInput
            style={styles.noteInput}
            placeholder="Write a progress note..."
            placeholderTextColor="#999999"
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={handleAddNote}
            activeOpacity={0.8}>
            <Ionicons
              name="add"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addNoteButtonText
              }>
              Add Note
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        // 'bottom',
      ]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.8}>
            <Ionicons
              name="arrow-back"
              size={25}
              color="#333333"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Progress Monitoring
            </Text>

            <Text style={styles.subtitle}>
              Track member fitness progress
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="trending-up-outline"
              size={25}
              color="#4169D8"
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                insets.bottom + 35,
            },
          ]}>
          <TouchableOpacity
            style={styles.memberSelector}
            activeOpacity={0.8}
            onPress={() =>
              setMemberModalVisible(true)
            }>
            <View style={styles.memberAvatar}>
              <Ionicons
                name="person"
                size={23}
                color="#4169D8"
              />
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {getMemberName()}
              </Text>

              <Text style={styles.memberDetails}>
                {latestAssessment
                  ? `Assessment: ${getAssessmentDate(
                      latestAssessment,
                    )}`
                  : 'No assessment yet'}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={22}
              color="#777777"
            />
          </TouchableOpacity>

          <View style={styles.tabsContainer}>
            {[
              'Overview',
              'Measurements',
              'Compare',
              'Notes',
            ].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab &&
                    styles.activeTab,
                ]}
                onPress={() =>
                  setSelectedTab(tab)
                }
                activeOpacity={0.8}>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[
                    styles.tabText,
                    selectedTab === tab &&
                      styles.activeTabText,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedTab === 'Overview' &&
            renderOverview()}

          {selectedTab === 'Measurements' &&
            renderMeasurements()}

          {selectedTab === 'Compare' &&
            renderCompare()}

          {selectedTab === 'Notes' &&
            renderNotes()}
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
                  paddingBottom: Math.max(
                    insets.bottom + 20,
                    30,
                  ),
                },
              ]}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Select Member
                  </Text>

                  <Text
                    style={styles.modalSubtitle}>
                    View fitness progress
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.modalCloseButton
                  }
                  onPress={() =>
                    setMemberModalVisible(false)
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="close"
                    size={25}
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

                    const memberName =
                      member.name ||
                      member.fullName ||
                      'Member';

                    const hasAssessment =
                      Array.isArray(
                        fitnessAssessments,
                      ) &&
                      fitnessAssessments.some(
                        assessment =>
                          String(
                            assessment.memberId,
                          ) ===
                          String(member.id),
                      );

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
                            styles.memberAvatarLarge
                          }>
                          <Text
                            style={
                              styles.memberAvatarText
                            }>
                            {memberName
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
                            {memberName}
                          </Text>

                          <Text
                            style={
                              styles.memberOptionEmail
                            }
                            numberOfLines={1}>
                            {hasAssessment
                              ? 'Assessment available'
                              : 'No assessment yet'}
                          </Text>
                        </View>

                        {isSelected && (
                          <View
                            style={
                              styles.selectedCheck
                            }>
                            <Ionicons
                              name="checkmark"
                              size={22}
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
                      size={42}
                      color="#4169D8"
                    />
                  </View>

                  <Text
                    style={
                      styles.noMembersTitle
                    }>
                    No Members Available
                  </Text>

                  <Text
                    style={
                      styles.noMembersText
                    }>
                    Add members to My Members
                    first.
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
                        'AddMembers',
                      );
                    }}
                    activeOpacity={0.8}>
                    <Ionicons
                      name="person-add-outline"
                      size={22}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6EB',
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 20,
  },

  memberSelector: {
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 5,
  },

  memberDetails: {
    fontSize: 13,
    color: '#777777',
  },

  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  activeTab: {
    backgroundColor: '#4169D8',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777777',
    textAlign: 'center',
    flexShrink: 0,
    letterSpacing: -0.2,
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    padding: 17,
    marginBottom: 17,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },

  assessmentDate: {
    fontSize: 12,
    color: '#4169D8',
    fontWeight: '600',
  },

  progressRow: {
    minHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastProgressRow: {
    borderBottomWidth: 0,
  },

  progressLabel: {
    width: 78,
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  startValue: {
    flex: 1,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  currentValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

  changeValue: {
    width: 55,
    fontSize: 12,
    fontWeight: '700',
    color: '#D9534F',
    textAlign: 'right',
  },

  positiveValue: {
    color: '#2E9B5B',
  },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  statusItem: {
    width: '50%',
    paddingVertical: 12,
  },

  statusLabel: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 5,
  },

  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  fitnessRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },

  fitnessIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  fitnessInfo: {
    flex: 1,
  },

  fitnessLabel: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 4,
  },

  fitnessValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  measurementItem: {
    width: '50%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },

  measurementLabel: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 6,
  },

  measurementValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },

  assessmentInfoRow: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },

  assessmentLabel: {
    fontSize: 14,
    color: '#777777',
  },

  assessmentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  updateButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 17,
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  compareRow: {
    marginBottom: 20,
  },

  compareLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 10,
  },

  compareValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  compareBox: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 11,
    padding: 12,
    alignItems: 'center',
  },

  compareSmall: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 5,
  },

  compareNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  compareChange: {
    width: 60,
    marginLeft: 9,
    fontSize: 12,
    fontWeight: '700',
    color: '#D9534F',
    textAlign: 'right',
  },

  comparePositive: {
    color: '#2E9B5B',
  },

  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  periodBox: {
    flex: 1,
  },

  periodLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 5,
  },

  periodValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  noteItem: {
    flexDirection: 'row',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
  },

  noteIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  noteContent: {
    flex: 1,
  },

  noteDate: {
    fontSize: 12,
    color: '#4169D8',
    fontWeight: '700',
    marginBottom: 6,
  },

  noteText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 21,
  },

  noNotes: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  noNotesText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 10,
  },

  noteInput: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    padding: 14,
    fontSize: 15,
    color: '#333333',
    marginBottom: 13,
  },

  addNoteButton: {
    minHeight: 52,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 7,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    paddingVertical: 45,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 17,
  },

  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 9,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 22,
  },

  emptyButton: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 7,
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
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    maxHeight: '82%',
    paddingTop: 12,
    paddingHorizontal: 20,
  },

  modalHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D3D8',
    alignSelf: 'center',
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    color: '#333333',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },

  modalSubtitle: {
    color: '#777777',
    fontSize: 14,
  },

  modalCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
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
    borderColor: '#D9DDE3',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  selectedMemberOption: {
    borderColor: '#4169D8',
    backgroundColor: '#F3F6FF',
  },

  memberAvatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  memberAvatarText: {
    color: '#4169D8',
    fontSize: 20,
    fontWeight: '700',
  },

  memberOptionInfo: {
    flex: 1,
  },

  memberOptionName: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  memberOptionEmail: {
    color: '#777777',
    fontSize: 13,
  },

  selectedCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  noMembersContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },

  noMembersIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  noMembersTitle: {
    color: '#333333',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 9,
  },

  noMembersText: {
    color: '#777777',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },

  goToMembersButton: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goToMembersText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default TrainerProgressScreen;
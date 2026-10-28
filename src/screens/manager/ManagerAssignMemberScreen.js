
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useDispatch, useSelector} from 'react-redux';

import {
  setTrainers,
  setMembers,
  assignMemberToTrainer,
} from '../../redux/slices/managerSlice';

const ManagerAssignMemberScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const managerState = useSelector(state => state.manager);
  const authUser = useSelector(state => state.auth?.user);

  const reduxTrainers = managerState?.trainers || [];
  const reduxMembers = managerState?.members || [];

  const [managerId, setManagerId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showTrainers, setShowTrainers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


 

  const getCurrentManagerId = useCallback(async () => {
    try {
      const reduxManagerId =
        authUser?.managerId ||
        (authUser?.role === 'manager' ? authUser?.id : null);

      if (reduxManagerId) {
        setManagerId(String(reduxManagerId));
        return String(reduxManagerId);
      }

      const storedManagerId =
        await AsyncStorage.getItem('currentManagerId');

      if (storedManagerId) {
        setManagerId(String(storedManagerId));
        return String(storedManagerId);
      }

      const storedCurrentUser =
        await AsyncStorage.getItem('currentUser');

      if (storedCurrentUser) {
        const currentUser = JSON.parse(storedCurrentUser);

        const id =
          currentUser?.managerId ||
          (currentUser?.role === 'manager'
            ? currentUser?.id
            : null);

        if (id) {
          setManagerId(String(id));
          return String(id);
        }
      }

      return null;
    } catch (error) {
      console.log('Error getting current manager:', error);
      return null;
    }
  }, [authUser]);

  const loadUsers = useCallback(async () => {
    try {
      const currentManagerId =
        await getCurrentManagerId();

      if (!currentManagerId) {
        dispatch(setTrainers([]));
        dispatch(setMembers([]));
        return;
      }

      const storedUsers =
        await AsyncStorage.getItem('registeredUsers');

      if (!storedUsers) {
        dispatch(setTrainers([]));
        dispatch(setMembers([]));
        return;
      }

      const parsedUsers = JSON.parse(storedUsers);

      const users = Array.isArray(parsedUsers)
        ? parsedUsers
        : [parsedUsers];

      const managerUsers = users.filter(user => {
        return (
          String(user?.managerId) ===
          String(currentManagerId)
        );
      });

      const managerTrainers = managerUsers.filter(
        user => user?.role === 'trainer',
      );

      const managerMembers = managerUsers.filter(
        user => user?.role === 'member',
      );

      const normalizedMembers = managerMembers.map(member => {
        let trainerId = member?.trainerId || null;

        if (!trainerId && Array.isArray(member?.trainerIds)) {
          trainerId =
            member.trainerIds.length > 0
              ? member.trainerIds[0]
              : null;
        }

        return {
          ...member,
          trainerId: trainerId
            ? String(trainerId)
            : null,
          trainerIds: trainerId
            ? [String(trainerId)]
            : [],
        };
      });

      dispatch(setTrainers(managerTrainers));
      dispatch(setMembers(normalizedMembers));
    } catch (error) {
      console.log('Error loading manager users:', error);
    }
  }, [dispatch, getCurrentManagerId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      () => {
        loadUsers();
      },
    );

    return unsubscribe;
  }, [navigation, loadUsers]);

  const trainers = useMemo(() => {
    return reduxTrainers.filter(
      trainer => trainer?.role === 'trainer',
    );
  }, [reduxTrainers]);

  const members = useMemo(() => {
    return reduxMembers.filter(
      member => member?.role === 'member',
    );
  }, [reduxMembers]);

  const getTrainer = trainerId => {
    if (!trainerId) {
      return null;
    }

    return trainers.find(
      trainer =>
        String(trainer?.id) ===
        String(trainerId),
    );
  };

  const getTrainerName = trainerId => {
    const trainer = getTrainer(trainerId);

    return (
      trainer?.fullName ||
      trainer?.name ||
      trainer?.email ||
      'Unknown Trainer'
    );
  };

  const getMemberTrainerId = member => {
    if (!member) {
      return null;
    }

    if (member?.trainerId) {
      return String(member.trainerId);
    }

    if (
      Array.isArray(member?.trainerIds) &&
      member.trainerIds.length > 0
    ) {
      return String(member.trainerIds[0]);
    }

    return null;
  };

  const handleMemberSelect = member => {
    const currentTrainerId =
      getMemberTrainerId(member);

    setSelectedMemberId(String(member.id));

    setSelectedTrainerId(
      currentTrainerId
        ? String(currentTrainerId)
        : null,
    );

    setShowMembers(false);
    setShowTrainers(true);
  };

  const handleTrainerSelect = trainer => {
    setSelectedTrainerId(String(trainer.id));
  };

  const handleAssign = async () => {
    if (!selectedMemberId) {
      Alert.alert(
        'Select Member',
        'Please select a member first.',
      );
      return;
    }

    if (!selectedTrainerId) {
      Alert.alert(
        'Select Trainer',
        'Please select a trainer first.',
      );
      return;
    }

    const selectedMember = members.find(
      member =>
        String(member?.id) ===
        String(selectedMemberId),
    );

    if (!selectedMember) {
      Alert.alert(
        'Error',
        'Selected member was not found.',
      );
      return;
    }

    const previousTrainerId =
      getMemberTrainerId(selectedMember);

    const isUpdate =
      previousTrainerId &&
      String(previousTrainerId) !==
        String(selectedTrainerId);

    const isSameTrainer =
      previousTrainerId &&
      String(previousTrainerId) ===
        String(selectedTrainerId);

    if (isSameTrainer) {
      Alert.alert(
        'Already Assigned',
        `${selectedMember?.fullName || 'This member'} is already assigned to ${getTrainerName(
          selectedTrainerId,
        )}.`,
      );
      return;
    }

    try {
      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (!storedUsers) {
        
        Alert.alert(
          'Error',
          'Registered users were not found.',
        );
        return;
      }

      const parsedUsers = JSON.parse(storedUsers);

      const users = Array.isArray(parsedUsers)
        ? parsedUsers
        : [parsedUsers];

      const updatedUsers = users.map(user => {
        if (
          String(user?.id) !==
          String(selectedMemberId)
        ) {
          return user;
        }

        return {
          ...user,
          trainerId: String(selectedTrainerId),
          trainerIds: [String(selectedTrainerId)],
        };
      });

      await AsyncStorage.setItem(
        'registeredUsers',
        JSON.stringify(updatedUsers),
      );

      dispatch(
        assignMemberToTrainer({
          memberId: selectedMemberId,
          trainerId: selectedTrainerId,
        }),
      );



      await loadUsers();

      const newTrainer =
        getTrainer(selectedTrainerId);

      const newTrainerName =
        newTrainer?.fullName ||
        newTrainer?.name ||
        newTrainer?.email ||
        'Trainer';

      if (isUpdate) {
        Alert.alert(
          'Trainer Updated',
          `${selectedMember?.fullName || 'Member'} has been updated from ${getTrainerName(
            previousTrainerId,
          )} to ${newTrainerName}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedMemberId(null);
                setSelectedTrainerId(null);
                setShowMembers(false);
                setShowTrainers(false);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Trainer Assigned',
          `${selectedMember?.fullName || 'Member'} has been assigned to ${newTrainerName}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedMemberId(null);
                setSelectedTrainerId(null);
                setShowMembers(false);
                setShowTrainers(false);
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log(
        'Error saving trainer assignment:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save the trainer assignment.',
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const selectedMember = members.find(
    member =>
      String(member?.id) ===
      String(selectedMemberId),
  );

  const currentTrainerId =
    getMemberTrainerId(selectedMember);

  const currentTrainer =
    getTrainer(currentTrainerId);

  const isChangingTrainer =
    currentTrainerId &&
    selectedTrainerId &&
    String(currentTrainerId) !==
      String(selectedTrainerId);

  return (
    <SafeAreaView
     style={styles.safeArea}
      edges={['top','left','right','bottom']}
     >

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={22}
            color="#222222"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Assign Trainer
          </Text>

          <Text style={styles.headerSubtitle}>
            Assign one trainer to each member
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => {
            setShowMembers(!showMembers);
            setShowTrainers(false);
          }}>

          <View style={styles.sectionTitleRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                1
              </Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Select Member
              </Text>

              <Text style={styles.sectionSubtitle}>
                Choose the member
              </Text>
            </View>
          </View>

          <Ionicons
            name={
              showMembers
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={20}
            color="#555555"
          />
        </TouchableOpacity>

        {showMembers && (
          <View style={styles.listContainer}>
            {members.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={40}
                  color="#999999"
                />

                <Text style={styles.emptyTitle}>
                  No Members Found
                </Text>

                <Text style={styles.emptyText}>
                  This manager has not created any
                  members yet.
                </Text>
              </View>
            ) : (
              members.map(member => {
                const selected =
                  String(member?.id) ===
                  String(selectedMemberId);

                const memberTrainerId =
                  getMemberTrainerId(member);

                const memberTrainer =
                  getTrainer(memberTrainerId);

                return (
                  <TouchableOpacity
                    key={String(member.id)}
                    style={[
                      styles.memberCard,
                      selected &&
                        styles.selectedCard,
                    ]}
                    onPress={() =>
                      handleMemberSelect(member)
                    }>

                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={22}
                        color={
                          selected
                            ? '#FFFFFF'
                            : '#4169D8'
                        }
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {member?.fullName ||
                          member?.name ||
                          'Unnamed Member'}
                      </Text>

                      <Text style={styles.cardEmail}>
                        {member?.email || 'No email'}
                      </Text>

                      {memberTrainer ? (
                        <View
                          style={
                            styles.currentTrainerRow
                          }>
                          <Ionicons
                            name="fitness-outline"
                            size={13}
                            color="#2E8B57"
                          />

                          <Text
                            style={
                              styles.currentTrainerText
                            }>
                            Trainer:{' '}
                            {memberTrainer?.fullName ||
                              memberTrainer?.name ||
                              memberTrainer?.email}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={
                            styles.noTrainerText
                          }>
                          No trainer assigned
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected &&
                          styles.radioSelected,
                      ]}>
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {selectedMember && (
          <View style={styles.selectedMemberBox}>
            <View style={styles.selectedMemberIcon}>
              <Ionicons
                name="person"
                size={20}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.selectedMemberInfo}>
              <Text style={styles.selectedMemberLabel}>
                Selected Member
              </Text>

              <Text style={styles.selectedMemberName}>
                {selectedMember?.fullName ||
                  selectedMember?.name ||
                  'Unnamed Member'}
              </Text>

              {currentTrainer ? (
                <Text
                  style={
                    styles.selectedTrainerText
                  }>
                  Current Trainer:{' '}
                  {currentTrainer?.fullName ||
                    currentTrainer?.name ||
                    currentTrainer?.email}
                </Text>
              ) : (
                <Text
                  style={
                    styles.selectedTrainerText
                  }>
                  No trainer assigned
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedMemberId(null);
                setSelectedTrainerId(null);
                setShowTrainers(false);
              }}>
              <Ionicons
                name="close-circle"
                size={23}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.sectionHeader,
            !selectedMember &&
              styles.disabledSection,
          ]}
          disabled={!selectedMember}
          onPress={() => {
            setShowTrainers(!showTrainers);
            setShowMembers(false);
          }}>

          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.numberCircle,
                !selectedMember &&
                  styles.disabledNumber,
              ]}>
              <Text style={styles.numberText}>
                2
              </Text>
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  !selectedMember &&
                    styles.disabledText,
                ]}>
                {currentTrainer
                  ? 'Update Trainer'
                  : 'Select Trainer'}
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  !selectedMember &&
                    styles.disabledText,
                ]}>
                {currentTrainer
                  ? 'Select another trainer to replace the current one'
                  : 'Choose one trainer for this member'}
              </Text>
            </View>
          </View>

          <Ionicons
            name={
              showTrainers
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={20}
            color={
              selectedMember
                ? '#555555'
                : '#BBBBBB'
            }
          />
        </TouchableOpacity>

        {showTrainers && selectedMember && (
          <View style={styles.listContainer}>
            {trainers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="fitness-outline"
                  size={40}
                  color="#999999"
                />

                <Text style={styles.emptyTitle}>
                  No Trainers Found
                </Text>

                <Text style={styles.emptyText}>
                  This manager has not created any
                  trainers yet.
                </Text>
              </View>
            ) : (
              trainers.map(trainer => {
                const selected =
                  String(trainer?.id) ===
                  String(selectedTrainerId);

                const isCurrentTrainer =
                  currentTrainerId &&
                  String(currentTrainerId) ===
                    String(trainer?.id);

                return (
                  <TouchableOpacity
                    key={String(trainer.id)}
                    style={[
                      styles.trainerCard,
                      selected &&
                        styles.selectedCard,
                    ]}
                    onPress={() =>
                      handleTrainerSelect(trainer)
                    }>

                    <View
                      style={[
                        styles.avatar,
                        styles.trainerAvatar,
                      ]}>
                      <Ionicons
                        name="fitness"
                        size={22}
                        color={
                          selected
                            ? '#FFFFFF'
                            : '#4169D8'
                        }
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {trainer?.fullName ||
                          trainer?.name ||
                          'Unnamed Trainer'}
                      </Text>

                      <Text style={styles.cardEmail}>
                        {trainer?.email ||
                          'No email'}
                      </Text>

                      {isCurrentTrainer && (
                        <Text
                          style={
                            styles.currentTrainerBadge
                          }>
                          Current Trainer
                        </Text>
                      )}

                      {!isCurrentTrainer &&
                        currentTrainerId && (
                          <Text
                            style={
                              styles.replaceText
                            }>
                            Replace current trainer
                          </Text>
                        )}
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected &&
                          styles.radioSelected,
                      ]}>
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {selectedMember && selectedTrainerId && (
          <View style={styles.assignmentPreview}>
            <Text style={styles.previewLabel}>
              Trainer Assignment
            </Text>

            <View style={styles.previewRow}>
              <View style={styles.previewPerson}>
                <Text style={styles.previewSmallLabel}>
                  MEMBER
                </Text>

                <Text style={styles.previewMember}>
                  {selectedMember?.fullName ||
                    selectedMember?.name ||
                    'Member'}
                </Text>
              </View>

              <Ionicons
                name={
                  isChangingTrainer
                    ? 'swap-horizontal'
                    : 'arrow-forward'
                }
                size={20}
                color="#4169D8"
              />

              <View style={styles.previewPerson}>
                <Text
                  style={[
                    styles.previewSmallLabel,
                    styles.previewSmallLabelRight,
                  ]}>
                  TRAINER
                </Text>

                <Text style={styles.previewTrainer}>
                  {getTrainerName(
                    selectedTrainerId,
                  )}
                </Text>
              </View>
            </View>

            {isChangingTrainer && (
              <View style={styles.changeBox}>
                <Text style={styles.changeText}>
                  {getTrainerName(
                    currentTrainerId,
                  )}{' '}
                  will be replaced by{' '}
                  {getTrainerName(
                    selectedTrainerId,
                  )}
                  .
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.assignButton,
            (!selectedMember ||
              !selectedTrainerId ||
              (currentTrainerId &&
                String(currentTrainerId) ===
                  String(selectedTrainerId))) &&
              styles.assignButtonDisabled,
          ]}
          disabled={
            !selectedMember ||
            !selectedTrainerId ||
            (currentTrainerId &&
              String(currentTrainerId) ===
                String(selectedTrainerId))
          }
          onPress={handleAssign}>

          <Ionicons
            name={
              currentTrainerId
                ? 'swap-horizontal-outline'
                : 'link-outline'
            }
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.assignButtonText}>
            {currentTrainerId
              ? 'Update Trainer'
              : 'Assign Trainer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EA',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  sectionHeader: {
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  disabledSection: {
    opacity: 0.55,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  disabledNumber: {
    backgroundColor: '#BBBBBB',
  },

  numberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: '#777777',
    fontSize: 11,
    marginTop: 3,
  },

  disabledText: {
    color: '#AAAAAA',
  },

  listContainer: {
    marginBottom: 15,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 13,
    marginBottom: 9,
  },

  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 13,
    marginBottom: 9,
  },

  selectedCard: {
    borderColor: '#4169D8',
    backgroundColor: '#F5F7FF',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  trainerAvatar: {
    backgroundColor: '#EAF0FF',
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },

  cardEmail: {
    fontSize: 11,
    color: '#777777',
    marginTop: 3,
  },

  currentTrainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  currentTrainerText: {
    fontSize: 10,
    color: '#2E8B57',
    marginLeft: 4,
    fontWeight: '600',
  },

  noTrainerText: {
    fontSize: 10,
    color: '#777777',
    marginTop: 5,
    fontWeight: '600',
  },

  currentTrainerBadge: {
    fontSize: 10,
    color: '#2E8B57',
    marginTop: 5,
    fontWeight: '700',
  },

  replaceText: {
    fontSize: 10,
    color: '#4169D8',
    marginTop: 5,
    fontWeight: '600',
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C5C9D0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },

  emptyText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },

  selectedMemberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4169D8',
    borderRadius: 13,
    padding: 12,
    marginBottom: 15,
  },

  selectedMemberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedMemberInfo: {
    flex: 1,
    marginLeft: 10,
  },

  selectedMemberLabel: {
    color: '#DCE5FF',
    fontSize: 10,
    marginBottom: 2,
  },

  selectedMemberName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  selectedTrainerText: {
    color: '#DCE5FF',
    fontSize: 10,
    marginTop: 4,
  },

  assignButton: {
    height: 50,
    backgroundColor: '#4169D8',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  assignButtonDisabled: {
    backgroundColor: '#B8C3DF',
  },

  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  assignmentPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 14,
    marginTop: 14,
  },

  previewLabel: {
    color: '#777777',
    fontSize: 11,
    marginBottom: 12,
    fontWeight: '600',
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  previewPerson: {
    flex: 1,
  },

  previewSmallLabel: {
    color: '#999999',
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 3,
  },

  previewSmallLabelRight: {
    textAlign: 'right',
  },

  previewMember: {
    color: '#222222',
    fontSize: 13,
    fontWeight: '700',
  },

  previewTrainer: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  changeBox: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 9,
    marginTop: 12,
  },

  changeText: {
    color: '#4169D8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ManagerAssignMemberScreen;


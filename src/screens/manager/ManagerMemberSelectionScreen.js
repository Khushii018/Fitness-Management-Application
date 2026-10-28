
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useSelector} from 'react-redux';

import {useFocusEffect} from '@react-navigation/native';

const PRIMARY_COLOR = '#4169D8';
const GREEN_COLOR = '#22C55E';
const BLACK_COLOR = '#111111';
const GRAY_COLOR = '#6B7280';
const LIGHT_GRAY = '#F5F7FA';
const BORDER_COLOR = '#E5E7EB';
const WHITE = '#FFFFFF';

const ManagerMemberSelectionScreen = ({
  navigation,
}) => {
  const [registeredUsers, setRegisteredUsers] =
    useState([]);

  const [memberModalVisible, setMemberModalVisible] =
    useState(false);

  const [selectedMember, setSelectedMember] =
    useState(null);

  const managerUser = useSelector(
    state => state.auth?.user,
  );

  const managerMembers = useSelector(
    state => state.manager?.members || [],
  );

  const trainerMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const managerId = useMemo(() => {
    const id =
      managerUser?.managerId ||
      managerUser?.id;

    return id ? String(id) : null;
  }, [managerUser]);

  const loadRegisteredUsers = useCallback(
    async () => {
      try {
        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        if (!storedUsers) {
          setRegisteredUsers([]);
          return;
        }

        const parsedUsers =
          JSON.parse(storedUsers);

        setRegisteredUsers(
          Array.isArray(parsedUsers)
            ? parsedUsers
            : [],
        );
      } catch (error) {
        console.log(
          'Error loading registered users:',
          error,
        );

        setRegisteredUsers([]);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadRegisteredUsers();
    }, [loadRegisteredUsers]),
  );

  const allMembers = useMemo(() => {
    if (!managerId) {
      return [];
    }

    const reduxManagerMembers =
      Array.isArray(managerMembers)
        ? managerMembers.filter(
            member =>
              member?.managerId &&
              String(
                member.managerId,
              ) === managerId,
          )
        : [];

    const reduxTrainerMembers =
      Array.isArray(trainerMembers)
        ? trainerMembers.filter(
            member =>
              member?.managerId &&
              String(
                member.managerId,
              ) === managerId,
          )
        : [];

    const storageMembers =
      Array.isArray(registeredUsers)
        ? registeredUsers.filter(
            user =>
              String(
                user?.role || '',
              ).toLowerCase() ===
                'member' &&
              user?.managerId &&
              String(
                user.managerId,
              ) === managerId,
          )
        : [];

    const combinedMembers = [
      ...reduxManagerMembers,
      ...reduxTrainerMembers,
      ...storageMembers,
    ];

    const uniqueMembers = [];

    combinedMembers.forEach(member => {
      const memberKey = String(
        member?.id ||
          member?.memberId ||
          member?.userId ||
          member?.email ||
          '',
      )
        .trim()
        .toLowerCase();

      if (!memberKey) {
        return;
      }

      const alreadyExists =
        uniqueMembers.some(
          existingMember => {
            const existingKey =
              String(
                existingMember?.id ||
                  existingMember?.memberId ||
                  existingMember?.userId ||
                  existingMember?.email ||
                  '',
              )
                .trim()
                .toLowerCase();

            return (
              existingKey === memberKey
            );
          },
        );

      if (!alreadyExists) {
        uniqueMembers.push(member);
      }
    });

    return uniqueMembers;
  }, [
    managerMembers,
    trainerMembers,
    registeredUsers,
    managerId,
  ]);

  const getMemberName = member => {
    return (
      member?.name ||
      member?.fullName ||
      member?.username ||
      member?.userName ||
      'Member'
    );
  };

  const getMemberEmail = member => {
    return (
      member?.email ||
      member?.emailAddress ||
      'No email available'
    );
  };

  const getMemberMobile = member => {
    return (
      member?.mobile ||
      member?.phone ||
      member?.phoneNumber ||
      ''
    );
  };

  const getTrainerId = member => {
    if (
      Array.isArray(member?.trainerIds) &&
      member.trainerIds.length > 0
    ) {
      return String(
        member.trainerIds[0],
      );
    }

    if (member?.trainerId) {
      return String(
        member.trainerId,
      );
    }

    if (member?.createdByTrainerId) {
      return String(
        member.createdByTrainerId,
      );
    }

    if (member?.trainer?.id) {
      return String(
        member.trainer.id,
      );
    }

    return null;
  };

  const getTrainerName = member => {
    if (member?.trainer?.name) {
      return member.trainer.name;
    }

    if (member?.trainer?.fullName) {
      return member.trainer.fullName;
    }

    if (member?.trainerName) {
      return member.trainerName;
    }

    return null;
  };

  const getInitials = name => {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return 'M';
    }

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

  const handleMemberPress = member => {
    navigation.navigate(
      'MemberDetails',
      {
        member,
      },
    );
  };

  const handleSelectMember = member => {
    setSelectedMember(member);
    setMemberModalVisible(false);
  };

  const clearMemberSelection = () => {
    setSelectedMember(null);
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

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.goBack()
          }>

          <Ionicons
            name="arrow-back"
            size={22}
            color={BLACK_COLOR}
          />

        </TouchableOpacity>

        <View style={styles.headerContent}>

          <Text
            style={styles.headerTitle}>
            Member Selection
          </Text>

          <Text
            style={styles.headerSubtitle}>
            Select a member to view
            details
          </Text>

        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }>

        <Text
          style={styles.sectionTitle}>
          Select Member
        </Text>

        <Text
          style={styles.sectionSubtitle}>
          Choose a member belonging to
          this manager
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.selectionButton,
            selectedMember &&
              styles.selectionButtonSelected,
          ]}
          onPress={() =>
            setMemberModalVisible(true)
          }>

          <View
            style={[
              styles.selectionIcon,
              selectedMember &&
                styles.selectionIconSelected,
            ]}>

            <Ionicons
              name="person-outline"
              size={22}
              color={
                selectedMember
                  ? WHITE
                  : PRIMARY_COLOR
              }
            />

          </View>

          <View
            style={styles.selectionContent}>

            <Text
              style={styles.selectionLabel}>
              Member
            </Text>

            <Text
              style={
                selectedMember
                  ? styles.selectedMemberText
                  : styles.placeholderText
              }
              numberOfLines={1}>

              {selectedMember
                ? getMemberName(
                    selectedMember,
                  )
                : 'Select Member'}

            </Text>

          </View>

          <Ionicons
            name="chevron-down"
            size={21}
            color={
              selectedMember
                ? PRIMARY_COLOR
                : GRAY_COLOR
            }
          />

        </TouchableOpacity>

        {selectedMember ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.clearButton}
            onPress={
              clearMemberSelection
            }>

            <Ionicons
              name="close-circle-outline"
              size={17}
              color={GRAY_COLOR}
            />

            <Text
              style={styles.clearButtonText}>
              Clear member selection
            </Text>

          </TouchableOpacity>
        ) : null}

        {!selectedMember ? (
          <View
            style={styles.noSelectionCard}>

            <View
              style={styles.noSelectionIcon}>

              <Ionicons
                name="people-outline"
                size={36}
                color={PRIMARY_COLOR}
              />

            </View>

            <Text
              style={styles.noSelectionTitle}>
              No member selected
            </Text>

            <Text
              style={styles.noSelectionText}>
              Select a member above to
              view their information and
              assigned trainer.
            </Text>

          </View>
        ) : (
          <View
            style={styles.memberSection}>

            <View
              style={styles.memberHeader}>

              <View
                style={styles.memberHeaderText}>

                <Text
                  style={
                    styles.memberSectionTitle
                  }>
                  Member Details
                </Text>

                <Text
                  style={
                    styles.memberSectionSubtitle
                  }>
                  Selected member information
                </Text>

              </View>

              <View
                style={styles.selectedBadge}>

                <Ionicons
                  name="checkmark"
                  size={16}
                  color={WHITE}
                />

              </View>

            </View>

            <TouchableOpacity
              style={styles.memberCard}
              activeOpacity={0.8}
              onPress={() =>
                handleMemberPress(
                  selectedMember,
                )
              }>

              <View
                style={styles.memberAvatar}>

                <Text
                  style={
                    styles.memberAvatarText
                  }>
                  {getInitials(
                    getMemberName(
                      selectedMember,
                    ),
                  )}
                </Text>

              </View>

              <View
                style={styles.memberInfo}>

                <Text
                  style={styles.memberName}
                  numberOfLines={1}>
                  {getMemberName(
                    selectedMember,
                  )}
                </Text>

                <Text
                  style={styles.memberEmail}
                  numberOfLines={1}>
                  {getMemberEmail(
                    selectedMember,
                  )}
                </Text>

                {getMemberMobile(
                  selectedMember,
                ) ? (
                  <Text
                    style={styles.memberMobile}
                    numberOfLines={1}>
                    {getMemberMobile(
                      selectedMember,
                    )}
                  </Text>
                ) : null}

                <View
                  style={styles.trainerRow}>

                  <Ionicons
                    name="fitness-outline"
                    size={14}
                    color={
                      getTrainerName(
                        selectedMember,
                      ) ||
                      getTrainerId(
                        selectedMember,
                      )
                        ? PRIMARY_COLOR
                        : GRAY_COLOR
                    }
                  />

                  <Text
                    style={trainerTextStyle(
                      getTrainerName(
                        selectedMember,
                      ),
                    )}
                    numberOfLines={1}>

                    {getTrainerName(
                      selectedMember,
                    )
                      ? `Trainer: ${getTrainerName(
                          selectedMember,
                        )}`
                      : getTrainerId(
                          selectedMember,
                        )
                      ? `Trainer ID: ${getTrainerId(
                          selectedMember,
                        )}`
                      : 'No trainer assigned'}

                  </Text>

                </View>

              </View>

              <View
                style={styles.memberRight}>

                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        getTrainerName(
                          selectedMember,
                        ) ||
                        getTrainerId(
                          selectedMember,
                        )
                          ? GREEN_COLOR
                          : '#D1D5DB',
                    },
                  ]}
                />

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={GRAY_COLOR}
                />

              </View>

            </TouchableOpacity>

          </View>
        )}

      </ScrollView>

      <Modal
        visible={memberModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setMemberModalVisible(false)
        }>

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setMemberModalVisible(false)
          }>

          <Pressable
            style={styles.modalCard}
            onPress={() => {}}>

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
                  style={styles.modalSubtitle}>
                  Members belonging to
                  this manager
                </Text>

              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  setMemberModalVisible(
                    false,
                  )
                }>

                <Ionicons
                  name="close"
                  size={22}
                  color={BLACK_COLOR}
                />

              </TouchableOpacity>

            </View>

            {allMembers.length === 0 ? (
              <View
                style={styles.emptyModal}>

                <View
                  style={
                    styles.emptyModalIcon
                  }>

                  <Ionicons
                    name="people-outline"
                    size={34}
                    color={PRIMARY_COLOR}
                  />

                </View>

                <Text
                  style={
                    styles.emptyModalTitle
                  }>
                  No members available
                </Text>

                <Text
                  style={
                    styles.emptyModalText
                  }>
                  This manager has no
                  members yet.
                </Text>

              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                style={styles.memberList}>

                {allMembers.map(
                  (
                    member,
                    index,
                  ) => {

                    const memberId =
                      member?.id ||
                      member?.memberId ||
                      member?.userId ||
                      member?.email ||
                      index;

                    const memberName =
                      getMemberName(
                        member,
                      );

                    const selectedId =
                      selectedMember?.id ||
                      selectedMember?.memberId ||
                      selectedMember?.userId ||
                      selectedMember?.email ||
                      '';

                    const currentId =
                      member?.id ||
                      member?.memberId ||
                      member?.userId ||
                      member?.email ||
                      '';

                    const isSelected =
                      selectedMember &&
                      String(
                        selectedId,
                      ) ===
                        String(
                          currentId,
                        );

                    const trainerName =
                      getTrainerName(
                        member,
                      );

                    const trainerId =
                      getTrainerId(
                        member,
                      );

                    return (
                      <TouchableOpacity
                        key={String(
                          memberId,
                        )}
                        activeOpacity={0.8}
                        style={[
                          styles.memberOption,
                          isSelected &&
                            styles.selectedMemberOption,
                        ]}
                        onPress={() =>
                          handleSelectMember(
                            member,
                          )
                        }>

                        <View
                          style={[
                            styles.memberOptionAvatar,
                            isSelected &&
                              styles.memberOptionAvatarSelected,
                          ]}>

                          <Text
                            style={[
                              styles.memberOptionAvatarText,
                              isSelected &&
                                styles.memberOptionAvatarTextSelected,
                            ]}>
                            {getInitials(
                              memberName,
                            )}
                          </Text>

                        </View>

                        <View
                          style={
                            styles.memberOptionInfo
                          }>

                          <Text
                            style={
                              styles.memberOptionName
                            }
                            numberOfLines={1}>
                            {memberName}
                          </Text>

                          <Text
                            style={
                              styles.memberOptionEmail
                            }
                            numberOfLines={1}>
                            {getMemberEmail(
                              member,
                            )}
                          </Text>

                          <View
                            style={
                              styles.memberOptionTrainerRow
                            }>

                            <Ionicons
                              name="fitness-outline"
                              size={12}
                              color={
                                trainerName ||
                                trainerId
                                  ? PRIMARY_COLOR
                                  : GRAY_COLOR
                              }
                            />

                            <Text
                              style={
                                styles.memberOptionTrainer
                              }
                              numberOfLines={1}>

                              {trainerName
                                ? `Trainer: ${trainerName}`
                                : trainerId
                                ? `Trainer ID: ${trainerId}`
                                : 'No trainer assigned'}

                            </Text>

                          </View>

                        </View>

                        {isSelected ? (
                          <View
                            style={
                              styles.selectedCheck
                            }>

                            <Ionicons
                              name="checkmark"
                              size={19}
                              color={WHITE}
                            />

                          </View>
                        ) : (
                          <Ionicons
                            name="chevron-forward"
                            size={19}
                            color={GRAY_COLOR}
                          />
                        )}

                      </TouchableOpacity>
                    );
                  },
                )}

              </ScrollView>
            )}

          </Pressable>

        </Pressable>

      </Modal>

    </SafeAreaView>
  );
};

const trainerTextStyle = trainer => ({
  fontSize: 10,
  color: trainer
    ? PRIMARY_COLOR
    : GRAY_COLOR,
  fontWeight: trainer
    ? '600'
    : '500',
  marginLeft: 5,
  flex: 1,
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContent: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: BLACK_COLOR,
  },

  headerSubtitle: {
    fontSize: 12,
    color: GRAY_COLOR,
    marginTop: 3,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLACK_COLOR,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: GRAY_COLOR,
    marginTop: 4,
    marginBottom: 14,
  },

  selectionButton: {
    minHeight: 76,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectionButtonSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F7F9FF',
  },

  selectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionIconSelected: {
    backgroundColor: PRIMARY_COLOR,
  },

  selectionContent: {
    flex: 1,
    marginLeft: 12,
  },

  selectionLabel: {
    fontSize: 11,
    color: GRAY_COLOR,
    marginBottom: 3,
  },

  placeholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY_COLOR,
  },

  selectedMemberText: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 9,
    paddingVertical: 4,
  },

  clearButtonText: {
    fontSize: 12,
    color: GRAY_COLOR,
    marginLeft: 5,
  },

  noSelectionCard: {
    marginTop: 20,
    paddingVertical: 38,
    paddingHorizontal: 25,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: WHITE,
    alignItems: 'center',
  },

  noSelectionIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  noSelectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  noSelectionText: {
    fontSize: 12,
    color: GRAY_COLOR,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  memberSection: {
    marginTop: 25,
  },

  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  memberHeaderText: {
    flex: 1,
  },

  memberSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLACK_COLOR,
  },

  memberSectionSubtitle: {
    fontSize: 12,
    color: GRAY_COLOR,
    marginTop: 3,
  },

  selectedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberCard: {
    minHeight: 88,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: WHITE,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },

  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },

  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  memberEmail: {
    fontSize: 11,
    color: GRAY_COLOR,
    marginTop: 3,
  },

  memberMobile: {
    fontSize: 10,
    color: GRAY_COLOR,
    marginTop: 2,
  },

  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  memberRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
    maxHeight: '78%',
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BLACK_COLOR,
  },

  modalSubtitle: {
    fontSize: 12,
    color: GRAY_COLOR,
    marginTop: 3,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberList: {
    maxHeight: 500,
  },

  memberOption: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: WHITE,
  },

  selectedMemberOption: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F7F9FF',
  },

  memberOptionAvatar: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberOptionAvatarSelected: {
    backgroundColor: PRIMARY_COLOR,
  },

  memberOptionAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },

  memberOptionAvatarTextSelected: {
    color: WHITE,
  },

  memberOptionInfo: {
    flex: 1,
    marginLeft: 11,
  },

  memberOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  memberOptionEmail: {
    fontSize: 11,
    color: GRAY_COLOR,
    marginTop: 3,
  },

  memberOptionTrainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  memberOptionTrainer: {
    flex: 1,
    fontSize: 10,
    color: GRAY_COLOR,
    marginLeft: 5,
  },

  selectedCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyModal: {
    paddingVertical: 35,
    alignItems: 'center',
  },

  emptyModalIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK_COLOR,
  },

  emptyModalText: {
    fontSize: 12,
    color: GRAY_COLOR,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ManagerMemberSelectionScreen;


import React, {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useSelector, useDispatch} from 'react-redux';

import {setMembers} from '../../redux/slices/trainerSlice';

const AddMembersScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const myMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const currentTrainer = useSelector(
    state => state.auth?.user || null,
  );

  const [systemMembers, setSystemMembers] =
    useState([]);

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSystemMembers();
    }, []),
  );

  const loadSystemMembers = async () => {
    try {
      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (!storedUsers) {
        setSystemMembers([]);
        return;
      }

      const parsedUsers =
        JSON.parse(storedUsers);

      const users = Array.isArray(parsedUsers)
        ? parsedUsers
        : [parsedUsers];

      const members = users.filter(
        user => user?.role === 'member',
      );

      setSystemMembers(members);
    } catch (error) {
      console.log(
        'Error loading system members:',
        error,
      );
    }
  };

  const getCurrentTrainerId = () => {
    return (
      currentTrainer?.id ||
      currentTrainer?.trainerId ||
      currentTrainer?.userId ||
      null
    );
  };

  const isAlreadyAdded = member => {
    const trainerId =
      getCurrentTrainerId();

    if (!trainerId) {
      return false;
    }

    const memberTrainerIds =
      Array.isArray(member?.trainerIds)
        ? member.trainerIds
        : member?.trainerId
        ? [member.trainerId]
        : [];

    if (
      memberTrainerIds.some(
        id =>
          String(id) ===
          String(trainerId),
      )
    ) {
      return true;
    }

    return myMembers.some(item => {
      const itemTrainerIds =
        Array.isArray(item?.trainerIds)
          ? item.trainerIds
          : item?.trainerId
          ? [item.trainerId]
          : [];

      const sameMember =
        item?.email &&
        member?.email &&
        String(item.email)
          .trim()
          .toLowerCase() ===
          String(member.email)
            .trim()
            .toLowerCase();

      const sameTrainer =
        itemTrainerIds.some(
          id =>
            String(id) ===
            String(trainerId),
        );

      return (
        sameMember &&
        sameTrainer
      );
    });
  };

  const handleAddMember = async member => {
    if (isAlreadyAdded(member)) {
      return;
    }

    const trainerId =
      getCurrentTrainerId();

    if (!trainerId) {
      Alert.alert(
        'Trainer Not Found',
        'Unable to identify the logged-in trainer.',
      );
      return;
    }

    try {
      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      let users = [];

      if (storedUsers) {
        const parsedUsers =
          JSON.parse(storedUsers);

        users = Array.isArray(
          parsedUsers,
        )
          ? parsedUsers
          : [];
      }

      const memberIndex =
        users.findIndex(user => {
          if (!user) {
            return false;
          }

          if (
            member?.id &&
            user?.id &&
            String(user.id) ===
              String(member.id)
          ) {
            return true;
          }

          if (
            member?.email &&
            user?.email &&
            String(user.email)
              .trim()
              .toLowerCase() ===
              String(member.email)
                .trim()
                .toLowerCase()
          ) {
            return true;
          }

          return false;
        });

      if (memberIndex === -1) {
        Alert.alert(
          'Member Not Found',
          'Unable to find this member account.',
        );
        return;
      }

      const existingMember =
        users[memberIndex];

      const existingTrainerIds =
        Array.isArray(
          existingMember?.trainerIds,
        )
          ? existingMember.trainerIds
          : existingMember?.trainerId
          ? [existingMember.trainerId]
          : [];

      const alreadyOwned =
        existingTrainerIds.some(
          id =>
            String(id) ===
            String(trainerId),
        );

      const updatedTrainerIds =
        alreadyOwned
          ? existingTrainerIds
          : [
              ...existingTrainerIds,
              trainerId,
            ];

      users[memberIndex] = {
        ...existingMember,
        trainerId: trainerId,
        trainerIds:
          updatedTrainerIds,
      };

      await AsyncStorage.setItem(
        'registeredUsers',
        JSON.stringify(users),
      );

      const newMember = {
        id:
          existingMember?.id ||
          member?.id ||
          `${Date.now()}-${Math.random()}`,

        name:
          existingMember?.fullName ||
          member?.fullName ||
          'Member',

        fullName:
          existingMember?.fullName ||
          member?.fullName ||
          'Member',

        email:
          existingMember?.email ||
          member?.email ||
          '',

        mobile:
          existingMember?.mobile ||
          member?.mobile ||
          '',

        status: 'Active',

        weight: existingMember?.weight
          ? `${existingMember.weight} kg`
          : member?.weight
          ? `${member.weight} kg`
          : 'Not added',

        goal:
          existingMember?.goal ||
          member?.goal ||
          'Not selected',

        trainerId:
          trainerId,

        trainerIds:
          updatedTrainerIds,
      };

      const memberAlreadyInRedux =
        myMembers.some(item => {
          if (
            item?.email &&
            newMember?.email
          ) {
            return (
              String(item.email)
                .trim()
                .toLowerCase() ===
              String(newMember.email)
                .trim()
                .toLowerCase()
            );
          }

          return (
            item?.id &&
            newMember?.id &&
            String(item.id) ===
              String(newMember.id)
          );
        });

      let updatedMembers;

      if (memberAlreadyInRedux) {
        updatedMembers =
          myMembers.map(item => {
            const sameMember =
              item?.email &&
              newMember?.email &&
              String(item.email)
                .trim()
                .toLowerCase() ===
                String(newMember.email)
                  .trim()
                  .toLowerCase();

            if (!sameMember) {
              return item;
            }

            const itemTrainerIds =
              Array.isArray(
                item?.trainerIds,
              )
                ? item.trainerIds
                : item?.trainerId
                ? [item.trainerId]
                : [];

            const mergedTrainerIds = [
              ...new Set([
                ...itemTrainerIds,
                ...updatedTrainerIds,
              ]),
            ];

            return {
              ...item,
              ...newMember,
              trainerId:
                trainerId,
              trainerIds:
                mergedTrainerIds,
            };
          });
      } else {
        updatedMembers = [
          ...myMembers,
          newMember,
        ];
      }

      dispatch(
        setMembers(
          updatedMembers,
        ),
      );

      setSystemMembers(
        prevMembers =>
          prevMembers.map(item => {
            const sameMember =
              item?.email &&
              newMember?.email &&
              String(item.email)
                .trim()
                .toLowerCase() ===
                String(newMember.email)
                  .trim()
                  .toLowerCase();

            if (!sameMember) {
              return item;
            }

            return {
              ...item,
              trainerId:
                trainerId,
              trainerIds:
                updatedTrainerIds,
            };
          }),
      );
    } catch (error) {
      console.log(
        'Error adding member:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to add this member.',
      );
    }
  };

  const filteredMembers =
    systemMembers.filter(member => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return (
        member?.fullName
          ?.toLowerCase()
          .includes(searchText) ||
        member?.email
          ?.toLowerCase()
          .includes(searchText) ||
        member?.mobile
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <SafeAreaView
      style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>
        <View
          style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.scrollContent
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
                  size={22}
                  color="#333333"
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerTextContainer
                }>
                <Text
                  style={styles.title}>
                  Add Members
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }>
                  Select members from the
                  system
                </Text>
              </View>
            </View>

            <View
              style={styles.infoCard}>
              <View
                style={styles.infoIcon}>
                <Ionicons
                  name="people-outline"
                  size={23}
                  color="#4169D8"
                />
              </View>

              <View
                style={
                  styles.infoContent
                }>
                <Text
                  style={
                    styles.infoTitle
                  }>
                  System Members
                </Text>

                <Text
                  style={styles.infoText}>
                  These are members who have
                  registered in the fitness app.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.searchContainer
              }>
              <Ionicons
                name="search-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Search members"
                placeholderTextColor="#999999"
                value={search}
                onChangeText={
                  setSearch
                }
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setSearch('')
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color="#999999"
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={
                styles.createMemberButton
              }
              onPress={() =>
                navigation.navigate(
                  'CreateMemberAccount',
                )
              }
              activeOpacity={0.8}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createMemberButtonText
                }>
                Create New Member Account
              </Text>
            </TouchableOpacity>

            <View
              style={styles.countRow}>
              <Text
                style={
                  styles.sectionTitle
                }>
                Available Members
              </Text>

              <Text
                style={
                  styles.countText
                }>
                {filteredMembers.length}{' '}
                members
              </Text>
            </View>

            {filteredMembers.length >
            0 ? (
              filteredMembers.map(
                member => {
                  const added =
                    isAlreadyAdded(
                      member,
                    );

                  return (
                    <View
                      key={
                        member?.id ||
                        member?.email ||
                        member?.mobile
                      }
                      style={
                        styles.memberCard
                      }>
                      <View
                        style={
                          styles.avatar
                        }>
                        <Ionicons
                          name="person"
                          size={24}
                          color="#4169D8"
                        />
                      </View>

                      <View
                        style={
                          styles.memberInfo
                        }>
                        <Text
                          style={
                            styles.memberName
                          }>
                          {
                            member?.fullName
                          }
                        </Text>

                        <Text
                          style={
                            styles.memberEmail
                          }>
                          {
                            member?.email
                          }
                        </Text>

                        {member?.mobile && (
                          <View
                            style={
                              styles.mobileRow
                            }>
                            <Ionicons
                              name="call-outline"
                              size={13}
                              color="#777777"
                            />

                            <Text
                              style={
                                styles.mobileText
                              }>
                              {
                                member.mobile
                              }
                            </Text>
                          </View>
                        )}
                      </View>

                      {added ? (
                        <View
                          style={
                            styles.addedButton
                          }>
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color="#4169D8"
                          />

                          <Text
                            style={
                              styles.addedButtonText
                            }>
                            Added
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={
                            styles.addButton
                          }
                          onPress={() =>
                            handleAddMember(
                              member,
                            )
                          }
                          activeOpacity={0.8}>
                          <Ionicons
                            name="add"
                            size={18}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.addButtonText
                            }>
                            Add
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                },
              )
            ) : (
              <View
                style={
                  styles.emptyCard
                }>
                <View
                  style={
                    styles.emptyIcon
                  }>
                  <Ionicons
                    name="people-outline"
                    size={32}
                    color="#4169D8"
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }>
                  No Members Found
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }>
                  {search
                    ? 'No registered members match your search.'
                    : 'There are no registered members in the system.'}
                </Text>
              </View>
            )}
          </ScrollView>
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

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: '#333333',
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 3,
  },

  subtitle: {
    color: '#777777',
    fontSize: 11,
  },

  infoCard: {
    backgroundColor: '#EAF0FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  infoText: {
    color: '#666666',
    fontSize: 10,
    lineHeight: 15,
  },

  searchContainer: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 22,
  },

  searchInput: {
    flex: 1,
    color: '#333333',
    fontSize: 13,
    marginLeft: 9,
    paddingVertical: 0,
  },

  createMemberButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 15,
  },

  createMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7,
  },

  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
  },

  countText: {
    color: '#777777',
    fontSize: 11,
  },

  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  memberEmail: {
    color: '#777777',
    fontSize: 10,
    marginBottom: 5,
  },

  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mobileText: {
    color: '#777777',
    fontSize: 10,
    marginLeft: 4,
  },

  addButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  addedButton: {
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#EAF0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addedButtonText: {
    color: '#4169D8',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  emptyText: {
    color: '#777777',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default AddMembersScreen;
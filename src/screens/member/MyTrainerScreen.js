import React, {useCallback, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const MyTrainerScreen = ({navigation}) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const trainerData = useSelector(
    state => state.trainer?.profile || null,
  );

  const loadTrainer = useCallback(async () => {
    try {
      setLoading(true);

      const currentUserData =
        await AsyncStorage.getItem('currentUser');

      const trainerProfileData =
        await AsyncStorage.getItem('trainerProfile');

      const registeredUsersData =
        await AsyncStorage.getItem('registeredUsers');

      let currentUser = null;

      if (currentUserData) {
        currentUser = JSON.parse(currentUserData);
      }

      let storedTrainer = null;

      if (trainerProfileData) {
        storedTrainer = JSON.parse(trainerProfileData);
      }

      let registeredUsers = [];

      if (registeredUsersData) {
        const parsedUsers =
          JSON.parse(registeredUsersData);

        if (Array.isArray(parsedUsers)) {
          registeredUsers = parsedUsers;
        }
      }

      const currentMemberId =
        currentUser?.id ||
        currentUser?.memberId ||
        currentUser?.userId;

      const currentMemberEmail =
        currentUser?.email;

      let currentMember = null;

      if (Array.isArray(members)) {
        currentMember = members.find(member => {
          const memberId =
            member?.id ||
            member?.memberId;

          return (
            (currentMemberId &&
              String(memberId) ===
                String(currentMemberId)) ||
            (currentMemberEmail &&
              String(member?.email || '').toLowerCase() ===
                String(currentMemberEmail).toLowerCase())
          );
        });
      }

      if (!currentMember && registeredUsers.length) {
        currentMember = registeredUsers.find(user => {
          const userId =
            user?.id ||
            user?.memberId;

          return (
            (currentMemberId &&
              String(userId) ===
                String(currentMemberId)) ||
            (currentMemberEmail &&
              String(user?.email || '').toLowerCase() ===
                String(currentMemberEmail).toLowerCase())
          );
        });
      }

      let assignedTrainer = null;

      if (currentMember) {
        assignedTrainer =
          currentMember?.trainer ||
          currentMember?.assignedTrainer ||
          null;
      }

      if (!assignedTrainer && storedTrainer) {
        assignedTrainer = storedTrainer;
      }

      if (!assignedTrainer && trainerData) {
        assignedTrainer = trainerData;
      }

      if (assignedTrainer) {
        setTrainer(assignedTrainer);
      } else {
        setTrainer(null);
      }
    } catch (error) {
      console.log(
        'Error loading trainer:',
        error,
      );
      setTrainer(null);
    } finally {
      setLoading(false);
    }
  }, [members, trainerData]);

  useFocusEffect(
    useCallback(() => {
      loadTrainer();
    }, [loadTrainer]),
  );

  const trainerName =
    trainer?.name ||
    trainer?.fullName ||
    trainer?.trainerName ||
    'Trainer';

  const trainerImage =
    trainer?.image ||
    trainer?.profileImage ||
    trainer?.photo ||
    trainer?.avatar ||
    null;

  const trainerExperience =
    trainer?.experience ||
    trainer?.experienceYears ||
    '3+ Years';

  const trainerSpecialization =
    trainer?.specialization ||
    trainer?.speciality ||
    trainer?.specialty ||
    'Fitness Trainer';

  const trainerQualification =
    trainer?.qualification ||
    trainer?.certification ||
    'Certified Fitness Trainer';

  const trainerPhone =
    trainer?.mobile ||
    trainer?.phone ||
    trainer?.phoneNumber ||
    '';

  const trainerEmail =
    trainer?.email ||
    '';

  const handleMessage = () => {
    if (navigation) {
      navigation.navigate('TrainerChat', {
        trainer,
      });
    }
  };

  const handleAppointment = () => {
    if (navigation) {
      navigation.navigate('Appointments', {
        trainer,
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4169D8"
        />

        <Text style={styles.loadingText}>
          Loading trainer...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color="#222222"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            My Trainer
          </Text>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleMessage}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#4169D8"
            />
          </TouchableOpacity>
        </View>

        {!trainer ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="person-outline"
                size={42}
                color="#4169D8"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Trainer Assigned
            </Text>

            <Text style={styles.emptyText}>
              You don't have a trainer assigned to
              your account yet.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileImageContainer}>
                {trainerImage ? (
                  <Image
                    source={{uri: trainerImage}}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={styles.profileImagePlaceholder}>
                    <Ionicons
                      name="person"
                      size={48}
                      color="#4169D8"
                    />
                  </View>
                )}

                <View style={styles.onlineBadge}>
                  <View
                    style={styles.onlineDot}
                  />

                  <Text style={styles.onlineText}>
                    Active
                  </Text>
                </View>
              </View>

              <Text style={styles.trainerName}>
                {trainerName}
              </Text>

              <Text style={styles.trainerRole}>
                {trainerQualification}
              </Text>

              <Text style={styles.specialization}>
                {trainerSpecialization}
              </Text>

              <View style={styles.ratingContainer}>
                <Ionicons
                  name="star"
                  size={16}
                  color="#F5A623"
                />

                <Text style={styles.ratingText}>
                  {trainer?.rating || '4.8'}
                </Text>

                <Text style={styles.ratingLabel}>
                  Trainer Rating
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}>
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color="#4169D8"
                />

                <Text
                  style={styles.messageButtonText}>
                  Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.appointmentButton}
                onPress={handleAppointment}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.appointmentButtonText
                  }>
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>
              Trainer Information
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color="#4169D8"
                  />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Experience
                  </Text>

                  <Text style={styles.infoValue}>
                    {trainerExperience}
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="fitness-outline"
                    size={20}
                    color="#4169D8"
                  />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Specialization
                  </Text>

                  <Text style={styles.infoValue}>
                    {trainerSpecialization}
                  </Text>
                </View>
              </View>

              {trainerEmail ? (
                <>
                  <View style={styles.separator} />

                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#4169D8"
                      />
                    </View>

                    <View
                      style={styles.infoContent}>
                      <Text style={styles.infoLabel}>
                        Email
                      </Text>

                      <Text
                        style={styles.infoValue}
                        numberOfLines={1}>
                        {trainerEmail}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}

              {trainerPhone ? (
                <>
                  <View style={styles.separator} />

                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color="#4169D8"
                      />
                    </View>

                    <View
                      style={styles.infoContent}>
                      <Text style={styles.infoLabel}>
                        Phone
                      </Text>

                      <Text style={styles.infoValue}>
                        {trainerPhone}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>
              My Trainer's Expertise
            </Text>

            <View style={styles.expertiseCard}>
              <View style={styles.expertiseItem}>
                <View
                  style={styles.expertiseIcon}>
                  <Ionicons
                    name="barbell-outline"
                    size={22}
                    color="#4169D8"
                  />
                </View>

                <Text style={styles.expertiseText}>
                  Strength Training
                </Text>
              </View>

              <View style={styles.expertiseItem}>
                <View
                  style={styles.expertiseIcon}>
                  <Ionicons
                    name="body-outline"
                    size={22}
                    color="#4169D8"
                  />
                </View>

                <Text style={styles.expertiseText}>
                  Fitness & Conditioning
                </Text>
              </View>

              <View style={styles.expertiseItem}>
                <View
                  style={styles.expertiseIcon}>
                  <Ionicons
                    name="nutrition-outline"
                    size={22}
                    color="#4169D8"
                  />
                </View>

                <Text style={styles.expertiseText}>
                  Diet Guidance
                </Text>
              </View>

              <View style={styles.expertiseItem}>
                <View
                  style={styles.expertiseIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={22}
                    color="#4169D8"
                  />
                </View>

                <Text style={styles.expertiseText}>
                  Health & Wellness
                </Text>
              </View>
            </View>

            <View style={styles.helpCard}>
              <View style={styles.helpIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={25}
                  color="#4169D8"
                />
              </View>

              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>
                  Need help?
                </Text>

                <Text style={styles.helpText}>
                  Contact your trainer for workout,
                  diet or fitness guidance.
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FBF9',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 30,
  },

  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EEE9',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DDEDE4',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 13,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  onlineBadge: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4169D8',
    marginRight: 4,
  },

  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4169D8',
  },

  trainerName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
    marginTop: 4,
  },

  trainerRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginTop: 5,
  },

  specialization: {
    fontSize: 11,
    color: '#4169D8',
    marginTop: 4,
    fontWeight: '600',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 5,
  },

  ratingLabel: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 5,
  },

  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 12,
    gap: 9,
  },

  messageButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#4169D8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  messageButtonText: {
    color: '#4169D8',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 7,
  },

  appointmentButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 11,
    backgroundColor: '#4169D8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  appointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 7,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  expertiseCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDEDE4',
    paddingHorizontal: 14,
  },

  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  expertiseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  expertiseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },

  helpCard: {
    marginHorizontal: 14,
    marginTop: 16,
    backgroundColor: '#EAF8F0',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  helpContent: {
    flex: 1,
  },

  helpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4169D8',
  },

  helpText: {
    fontSize: 10,
    color: '#5D806D',
    marginTop: 3,
    lineHeight: 15,
  },

  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 100,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EAF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  emptyText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FBF9',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#777777',
  },

  bottomSpace: {
    height: 20,
  },
});

export default MyTrainerScreen;
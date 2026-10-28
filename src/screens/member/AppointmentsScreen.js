import React, {useCallback, useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';



const AppointmentsScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxAppointments = useSelector(
    state => state.trainer?.appointments || [],
  );

  const [user, setUser] = useState(null);
  const [appointments, setAppointmentsList] = useState([]);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [duration, setDuration] = useState('');

  const [showTypes, setShowTypes] = useState(false);
  const [showDurations, setShowDurations] = useState(false);

  const [pendingRequest, setPendingRequest] =
    useState(null);

  const [assignedTrainerIds, setAssignedTrainerIds] =
    useState([]);

  const sessionTypes = [
    'Personal Training',
    'Workout Session',
    'Progress Review',
    'Fitness Assessment',
  ];

  const durations = [
    '30 min',
    '45 min',
    '60 min',
    '90 min',
  ];

  const getUserId = currentUser => {
    if (!currentUser) {
      return null;
    }

    return (
      currentUser.id ||
      currentUser.memberId ||
      currentUser.userId ||
      null
    );
  };

  const getUserEmail = currentUser => {
    return String(
      currentUser?.email || '',
    )
      .trim()
      .toLowerCase();
  };

  const getUserMobile = currentUser => {
    return String(
      currentUser?.mobile ||
        currentUser?.phone ||
        currentUser?.mobileNumber ||
        '',
    ).trim();
  };

  const getTrainerIdsFromUser = member => {
    if (!member) {
      return [];
    }

    if (
      Array.isArray(member.trainerIds) &&
      member.trainerIds.length > 0
    ) {
      return member.trainerIds
        .filter(Boolean)
        .map(String);
    }

    if (member.trainerId) {
      return [String(member.trainerId)];
    }

    return [];
  };

  const getTrainerIdsFromAppointment =
    appointment => {
      if (!appointment) {
        return [];
      }

      if (
        Array.isArray(
          appointment.trainerIds,
        ) &&
        appointment.trainerIds.length > 0
      ) {
        return appointment.trainerIds
          .filter(Boolean)
          .map(String);
      }

      if (appointment.trainerId) {
        return [
          String(
            appointment.trainerId,
          ),
        ];
      }

      if (
        appointment.createdByTrainerId
      ) {
        return [
          String(
            appointment.createdByTrainerId,
          ),
        ];
      }

      if (
        appointment.approvedByTrainerId
      ) {
        return [
          String(
            appointment.approvedByTrainerId,
          ),
        ];
      }

      return [];
    };

  const findRegisteredMember = (
    registeredUsers,
    currentUser,
  ) => {
    if (
      !Array.isArray(registeredUsers) ||
      !currentUser
    ) {
      return null;
    }

    const currentUserId =
      getUserId(currentUser);

    const currentUserEmail =
      getUserEmail(currentUser);

    const currentUserMobile =
      getUserMobile(currentUser);

    return (
      registeredUsers.find(member => {
        if (
          !member ||
          member.role !== 'member'
        ) {
          return false;
        }

        const memberId =
          member.id ||
          member.memberId ||
          member.userId ||
          null;

        const memberEmail = String(
          member.email || '',
        )
          .trim()
          .toLowerCase();

        const memberMobile = String(
          member.mobile ||
            member.phone ||
            member.mobileNumber ||
            '',
        ).trim();

        if (
          currentUserId &&
          memberId &&
          String(memberId) ===
            String(currentUserId)
        ) {
          return true;
        }

        if (
          currentUserEmail &&
          memberEmail &&
          memberEmail ===
            currentUserEmail
        ) {
          return true;
        }

        if (
          currentUserMobile &&
          memberMobile &&
          memberMobile ===
            currentUserMobile
        ) {
          return true;
        }

        return false;
      }) || null
    );
  };

  const isAppointmentForMember = (
    appointment,
    currentUser,
  ) => {
    if (
      !appointment ||
      !currentUser
    ) {
      return false;
    }

    const currentUserId =
      getUserId(currentUser);

    const currentUserEmail =
      getUserEmail(currentUser);

    const currentUserMobile =
      getUserMobile(currentUser);

    const appointmentMemberId =
      appointment.memberId ||
      appointment.userId ||
      null;

    const appointmentEmail =
      String(
        appointment.memberEmail || '',
      )
        .trim()
        .toLowerCase();

    const appointmentMobile =
      String(
        appointment.memberMobile ||
          appointment.mobile ||
          appointment.memberPhone ||
          '',
      ).trim();

    if (
      currentUserId &&
      appointmentMemberId &&
      String(appointmentMemberId) ===
        String(currentUserId)
    ) {
      return true;
    }

    if (
      currentUserEmail &&
      appointmentEmail &&
      appointmentEmail ===
        currentUserEmail
    ) {
      return true;
    }

    if (
      currentUserMobile &&
      appointmentMobile &&
      appointmentMobile ===
        currentUserMobile
    ) {
      return true;
    }

    return false;
  };

  const isAppointmentOwnedByAssignedTrainer =
    (
      appointment,
      trainerIds,
    ) => {
      if (
        !appointment ||
        !Array.isArray(trainerIds) ||
        trainerIds.length === 0
      ) {
        return false;
      }

      const appointmentTrainerIds =
        getTrainerIdsFromAppointment(
          appointment,
        );

      return appointmentTrainerIds.some(
        appointmentTrainerId =>
          trainerIds.some(
            trainerId =>
              String(
                appointmentTrainerId,
              ) ===
              String(trainerId),
          ),
      );
    };

  const getMemberAppointments = (
    allAppointments,
    currentUser,
    trainerIds,
  ) => {
    if (
      !Array.isArray(
        allAppointments,
      ) ||
      !currentUser
    ) {
      return [];
    }

    return allAppointments.filter(
      appointment => {
        const belongsToMember =
          isAppointmentForMember(
            appointment,
            currentUser,
          );

        if (!belongsToMember) {
          return false;
        }

        if (
          !Array.isArray(
            trainerIds,
          ) ||
          trainerIds.length === 0
        ) {
          return false;
        }

        return isAppointmentOwnedByAssignedTrainer(
          appointment,
          trainerIds,
        );
      },
    );
  };

  const getMemberRequests = (
    allRequests,
    currentUser,
    trainerIds,
  ) => {
    if (
      !Array.isArray(
        allRequests,
      ) ||
      !currentUser
    ) {
      return [];
    }

    return allRequests.filter(
      request => {
        const belongsToMember =
          isAppointmentForMember(
            request,
            currentUser,
          );

        if (!belongsToMember) {
          return false;
        }

        if (
          !Array.isArray(
            trainerIds,
          ) ||
          trainerIds.length === 0
        ) {
          return false;
        }

        return isAppointmentOwnedByAssignedTrainer(
          request,
          trainerIds,
        );
      },
    );
  };

  const loadUserAndAppointments =
    useCallback(async () => {
      try {
        const currentUser =
          authUser;

        if (!currentUser) {
          setUser(null);
          setAssignedTrainerIds([]);
          setAppointmentsList([]);
          setPendingRequest(null);
          return;
        }

        setUser(currentUser);

        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        let registeredUsers = [];

        if (storedUsers) {
          try {
            const parsedUsers =
              JSON.parse(
                storedUsers,
              );

            if (
              Array.isArray(
                parsedUsers,
              )
            ) {
              registeredUsers =
                parsedUsers;
            }
          } catch (error) {
            registeredUsers = [];
          }
        }

        const registeredMember =
          findRegisteredMember(
            registeredUsers,
            currentUser,
          );

        let trainerIds = [];

        if (registeredMember) {
          trainerIds =
            getTrainerIdsFromUser(
              registeredMember,
            );
        }

        if (
          trainerIds.length === 0
        ) {
          trainerIds =
            getTrainerIdsFromUser(
              currentUser,
            );
        }

        trainerIds = [
          ...new Set(
            trainerIds
              .filter(Boolean)
              .map(String),
          ),
        ];

        setAssignedTrainerIds(
          trainerIds,
        );

        const allAppointments =
          Array.isArray(
            reduxAppointments,
          )
            ? reduxAppointments
            : [];

        const memberAppointments =
          getMemberAppointments(
            allAppointments,
            currentUser,
            trainerIds,
          );

        setAppointmentsList(
          memberAppointments,
        );

        const storedRequests =
          await AsyncStorage.getItem(
            'appointmentRequests',
          );

        let allRequests = [];

        if (storedRequests) {
          try {
            const parsedRequests =
              JSON.parse(
                storedRequests,
              );

            if (
              Array.isArray(
                parsedRequests,
              )
            ) {
              allRequests =
                parsedRequests;
            }
          } catch (error) {
            allRequests = [];
          }
        }

        const memberRequests =
          getMemberRequests(
            allRequests,
            currentUser,
            trainerIds,
          );

        const pending =
          memberRequests.find(
            request => {
              const status =
                String(
                  request?.status ||
                    '',
                )
                  .trim()
                  .toLowerCase();

              return (
                status === 'pending'
              );
            },
          );

        setPendingRequest(
          pending || null,
        );
      } catch (error) {
        console.log(
          'Load appointments error:',
          error,
        );

        setAppointmentsList([]);
        setPendingRequest(null);
        setAssignedTrainerIds([]);
      }
    }, [
      authUser,
      reduxAppointments,
    ]);

  useEffect(() => {
    loadUserAndAppointments();
  }, [
    loadUserAndAppointments,
  ]);

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        () => {
          loadUserAndAppointments();
        },
      );

    return unsubscribe;
  }, [
    navigation,
    loadUserAndAppointments,
  ]);

  const getDateKey = value => {
    if (!value) {
      return null;
    }

    const stringValue =
      String(value).trim();

    const isoMatch =
      stringValue.match(
        /^(\d{4})-(\d{2})-(\d{2})/,
      );

    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    const match =
      stringValue.match(
        /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
      );

    if (!match) {
      return null;
    }

    const day = Number(
      match[1],
    );

    const monthName = match[2];

    const year = Number(
      match[3],
    );

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthIndex =
      monthNames.findIndex(
        month =>
          month.toLowerCase() ===
          monthName.toLowerCase(),
      );

    if (monthIndex === -1) {
      return null;
    }

    const lastDay = new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate();

    if (
      day < 1 ||
      day > lastDay
    ) {
      return null;
    }

    return `${year}-${String(
      monthIndex + 1,
    ).padStart(2, '0')}-${String(
      day,
    ).padStart(2, '0')}`;
  };

  const handleCreateAppointment =
    async () => {
      if (!user) {
        Alert.alert(
          'User Not Found',
          'Unable to identify the logged-in member.',
        );
        return;
      }

      if (
        assignedTrainerIds.length ===
        0
      ) {
        Alert.alert(
          'No Trainer Assigned',
          'You do not have a trainer assigned yet. Please contact the trainer or gym administrator before creating an appointment.',
        );
        return;
      }

      if (pendingRequest) {
        Alert.alert(
          'Request Pending',
          'You already have an appointment request waiting for trainer approval.',
        );
        return;
      }

      if (!date.trim()) {
        Alert.alert(
          'Missing Date',
          'Please enter the appointment date.',
        );
        return;
      }

      const dateKey =
        getDateKey(date);

      if (!dateKey) {
        Alert.alert(
          'Invalid Date',
          'Please enter the date like 11 September 2026.',
        );
        return;
      }

      if (!time.trim()) {
        Alert.alert(
          'Missing Time',
          'Please enter the appointment time.',
        );
        return;
      }

      if (!sessionType) {
        Alert.alert(
          'Missing Session Type',
          'Please select a session type.',
        );
        return;
      }

      if (!duration) {
        Alert.alert(
          'Missing Duration',
          'Please select the session duration.',
        );
        return;
      }

      try {
        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        let registeredUsers = [];

        if (storedUsers) {
          try {
            const parsedUsers =
              JSON.parse(
                storedUsers,
              );

            if (
              Array.isArray(
                parsedUsers,
              )
            ) {
              registeredUsers =
                parsedUsers;
            }
          } catch (error) {
            registeredUsers = [];
          }
        }

        const registeredMember =
          findRegisteredMember(
            registeredUsers,
            user,
          );

        let currentTrainerIds = [];

        if (registeredMember) {
          currentTrainerIds =
            getTrainerIdsFromUser(
              registeredMember,
            );
        }

        if (
          currentTrainerIds.length ===
          0
        ) {
          currentTrainerIds =
            getTrainerIdsFromUser(
              user,
            );
        }

        currentTrainerIds = [
          ...new Set(
            currentTrainerIds
              .filter(Boolean)
              .map(String),
          ),
        ];

        if (
          currentTrainerIds.length ===
          0
        ) {
          Alert.alert(
            'No Trainer Assigned',
            'You do not have an assigned trainer.',
          );
          return;
        }

        setAssignedTrainerIds(
          currentTrainerIds,
        );

        const storedRequests =
          await AsyncStorage.getItem(
            'appointmentRequests',
          );

        let existingRequests = [];

        if (storedRequests) {
          try {
            const parsedRequests =
              JSON.parse(
                storedRequests,
              );

            if (
              Array.isArray(
                parsedRequests,
              )
            ) {
              existingRequests =
                parsedRequests;
            }
          } catch (error) {
            existingRequests = [];
          }
        }

        const memberId =
          getUserId(user);

        const memberName =
          user.name ||
          user.fullName ||
          user.username ||
          'Member';

        const memberEmail =
          user.email || '';

        const memberMobile =
          user.mobile ||
          user.phone ||
          user.mobileNumber ||
          '';

        const existingPendingRequest =
          existingRequests.find(
            request => {
              if (!request) {
                return false;
              }

              const status =
                String(
                  request.status ||
                    '',
                )
                  .trim()
                  .toLowerCase();

              if (
                status !== 'pending'
              ) {
                return false;
              }

              if (
                memberId &&
                request.memberId &&
                String(
                  request.memberId,
                ) ===
                  String(memberId)
              ) {
                return true;
              }

              if (
                memberEmail &&
                request.memberEmail &&
                String(
                  request.memberEmail,
                )
                  .trim()
                  .toLowerCase() ===
                  String(
                    memberEmail,
                  )
                    .trim()
                    .toLowerCase()
              ) {
                return true;
              }

              return false;
            },
          );

        if (
          existingPendingRequest
        ) {
          setPendingRequest(
            existingPendingRequest,
          );

          Alert.alert(
            'Request Pending',
            'You already have an appointment request waiting for trainer approval.',
          );

          return;
        }

        const requestId = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const newRequest = {
          id: requestId,

          appointmentId:
            requestId,

          memberId:
            memberId,

          memberName:
            memberName,

          memberEmail:
            memberEmail,

          memberMobile:
            memberMobile,

          trainerIds:
            currentTrainerIds,

          trainerId:
            currentTrainerIds.length ===
            1
              ? String(
                  currentTrainerIds[0],
                )
              : null,

          date:
            date.trim(),

          dateKey:
            dateKey,

          time:
            time.trim(),

          type:
            sessionType,

          duration:
            duration,

          status:
            'Pending',

          approved:
            false,

          createdBy:
            'member',

          createdAt:
            new Date().toISOString(),
        };

        const updatedRequests = [
          ...existingRequests,
          newRequest,
        ];

        await AsyncStorage.setItem(
          'appointmentRequests',
          JSON.stringify(
            updatedRequests,
          ),
        );

        setPendingRequest(
          newRequest,
        );

        setDate('');
        setTime('');
        setSessionType('');
        setDuration('');
        setShowTypes(false);
        setShowDurations(false);

        Alert.alert(
          'Request Sent',
          currentTrainerIds.length ===
            1
            ? 'Your appointment request has been sent to your assigned trainer.'
            : 'Your appointment request has been sent to your assigned trainers.',
        );
      } catch (error) {
        console.log(
          'Create appointment request error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to send the appointment request.',
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.container}
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
            style={
              styles.headerTextContainer
            }>
            <Text
              style={
                styles.headerTitle
              }>
             Request New Appointments
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Schedule your training
              session
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }>
          

         

         
          <View
            style={
              styles.createSection
            }>
            

          

            <Text
              style={
                styles.fieldTitle
              }>
              Date
            </Text>

            <View
              style={
                styles.inputContainer
              }>
              <Ionicons
                name="calendar-outline"
                size={21}
                color="#4169D8"
              />

              <TextInput
                style={styles.input}
                placeholder="DD Month YYYY"
                placeholderTextColor="#999999"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <Text
              style={
                styles.helperText
              }>
              Example: 11 September 2026
            </Text>

            <Text
              style={
                styles.fieldTitle
              }>
              Time
            </Text>

            <View
              style={
                styles.inputContainer
              }>
              <Ionicons
                name="time-outline"
                size={21}
                color="#4169D8"
              />

              <TextInput
                style={styles.input}
                placeholder="09:00 AM"
                placeholderTextColor="#999999"
                value={time}
                onChangeText={setTime}
              />
            </View>

            <Text
              style={
                styles.helperText
              }>
              Example: 09:00 AM
            </Text>

            <Text
              style={
                styles.fieldTitle
              }>
              Session Type
            </Text>

            <TouchableOpacity
              style={
                styles.selectBox
              }
              onPress={() =>
                setShowTypes(
                  !showTypes,
                )
              }
              activeOpacity={0.8}>
              <View
                style={
                  styles.selectLeft
                }>
                <Ionicons
                  name="barbell-outline"
                  size={21}
                  color="#4169D8"
                />

                <Text
                  style={[
                    styles.selectText,
                    !sessionType &&
                      styles.placeholder,
                  ]}>
                  {sessionType ||
                    'Select session type'}
                </Text>
              </View>

              <Ionicons
                name={
                  showTypes
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color="#777777"
              />
            </TouchableOpacity>

            {showTypes && (
              <View
                style={
                  styles.dropdown
                }>
                {sessionTypes.map(
                  type => (
                    <TouchableOpacity
                      key={type}
                      style={
                        styles.optionItem
                      }
                      onPress={() => {
                        setSessionType(
                          type,
                        );

                        setShowTypes(
                          false,
                        );
                      }}
                      activeOpacity={
                        0.8
                      }>
                      <Text
                        style={
                          styles.optionText
                        }>
                        {type}
                      </Text>

                      {sessionType ===
                        type && (
                        <Ionicons
                          name="checkmark"
                          size={21}
                          color="#4169D8"
                        />
                      )}
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}

            <Text
              style={
                styles.fieldTitle
              }>
              Duration
            </Text>

            <TouchableOpacity
              style={
                styles.selectBox
              }
              onPress={() =>
                setShowDurations(
                  !showDurations,
                )
              }
              activeOpacity={0.8}>
              <View
                style={
                  styles.selectLeft
                }>
                <Ionicons
                  name="hourglass-outline"
                  size={21}
                  color="#4169D8"
                />

                <Text
                  style={[
                    styles.selectText,
                    !duration &&
                      styles.placeholder,
                  ]}>
                  {duration ||
                    'Select duration'}
                </Text>
              </View>

              <Ionicons
                name={
                  showDurations
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color="#777777"
              />
            </TouchableOpacity>

            {showDurations && (
              <View
                style={
                  styles.dropdown
                }>
                {durations.map(
                  item => (
                    <TouchableOpacity
                      key={item}
                      style={
                        styles.optionItem
                      }
                      onPress={() => {
                        setDuration(
                          item,
                        );

                        setShowDurations(
                          false,
                        );
                      }}
                      activeOpacity={
                        0.8
                      }>
                      <Text
                        style={
                          styles.optionText
                        }>
                        {item}
                      </Text>

                      {duration ===
                        item && (
                        <Ionicons
                          name="checkmark"
                          size={21}
                          color="#4169D8"
                        />
                      )}
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}

            <View
              style={
                styles.approvalInfo
              }>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#4169D8"
              />

              <Text
                style={
                  styles.approvalInfoText
                }>
                Your request will only be
                sent to your assigned
                trainer. Other trainers
                will not receive or see
                this appointment.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (pendingRequest ||
                  assignedTrainerIds.length ===
                    0) &&
                  styles.disabledButton,
              ]}
              onPress={
                handleCreateAppointment
              }
              activeOpacity={0.85}
              disabled={
                !!pendingRequest ||
                assignedTrainerIds.length ===
                  0
              }>
              <Ionicons
                name={
                  pendingRequest
                    ? 'time-outline'
                    : 'send-outline'
                }
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }>
                {pendingRequest
                  ? 'Request Pending'
                  : assignedTrainerIds.length ===
                    0
                  ? 'No Trainer Assigned'
                  : 'Send Appointment Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#333333',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  assignmentIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  assignmentContent: {
    flex: 1,
  },

  assignmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  assignmentText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  assignmentBadge: {
    backgroundColor: '#E8F7EE',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  assignmentBadgeEmpty: {
    backgroundColor: '#FFF1F0',
  },

  assignmentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E9D59',
  },

  assignmentBadgeTextEmpty: {
    color: '#D9534F',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333333',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4169D8',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  emptyText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  appointmentsContainer: {
    marginBottom: 10,
  },

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  calendarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  appointmentMain: {
    flex: 1,
  },

  appointmentType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  appointmentDate: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  appointmentDivider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginVertical: 13,
  },

  appointmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },

  detailText: {
    fontSize: 12,
    color: '#555555',
    marginLeft: 7,
  },

  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  trainerText: {
    fontSize: 12,
    color: '#777777',
    marginLeft: 7,
  },

  pendingCard: {
    backgroundColor: '#FFF9ED',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1D9A7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  pendingIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF0CF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  pendingContent: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6F4B08',
  },

  pendingType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    marginTop: 4,
  },

  pendingDetails: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  pendingStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D88916',
    marginTop: 6,
  },

  createSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  createTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  createSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
    marginBottom: 8,
  },

  fieldTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginTop: 15,
    marginBottom: 9,
  },

  inputContainer: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    marginLeft: 11,
    paddingVertical: 0,
  },

  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 6,
    marginLeft: 3,
  },

  selectBox: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  selectText: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 11,
    flex: 1,
  },

  placeholder: {
    color: '#999999',
  },

  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 13,
    marginTop: 6,
    overflow: 'hidden',
  },

  optionItem: {
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },

  optionText: {
    fontSize: 15,
    color: '#333333',
  },

  approvalInfo: {
    marginTop: 20,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  approvalInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    marginLeft: 8,
  },

  createButton: {
    height: 54,
    backgroundColor: '#4169D8',
    borderRadius: 13,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#9BADE3',
  },

  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 9,
  },
});

export default AppointmentsScreen;
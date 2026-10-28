import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

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

import {useDispatch, useSelector} from 'react-redux';

import {SafeAreaView} from 'react-native-safe-area-context';

import {setAppointments} from '../../redux/slices/trainerSlice';

const CreateAppointmentScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const members = useSelector(
    state => state.trainer?.members || [],
  );

  const reduxAppointments = useSelector(
    state => state.trainer?.appointments || [],
  );

  const currentTrainer = useSelector(
    state => state.auth?.user || null,
  );

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [showMembers, setShowMembers] =
    useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [sessionType, setSessionType] =
    useState('');
  const [duration, setDuration] =
    useState('');

  const [showTypes, setShowTypes] =
    useState(false);

  const [showDurations, setShowDurations] =
    useState(false);

  

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

  const getCurrentTrainerId = trainer => {
    if (!trainer) {
      return null;
    }

    return (
      trainer.id ||
      trainer.trainerId ||
      trainer.userId ||
      null
    );
  };

  const getTrainerIds = item => {
    if (!item) {
      return [];
    }

    if (Array.isArray(item.trainerIds)) {
      return item.trainerIds
        .filter(Boolean)
        .map(String);
    }

    if (item.trainerId) {
      return [String(item.trainerId)];
    }

    if (item.createdByTrainerId) {
      return [String(item.createdByTrainerId)];
    }

    if (item.approvedByTrainerId) {
      return [String(item.approvedByTrainerId)];
    }

    return [];
  };

  const isTrainerAllowed = (
    item,
    trainerId,
    registeredUsers = [],
  ) => {
    if (!item || !trainerId) {
      return false;
    }

    const itemTrainerIds =
      getTrainerIds(item);

    if (
      itemTrainerIds.some(
        id => String(id) === String(trainerId),
      )
    ) {
      return true;
    }

    const memberId =
      item.memberId ||
      item.member?.id ||
      item.member?.memberId ||
      null;

    const memberEmail =
      item.memberEmail ||
      item.member?.email ||
      '';

    const registeredMember =
      registeredUsers.find(member => {
        if (!member) {
          return false;
        }

        const registeredMemberId =
          member.id ||
          member.memberId ||
          member.userId ||
          null;

        if (
          memberId &&
          registeredMemberId &&
          String(registeredMemberId) ===
            String(memberId)
        ) {
          return true;
        }

        if (
          memberEmail &&
          member.email &&
          String(member.email)
            .trim()
            .toLowerCase() ===
            String(memberEmail)
              .trim()
              .toLowerCase()
        ) {
          return true;
        }

        return false;
      });

    if (!registeredMember) {
      return false;
    }

    const memberTrainerIds =
      getTrainerIds(registeredMember);

    return memberTrainerIds.some(
      id =>
        String(id) ===
        String(trainerId),
    );
  };

  const getDateKey = value => {
    if (!value) {
      return null;
    }

    const match = String(value)
      .trim()
      .match(
        /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
      );

    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const monthName = match[2];
    const year = Number(match[3]);

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
    ).padStart(
      2,
      '0',
    )}-${String(day).padStart(
      2,
      '0',
    )}`;
  };

  const formatDate = value => {
    if (!value) {
      return '--';
    }

    const parts = String(value)
      .trim()
      .split(' ');

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[0]} ${parts[1].substring(
      0,
      3,
    )} ${parts[2]}`;
  };

  const loadAppointmentsAndRequests =
    useCallback(async () => {
      try {
        // setLoadingRequests(true);

        const trainerId =
          getCurrentTrainerId(
            currentTrainer,
          );

        if (!trainerId) {
          setPendingRequests([]);
          // setApprovedAppointments([]);
          return;
        }

        const storedUsers =
          await AsyncStorage.getItem(
            'registeredUsers',
          );

        let registeredUsers = [];

        if (storedUsers) {
          try {
            const parsedUsers =
              JSON.parse(storedUsers);

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

        const trainerAppointments =
          reduxAppointments.filter(
            appointment =>
              isTrainerAllowed(
                appointment,
                trainerId,
                registeredUsers,
              ),
          );

        // setApprovedAppointments(
        //   trainerAppointments,
        // );

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

        const onlyPending =
          allRequests.filter(
            request => {
              if (!request) {
                return false;
              }

              const status =
                String(
                  request.status ||
                    'Pending',
                )
                  .trim()
                  .toLowerCase();

              if (
                status !== 'pending'
              ) {
                return false;
              }

              return isTrainerAllowed(
                request,
                trainerId,
                registeredUsers,
              );
            },
          );

        setPendingRequests(
          onlyPending,
        );
      } catch (error) {
        console.log(
          'Load appointments and requests error:',
          error,
        );

        // setApprovedAppointments([]);
        // setPendingRequests([]);
      } finally {
        // setLoadingRequests(false);
      }
    }, [
      currentTrainer,
      reduxAppointments,
    ]);

  useEffect(() => {
    loadAppointmentsAndRequests();
  }, [
    loadAppointmentsAndRequests,
  ]);

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        () => {
          loadAppointmentsAndRequests();
        },
      );

    return unsubscribe;
  }, [
    navigation,
    loadAppointmentsAndRequests,
  ]);

  const handleApproveRequest =
    async request => {
      try {
        if (!request) {
          return;
        }

        const trainerId =
          getCurrentTrainerId(
            currentTrainer,
          );

        if (!trainerId) {
          Alert.alert(
            'Trainer Not Found',
            'Unable to identify the logged-in trainer.',
          );
          return;
        }

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

        if (
          !isTrainerAllowed(
            request,
            trainerId,
            registeredUsers,
          )
        ) {
          Alert.alert(
            'Access Denied',
            'This appointment request does not belong to you.',
          );

          await loadAppointmentsAndRequests();
          return;
        }

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

        const requestExists =
          allRequests.some(
            item =>
              String(item?.id) ===
              String(request?.id),
          );

        if (!requestExists) {
          Alert.alert(
            'Request Not Found',
            'This appointment request is no longer available.',
          );

          await loadAppointmentsAndRequests();
          return;
        }

        let allAppointments = [
          ...reduxAppointments,
        ];

        const alreadyApproved =
          allAppointments.some(
            appointment =>
              String(
                appointment?.id,
              ) ===
              String(
                request?.id,
              ),
          );

        let approvedAppointment;

        if (alreadyApproved) {
          const existingAppointment =
            allAppointments.find(
              appointment =>
                String(
                  appointment?.id,
                ) ===
                String(
                  request?.id,
                ),
            );

          const existingTrainerIds =
            getTrainerIds(
              existingAppointment,
            );

          const updatedTrainerIds =
            existingTrainerIds.includes(
              String(trainerId),
            )
              ? existingTrainerIds
              : [
                  ...existingTrainerIds,
                  String(trainerId),
                ];

          approvedAppointment = {
            ...existingAppointment,
            trainerIds:
              updatedTrainerIds,
            trainerId:
              updatedTrainerIds.length ===
              1
                ? updatedTrainerIds[0]
                : null,
            approvedByTrainerId:
              String(trainerId),
            approvedAt:
              new Date().toISOString(),
            status: 'Approved',
          };

          allAppointments =
            allAppointments.map(
              appointment =>
                String(
                  appointment?.id,
                ) ===
                String(
                  request?.id,
                )
                  ? approvedAppointment
                  : appointment,
            );
        } else {
          const requestTrainerIds =
            getTrainerIds(
              request,
            );

          const trainerIds =
            requestTrainerIds.length > 0
              ? requestTrainerIds
              : [String(trainerId)];

          approvedAppointment = {
            ...request,
            trainerIds,
            trainerId:
              trainerIds.length === 1
                ? trainerIds[0]
                : null,
            status: 'Approved',
            approvedBy:
              String(trainerId),
            approvedByTrainerId:
              String(trainerId),
            approvedAt:
              new Date().toISOString(),
          };

          allAppointments = [
            ...allAppointments,
            approvedAppointment,
          ];
        }

        const remainingRequests =
          allRequests.filter(
            item =>
              String(item?.id) !==
              String(request?.id),
          );

        await AsyncStorage.setItem(
          'appointmentRequests',
          JSON.stringify(
            remainingRequests,
          ),
        );

        const visibleAppointments =
          allAppointments.filter(
            appointment =>
              isTrainerAllowed(
                appointment,
                trainerId,
                registeredUsers,
              ),
          );

        dispatch(
          setAppointments(
            allAppointments,
          ),
        );

        // setApprovedAppointments(
        //   visibleAppointments,
        // );

        setPendingRequests(
          remainingRequests.filter(
            item => {
              if (!item) {
                return false;
              }

              if (
                String(
                  item.status ||
                    'Pending',
                )
                  .trim()
                  .toLowerCase() !==
                'pending'
              ) {
                return false;
              }

              return isTrainerAllowed(
                item,
                trainerId,
                registeredUsers,
              );
            },
          ),
        );

        Alert.alert(
          'Appointment Approved',
          `${request.memberName || 'Member'}'s appointment has been approved successfully.`,
        );
      } catch (error) {
        console.log(
          'Approve appointment error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to approve this appointment request.',
        );
      }
    };

  const handleRejectRequest =
    async request => {
      try {
        if (!request) {
          return;
        }

        const trainerId =
          getCurrentTrainerId(
            currentTrainer,
          );

        if (!trainerId) {
          Alert.alert(
            'Trainer Not Found',
            'Unable to identify the logged-in trainer.',
          );
          return;
        }

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

        if (
          !isTrainerAllowed(
            request,
            trainerId,
            registeredUsers,
          )
        ) {
          Alert.alert(
            'Access Denied',
            'This appointment request does not belong to you.',
          );

          await loadAppointmentsAndRequests();
          return;
        }

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

        const requestExists =
          allRequests.some(
            item =>
              String(item?.id) ===
              String(request?.id),
          );

        if (!requestExists) {
          Alert.alert(
            'Request Not Found',
            'This appointment request is no longer available.',
          );

          await loadAppointmentsAndRequests();
          return;
        }

        const remainingRequests =
          allRequests.filter(
            item =>
              String(item?.id) !==
              String(request?.id),
          );

        await AsyncStorage.setItem(
          'appointmentRequests',
          JSON.stringify(
            remainingRequests,
          ),
        );

        setPendingRequests(
          remainingRequests.filter(
            item => {
              if (!item) {
                return false;
              }

              if (
                String(
                  item.status ||
                    'Pending',
                )
                  .trim()
                  .toLowerCase() !==
                'pending'
              ) {
                return false;
              }

              return isTrainerAllowed(
                item,
                trainerId,
                registeredUsers,
              );
            },
          ),
        );

        Alert.alert(
          'Request Rejected',
          `${request.memberName || 'Member'}'s appointment request has been rejected.`,
        );
      } catch (error) {
        console.log(
          'Reject appointment error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to reject this appointment request.',
        );
      }
    };

  const confirmApprove = request => {
    Alert.alert(
      'Approve Appointment',
      `Approve ${request.memberName || 'this member'}'s appointment request?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () =>
            handleApproveRequest(
              request,
            ),
        },
      ],
    );
  };

  const confirmReject = request => {
    Alert.alert(
      'Reject Appointment',
      `Reject ${request.memberName || 'this member'}'s appointment request?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            handleRejectRequest(
              request,
            ),
        },
      ],
    );
  };

  const handleCreateAppointment =
    async () => {
      if (!selectedMember) {
        Alert.alert(
          'Missing Member',
          'Please select a member.',
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
        const trainerId =
          getCurrentTrainerId(
            currentTrainer,
          );

        if (!trainerId) {
          Alert.alert(
            'Trainer Not Found',
            'Unable to identify the logged-in trainer.',
          );
          return;
        }

        const newAppointment = {
          id: `${Date.now()}-${Math.random()}`,

          memberId:
            selectedMember.id ||
            selectedMember.memberId ||
            selectedMember.userId ||
            null,

          memberName:
            selectedMember.name ||
            selectedMember.fullName ||
            'Member',

          memberEmail:
            selectedMember.email ||
            '',

          memberMobile:
            selectedMember.mobile ||
            selectedMember.phone ||
            selectedMember.mobileNumber ||
            '',

          trainerIds: [
            String(trainerId),
          ],

          trainerId:
            String(trainerId),

          createdByTrainerId:
            String(trainerId),

          date:
            date.trim(),

          dateKey,

          time:
            time.trim(),

          type:
            sessionType,

          duration,

          status:
            'Approved',

          createdBy:
            'trainer',

          createdAt:
            new Date().toISOString(),

          approvedBy:
            String(trainerId),

          approvedByTrainerId:
            String(trainerId),

          approvedAt:
            new Date().toISOString(),
        };

        const updatedAppointments = [
          ...reduxAppointments,
          newAppointment,
        ];

        dispatch(
          setAppointments(
            updatedAppointments,
          ),
        );

        // setApprovedAppointments(
        //   updatedAppointments.filter(
        //     appointment =>
        //       getTrainerIds(
        //         appointment,
        //       ).some(
        //         id =>
        //           String(id) ===
        //           String(trainerId),
        //       ),
        //   ),
        // );

        setSelectedMember(null);
        setDate('');
        setTime('');
        setSessionType('');
        setDuration('');
        setShowMembers(false);
        setShowTypes(false);
        setShowDurations(false);

        Alert.alert(
          'Appointment Created',
          'The appointment has been created and approved successfully.',
        );
      } catch (error) {
        console.log(
          'Create appointment error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to create appointment.',
        );
      }
    };

  const renderPendingRequest =
    request => {
      return (
        <View
          key={String(request?.id)}
          style={styles.requestCard}>
          <View
            style={styles.requestTop}>
            <View
              style={styles.memberAvatar}>
              <Ionicons
                name="person"
                size={21}
                color="#4169D8"
              />
            </View>

            <View
              style={styles.requestMemberInfo}>
              <Text
                style={
                  styles.requestMemberName
                }>
                {request?.memberName ||
                  'Member'}
              </Text>

              <Text
                style={
                  styles.requestMemberEmail
                }>
                {request?.memberEmail ||
                  request?.memberMobile ||
                  'Member'}
              </Text>
            </View>

            <View
              style={
                styles.notApprovedBadge
              }>
              <Text
                style={
                  styles.notApprovedText
                }>
                Not Approved
              </Text>
            </View>
          </View>

          <View
            style={styles.requestDivider}
          />

          <View
            style={
              styles.requestTitleRow
            }>
            <View
              style={
                styles.requestTypeIcon
              }>
              <Ionicons
                name="barbell-outline"
                size={20}
                color="#4169D8"
              />
            </View>

            <View
              style={
                styles.requestTitleContainer
              }>
              <Text
                style={styles.requestType}>
                {request?.type ||
                  'Training Session'}
              </Text>

              <Text
                style={
                  styles.requestCreatedText
                }>
                Appointment request
              </Text>
            </View>
          </View>

          <View
            style={styles.requestDetails}>
            <View
              style={styles.requestDetail}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {formatDate(
                  request?.date,
                )}
              </Text>
            </View>

            <View
              style={styles.requestDetail}>
              <Ionicons
                name="time-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {request?.time ||
                  '--'}
              </Text>
            </View>

            <View
              style={styles.requestDetail}>
              <Ionicons
                name="hourglass-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {request?.duration ||
                  '--'}
              </Text>
            </View>
          </View>

          <View
            style={styles.requestInfoBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#4169D8"
            />

            <Text
              style={
                styles.requestInfoText
              }>
              This member is waiting for you
              to approve this appointment.
            </Text>
          </View>

          <View
            style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() =>
                confirmReject(request)
              }
              activeOpacity={0.8}>
              <Ionicons
                name="close"
                size={19}
                color="#D93025"
              />

              <Text
                style={
                  styles.rejectButtonText
                }>
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveButton}
              onPress={() =>
                confirmApprove(request)
              }
              activeOpacity={0.8}>
              <Ionicons
                name="checkmark"
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.approveButtonText
                }>
                Approve
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

  const renderApprovedAppointment =
    appointment => {
      return (
        <View
          key={String(
            appointment?.id,
          )}
          style={styles.approvedCard}>
          <View
            style={styles.approvedTop}>
            <View
              style={styles.approvedIcon}>
              <Ionicons
                name="calendar"
                size={22}
                color="#4169D8"
              />
            </View>

            <View
              style={styles.approvedMain}>
              <Text
                style={
                  styles.approvedType
                }>
                {appointment?.type ||
                  'Training Session'}
              </Text>

              <Text
                style={
                  styles.approvedMember
                }>
                {appointment?.memberName ||
                  'Member'}
              </Text>
            </View>

            <View
              style={styles.approvedBadge}>
              <Text
                style={
                  styles.approvedBadgeText
                }>
                Approved
              </Text>
            </View>
          </View>

          <View
            style={styles.approvedDivider}
          />

          <View
            style={styles.approvedDetails}>
            <View
              style={styles.approvedDetail}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#777777"
              />

              <Text
                style={
                  styles.approvedDetailText
                }>
                {formatDate(
                  appointment?.date,
                )}
              </Text>
            </View>

            <View
              style={styles.approvedDetail}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#777777"
              />

              <Text
                style={
                  styles.approvedDetailText
                }>
                {appointment?.time ||
                  '--'}
              </Text>
            </View>
          </View>

          <View
            style={styles.approvedDuration}>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color="#777777"
            />

            <Text
              style={
                styles.approvedDetailText
              }>
              {appointment?.duration ||
                '--'}
            </Text>
          </View>
        </View>
      );
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
              style={styles.headerTitle}>
             Create Appointments
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Manage member
              sessions
            </Text>
          </View>

          <View
            style={styles.headerIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#4169D8"
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }>  

          <View
            style={styles.createSection}>
            

            <Text
              style={styles.fieldTitle}>
              Member
            </Text>

            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                setShowMembers(
                  !showMembers,
                )
              }
              activeOpacity={0.8}>
              <View
                style={
                  styles.selectLeft
                }>
                <Ionicons
                  name="person-outline"
                  size={21}
                  color="#4169D8"
                />

                <Text
                  style={[
                    styles.selectText,
                    !selectedMember &&
                      styles.placeholder,
                  ]}>
                  {selectedMember
                    ? selectedMember.name ||
                      selectedMember.fullName ||
                      'Member'
                    : 'Select a member'}
                </Text>
              </View>

              <Ionicons
                name={
                  showMembers
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color="#777777"
              />
            </TouchableOpacity>

            {showMembers && (
              <View
                style={styles.dropdown}>
                {members.length === 0 ? (
                  <View
                    style={
                      styles.emptyDropdown
                    }>
                    <Ionicons
                      name="people-outline"
                      size={25}
                      color="#999999"
                    />

                    <Text
                      style={
                        styles.emptyDropdownText
                      }>
                      No members added yet
                    </Text>
                  </View>
                ) : (
                  members.map(member => (
                    <TouchableOpacity
                      key={
                        member.id ||
                        member.memberId ||
                        member.email
                      }
                      style={
                        styles.dropdownItem
                      }
                      onPress={() => {
                        setSelectedMember(
                          member,
                        );
                        setShowMembers(
                          false,
                        );
                      }}
                      activeOpacity={0.8}>
                      <View
                        style={
                          styles.memberIcon
                        }>
                        <Ionicons
                          name="person"
                          size={18}
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
                          {member.name ||
                            member.fullName ||
                            'Member'}
                        </Text>

                        <Text
                          style={
                            styles.memberEmail
                          }>
                          {member.email ||
                            member.mobile ||
                            member.phone ||
                            ''}
                        </Text>
                      </View>

                      {(
                        selectedMember?.id ||
                        selectedMember?.memberId
                      ) ===
                        (
                          member.id ||
                          member.memberId
                        ) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#4169D8"
                        />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <Text
              style={styles.fieldTitle}>
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
              style={styles.helperText}>
              Example: 11 September 2026
            </Text>

            <Text
              style={styles.fieldTitle}>
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
              style={styles.helperText}>
              Example: 09:00 AM
            </Text>

            <Text
              style={styles.fieldTitle}>
              Session Type
            </Text>

            <TouchableOpacity
              style={styles.selectBox}
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
                style={styles.dropdown}>
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
                      activeOpacity={0.8}>
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
              style={styles.fieldTitle}>
              Duration
            </Text>

            <TouchableOpacity
              style={styles.selectBox}
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
                style={styles.dropdown}>
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
                      activeOpacity={0.8}>
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

            <TouchableOpacity
              style={styles.createButton}
              onPress={
                handleCreateAppointment
              }
              activeOpacity={0.85}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }>
                Create Appointment
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
    paddingHorizontal: 18,
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

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  pendingCountBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pendingCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4169D8',
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
    marginBottom: 14,
  },

  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  requestMemberInfo: {
    flex: 1,
  },

  requestMemberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  requestMemberEmail: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
  },

  notApprovedBadge: {
    backgroundColor: '#F1F3F7',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },

  notApprovedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#777777',
  },

  requestDivider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginVertical: 14,
  },

  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestTypeIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  requestTitleContainer: {
    flex: 1,
  },

  requestType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  requestCreatedText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
  },

  requestDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 15,
  },

  requestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 5,
  },

  requestDetailText: {
    fontSize: 12,
    color: '#555555',
    marginLeft: 6,
  },

  requestInfoBox: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    padding: 11,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  requestInfoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#59627A',
    marginLeft: 7,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
  },

  rejectButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D93025',
    backgroundColor: '#FFF5F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  rejectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D93025',
    marginLeft: 6,
  },

  approveButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2E9D59',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  approveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 13,
    color: '#777777',
    marginTop: 8,
  },

  noRequestsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  noRequestsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  noRequestsContent: {
    flex: 1,
  },

  noRequestsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  noRequestsText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#777777',
    marginTop: 3,
  },

  approvedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 11,
  },

  approvedCountBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  approvedCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E9D59',
  },

  approvedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  approvedTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  approvedIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  approvedMain: {
    flex: 1,
  },

  approvedType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  approvedMember: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
  },

  approvedBadge: {
    backgroundColor: '#E8F7EE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  approvedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2E9D59',
  },

  approvedDivider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginVertical: 13,
  },

  approvedDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  approvedDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },

  approvedDetailText: {
    fontSize: 11,
    color: '#555555',
    marginLeft: 6,
  },

  approvedDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  noApprovedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },

  noApprovedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginTop: 9,
  },

  noApprovedText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
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
    marginTop: 18,
    marginBottom: 9,
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

  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 13,
    marginTop: 6,
    overflow: 'hidden',
  },

  dropdownItem: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },

  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },

  memberEmail: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
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

  emptyDropdown: {
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyDropdownText: {
    fontSize: 14,
    color: '#777777',
    marginTop: 7,
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

  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 9,
  },
});

export default CreateAppointmentScreen;
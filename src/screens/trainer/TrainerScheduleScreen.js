import React, {useCallback, useState} from 'react';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  setAppointments,
} from '../../redux/slices/trainerSlice';

const TrainerScheduleScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxAppointments = useSelector(
    state => state.trainer?.appointments || [],
  );

  const [selectedTab, setSelectedTab] =
    useState('Today');

  const [appointments, setAppointmentsState] =
    useState([]);

  const [pendingRequests, setPendingRequests] =
    useState([]);

  const [loadingRequests, setLoadingRequests] =
    useState(true);

  const [processingId, setProcessingId] =
    useState(null);

  const getTodayKey = () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(today.getMonth() + 1).padStart(
        2,
        '0',
      );

    const day =
      String(today.getDate()).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

  const getTomorrowKey = () => {
    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1,
    );

    const year =
      tomorrow.getFullYear();

    const month =
      String(
        tomorrow.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        tomorrow.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getDateKeyFromAppointment =
    appointment => {
      if (appointment?.dateKey) {
        return appointment.dateKey;
      }

      if (!appointment?.date) {
        return null;
      }

      const value =
        String(
          appointment.date,
        ).trim();

      const match = value.match(
        /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
      );

      if (!match) {
        return null;
      }

      const day =
        Number(match[1]);

      const monthName =
        match[2];

      const year =
        Number(match[3]);

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

      return `${year}-${String(
        monthIndex + 1,
      ).padStart(
        2,
        '0',
      )}-${String(
        day,
      ).padStart(
        2,
        '0',
      )}`;
    };

  const normalizeStatus =
    appointment => {
      return String(
        appointment?.status || '',
      )
        .toLowerCase()
        .trim();
    };

  const isCompleted =
    appointment => {
      const status =
        normalizeStatus(
          appointment,
        );

      return (
        status ===
          'completed' ||
        status ===
          'complete' ||
        status ===
          'done'
      );
    };

  const isPending =
    appointment => {
      const status =
        normalizeStatus(
          appointment,
        );

      return (
        status ===
          'pending' ||
        status ===
          'not approved' ||
        status ===
          'requested' ||
        status ===
          'waiting'
      );
    };

  const isApproved =
    appointment => {
      const status =
        normalizeStatus(
          appointment,
        );

      return (
        status ===
          'approved' ||
        status ===
          'upcoming' ||
        status ===
          'confirmed'
      );
    };

  const getTrainerId =
    trainer =>
      trainer?.trainerId ||
      trainer?.id ||
      trainer?.userId ||
      null;

  const getTrainerIds =
    record => {
      if (
        Array.isArray(
          record?.trainerIds,
        ) &&
        record.trainerIds.length >
          0
      ) {
        return record.trainerIds.map(
          String,
        );
      }

      if (record?.trainerId) {
        return [
          String(
            record.trainerId,
          ),
        ];
      }

      if (
        record?.createdByTrainerId
      ) {
        return [
          String(
            record.createdByTrainerId,
          ),
        ];
      }

      if (
        record?.approvedByTrainerId
      ) {
        return [
          String(
            record.approvedByTrainerId,
          ),
        ];
      }

      return [];
    };

  const getRegisteredUsers =
    async () => {
      const data =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (!data) {
        return [];
      }

      try {
        const parsed =
          JSON.parse(data);

        return Array.isArray(
          parsed,
        )
          ? parsed
          : [];
      } catch {
        return [];
      }
    };

  const belongsToTrainer = (
    record,
    trainer,
    users,
  ) => {
    const trainerId =
      getTrainerId(
        trainer,
      );

    if (
      !trainerId ||
      !record
    ) {
      return false;
    }

    const id =
      String(
        trainerId,
      );

    if (
      getTrainerIds(
        record,
      ).some(
        item =>
          String(item) ===
          id,
      )
    ) {
      return true;
    }

    const member =
      users.find(
        user => {
          const sameId =
            record?.memberId &&
            (user?.id ||
              user?.memberId) &&
            String(
              user.id ||
                user.memberId,
            ) ===
              String(
                record.memberId,
              );

          const sameEmail =
            record?.memberEmail &&
            user?.email &&
            String(
              user.email,
            )
              .trim()
              .toLowerCase() ===
              String(
                record.memberEmail,
              )
                .trim()
                .toLowerCase();

          return (
            sameId ||
            sameEmail
          );
        },
      );

    if (!member) {
      return false;
    }

    const memberTrainerIds =
      Array.isArray(
        member.trainerIds,
      )
        ? member.trainerIds
        : member.trainerId
        ? [
            member.trainerId,
          ]
        : [];

    return memberTrainerIds.some(
      item =>
        String(item) ===
        id,
    );
  };

  const loadAppointments =
    useCallback(
      async () => {
        try {
          setLoadingRequests(
            true,
          );

          const trainer =
            authUser;

          const trainerId =
            getTrainerId(
              trainer,
            );

          if (
            !trainer ||
            trainer?.role !==
              'trainer' ||
            !trainerId
          ) {
            setAppointmentsState(
              [],
            );

            setPendingRequests(
              [],
            );

            dispatch(
              setAppointments(
                [],
              ),
            );

            return;
          }

          const registeredUsers =
            await getRegisteredUsers();

          const parsedAppointments =
            Array.isArray(
              reduxAppointments,
            )
              ? reduxAppointments
              : [];

          const trainerAppointments =
            parsedAppointments.filter(
              appointment =>
                !isPending(
                  appointment,
                ) &&
                belongsToTrainer(
                  appointment,
                  trainer,
                  registeredUsers,
                ),
            );

          setAppointmentsState(
            trainerAppointments,
          );

          const storedRequests =
            await AsyncStorage.getItem(
              'appointmentRequests',
            );

          let parsedRequests =
            [];

          if (
            storedRequests
          ) {
            try {
              const parsed =
                JSON.parse(
                  storedRequests,
                );

              if (
                Array.isArray(
                  parsed,
                )
              ) {
                parsedRequests =
                  parsed;
              }
            } catch (error) {
              console.log(
                'Error parsing appointmentRequests:',
                error,
              );
            }
          }

          const trainerRequests =
            parsedRequests.filter(
              request =>
                (
                  isPending(
                    request,
                  ) ||
                  !request?.status
                ) &&
                belongsToTrainer(
                  request,
                  trainer,
                  registeredUsers,
                ),
            );

          setPendingRequests(
            trainerRequests,
          );
        } catch (error) {
          console.log(
            'Error loading appointments:',
            error,
          );
        } finally {
          setLoadingRequests(
            false,
          );
        }
      },
      [
        dispatch,
        authUser,
        reduxAppointments,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [
      loadAppointments,
    ]),
  );

  const handleApproveAppointment =
    async request => {
      if (!request) {
        return;
      }

      const requestId =
        request?.id ||
        request?.appointmentId;

      if (!requestId) {
        Alert.alert(
          'Error',
          'This appointment request does not have a valid ID.',
        );

        return;
      }

      try {
        setProcessingId(
          String(requestId),
        );

        const trainer =
          authUser;

        const trainerId =
          getTrainerId(
            trainer,
          );

        const registeredUsers =
          await getRegisteredUsers();

        if (
          !trainer ||
          trainer?.role !==
            'trainer' ||
          !trainerId ||
          !belongsToTrainer(
            request,
            trainer,
            registeredUsers,
          )
        ) {
          Alert.alert(
            'Not Allowed',
            'This appointment belongs to another trainer.',
          );

          await loadAppointments();

          return;
        }

        const requestsData =
          await AsyncStorage.getItem(
            'appointmentRequests',
          );

        let allRequests =
          [];

        if (
          requestsData
        ) {
          try {
            const parsed =
              JSON.parse(
                requestsData,
              );

            if (
              Array.isArray(
                parsed,
              )
            ) {
              allRequests =
                parsed;
            }
          } catch (error) {
            console.log(
              'Error parsing requests:',
              error,
            );
          }
        }

        const requestIndex =
          allRequests.findIndex(
            item =>
              String(
                item?.id ||
                  item?.appointmentId ||
                  '',
              ) ===
              String(
                requestId,
              ),
          );

        if (
          requestIndex ===
          -1
        ) {
          Alert.alert(
            'Already Processed',
            'This appointment request is no longer available.',
          );

          await loadAppointments();

          return;
        }

        const selectedRequest =
          allRequests[
            requestIndex
          ];

        if (
          !belongsToTrainer(
            selectedRequest,
            trainer,
            registeredUsers,
          )
        ) {
          Alert.alert(
            'Not Allowed',
            'This appointment belongs to another trainer.',
          );

          await loadAppointments();

          return;
        }

        const allAppointments =
          Array.isArray(
            reduxAppointments,
          )
            ? reduxAppointments
            : [];

        const alreadyApproved =
          allAppointments.some(
            appointment =>
              String(
                appointment?.id ||
                  appointment?.appointmentId ||
                  '',
              ) ===
              String(
                requestId,
              ),
          );

        if (
          alreadyApproved
        ) {
          const remainingRequests =
            allRequests.filter(
              item =>
                String(
                  item?.id ||
                    item?.appointmentId ||
                    '',
                ) !==
                String(
                  requestId,
                ),
            );

          await AsyncStorage.setItem(
            'appointmentRequests',
            JSON.stringify(
              remainingRequests,
            ),
          );

          await loadAppointments();

          Alert.alert(
            'Already Approved',
            'This appointment was already approved.',
          );

          return;
        }

        const requestTrainerIds =
          getTrainerIds(
            selectedRequest,
          );

        const approvedAppointment = {
          ...selectedRequest,

          id:
            selectedRequest.id ||
            selectedRequest.appointmentId,

          appointmentId:
            selectedRequest.id ||
            selectedRequest.appointmentId,

          trainerIds:
            requestTrainerIds.length >
            0
              ? requestTrainerIds
              : [
                  String(
                    trainerId,
                  ),
                ],

          trainerId:
            requestTrainerIds.length ===
            1
              ? requestTrainerIds[0]
              : String(
                  trainerId,
                ),

          createdByTrainerId:
            selectedRequest.createdByTrainerId ||
            (
              selectedRequest.createdBy ===
              'trainer'
                ? String(
                    trainerId,
                  )
                : undefined
            ),

          approvedBy:
            'trainer',

          approvedByTrainerId:
            String(
              trainerId,
            ),

          approvedAt:
            new Date().toISOString(),

          status:
            'Approved',

          approved:
            true,

          createdBy:
            selectedRequest.createdBy ||
            'member',
        };

        const updatedAppointments =
          [
            ...allAppointments,
            approvedAppointment,
          ];

        dispatch(
          setAppointments(
            updatedAppointments,
          ),
        );

        const remainingRequests =
          allRequests.filter(
            item =>
              String(
                item?.id ||
                  item?.appointmentId ||
                  '',
              ) !==
              String(
                requestId,
              ),
          );

        await AsyncStorage.setItem(
          'appointmentRequests',
          JSON.stringify(
            remainingRequests,
          ),
        );

        await loadAppointments();

        Alert.alert(
          'Appointment Approved',
          `${selectedRequest.memberName || 'Member'}'s appointment has been approved successfully.`,
        );
      } catch (error) {
        console.log(
          'Approve appointment error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to approve the appointment. Please try again.',
        );
      } finally {
        setProcessingId(
          null,
        );
      }
    };

  const handleRejectAppointment =
    request => {
      if (!request) {
        return;
      }

      const requestId =
        request?.id ||
        request?.appointmentId;

      Alert.alert(
        'Reject Appointment',
        `Are you sure you want to reject ${request.memberName || 'this member'}'s appointment request?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reject',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  setProcessingId(
                    String(
                      requestId,
                    ),
                  );

                  const trainer =
                    authUser;

                  const trainerId =
                    getTrainerId(
                      trainer,
                    );

                  const registeredUsers =
                    await getRegisteredUsers();

                  const requestsData =
                    await AsyncStorage.getItem(
                      'appointmentRequests',
                    );

                  let allRequests =
                    [];

                  if (
                    requestsData
                  ) {
                    try {
                      const parsed =
                        JSON.parse(
                          requestsData,
                        );

                      if (
                        Array.isArray(
                          parsed,
                        )
                      ) {
                        allRequests =
                          parsed;
                      }
                    } catch (error) {
                      console.log(
                        'Error parsing requests:',
                        error,
                      );
                    }
                  }

                  const selectedRequest =
                    allRequests.find(
                      item =>
                        String(
                          item?.id ||
                            item?.appointmentId ||
                            '',
                        ) ===
                        String(
                          requestId,
                        ),
                    );

                  if (
                    !trainer ||
                    trainer?.role !==
                      'trainer' ||
                    !trainerId ||
                    !selectedRequest ||
                    !belongsToTrainer(
                      selectedRequest,
                      trainer,
                      registeredUsers,
                    )
                  ) {
                    Alert.alert(
                      'Not Allowed',
                      'This appointment belongs to another trainer.',
                    );

                    await loadAppointments();

                    return;
                  }

                  const remainingRequests =
                    allRequests.filter(
                      item =>
                        String(
                          item?.id ||
                            item?.appointmentId ||
                            '',
                        ) !==
                        String(
                          requestId,
                        ),
                    );

                  await AsyncStorage.setItem(
                    'appointmentRequests',
                    JSON.stringify(
                      remainingRequests,
                    ),
                  );

                  await loadAppointments();

                  Alert.alert(
                    'Request Rejected',
                    'The appointment request has been rejected.',
                  );
                } catch (error) {
                  console.log(
                    'Reject appointment error:',
                    error,
                  );

                  Alert.alert(
                    'Error',
                    'Unable to reject the appointment.',
                  );
                } finally {
                  setProcessingId(
                    null,
                  );
                }
              },
          },
        ],
      );
    };

  const getAppointments = () => {
    if (
      !Array.isArray(
        appointments,
      )
    ) {
      return [];
    }

    const todayKey =
      getTodayKey();

    if (
      selectedTab ===
      'Today'
    ) {
      return appointments.filter(
        appointment => {
          const appointmentDate =
            getDateKeyFromAppointment(
              appointment,
            );

          return (
            appointmentDate ===
              todayKey &&
            !isCompleted(
              appointment,
            )
          );
        },
      );
    }

    if (
      selectedTab ===
      'Upcoming'
    ) {
      return appointments.filter(
        appointment => {
          const appointmentDate =
            getDateKeyFromAppointment(
              appointment,
            );

          return (
            appointmentDate &&
            appointmentDate >
              todayKey &&
            !isCompleted(
              appointment,
            )
          );
        },
      );
    }

    if (
      selectedTab ===
      'Completed'
    ) {
      return appointments.filter(
        appointment =>
          isCompleted(
            appointment,
          ),
      );
    }

    return [];
  };

  const displayedAppointments =
    getAppointments();

  const getAppointmentDate =
    appointment => {
      const dateKey =
        getDateKeyFromAppointment(
          appointment,
        );

      if (!dateKey) {
        return (
          appointment?.date ||
          'Date not available'
        );
      }

      const todayKey =
        getTodayKey();

      const tomorrowKey =
        getTomorrowKey();

      if (
        dateKey ===
        todayKey
      ) {
        return 'Today';
      }

      if (
        dateKey ===
        tomorrowKey
      ) {
        return 'Tomorrow';
      }

      const parts =
        dateKey.split('-');

      if (
        parts.length !==
        3
      ) {
        return (
          appointment?.date ||
          '--'
        );
      }

      const year =
        Number(
          parts[0],
        );

      const month =
        Number(
          parts[1],
        ) - 1;

      const day =
        Number(
          parts[2],
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

      return `${String(
        day,
      ).padStart(
        2,
        '0',
      )} ${
        monthNames[month]
      } ${year}`;
    };

  const getAppointmentIcon =
    type => {
      if (
        type ===
        'Personal Training'
      ) {
        return 'person-outline';
      }

      if (
        type ===
        'Workout Session'
      ) {
        return 'barbell-outline';
      }

      if (
        type ===
        'Progress Review'
      ) {
        return 'analytics-outline';
      }

      if (
        type ===
        'Fitness Assessment'
      ) {
        return 'fitness-outline';
      }

      return 'calendar-outline';
    };

  const handleAppointmentPress =
    appointment => {
      if (
        appointment?.memberId
      ) {
        navigation.navigate(
          'MemberDetails',
          {
            memberId:
              appointment.memberId,

            memberName:
              appointment.memberName,
          },
        );
      }
    };

  const handleStartSession =
    appointment => {
      navigation.navigate(
        '',
        {
          memberId:
            appointment.memberId,

          memberName:
            appointment.memberName,

          appointmentId:
            appointment.id,

          appointmentType:
            appointment.type,

          duration:
            appointment.duration,
        },
      );
    };

  const renderPendingRequest =
    request => {
      const requestId =
        String(
          request?.id ||
            request?.appointmentId ||
            '',
        );

      const isProcessing =
        processingId ===
        requestId;

      return (
        <View
          key={requestId}
          style={
            styles.requestCard
          }>
          <View
            style={
              styles.requestTopRow
            }>
            <View
              style={
                styles.requestMemberIcon
              }>
              <Ionicons
                name="person-outline"
                size={23}
                color="#4169D8"
              />
            </View>

            <View
              style={
                styles.requestMemberInfo
              }>
              <Text
                style={
                  styles.requestMemberName
                }>
                {request?.memberName ||
                  'Member'}
              </Text>

              {request?.memberEmail ? (
                <Text
                  style={
                    styles.requestMemberEmail
                  }>
                  {
                    request.memberEmail
                  }
                </Text>
              ) : null}
            </View>

            <View
              style={
                styles.pendingBadge
              }>
              <Text
                style={
                  styles.pendingBadgeText
                }>
                Not Approved
              </Text>
            </View>
          </View>

          <View
            style={
              styles.requestDivider
            }
          />

          <View
            style={
              styles.requestDetails
            }>
            <View
              style={
                styles.requestDetailRow
              }>
              <Ionicons
                name={getAppointmentIcon(
                  request?.type,
                )}
                size={16}
                color="#666666"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {request?.type ||
                  'Training Session'}
              </Text>
            </View>

            <View
              style={
                styles.requestDetailRow
              }>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#666666"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {getAppointmentDate(
                  request,
                )}
              </Text>
            </View>

            <View
              style={
                styles.requestDetailRow
              }>
              <Ionicons
                name="time-outline"
                size={16}
                color="#666666"
              />

              <Text
                style={
                  styles.requestDetailText
                }>
                {request?.time ||
                  '--'}

                {request?.duration
                  ? ` • ${request.duration} `
                  : ''}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.requestActions
            }>
            <TouchableOpacity
              style={[
                styles.rejectButton,
                isProcessing &&
                  styles.disabledButton,
              ]}
              onPress={() =>
                handleRejectAppointment(
                  request,
                )
              }
              disabled={
                isProcessing
              }
              activeOpacity={0.8}>
              <Ionicons
                name="close-outline"
                size={18}
                color="#D64545"
              />

              <Text
                style={
                  styles.rejectButtonText
                }>
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.approveButton,
                isProcessing &&
                  styles.disabledButton,
              ]}
              onPress={() =>
                handleApproveAppointment(
                  request,
                )
              }
              disabled={
                isProcessing
              }
              activeOpacity={0.8}>
              {isProcessing ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.approveButtonText
                    }>
                    Approve
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}>
      <View
        style={styles.container}>
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
              size={23}
              color="#333333"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerText
            }>
            <Text
              style={styles.title}>
              Schedule & Appointments
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Manage your training sessions
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.calendarButton
            }
            onPress={() =>
              navigation.navigate(
                'CreateAppointment',
              )
            }
            activeOpacity={0.8}>
            <Ionicons
              name="add"
              size={24}
              color="#4169D8"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                insets.bottom +
                30,
            },
          ]}>
          <View
            style={
              styles.pendingSection
            }>
            {loadingRequests ? (
              <View
                style={
                  styles.loadingContainer
                }>
                <ActivityIndicator
                  size="small"
                  color="#4169D8"
                />

                <Text
                  style={
                    styles.loadingText
                  }>
                  Loading requests...
                </Text>
              </View>
            ) : pendingRequests.length >
              0 ? (
              <View
                style={
                  styles.requestsContainer
                }>
                {pendingRequests.map(
                  request =>
                    renderPendingRequest(
                      request,
                    ),
                )}
              </View>
            ) : (
              <View
                style={
                  styles.noRequestsCard
                }>
                <View
                  style={
                    styles.noRequestsIcon
                  }>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={29}
                    color="#168052"
                  />
                </View>

                <View
                  style={
                    styles.noRequestsInfo
                  }>
                  <Text
                    style={
                      styles.noRequestsTitle
                    }>
                    No Pending Requests
                  </Text>

                  <Text
                    style={
                      styles.noRequestsText
                    }>
                    New member appointment
                    requests will appear here.
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View
            style={
              styles.tabsContainer
            }>
            {[
              'Today',
              'Upcoming',
              'Completed',
            ].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab ===
                    tab &&
                    styles.activeTab,
                ]}
                onPress={() =>
                  setSelectedTab(
                    tab,
                  )
                }
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.tabText,
                    selectedTab ===
                      tab &&
                      styles.activeTabText,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={
              styles.dateHeader
            }>
            <View>
              <Text
                style={
                  styles.dateTitle
                }>
                {selectedTab ===
                'Today'
                  ? "Today's Sessions"
                  : selectedTab ===
                    'Upcoming'
                  ? 'Upcoming Appointments'
                  : 'Completed Appointments'}
              </Text>

              {selectedTab ===
                'Today' && (
                <Text
                  style={
                    styles.dateText
                  }>
                  {formatTodayDate()}
                </Text>
              )}
            </View>

            <View
              style={
                styles.appointmentCount
              }>
              <Text
                style={
                  styles.countText
                }>
                {
                  displayedAppointments.length
                }{' '}
                {displayedAppointments.length ===
                1
                  ? 'Appointment'
                  : 'Appointments'}
              </Text>
            </View>
          </View>

          {displayedAppointments.length >
          0 ? (
            <View
              style={
                styles.appointmentsContainer
              }>
              {displayedAppointments.map(
                appointment => (
                  <TouchableOpacity
                    key={
                      appointment.id ||
                      appointment.appointmentId
                    }
                    style={
                      styles.appointmentCard
                    }
                    activeOpacity={0.85}
                    onPress={() =>
                      handleAppointmentPress(
                        appointment,
                      )
                    }>
                    <View
                      style={
                        styles.timeContainer
                      }>
                      <Text
                        style={
                          styles.timeText
                        }>
                        {appointment.time ||
                          '--'}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.appointmentDivider
                      }
                    />

                    <View
                      style={
                        styles.memberIconContainer
                      }>
                      <Ionicons
                        name={getAppointmentIcon(
                          appointment.type,
                        )}
                        size={21}
                        color="#4169D8"
                      />
                    </View>

                    <View
                      style={
                        styles.appointmentInfo
                      }>
                      <Text
                        style={
                          styles.memberName
                        }>
                        {appointment.memberName ||
                          'Member'}
                      </Text>

                      <Text
                        style={
                          styles.appointmentType
                        }>
                        {appointment.type ||
                          'Training Session'}
                      </Text>

                      <View
                        style={
                          styles.dateRow
                        }>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#888888"
                        />

                        <Text
                          style={
                            styles.dateRowText
                          }>
                          {getAppointmentDate(
                            appointment,
                          )}
                        </Text>
                      </View>

                      {appointment.duration && (
                        <View
                          style={
                            styles.durationRow
                          }>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#888888"
                          />

                          <Text
                            style={
                              styles.durationText
                            }>
                            {
                              appointment.duration
                            }{' '}
                            
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={
                        styles.rightSection
                      }>
                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted(
                            appointment,
                          ) &&
                            styles.completedBadge,
                          isApproved(
                            appointment,
                          ) &&
                            styles.approvedBadge,
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            isCompleted(
                              appointment,
                            ) &&
                              styles.completedText,
                            isApproved(
                              appointment,
                            ) &&
                              styles.approvedText,
                          ]}>
                          {appointment.status ||
                            'Approved'}
                        </Text>
                      </View>

                      {!isCompleted(
                        appointment,
                      ) &&
                        getDateKeyFromAppointment(
                          appointment,
                        ) ===
                          getTodayKey() && (
                          <TouchableOpacity
                            style={
                              styles.actionButton
                            }
                            onPress={() =>
                              handleStartSession(
                                appointment,
                              )
                            }
                            activeOpacity={
                              0.8
                            }>
                            <Text
                              style={
                                styles.actionButtonText
                              }>
                              Start Session
                            </Text>
                          </TouchableOpacity>
                        )}

                      {isCompleted(
                        appointment,
                      ) && (
                        <TouchableOpacity
                          style={
                            styles.detailsButton
                          }
                          onPress={() =>
                            handleAppointmentPress(
                              appointment,
                            )
                          }
                          activeOpacity={
                            0.8
                          }>
                          <Text
                            style={
                              styles.detailsButtonText
                            }>
                            View Details
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ),
              )}
            </View>
          ) : (
            <View
              style={
                styles.emptyContainer
              }>
              <View
                style={
                  styles.emptyIcon
                }>
                <Ionicons
                  name={
                    selectedTab ===
                    'Completed'
                      ? 'checkmark-circle-outline'
                      : 'calendar-outline'
                  }
                  size={32}
                  color="#4169D8"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }>
                {selectedTab ===
                'Today'
                  ? 'No Appointments Today'
                  : selectedTab ===
                    'Upcoming'
                  ? 'No Upcoming Appointments'
                  : 'No Completed Appointments'}
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                {selectedTab ===
                'Today'
                  ? 'There are no appointments scheduled for today.'
                  : selectedTab ===
                    'Upcoming'
                  ? 'There are no upcoming appointments.'
                  : 'Completed appointments will appear here.'}
              </Text>

              {selectedTab !==
                'Completed' && (
                <TouchableOpacity
                  style={
                    styles.createButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'CreateAppointment',
                    )
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.createButtonText
                    }>
                    Create Appointment
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View
            style={
              styles.summaryCard
            }>
            <View
              style={
                styles.summaryIcon
              }>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#4169D8"
              />
            </View>

            <View
              style={
                styles.summaryInfo
              }>
              <Text
                style={
                  styles.summaryTitle
                }>
                Appointment Management
              </Text>

              <Text
                style={
                  styles.summaryText
                }>
                Review member requests and
                manage your training sessions.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const formatTodayDate = () => {
  const today =
    new Date();

  const day =
    String(
      today.getDate(),
    ).padStart(
      2,
      '0',
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

  const month =
    monthNames[
      today.getMonth()
    ];

  const year =
    today.getFullYear();

  return `${day} ${month} ${year}`;
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
    minHeight: 78,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
     borderWidth: 1,
         borderColor: '#E1E6EF',
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },

  subtitle: {
    fontSize: 12,
    color: '#777777',
  },

  calendarButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 18,
  },

  pendingSection: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#888888',
  },

  requestCountBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  requestCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D64545',
  },

  requestsContainer: {
    gap: 12,
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E4E9',
    padding: 14,
  },

  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestMemberIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  requestMemberInfo: {
    flex: 1,
    minWidth: 0,
  },

  requestMemberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },

  requestMemberEmail: {
    fontSize: 10,
    color: '#888888',
  },

  pendingBadge: {
    backgroundColor: '#FFF4D9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    marginLeft: 6,
  },

  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A56B00',
  },

  requestDivider: {
    height: 1,
    backgroundColor: '#ECEEF1',
    marginVertical: 13,
  },

  requestDetails: {
    gap: 8,
  },

  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestDetailText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 8,
  },

  requestActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },

  rejectButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F2CCCC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D64545',
    marginLeft: 5,
  },

  approveButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 5,
  },

  disabledButton: {
    opacity: 0.55,
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    minHeight: 90,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E3E8',
  },

  loadingText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 8,
  },

  noRequestsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noRequestsIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E6F7EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  noRequestsInfo: {
    flex: 1,
  },

  noRequestsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },

  noRequestsText: {
    fontSize: 10,
    color: '#888888',
    lineHeight: 15,
  },

  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#4169D8',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 3,
  },

  dateText: {
    fontSize: 12,
    color: '#888888',
  },

  appointmentCount: {
    backgroundColor: '#EAF0FF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },

  countText: {
    color: '#4169D8',
    fontSize: 11,
    fontWeight: '700',
  },

  appointmentsContainer: {
    gap: 12,
  },

  appointmentCard: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeContainer: {
    width: 67,
    alignItems: 'center',
  },

  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    textAlign: 'center',
  },

  appointmentDivider: {
    width: 1,
    height: 70,
    backgroundColor: '#E2E5E9',
    marginHorizontal: 9,
  },

  memberIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  appointmentInfo: {
    flex: 1,
    minWidth: 0,
  },

  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },

  appointmentType: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 7,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  dateRowText: {
    fontSize: 10,
    color: '#888888',
    marginLeft: 5,
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  durationText: {
    fontSize: 10,
    color: '#888888',
    marginLeft: 5,
  },

  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 7,
  },

  statusBadge: {
    backgroundColor: '#FFF4D9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 8,
  },

  statusText: {
    color: '#A56B00',
    fontSize: 9,
    fontWeight: '700',
  },

  approvedBadge: {
    backgroundColor: '#E6F7EF',
  },

  approvedText: {
    color: '#168052',
  },

  completedBadge: {
    backgroundColor: '#E6F7EF',
  },

  completedText: {
    color: '#168052',
  },

  actionButton: {
    minWidth: 92,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  actionButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  detailsButton: {
    minWidth: 82,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  detailsButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4169D8',
    textAlign: 'center',
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E3E8',
    minHeight: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },

  createButton: {
    height: 44,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  summaryCard: {
    backgroundColor: '#EAF0FF',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },

  summaryText: {
    fontSize: 11,
    color: '#777777',
  },
});

export default TrainerScheduleScreen;
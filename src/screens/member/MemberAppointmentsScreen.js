import React, {useCallback, useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

const MemberAppointmentsScreen = ({navigation}) => {
  const authUser = useSelector(
    state => state.auth?.user,
  );

  const reduxAppointments = useSelector(
    state =>
      state.member?.appointments ||
      state.trainer?.appointments ||
      [],
  );

  const [pendingAppointments, setPendingAppointments] =
    useState([]);

  const memberId = authUser?.id
    ? String(authUser.id)
    : authUser?.memberId
    ? String(authUser.memberId)
    : authUser?.userId
    ? String(authUser.userId)
    : null;

  const getTodayDateKey = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
  };

  const loadAppointments = useCallback(
    async () => {
      try {
        const savedRequests =
          await AsyncStorage.getItem(
            'appointmentRequests',
          );

        if (!savedRequests) {
          setPendingAppointments([]);
          return;
        }

        const parsedRequests =
          JSON.parse(savedRequests);

        if (!Array.isArray(parsedRequests)) {
          setPendingAppointments([]);
          return;
        }

        const memberRequests =
          parsedRequests.filter(request => {
            if (!request) {
              return false;
            }

            if (
              request.status &&
              String(request.status)
                .trim()
                .toLowerCase() !== 'pending'
            ) {
              return false;
            }

            if (
              !memberId ||
              request.memberId === null ||
              request.memberId === undefined
            ) {
              return false;
            }

            return (
              String(request.memberId) ===
              String(memberId)
            );
          });

        setPendingAppointments(
          memberRequests,
        );
      } catch (error) {
        console.log(
          'Error loading appointment requests:',
          error,
        );

        setPendingAppointments([]);
      }
    },
    [memberId],
  );

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        () => {
          loadAppointments();
        },
      );

    return unsubscribe;
  }, [
    navigation,
    loadAppointments,
  ]);

  const getDateKeyFromAppointment =
    appointment => {
      if (appointment?.dateKey) {
        const dateKey = String(
          appointment.dateKey,
        ).trim();

        if (
          /^\d{4}-\d{2}-\d{2}$/.test(
            dateKey,
          )
        ) {
          return dateKey;
        }
      }

      const rawDate =
        appointment?.date ||
        appointment?.appointmentDate ||
        appointment?.scheduledDate;

      if (!rawDate) {
        return null;
      }

      const value =
        String(rawDate).trim();

      const isoMatch =
        value.match(
          /^(\d{4})-(\d{2})-(\d{2})/,
        );

      if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
      }

      const textMatch =
        value.match(
          /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
        );

      if (!textMatch) {
        return null;
      }

      const day = Number(
        textMatch[1],
      );

      const monthName =
        textMatch[2];

      const year = Number(
        textMatch[3],
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

      const daysInMonth =
        new Date(
          year,
          monthIndex + 1,
          0,
        ).getDate();

      if (
        day < 1 ||
        day > daysInMonth
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

  const todayDateKey =
    getTodayDateKey();

  const todayPendingAppointments =
    pendingAppointments.filter(
      appointment =>
        getDateKeyFromAppointment(
          appointment,
        ) === todayDateKey,
    );

  const memberAppointments =
    Array.isArray(
      reduxAppointments,
    )
      ? reduxAppointments.filter(
          appointment => {
            if (!appointment?.memberId) {
              return false;
            }

            if (!memberId) {
              return false;
            }

            if (
              String(
                appointment.memberId,
              ) !== String(memberId)
            ) {
              return false;
            }

            const status = String(
              appointment.status ||
                'Approved',
            )
              .trim()
              .toLowerCase();

            if (
              status === 'pending' ||
              status === 'rejected'
            ) {
              return false;
            }

            return (
              getDateKeyFromAppointment(
                appointment,
              ) === todayDateKey
            );
          },
        )
      : [];

  const getStatus = appointment => {
    if (appointment?.status) {
      const status =
        String(
          appointment.status,
        ).trim();

      if (
        status.toLowerCase() ===
          'complete' ||
        status.toLowerCase() ===
          'done'
      ) {
        return 'Completed';
      }

      return status;
    }

    return 'Approved';
  };

  const formatDate = appointment => {
    const dateKey =
      getDateKeyFromAppointment(
        appointment,
      );

    if (!dateKey) {
      return (
        appointment?.date ||
        '--'
      );
    }

    const parts =
      dateKey.split('-');

    if (parts.length !== 3) {
      return (
        appointment?.date ||
        '--'
      );
    }

    const year =
      Number(parts[0]);

    const monthIndex =
      Number(parts[1]) - 1;

    const day =
      Number(parts[2]);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${String(day).padStart(
      2,
      '0',
    )} ${
      monthNames[monthIndex]
    } ${year}`;
  };

  const formatPendingDate =
    appointment => {
      const dateKey =
        getDateKeyFromAppointment(
          appointment,
        );

      if (!dateKey) {
        return '--';
      }

      const parts =
        dateKey.split('-');

      if (parts.length !== 3) {
        return '--';
      }

      const year =
        Number(parts[0]);

      const monthIndex =
        Number(parts[1]) - 1;

      const day =
        Number(parts[2]);

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      return `${String(day).padStart(
        2,
        '0',
      )} ${
        monthNames[monthIndex]
      } ${year}`;
    };

  const formatTime = appointment => {
    return (
      appointment?.time ||
      appointment?.appointmentTime ||
      appointment?.scheduledTime ||
      '--'
    );
  };

  const getAppointmentTitle =
    appointment => {
      return (
        appointment?.type ||
        appointment?.title ||
        appointment?.appointmentType ||
        appointment?.purpose ||
        'Training Session'
      );
    };

  const getTrainerName =
    appointment => {
      return (
        appointment?.trainerName ||
        appointment?.trainer?.name ||
        appointment?.trainerFullName ||
        appointment?.trainer ||
        'Trainer'
      );
    };

  const getLocation =
    appointment => {
      return (
        appointment?.location ||
        appointment?.place ||
        'Fitness Center'
      );
    };

  const renderPendingCard =
    appointment => {
      return (
        <View
          key={String(
            appointment?.id,
          )}
          style={
            styles.pendingCard
          }>
          <View
            style={
              styles.pendingTopRow
            }>
            <View
              style={
                styles.pendingIcon
              }>
              <Ionicons
                name="time-outline"
                size={23}
                color="#D88916"
              />
            </View>

            <View
              style={
                styles.pendingMain
              }>
              <Text
                style={
                  styles.pendingTitle
                }>
                {getAppointmentTitle(
                  appointment,
                )}
              </Text>

              <Text
                style={
                  styles.pendingTrainer
                }>
                Waiting for trainer
                approval
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
            style={
              styles.pendingDivider
            }
          />

          <View
            style={
              styles.pendingDetails
            }>
            <View
              style={
                styles.detailItem
              }>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.detailText
                }>
                {formatPendingDate(
                  appointment,
                )}
              </Text>
            </View>

            <View
              style={
                styles.detailItem
              }>
              <Ionicons
                name="time-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.detailText
                }>
                {formatTime(
                  appointment,
                )}
              </Text>
            </View>
          </View>

          {appointment?.duration && (
            <View
              style={
                styles.locationRow
              }>
              <Ionicons
                name="hourglass-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.locationText
                }>
                {appointment.duration}
              </Text>
            </View>
          )}

          <View
            style={
              styles.waitingBox
            }>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#D88916"
            />

            <Text
              style={
                styles.waitingText
              }>
              This appointment will appear
              in your approved appointments
              after your trainer approves it.
            </Text>
          </View>
        </View>
      );
    };

  const renderApprovedCard =
    appointment => {
      const status =
        getStatus(appointment);

      const isCompleted =
        status.toLowerCase() ===
        'completed';

      const isCancelled =
        status.toLowerCase() ===
        'cancelled';

      return (
        <View
          key={String(
            appointment?.id,
          )}
          style={
            styles.appointmentCard
          }>
          <View
            style={
              styles.cardTopRow
            }>
            <View
              style={[
                styles.calendarIcon,
                isCompleted &&
                  styles.completedIcon,
                isCancelled &&
                  styles.cancelledIcon,
              ]}>
              <Ionicons
                name={
                  isCompleted
                    ? 'checkmark-circle-outline'
                    : isCancelled
                    ? 'close-circle-outline'
                    : 'calendar-outline'
                }
                size={23}
                color={
                  isCancelled
                    ? '#D93025'
                    : isCompleted
                    ? '#2E9D59'
                    : '#4169D8'
                }
              />
            </View>

            <View
              style={
                styles.appointmentMain
              }>
              <Text
                style={
                  styles.appointmentTitle
                }>
                {getAppointmentTitle(
                  appointment,
                )}
              </Text>

              <Text
                style={
                  styles.trainerText
                }>
                {getTrainerName(
                  appointment,
                )}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isCompleted &&
                  styles.completedBadge,
                isCancelled &&
                  styles.cancelledBadge,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  isCompleted &&
                    styles.completedStatusText,
                  isCancelled &&
                    styles.cancelledStatusText,
                ]}>
                {isCompleted
                  ? 'Completed'
                  : isCancelled
                  ? 'Cancelled'
                  : 'Approved'}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.detailsContainer
            }>
            <View
              style={
                styles.detailItem
              }>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.detailText
                }>
                {formatDate(
                  appointment,
                )}
              </Text>
            </View>

            <View
              style={
                styles.detailItem
              }>
              <Ionicons
                name="time-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.detailText
                }>
                {formatTime(
                  appointment,
                )}
              </Text>
            </View>
          </View>

          {appointment?.duration && (
            <View
              style={
                styles.locationRow
              }>
              <Ionicons
                name="hourglass-outline"
                size={17}
                color="#777777"
              />

              <Text
                style={
                  styles.locationText
                }>
                {appointment.duration}
              </Text>
            </View>
          )}

          <View
            style={
              styles.locationRow
            }>
            <Ionicons
              name="location-outline"
              size={17}
              color="#777777"
            />

            <Text
              style={
                styles.locationText
              }>
              {getLocation(
                appointment,
              )}
            </Text>
          </View>

          {!isCompleted &&
            !isCancelled && (
              <TouchableOpacity
                style={
                  styles.viewButton
                }
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate(
                    'AppointmentDetails',
                    {
                      appointment,
                    },
                  );
                }}>
                <Text
                  style={
                    styles.viewButtonText
                  }>
                  View Details
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
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
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }>
        <View
          style={styles.header}>
          <View>
            <Text
              style={
                styles.headerTitle
              }>
              Appointments
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              Today's training sessions
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }>
            <Ionicons
              name="calendar-outline"
              size={25}
              color="#4169D8"
            />
          </View>
        </View>

        <View
          style={
            styles.summaryCard
          }>
          <View
            style={
              styles.summaryIcon
            }>
            <Ionicons
              name="calendar"
              size={24}
              color="#4169D8"
            />
          </View>

          <View
            style={
              styles.summaryContent
            }>
            <Text
              style={
                styles.summaryTitle
              }>
              Today's Appointments
            </Text>

            <Text
              style={
                styles.summarySubtitle
              }>
              {todayPendingAppointments.length}{' '}
              pending •{' '}
              {memberAppointments.length}{' '}
              approved
            </Text>
          </View>
        </View>

        {todayPendingAppointments.length >
        0 ? (
          todayPendingAppointments.map(
            renderPendingCard,
          )
        ) : (
          <View
            style={
              styles.noPendingCard
            }>
            <View
              style={
                styles.noPendingIcon
              }>
              <Ionicons
                name="checkmark-circle-outline"
                size={30}
                color="#2E9D59"
              />
            </View>

            <View
              style={
                styles.noPendingContent
              }>
              <Text
                style={
                  styles.noPendingTitle
                }>
                No Pending Requests
              </Text>

              <Text
                style={
                  styles.noPendingText
                }>
                You don't have any appointment
                requests waiting for approval
                today.
              </Text>
            </View>
          </View>
        )}

        <View
          style={
            styles.approvedSectionHeader
          }>
          <View>
            <Text
              style={
                styles.sectionTitle
              }>
              Today's Appointments
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Appointments scheduled for today
            </Text>
          </View>

          <View
            style={
              styles.approvedCountBadge
            }>
            <Text
              style={
                styles.approvedCountText
              }>
              {memberAppointments.length}
            </Text>
          </View>
        </View>

        {memberAppointments.length >
        0 ? (
          memberAppointments.map(
            renderApprovedCard,
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
                name="calendar-outline"
                size={35}
                color="#4169D8"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }>
              No Appointments Today
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              You don't have any appointments
              scheduled for today.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333333',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE4DF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  summarySubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
    lineHeight: 17,
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

  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1D9A7',
    padding: 16,
    marginBottom: 14,
  },

  pendingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pendingIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFF0CF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  pendingMain: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  pendingTrainer: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  notApprovedBadge: {
    backgroundColor: '#FFF0CF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 7,
  },

  notApprovedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D88916',
  },

  pendingDivider: {
    height: 1,
    backgroundColor: '#F1E5CC',
    marginTop: 15,
    marginBottom: 13,
  },

  pendingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  waitingBox: {
    marginTop: 13,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#FFF9ED',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  waitingText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#8A6A29',
    marginLeft: 7,
  },

  approvedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
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

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 16,
    marginBottom: 14,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  calendarIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  completedIcon: {
    backgroundColor: '#E8F7EE',
  },

  cancelledIcon: {
    backgroundColor: '#FFF1F0',
  },

  appointmentMain: {
    flex: 1,
  },

  appointmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  trainerText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: '#E8F7EE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },

  completedBadge: {
    backgroundColor: '#E8F7EE',
  },

  cancelledBadge: {
    backgroundColor: '#FFF1F0',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E9D59',
  },

  completedStatusText: {
    color: '#2E9D59',
  },

  cancelledStatusText: {
    color: '#D93025',
  },

  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 22,
  },

  detailText: {
    fontSize: 13,
    color: '#555555',
    marginLeft: 7,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  locationText: {
    fontSize: 12,
    color: '#777777',
    marginLeft: 7,
  },

  viewButton: {
    height: 42,
    borderRadius: 9,
    backgroundColor: '#4169D8',
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 5,
  },

  noPendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noPendingIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  noPendingContent: {
    flex: 1,
  },

  noPendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  noPendingText: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
});

export default MemberAppointmentsScreen;
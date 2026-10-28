import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

const PRIMARY_COLOR = '#4169D8';
const BLACK = '#111111';
const GREEN = '#22C55E';
const LIGHT_GREEN = '#EAF9EF';

const MyMembershipScreen = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(
    true,
  );

  const [member, setMember] =
    useState(null);

  const [membership, setMembership] =
    useState(null);

  const [username, setUsername] =
    useState('');

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const reduxMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const reduxMembership = useSelector(
    state => state.member?.membership || null,
  );

  const loadMembership = () => {
    try {
      setLoading(true);

      const currentUser = authUser;

      if (!currentUser) {
        setMember(null);
        setMembership(null);
        setUsername('');
        return;
      }

      const loginUsername =
        currentUser?.username ||
        currentUser?.userName ||
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Member';

      setUsername(loginUsername);

      const currentUserId = String(
        currentUser?.memberId ||
          currentUser?.id ||
          '',
      ).trim();

      const currentUserEmail =
        String(
          currentUser?.email || '',
        )
          .trim()
          .toLowerCase();

      const members = Array.isArray(
        reduxMembers,
      )
        ? reduxMembers
        : [];

      const matchedMember =
        members.find(memberItem => {
          const memberId = String(
            memberItem?.id ||
              memberItem?.memberId ||
              '',
          ).trim();

          const memberEmail =
            String(
              memberItem?.email || '',
            )
              .trim()
              .toLowerCase();

          return (
            (currentUserId &&
              memberId &&
              currentUserId ===
                memberId) ||
            (currentUserEmail &&
              memberEmail &&
              currentUserEmail ===
                memberEmail)
          );
        });

      const currentMember =
        matchedMember || currentUser;

      setMember(currentMember);

      let memberMembership = null;

      if (
        reduxMembership &&
        !Array.isArray(reduxMembership)
      ) {
        const membershipMemberId =
          String(
            reduxMembership?.memberId ||
              reduxMembership?.id ||
              '',
          ).trim();

        const membershipEmail =
          String(
            reduxMembership?.email || '',
          )
            .trim()
            .toLowerCase();

        const belongsToMember =
          !membershipMemberId &&
          !membershipEmail
            ? true
            : (currentUserId &&
                membershipMemberId &&
                currentUserId ===
                  membershipMemberId) ||
              (currentUserEmail &&
                membershipEmail &&
                currentUserEmail ===
                  membershipEmail);

        if (belongsToMember) {
          memberMembership =
            reduxMembership;
        }
      }

      if (
        Array.isArray(reduxMembership)
      ) {
        memberMembership =
          reduxMembership.find(item => {
            const itemMemberId =
              String(
                item?.memberId ||
                  item?.id ||
                  '',
              ).trim();

            const itemEmail =
              String(
                item?.email || '',
              )
                .trim()
                .toLowerCase();

            return (
              (currentUserId &&
                itemMemberId &&
                currentUserId ===
                  itemMemberId) ||
              (currentUserEmail &&
                itemEmail &&
                currentUserEmail ===
                  itemEmail)
            );
          });
      }

      const membershipFromMember =
        currentMember?.membership ||
        currentMember?.membershipDetails ||
        currentMember?.plan ||
        null;

      const finalMembership =
        memberMembership ||
        membershipFromMember ||
        null;

      setMembership(finalMembership);
    } catch (error) {
      console.log(
        'Load membership error:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembership();
    }, [
      authUser,
      reduxMembers,
      reduxMembership,
    ]),
  );

  const parseDate = value => {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsed = new Date(value);

    if (
      !Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return parsed;
    }

    const parts = String(value)
      .trim()
      .split(' ');

    if (parts.length === 3) {
      const day = parseInt(
        parts[0],
        10,
      );

      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const month =
        monthMap[parts[1]];

      const year = parseInt(
        parts[2],
        10,
      );

      if (
        !Number.isNaN(day) &&
        month !== undefined &&
        !Number.isNaN(year)
      ) {
        return new Date(
          year,
          month,
          day,
        );
      }
    }

    return null;
  };

  const formatDate = value => {
    if (!value) {
      return '--';
    }

    const date = parseDate(value);

    if (!date) {
      return String(value);
    }

    const months = [
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

    return `${String(
      date.getDate(),
    ).padStart(2, '0')} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const calculateDaysRemaining = () => {
    if (!membership) {
      return 0;
    }

    const expiry = parseDate(
      membership?.expiryDate ||
        membership?.endDate ||
        membership?.validTill,
    );

    if (!expiry) {
      return (
        membership?.daysRemaining ||
        membership?.remainingDays ||
        0
      );
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    expiry.setHours(
      0,
      0,
      0,
      0,
    );

    const difference =
      expiry.getTime() -
      today.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24),
      ),
    );
  };

  const handleRenew = () => {
    Alert.alert(
      'Renew Membership',
      'Membership renewal will be available here.',
      [
        {
          text: 'OK',
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={PRIMARY_COLOR}
          />

          <Text
            style={styles.loadingText}
          >
            Loading membership...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!member && !membership) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="card-outline"
              size={38}
              color={PRIMARY_COLOR}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            No Membership Found
          </Text>

          <Text
            style={styles.emptyText}
          >
            We could not find membership
            details for your account.
          </Text>

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status =
    membership?.status ||
    membership?.membershipStatus ||
    'Active';

  const membershipType =
    membership?.type ||
    membership?.membershipType ||
    membership?.planName ||
    'Yearly Membership';

  const startDate =
    membership?.startDate ||
    membership?.membershipStartDate;

  const expiryDate =
    membership?.expiryDate ||
    membership?.endDate ||
    membership?.membershipExpiryDate ||
    membership?.validTill;

  const branch =
    membership?.branch ||
    membership?.branchName ||
    member?.branch ||
    'Ahmedabad';

  const trainer =
    membership?.trainer ||
    membership?.trainerName ||
    member?.trainer ||
    member?.trainerName ||
    member?.assignedTrainer ||
    member?.assignedTrainerName ||
    username ||
    'Not Assigned';

  const daysRemaining =
    calculateDaysRemaining();

  const isActive =
    String(status)
      .toLowerCase() ===
    'active';

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>

          <View
            style={styles.headerContent}
          >
            <Text
              style={styles.headerTitle}
            >
              My Membership
            </Text>

            <Text
              style={styles.headerSubtitle}
              numberOfLines={1}
            >
              Welcome, {username}
            </Text>
          </View>

          <View
            style={
              styles.headerCardIcon
            }
          >
            <Ionicons
              name="card-outline"
              size={23}
              color={PRIMARY_COLOR}
            />
          </View>
        </View>

        <View
          style={styles.profileGreeting}
        >
          <View
            style={styles.profileAvatar}
          >
            <Ionicons
              name="person"
              size={22}
              color={PRIMARY_COLOR}
            />
          </View>

          <View
            style={
              styles.profileGreetingContent
            }
          >
            <Text
              style={
                styles.profileGreetingSmall
              }
            >
              Member Account
            </Text>

            <Text
              style={
                styles.profileGreetingName
              }
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        <View
          style={styles.membershipCard}
        >
          <View style={styles.cardTop}>
            <View
              style={styles.cardTitleRow}
            >
              <View
                style={
                  styles.membershipIcon
                }
              >
                <Ionicons
                  name="ribbon-outline"
                  size={23}
                  color={PRIMARY_COLOR}
                />
              </View>

              <View
                style={
                  styles.membershipTitleContainer
                }
              >
                <Text
                  style={
                    styles.membershipLabel
                  }
                >
                  Membership
                </Text>

                <Text
                  style={
                    styles.membershipType
                  }
                  numberOfLines={1}
                >
                  {membershipType}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    isActive
                      ? LIGHT_GREEN
                      : '#FDEAEA',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isActive
                        ? GREEN
                        : '#E05252',
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      isActive
                        ? GREEN
                        : '#E05252',
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.dateRow}
          >
            <View
              style={styles.dateBox}
            >
              <Text
                style={styles.dateLabel}
              >
                Start Date
              </Text>

              <Text
                style={styles.dateValue}
              >
                {formatDate(startDate)}
              </Text>
            </View>

            <View
              style={styles.dateDivider}
            />

            <View
              style={styles.dateBox}
            >
              <Text
                style={styles.dateLabel}
              >
                Expiry Date
              </Text>

              <Text
                style={styles.dateValue}
              >
                {formatDate(expiryDate)}
              </Text>
            </View>
          </View>

          <View
            style={styles.remainingCard}
          >
            <View
              style={styles.remainingIcon}
            >
              <Ionicons
                name="time-outline"
                size={21}
                color={PRIMARY_COLOR}
              />
            </View>

            <View
              style={
                styles.remainingContent
              }
            >
              <Text
                style={
                  styles.remainingLabel
                }
              >
                Membership Remaining
              </Text>

              <Text
                style={
                  styles.remainingText
                }
              >
                {daysRemaining}{' '}
                Days Remaining
              </Text>
            </View>

            <View
              style={styles.remainingDays}
            >
              <Text
                style={
                  styles.remainingNumber
                }
              >
                {daysRemaining}
              </Text>

              <Text
                style={
                  styles.remainingDaysText
                }
              >
                DAYS
              </Text>
            </View>
          </View>
        </View>

        <View
          style={styles.detailsSection}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.sectionIndicator
              }
            />

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Membership Details
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Your membership information
              </Text>
            </View>
          </View>

          <View
            style={styles.detailsCard}
          >
            <View
              style={styles.detailRow}
            >
              <View
                style={styles.detailIcon}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                />
              </View>

              <View
                style={styles.detailContent}
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Branch
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {branch}
                </Text>
              </View>
            </View>

            <View
              style={styles.detailDivider}
            />

            <View
              style={styles.detailRow}
            >
              <View
                style={styles.detailIcon}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                />
              </View>

              <View
                style={styles.detailContent}
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Trainer
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {trainer}
                </Text>
              </View>
            </View>

            <View
              style={styles.detailDivider}
            />

            <View
              style={styles.detailRow}
            >
              <View
                style={styles.detailIcon}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                />
              </View>

              <View
                style={styles.detailContent}
              >
                <Text
                  style={
                    styles.detailLabel
                  }
                >
                  Plan Duration
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {membership?.duration ||
                    '1 Year'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={styles.renewCard}
        >
          <View
            style={styles.renewIcon}
          >
            <Ionicons
              name="refresh-outline"
              size={23}
              color={PRIMARY_COLOR}
            />
          </View>

          <View
            style={styles.renewContent}
          >
            <Text
              style={styles.renewTitle}
            >
              Renew Membership
            </Text>

            <Text
              style={styles.renewText}
            >
              Keep your fitness journey
              going without interruption.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.renewButton}
          onPress={handleRenew}
          activeOpacity={0.85}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.renewButtonText
            }
          >
            Renew Membership
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  backIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    color: BLACK,
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#777777',
    fontSize: 10,
    marginTop: 3,
  },

  headerCardIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileGreeting: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  profileGreetingContent: {
    flex: 1,
  },

  profileGreetingSmall: {
    color: '#888888',
    fontSize: 9,
    marginBottom: 3,
  },

  profileGreetingName: {
    color: BLACK,
    fontSize: 14,
    fontWeight: '800',
  },

  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    padding: 16,
    marginBottom: 20,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  membershipIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  membershipTitleContainer: {
    flex: 1,
  },

  membershipLabel: {
    color: '#777777',
    fontSize: 10,
    marginBottom: 3,
  },

  membershipType: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '800',
  },

  statusBadge: {
    minWidth: 68,
    height: 27,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 17,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    color: '#888888',
    fontSize: 9,
    marginBottom: 5,
  },

  dateValue: {
    color: BLACK,
    fontSize: 13,
    fontWeight: '800',
  },

  dateDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 16,
  },

  remainingCard: {
    marginTop: 17,
    borderRadius: 14,
    backgroundColor: '#F3F6FF',
    borderWidth: 1,
    borderColor: '#D9E2FA',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  remainingIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  remainingContent: {
    flex: 1,
  },

  remainingLabel: {
    color: '#777777',
    fontSize: 9,
    marginBottom: 3,
  },

  remainingText: {
    color: BLACK,
    fontSize: 11,
    fontWeight: '800',
  },

  remainingDays: {
    minWidth: 47,
    alignItems: 'center',
  },

  remainingNumber: {
    color: BLACK,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 21,
  },

  remainingDaysText: {
    color: '#777777',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  detailsSection: {
    marginBottom: 17,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionIndicator: {
    width: 5,
    height: 38,
    borderRadius: 3,
    backgroundColor: PRIMARY_COLOR,
    marginRight: 10,
  },

  sectionTitle: {
    color: BLACK,
    fontSize: 16,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#888888',
    fontSize: 9,
    marginTop: 3,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    paddingHorizontal: 14,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: '#888888',
    fontSize: 9,
    marginBottom: 3,
  },

  detailValue: {
    color: BLACK,
    fontSize: 12,
    fontWeight: '800',
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },

  renewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  renewIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  renewContent: {
    flex: 1,
  },

  renewTitle: {
    color: BLACK,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  renewText: {
    color: '#777777',
    fontSize: 9,
    lineHeight: 14,
  },

  renewButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 5,
  },

  renewButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginHorizontal: 8,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },

  loadingText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F7F8FA',
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    color: BLACK,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 7,
  },

  emptyText: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 280,
  },

  backButton: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});

export default MyMembershipScreen;
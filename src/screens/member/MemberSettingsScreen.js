
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const MemberSettingsScreen = () => {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container1}>

        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.headerText}>
              Settings
            </Text>
          </View>

          <View style={styles.profileCard}>

            <View style={styles.profileIconContainer}>
              <Ionicons
                name="person"
                size={25}
                color="#1959e4"
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileTitle}>
                My Profile
              </Text>

              <Text style={styles.profileSubtitle}>
                Manage your personal information
              </Text>
            </View>

          </View>

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <View style={styles.personalInfoCard}>

            <View style={styles.infoRow}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  Name
                </Text>

                <Text style={styles.infoValue}>
                  Khushi
                </Text>
              </View>

              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#1959e4"
                />
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  Email
                </Text>

                <Text style={styles.infoValue}>
                  khushi@example.com
                </Text>
              </View>

              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#1959e4"
                />
              </View>
            </View>

            <View style={styles.infoRowLast}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  Phone
                </Text>

                <Text style={styles.infoValue}>
                  +91 9876543210
                </Text>
              </View>

              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#1959e4"
                />
              </View>
            </View>

          </View>

          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <View style={styles.accountCard}>

            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name="create-outline"
                  size={21}
                  color="#1959e4"
                />
              </View>

              <View style={styles.accountTextContainer}>
                <Text style={styles.accountTitle}>
                  Edit Profile
                </Text>

                <Text style={styles.accountSubtitle}>
                  Update your personal information
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#777777"
              />
            </View>

            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={21}
                  color="#1959e4"
                />
              </View>

              <View style={styles.accountTextContainer}>
                <Text style={styles.accountTitle}>
                  Change Password
                </Text>

                <Text style={styles.accountSubtitle}>
                  Update your account password
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#777777"
              />
            </View>

            <View style={styles.accountRowLast}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#1959e4"
                />
              </View>

              <View style={styles.accountTextContainer}>
                <Text style={styles.accountTitle}>
                  Notifications
                </Text>

                <Text style={styles.accountSubtitle}>
                  Manage notification preferences
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#777777"
              />
            </View>

          </View>

          <Text style={styles.sectionTitle}>
            My Trainer
          </Text>

          <View style={styles.trainerCard}>

            <View style={styles.trainerIconContainer}>
              <Ionicons
                name="person-outline"
                size={23}
                color="#1959e4"
              />
            </View>

            <View style={styles.trainerInfo}>
              <Text style={styles.trainerName}>
                Trainer
              </Text>

              <Text style={styles.trainerEmail}>
                trainer@gmail.com
              </Text>

              <View style={styles.assignedContainer}>
                <View style={styles.activeDot} />

                <Text style={styles.assignedText}>
                  Assigned
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />

          </View>

          <Text style={styles.sectionTitle}>
            My Member
          </Text>

          <View style={styles.trainerCard}>

            <View style={styles.trainerIconContainer}>
              <Ionicons
                name="person-outline"
                size={23}
                color="#1959e4"
              />
            </View>

            <View style={styles.trainerInfo}>

              <Text style={styles.trainerName}>
                Member
              </Text>

              <Text style={styles.trainerEmail}>
                member@gmail.com
              </Text>

              <View style={styles.assignedContainer}>
                <View style={styles.activeDot} />

                <Text style={styles.assignedText}>
                  Assigned
                </Text>
              </View>

            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />

          </View>

          <Text style={styles.sectionTitle}>
            My Trainer
          </Text>

          <View style={styles.trainerCard}>
                <View style={styles.trainerIconContainer}>
              <Ionicons
                name="person-outline"
                size={23}
                color="#1959e4"
              />
            </View>

            <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>
                    trainer
                </Text>

                <Text style={styles.trainerEmail}>
                    trainer@gmail.com
                </Text>

                <View style={styles.assignedContainer}>
                    <View style={styles.activeDot}/>
                    <Text style={styles.assignedText}>Assigned</Text>
                </View>
                
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#777777"
            />

            </View>


          </View>

          <View style={styles.logoutContainer}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#D32F2F"
            />

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container1: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    marginBottom: 24,
  },

  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  profileTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },

  profileSubtitle: {
    fontSize: 13,
    color: '#777777',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
  },

  personalInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingHorizontal: 15,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  infoRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },

  infoIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    paddingHorizontal: 15,
    marginBottom: 24,
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  accountRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  accountTextContainer: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 3,
  },

  accountSubtitle: {
    fontSize: 12,
    color: '#777777',
  },

  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    marginBottom: 24,
  },

  trainerIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  trainerInfo: {
    flex: 1,
  },

  trainerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 3,
  },

  trainerEmail: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 6,
  },

  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2EAF5D',
    marginRight: 6,
  },

  assignedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2EAF5D',
  },

  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    paddingVertical: 14,
    marginBottom: 10,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D32F2F',
    marginLeft: 8,
  },
});

export default MemberSettingsScreen;


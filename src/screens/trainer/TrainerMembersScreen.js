import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useSelector} from 'react-redux';

import MemberCard from '../../components/MemberCard';

const TrainerMembersScreen = ({navigation}) => {
  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const currentTrainer = useSelector(
    state => state.auth?.user || null,
  );

  const allMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const currentTrainerId =
    currentTrainer?.trainerId ||
    currentTrainer?.id ||
    currentTrainer?.userId ||
    null;

  const members = allMembers.filter(member => {
    if (!currentTrainerId) {
      return false;
    }

    const trainerIds = Array.isArray(
      member?.trainerIds,
    )
      ? member.trainerIds
      : member?.trainerId
      ? [member.trainerId]
      : [];

    return trainerIds.some(
      id =>
        String(id) ===
        String(currentTrainerId),
    );
  });

  const filters = [
    'All',
    'Active',
    'Inactive',
    'Expiring',
  ];

  const filteredMembers = members.filter(
    member => {
      if (selectedFilter === 'All') {
        return true;
      }

      return (
        member.status?.toLowerCase() ===
        selectedFilter.toLowerCase()
      );
    },
  );

  const handleMemberPress = member => {
    navigation.navigate(
      'MemberDetails',
      {
        memberId:
          member.id || member.memberId,
        memberName:
          member.name ||
          member.fullName ||
          'Member',
      },
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

      <View style={styles.container}>

       

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
                style={styles.subtitle}>
                Manage your
              </Text>

              <Text
                style={styles.title}>
                My Members
              </Text>

            </View>

            <TouchableOpacity
              style={
                styles.notificationButton
              }
              onPress={() =>
                navigation.navigate(
                  'TrainerNotifications',
                )
              }
              activeOpacity={0.8}>

              <Ionicons
                name="notifications-outline"
                size={23}
                color="#333333"
              />

              <View
                style={
                  styles.notificationDot
                }
              />

            </TouchableOpacity>

          </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }>


          <View
            style={styles.filterContainer}>

            {filters.map(filter => {
              const isSelected =
                selectedFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    isSelected &&
                      styles.selectedFilterButton,
                  ]}
                  onPress={() =>
                    setSelectedFilter(
                      filter,
                    )
                  }
                  activeOpacity={0.8}>

                  <Text
                    style={[
                      styles.filterText,
                      isSelected &&
                        styles.selectedFilterText,
                    ]}>
                    {filter}
                  </Text>

                </TouchableOpacity>
              );
            })}

          </View>

          <View
            style={styles.sectionHeader}>

            <View>

              <Text
                style={styles.sectionTitle}>
                My Members
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }>
                Members assigned to you
              </Text>

            </View>

            <View
              style={styles.totalBadge}>

              <Text
                style={
                  styles.totalBadgeText
                }>
                {filteredMembers.length}
              </Text>

            </View>

          </View>

          {filteredMembers.length > 0 ? (

            <View
              style={styles.membersList}>

              {filteredMembers.map(
                member => (
                  <MemberCard
                    key={
                      member.id ||
                      member.memberId ||
                      member.email
                    }
                    name={
                      member.name ||
                      member.fullName ||
                      'Member'
                    }
                    status={
                      member.status ||
                      'Active'
                    }
                    onPress={() =>
                      handleMemberPress(
                        member,
                      )
                    }
                  />
                ),
              )}

            </View>

          ) : (

            <View
              style={styles.emptyCard}>

              <View
                style={styles.emptyIcon}>

                <Ionicons
                  name="people-outline"
                  size={32}
                  color="#4169D8"
                />

              </View>

              <Text
                style={styles.emptyTitle}>
                No Members Found
              </Text>

              <Text
                style={styles.emptyText}>

                {selectedFilter === 'All'
                  ? 'No members have been added to your members list yet.'
                  : `No ${selectedFilter.toLowerCase()} members found.`}

              </Text>

              {selectedFilter ===
                'All' && (

                <TouchableOpacity
                  style={
                    styles.addMemberButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'AddMembers',
                    )
                  }
                  activeOpacity={0.8}>

                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.addMemberButtonText
                    }>
                    Add Member
                  </Text>

                </TouchableOpacity>

              )}

            </View>

          )}

        </ScrollView>

      </View>

    </SafeAreaView>
  );
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

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  

   header: {
    minHeight:78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6EB',
    marginBottom: 14,
    backgroundColor:'#FFFFFF',
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

  
  headerTextContainer: {
    flex: 1,
  },

  subtitle: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 3,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#333333',
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4169D8',
    top: 7,
    right: 8,
  },

  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedFilterButton: {
    backgroundColor: '#4169D8',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
  },

  selectedFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
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

  totalBadge: {
    minWidth: 34,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  totalBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4169D8',
  },

  membersList: {
    gap: 12,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E4E9',
    paddingVertical: 38,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 15,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },

  addMemberButton: {
    height: 42,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default TrainerMembersScreen;
import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import MemberDashboardScreen from '../screens/member/MemberDashboardScreen';
import MemberWorkoutScreen from '../screens/member/MemberWorkoutScreen';
import MemberProgressScreen from '../screens/member/MemberProgressScreen';
import MemberAppointmentsScreen from '../screens/member/MemberAppointmentsScreen';
import MemberProfileScreen from '../screens/member/MemberProfileScreen';

const Tab = createBottomTabNavigator();

const MemberTabNavigator = () => {
  return (

    <SafeAreaView
          style={{flex: 1}}
          edges={['bottom']}>
    
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor: '#4169D8',
        tabBarInactiveTintColor: '#777777',

        tabBarStyle: {
          height: 72,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E4E8',
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: 5,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },

        tabBarIcon: ({focused}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused
              ? 'home'
              : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused
              ? 'barbell'
              : 'barbell-outline';
          } else if (route.name === 'Progress') {
            iconName = focused
              ? 'stats-chart'
              : 'stats-chart-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused
              ? 'calendar'
              : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused
              ? 'person'
              : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={
                focused
                  ? '#4169D8'
                  : '#777777'
              }
            />
          );
        },

        tabBar: props => (
          

            <View style={styles.tabBarContainer}>
              <BottomTabBar {...props} />
            </View>

        ),
      })}>

      <Tab.Screen
        name="Home"
        component={MemberDashboardScreen}
      />

      <Tab.Screen
        name="Workout"
        component={MemberWorkoutScreen}
      />

      <Tab.Screen
        name="Progress"
        component={MemberProgressScreen}
      />

      <Tab.Screen
        name="Appointments"
        component={MemberAppointmentsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={MemberProfileScreen}
      />

    </Tab.Navigator>

        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
  },
});

export default MemberTabNavigator;
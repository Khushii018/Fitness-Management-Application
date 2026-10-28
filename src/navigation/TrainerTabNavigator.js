import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Ionicons from '@react-native-vector-icons/ionicons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import TrainerDashboardScreen from '../screens/trainer/TrainerDashboardScreen';
import TrainerMembersScreen from '../screens/trainer/TrainerMembersScreen';
import TrainerScheduleScreen from '../screens/trainer/TrainerScheduleScreen';
import CreateWorkoutPlanScreen from '../screens/trainer/CreateWorkoutPlanScreen';
import TrainerSettingsScreen from '../screens/trainer/TrainerSettingsScreen';

const Tab = createBottomTabNavigator();

const TrainerTabNavigator = () => {
  return (
    <SafeAreaView
      style={{flex: 1}}
      edges={['bottom']}>

      <Tab.Navigator
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
            fontSize: 9,
            fontWeight: '600',
          },

          tabBarIcon: ({focused}) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home-outline';
            } else if (route.name === 'Members') {
              iconName = focused
                ? 'people'
                : 'people-outline';
            } else if (route.name === 'Schedule') {
              iconName = focused
                ? 'calendar'
                : 'calendar-outline';
            } else if (route.name === 'Workout') {
              iconName = focused
                ? 'barbell'
                : 'barbell-outline';
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
        })}>

        <Tab.Screen
          name="Home"
          component={TrainerDashboardScreen}
        />

        <Tab.Screen
          name="Members"
          component={TrainerMembersScreen}
        />

        <Tab.Screen
          name="Schedule"
          component={TrainerScheduleScreen}
        />

        <Tab.Screen
          name="Workout"
          component={CreateWorkoutPlanScreen}
        />

        <Tab.Screen
          name="Profile"
          component={TrainerSettingsScreen}
        />

      </Tab.Navigator>

    </SafeAreaView>
  );
};

export default TrainerTabNavigator;
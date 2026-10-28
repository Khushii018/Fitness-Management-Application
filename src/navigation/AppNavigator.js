import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import AuthenticationScreen from '../screens/auth/AuthenticationScreen';
import AuthLoadingScreen from '../screens/auth/AuthLoadingScreen';
import MemberExerciseScreen from '../screens/member/MemberExerciseScreen';
import MemberProfileSetupScreen from '../screens/member/MemberProfileSetupScreen';
import MemberDashboardScreen from '../screens/member/MemberDashboardScreen';
import CompleteExerciseScreen from '../screens/member/CompleteExerciseScreen';
import TrainerTabNavigator from './TrainerTabNavigator';
import WorkoutHistoryScreen from '../screens/member/WorkoutHistoryScreen';
import AddMembersScreen from '../screens/trainer/AddMembersScreen';
import FitnessAssessmentScreen from '../screens/trainer/FitnessAssessmentScreen';
import DietPlanScreen from '../screens/trainer/DietPlanScreen';
// import TrainerProgressScreen from '../screens/trainer/TrainerProgressScreen';
// import TrainerAttendanceScreen from '../screens/trainer/TrainerAttendanceScreen';
import MemberDetailsScreen from '../screens/trainer/MemberDetailsScreen';
import TrainerNotificationsScreen from '../screens/trainer/TrainerNotificationScreen';
import CreateAppointmentScreen from '../screens/trainer/CreateAppointmentScreen';
import CreateWorkoutPlanScreen from '../screens/trainer/CreateWorkoutPlanScreen';
import MemberTabNavigator from '../navigation/MemberTabNavigator';
import MemberDietPlanScreen from '../screens/member/MemberDietPlanScreen';
import CreateMemberAccountScreen from '../screens/trainer/CreateMemberAccountScreen';
// import TrainerSettingsScreen from '../screens/trainer/TrainerSettingsScreen';
import MyTrainerScreen from '../screens/member/MyTrainerScreen';
import MyMembershipScreen from '../screens/member/MyMembershipScreen';
import MemberWorkoutScreen from '../screens/member/MemberWorkoutScreen';
import AppointmentsScreen from '../screens/member/AppointmentsScreen';
// import GlobalDietPlanScreen from '../screens/trainer/GlobalDietPlanScreen';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import CreateTrainerScreen from '../screens/manager/CreateTrainerScreen';
import ManagerTrainerSelectionScreen from '../screens/manager/ManagerTrainerSelectionScreen';
import ManagerMemberSelectionScreen from '../screens/manager/ManagerMemberSelectionScreen';
import CreateMemberScreen from '../screens/manager/CreateMemberScreen';
import ManagerAssignMemberScreen from '../screens/manager/ManagerAssignMemberScreen';
import MemberSettingsScreen from '../screens/member/MemberSettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthLoading"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />

      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen name="Register" component={RegisterScreen} />

      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="OTP" component={OtpScreen} />

      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />

      <Stack.Screen name="Authentication" component={AuthenticationScreen} />

      <Stack.Screen
        name="MemberProfileSetup"
        component={MemberProfileSetupScreen}
      />

      <Stack.Screen name="TrainerTabs" component={TrainerTabNavigator} />

      <Stack.Screen name="AddMembers" component={AddMembersScreen} />

      <Stack.Screen
        name="FitnessAssessment"
        component={FitnessAssessmentScreen}
      />

      <Stack.Screen name="DietPlan" component={DietPlanScreen} />

      <Stack.Screen name="MemberDetails" component={MemberDetailsScreen} />

      <Stack.Screen
        name="TrainerNotifications"
        component={TrainerNotificationsScreen}
      />

      <Stack.Screen
        name="CreateAppointment"
        component={CreateAppointmentScreen}
      />

      <Stack.Screen name="Workout" component={CreateWorkoutPlanScreen} />

      <Stack.Screen name="MemberTabs" component={MemberTabNavigator} />

      <Stack.Screen name="MemberDietPlan" component={MemberDietPlanScreen} />

      <Stack.Screen
        name="CreateMemberAccount"
        component={CreateMemberAccountScreen}
      />

      <Stack.Screen name="MemberExercise" component={MemberExerciseScreen} />

      <Stack.Screen
        name="CompleteExercise"
        component={CompleteExerciseScreen}
      />

      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />

      <Stack.Screen name="MyTrainer" component={MyTrainerScreen} />

      <Stack.Screen name="MyMembership" component={MyMembershipScreen} />

      <Stack.Screen name="MemberWorkout" component={MemberWorkoutScreen} />

      <Stack.Screen name="AppointmentsCreate" component={AppointmentsScreen} />



      <Stack.Screen name='ManagerDashboard' component={ManagerDashboardScreen}/>

      <Stack.Screen name='CreateTrainer' component={CreateTrainerScreen}/>
      <Stack.Screen name='CreateMember' component={CreateMemberScreen}/>


              <Stack.Screen
            
          name="ManagerTrainerSelection"
          component={ManagerTrainerSelectionScreen}
          options={{
            headerShown: false,
          }}
        />

              <Stack.Screen
          name="ManagerMemberSelection"
          component={ManagerMemberSelectionScreen}
          options={{
            headerShown: false,
          }}
        />
              <Stack.Screen
          name="ManagerAssignMember"
          component={ManagerAssignMemberScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
        name='demo'
        component={MemberSettingsScreen}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;

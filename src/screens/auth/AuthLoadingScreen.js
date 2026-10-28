import React, {useEffect, useRef} from 'react';

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {login} from '../../redux/slices/authSlice';

const AuthLoadingScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const hasNavigated = useRef(false);

  const authUser = useSelector(
    state => state.auth?.user || null,
  );

  const authToken = useSelector(
    state => state.auth?.token || null,
  );

  const isLoggedIn = useSelector(
    state => state.auth?.isLoggedIn || false,
  );

  const memberProfile = useSelector(
    state => state.member?.profile || null,
  );

  useEffect(() => {
    if (hasNavigated.current) {
      return;
    }

    const timer = setTimeout(() => {
      checkAuthentication();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const resetToScreen = screen => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: screen,
        },
      ],
    });
  };

  const checkAuthentication = () => {
    if (hasNavigated.current) {
      return;
    }

    try {
      if (
        !isLoggedIn ||
        !authToken ||
        !authUser
      ) {
        hasNavigated.current = true;

        navigation.replace('Splash');

        return;
      }

      const userData = {
        ...authUser,
      };

      if (userData.role === 'manager') {
        dispatch(
          login({
            token: authToken,
            user: userData,
          }),
        );

        hasNavigated.current = true;

        resetToScreen('ManagerDashboard');

        return;
      }

      if (userData.role === 'trainer') {
        dispatch(
          login({
            token: authToken,
            user: userData,
          }),
        );

        hasNavigated.current = true;

        resetToScreen('TrainerTabs');

        return;
      }

      if (userData.role === 'member') {
        const profileCompleted =
          userData.profileCompleted === true ||
          memberProfile?.profileCompleted === true;

        const updatedUser = {
          ...userData,

          profileCompleted:
            profileCompleted === true,
        };

        dispatch(
          login({
            token: authToken,
            user: updatedUser,
          }),
        );

        hasNavigated.current = true;

        if (profileCompleted) {
          resetToScreen('MemberTabs');
        } else {
          resetToScreen(
            'MemberProfileSetup',
          );
        }

        return;
      }

      hasNavigated.current = true;

      navigation.replace('Splash');
    } catch (error) {
      console.log(
        'Auth check error:',
        error,
      );

      hasNavigated.current = true;

      navigation.replace('Splash');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#4169D8"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;
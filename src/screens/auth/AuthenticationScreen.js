import React, {useEffect} from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

const AuthenticationScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('AuthLoading');
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={48}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.title}>
          Login Successful
        </Text>

        <Text style={styles.welcome}>
          Welcome!
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  successCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#4169D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    color: '#333333',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  welcome: {
    color: '#4169D8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AuthenticationScreen;
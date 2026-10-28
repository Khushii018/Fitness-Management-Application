import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

const WelcomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>

          {/* Dumbbell Icon */}
          <Ionicons
            name="barbell-outline"
            size={55}
            color="#3F3F3F"
            style={styles.dumbbell}
          />

          {/* App Name */}
          <Text style={styles.appName}>
            FITNESS APP
          </Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Train. Track. Transform.
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Login
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.createAccountText}>
              Create Account
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  // --------------------------------------------------
  // SAFE AREA
  // --------------------------------------------------

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  // --------------------------------------------------
  // MAIN CONTAINER
  // --------------------------------------------------

  container: {
    flex: 1,

    backgroundColor: '#F7F8FA',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 20,
  },

  // --------------------------------------------------
  // WELCOME CARD
  // --------------------------------------------------

  welcomeCard: {
    width: width * 0.78,

    maxWidth: 360,

    minWidth: 280,

    paddingVertical: 35,

    paddingHorizontal: 22,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,

    borderColor: '#D9DDE3',

    alignItems: 'center',

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 5,
  },

  // --------------------------------------------------
  // DUMBBELL
  // --------------------------------------------------

  dumbbell: {
    marginBottom: 12,
  },

  // --------------------------------------------------
  // APP NAME
  // --------------------------------------------------

  appName: {
    color: '#333333',

    fontSize: 20,

    fontWeight: '700',

    letterSpacing: 1.2,

    marginBottom: 6,
  },

  // --------------------------------------------------
  // TAGLINE
  // --------------------------------------------------

  tagline: {
    color: '#666666',

    fontSize: 12,

    fontWeight: '400',

    marginBottom: 25,
  },

  // --------------------------------------------------
  // LOGIN BUTTON
  // --------------------------------------------------

  loginButton: {
    width: '100%',

    height: 42,

    backgroundColor: '#4169D8',

    borderRadius: 9,

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 10,
  },

  loginText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '600',
  },

  // --------------------------------------------------
  // CREATE ACCOUNT BUTTON
  // --------------------------------------------------

  createAccountButton: {
    width: '100%',

    height: 42,

    backgroundColor: '#FFFFFF',

    borderRadius: 9,

    borderWidth: 1,

    borderColor: '#9EA4AD',

    justifyContent: 'center',

    alignItems: 'center',
  },

  createAccountText: {
    color: '#444444',

    fontSize: 14,

    fontWeight: '500',
  },

});

export default WelcomeScreen;
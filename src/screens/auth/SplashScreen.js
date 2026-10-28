import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

const SplashScreen = ({navigation}) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        <View style={styles.splashCard}>

          {/* Dumbbell Icon */}
          <Ionicons
            name="barbell-outline"
            size={70}
            color="#FFFFFF"
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

          {/* Loading */}
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={styles.loader}
          />

        </View>

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#07111F',
  },

  container: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  splashCard: {
    width: width * 0.40,
    height: height * 0.46,

    maxWidth: 330,
    maxHeight: 400,

    minWidth: 250,
    minHeight: 300,

    backgroundColor: '#182538',

    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: 35,

    elevation: 8,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.35,

    shadowRadius: 8,
  },

  /* ---------------- DUMBBELL ICON ---------------- */

  dumbbell: {
    marginBottom: 25,
  },

  /* ---------------- TEXT ---------------- */

  appName: {
    color: '#FFFFFF',

    fontSize: 22,

    fontWeight: '700',

    letterSpacing: 1.5,

    marginBottom: 7,
  },

  tagline: {
    color: '#D7DEE8',

    fontSize: 12,

    fontWeight: '400',

    letterSpacing: 0.5,
  },

  /* ---------------- LOADER ---------------- */

  loader: {
    marginTop: 22,
  },

});

export default SplashScreen;
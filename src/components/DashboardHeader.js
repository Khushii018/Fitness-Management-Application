import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const DashboardHeader = ({
  name,
  subtitle = 'Good Morning,',
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>

      <View>
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>

        <Text style={styles.name}>
          {name}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.8}>

        <Ionicons
          name="notifications-outline"
          size={23}
          color="#333333"
        />

        <View style={styles.notificationDot} />

      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  subtitle: {
    color: '#777777',
    fontSize: 13,
    marginBottom: 3,
  },

  name: {
    color: '#333333',
    fontSize: 24,
    fontWeight: '700',
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4169D8',
    top: 9,
    right: 10,
  },
});

export default DashboardHeader;
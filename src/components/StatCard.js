import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const StatCard = ({
  icon = 'stats-chart-outline',
  title,
  value,
}) => {
  return (
    <View style={styles.card}>

      <View style={styles.iconContainer}>

        <Ionicons
          name={icon}
          size={21}
          color="#4169D8"
        />

      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    minHeight: 105,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  title: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },

  value: {
    color: '#333333',
    fontSize: 23,
    fontWeight: '700',
  },
});

export default StatCard;
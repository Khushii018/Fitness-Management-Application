import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const ProgressCard = ({
  title,
  value,
  target,
  progress = 0,
  icon = 'trending-up-outline',
}) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={21}
            color="#4169D8"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {target && (
            <Text style={styles.target}>{target}</Text>
          )}
        </View>

        <Text style={styles.percentage}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {width: `${percentage}%`},
          ]}
        />
      </View>

      {value && (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 14,
    marginBottom: 12,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },

  target: {
    color: '#777777',
    fontSize: 10,
  },

  percentage: {
    color: '#4169D8',
    fontSize: 14,
    fontWeight: '700',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#EAF0FF',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4169D8',
    borderRadius: 4,
  },

  value: {
    color: '#777777',
    fontSize: 10,
    marginTop: 7,
  },
});

export default ProgressCard;
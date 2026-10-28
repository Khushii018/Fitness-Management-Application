import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const AppointmentCard = ({
  name,
  date,
  time,
  type = 'Training Session',
  status = 'Upcoming',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      
      <View style={styles.dateBox}>
        <Ionicons
          name="calendar-outline"
          size={22}
          color="#4169D8"
        />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{name}</Text>

          <View style={styles.status}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.type}>{type}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#777777"
            />
            <Text style={styles.detailText}>{date}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color="#777777"
            />
            <Text style={styles.detailText}>{time}</Text>
          </View>
        </View>
      </View>

      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  name: {
    flex: 1,
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },

  status: {
    backgroundColor: '#EAF0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    color: '#4169D8',
    fontSize: 10,
    fontWeight: '700',
  },

  type: {
    color: '#777777',
    fontSize: 11,
    marginBottom: 8,
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    color: '#777777',
    fontSize: 10,
    marginLeft: 4,
  },
});

export default AppointmentCard;
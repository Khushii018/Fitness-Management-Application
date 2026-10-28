import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const MemberCard = ({
  name,
  status = 'Active',
  weight,
  goal,
  onPress,
}) => {
  // const isActive = status.toLowerCase() === 'active';
  const isActive =
  String(status || '').toLowerCase() === 'active';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      
      <View style={styles.avatar}>
        <Ionicons
          name="person"
          size={23}
          color="#4169D8"
        />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>

          <View
            style={[
              styles.status,
              isActive
                ? styles.activeStatus
                : styles.inactiveStatus,
            ]}>
            <Text
              style={[
                styles.statusText,
                isActive
                  ? styles.activeStatusText
                  : styles.inactiveStatusText,
              ]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          {weight && (
            <View style={styles.detailItem}>
              <Ionicons
                name="scale-outline"
                size={15}
                color="#777777"
              />
              <Text style={styles.detailText}>{weight}</Text>
            </View>
          )}

          {goal && (
            <View style={styles.detailItem}>
              <Ionicons
                name="flag-outline"
                size={15}
                color="#777777"
              />
              <Text style={styles.detailText}>{goal}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#777777"
      />
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

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  name: {
    flex: 1,
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  activeStatus: {
    backgroundColor: '#EAF0FF',
  },

  inactiveStatus: {
    backgroundColor: '#F1F1F1',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  activeStatusText: {
    color: '#4169D8',
  },

  inactiveStatusText: {
    color: '#777777',
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    color: '#777777',
    fontSize: 11,
    marginLeft: 4,
  },
});

export default MemberCard;
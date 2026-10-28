import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>

      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={21}
          color="#4169D8"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#777777"
      />

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  subtitle: {
    color: '#888888',
    fontSize: 10,
  },
});

export default SettingsItem;
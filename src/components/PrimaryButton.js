import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const PrimaryButton = ({
  title,
  onPress,
  icon = 'arrow-forward',
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}>

      <Text style={styles.text}>
        {title}
      </Text>

      <Ionicons
        name={icon}
        size={18}
        color="#FFFFFF"
      />

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    backgroundColor: '#4169D8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default PrimaryButton;
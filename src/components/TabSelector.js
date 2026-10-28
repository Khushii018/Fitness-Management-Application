import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const TabSelector = ({
  tabs = [],
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => onTabPress(tab)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.text,
                isActive && styles.activeText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EAF0FF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
  },

  text: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '600',
  },

  activeText: {
    color: '#4169D8',
    fontWeight: '700',
  },
});

export default TabSelector;
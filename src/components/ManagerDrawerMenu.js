
import React, {useEffect, useRef} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const {width} = Dimensions.get('window');

const DRAWER_WIDTH = width * 0.78;

const ManagerDrawerMenu = ({
  visible,
  onClose,
  navigation,
  activeScreen,
}) => {
  const slideAnim = useRef(
    new Animated.Value(-DRAWER_WIDTH),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const menuItems = [
   
 {
      title: 'Dashboard',
      icon: 'grid-outline',
      screen: 'ManagerDashboard',
    },
    {
      title: 'Create Trainers',
      icon: 'fitness-outline',
      screen: 'CreateTrainer',
    },
    {
      title: 'Create Members',
      icon: 'people-outline',
      screen: 'CreateMember',
    },
  ];

  const handleNavigation = screen => {
    onClose();

    setTimeout(() => {
      navigation.navigate(screen);
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.overlayTouchable}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                {
                  translateX: slideAnim,
                },
              ],
            },
          ]}>
          <View style={styles.drawerHeader}>
            <View style={styles.profileCircle}>
              <Ionicons
                name="person"
                size={27}
                color="#4169D8"
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                Manager
              </Text>

              <Text style={styles.profileRole}>
                Fitness Manager
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}>
              <Ionicons
                name="close"
                size={22}
                color="#333333"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.menuLabel}>
            MANAGER MENU
          </Text>

          <View style={styles.menuContainer}>
            {menuItems.map(item => {
              const isActive =
                activeScreen === item.screen;

              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[
                    styles.menuItem,
                    isActive &&
                      styles.activeMenuItem,
                  ]}
                  onPress={() =>
                    handleNavigation(
                      item.screen,
                    )
                  }
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.iconContainer,
                      isActive &&
                        styles.activeIconContainer,
                    ]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={
                        isActive
                          ? '#4169D8'
                          : '#777777'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.menuText,
                      isActive &&
                        styles.activeMenuText,
                    ]}>
                    {item.title}
                  </Text>

                  {isActive && (
                    <View
                      style={
                        styles.activeIndicator
                      }
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.drawerFooter}>
            <View style={styles.footerDivider} />

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                onClose();
                navigation.navigate(
                  'Welcome',
                );
              }}
              activeOpacity={0.8}>
              <View style={styles.logoutIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#D9534F"
                />
              </View>

              <Text style={styles.logoutText}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },

  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.35)',
  },

  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 14,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 3,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 18,
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  profileName: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },

  profileRole: {
    color: '#777777',
    fontSize: 11,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 18,
  },

  menuLabel: {
    color: '#999999',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 8,
    marginBottom: 8,
  },

  menuContainer: {
    paddingBottom: 0,
  },

  menuItem: {
    minHeight: 49,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
    position: 'relative',
  },

  activeMenuItem: {
    backgroundColor: '#EAF0FF',
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  activeIconContainer: {
    backgroundColor: '#FFFFFF',
  },

  menuText: {
    flex: 1,
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  activeMenuText: {
    color: '#4169D8',
    fontWeight: '700',
  },

  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 25,
    borderRadius: 3,
    backgroundColor: '#4169D8',
  },

  drawerFooter: {
    marginTop: 2,
  },

  footerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },

  logoutButton: {
    minHeight: 44,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  logoutText: {
    color: '#D9534F',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ManagerDrawerMenu;

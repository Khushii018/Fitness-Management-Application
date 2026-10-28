import React, {useEffect, useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const DRAWER_WIDTH = width * 0.78;

const MemberDrawerMenu = ({
  visible,
  onClose,
  navigation,
  activeScreen,
}) => {
  const [user, setUser] = useState(null);

  const slideAnim = useRef(
    new Animated.Value(-DRAWER_WIDTH),
  ).current;

  useEffect(() => {
    if (visible) {
      loadUser();

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

  const loadUser = async () => {
    try {
      const currentUser =
        await AsyncStorage.getItem('currentUser');

      if (currentUser) {
        setUser(JSON.parse(currentUser));
      }
    } catch (error) {
      console.log(
        'Error loading current user:',
        error,
      );
    }
  };

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    'Member';

  const userEmail =
    user?.email ||
    'member@example.com';

  const profileImage =
    user?.image ||
    user?.profileImage ||
    user?.photo ||
    user?.avatar ||
    null;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      screen: 'MemberDashboard',
    },
    {
      title: 'My Membership',
      icon: 'card-outline',
      screen: 'MyMembership',
    },
    {
      title: 'Demo',
      icon: 'calendar-outline',
      screen: 'demo',
    },
    {
      title: 'Workout',
      icon: 'barbell-outline',
      screen: 'MemberWorkout',
    },
    {
      title: 'Diet Plan',
      icon: 'nutrition-outline',
      screen: 'MemberDietPlan',
    },
   
    {
      title: 'My Trainer',
      icon: 'person-outline',
      screen: 'MyTrainer',
    },
    {
      title: 'Create Appointments',
      icon: 'calendar-number-outline',
      screen: 'AppointmentsCreate',
    },
    {
      title: 'Settings',
      icon: 'settings-outline',
      screen: 'Settings',
    },
  ];

  const handleNavigation = screen => {
    onClose();

    setTimeout(() => {
      if (navigation && screen) {
        navigation.navigate(screen);
      }
    }, 250);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');

      onClose();

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Welcome'}],
        });
      }, 250);
    } catch (error) {
      console.log(
        'Logout error:',
        error,
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.backdrop}
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
            
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={
              styles.scrollContent
            }>
            <View style={styles.drawerHeader}>
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={styles.profileCircle}
                />
              ) : (
                <View style={styles.profileCircle}>
                  <Ionicons
                    name="person"
                    size={27}
                    color="#4169D8"
                  />
                </View>
              )}

              <View style={styles.profileInfo}>
                <Text
                  style={styles.profileName}
                  numberOfLines={1}>
                  {userName}
                </Text>

                <Text
                  style={styles.profileRole}
                  numberOfLines={1}>
                  Fitness Member
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

            <View style={styles.emailContainer}>
              <Text
                style={styles.emailText}
                numberOfLines={1}>
                {userEmail}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.menuLabel}>
              MEMBER MENU
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
                      ]}
                      numberOfLines={1}>
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

            <View style={styles.footerDivider} />

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
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

            <View style={styles.bottomSpace} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 14,
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  scrollContent: {
    paddingBottom: 30,
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

  emailContainer: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    paddingLeft: 66,
  },

  emailText: {
    color: '#999999',
    fontSize: 10,
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
    paddingBottom: 8,
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

  footerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
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

  bottomSpace: {
    height: 20,
  },
});

export default MemberDrawerMenu;
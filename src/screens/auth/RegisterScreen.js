import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({navigation}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [role, setRole] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const nameRegex =
    /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

  const mobileRegex =
    /^[6-9]\d{9}$/;

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName =
        'Full name is required';
    } else if (
      !nameRegex.test(fullName.trim())
    ) {
      newErrors.fullName =
        'Enter a valid name using letters and spaces only';
    }

    if (!mobile.trim()) {
      newErrors.mobile =
        'Mobile number is required';
    } 
    // else if (
    //   !mobileRegex.test(mobile.trim())
    // ) {
    //   newErrors.mobile =
    //     'Enter a valid 10-digit mobile number';
    // }

    if (!email.trim()) {
      newErrors.email =
        'Email is required';
    } else if (
      !emailRegex.test(
        email.trim(),
      )
    ) {
      newErrors.email =
        'Enter a valid email address';
    }

    if (!password) {
      newErrors.password =
        'Password is required';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        'Please confirm your password';
    } else if (
      confirmPassword !== password
    ) {
      newErrors.confirmPassword =
        'Passwords do not match';
    }

    if (!role) {
      newErrors.role =
        'Please select your role';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleRoleSelect = selectedRole => {
    setRole(selectedRole);

    if (errors.role) {
      setErrors({
        ...errors,
        role: '',
      });
    }
  };

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    let previousUsersValue = null;
    let saveAttempted = false;

    try {
      const normalizedEmail =
        email.trim().toLowerCase();

      previousUsersValue =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      let users = [];

      if (previousUsersValue) {
        const parsedUsers =
          JSON.parse(previousUsersValue);

        if (Array.isArray(parsedUsers)) {
          users = parsedUsers;
        } else {
          throw new Error(
            'Invalid registered users data',
          );
        }
      }

      const existingUser =
        users.find(
          user =>
            String(
              user?.email || '',
            ).toLowerCase() ===
            normalizedEmail,
        );

      if (existingUser) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists.',
        );
        return;
      }

      const userId =
        generateUserId();

      const userData = {
        id: userId,

        fullName:
          fullName.trim(),

        mobile:
          mobile.trim(),

        email:
          normalizedEmail,

        password:
          password,

        role:
          role,

        ...(role === 'manager' && {
          managerId: userId,
        }),

        ...(role === 'trainer' && {
          trainerId: userId,
        }),
      };

      const updatedUsers = [
        ...users,
        userData,
      ];

      const updatedUsersString =
        JSON.stringify(updatedUsers);

      saveAttempted = true;

      await AsyncStorage.setItem(
        'registeredUsers',
        updatedUsersString,
      );

      const savedUsersValue =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      if (
        savedUsersValue !==
        updatedUsersString
      ) {
        throw new Error(
          'User data could not be verified after saving',
        );
      }

      Alert.alert(
        'Success',
        'Account created successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.replace(
                'Login',
              ),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Error saving user:',
        error,
      );

      if (saveAttempted) {
        try {
          if (
            previousUsersValue === null
          ) {
            await AsyncStorage.removeItem(
              'registeredUsers',
            );
          } else {
            await AsyncStorage.setItem(
              'registeredUsers',
              previousUsersValue,
            );
          }
        } catch (rollbackError) {
          console.log(
            'Error rolling back user data:',
            rollbackError,
          );
        }
      }

      Alert.alert(
        'Error',
        'Unable to create account. The account was not saved. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>

        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          showsVerticalScrollIndicator={
            false
          }>

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }>

            <Ionicons
              name="arrow-back"
              size={24}
              color="#333333"
            />
          </TouchableOpacity>

          <View
            style={styles.header}>

            <View
              style={
                styles.logoCircle
              }>

              <Ionicons
                name="barbell-outline"
                size={38}
                color="#4169D8"
              />
            </View>

            <Text
              style={styles.title}>
              Create Account
            </Text>

            <Text
              style={styles.subtitle}>
              Create your account and start your
              fitness journey.
            </Text>
          </View>

          <View
            style={styles.formCard}>

            <Text
              style={styles.label}>
              Full Name
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.fullName &&
                  styles.inputError,
              ]}>

              <Ionicons
                name="person-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);

                  if (
                    errors.fullName
                  ) {
                    setErrors({
                      ...errors,
                      fullName: '',
                    });
                  }
                }}
                autoCapitalize="words"
              />
            </View>

            {errors.fullName ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.fullName}
              </Text>
            ) : null}

            <Text
              style={styles.label}>
              Mobile Number
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.mobile &&
                  styles.inputError,
              ]}>

              <Ionicons
                name="call-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#999999"
                value={mobile}
                onChangeText={text => {
                  const numbersOnly =
                    text.replace(
                      /[^0-9]/g,
                      '',
                    );

                  setMobile(
                    numbersOnly,
                  );

                  if (
                    errors.mobile
                  ) {
                    setErrors({
                      ...errors,
                      mobile: '',
                    });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {errors.mobile ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.mobile}
              </Text>
            ) : null}

            <Text
              style={styles.label}>
              Email
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.email &&
                  styles.inputError,
              ]}>

              <Ionicons
                name="mail-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={text => {
                  setEmail(text);

                  if (
                    errors.email
                  ) {
                    setErrors({
                      ...errors,
                      email: '',
                    });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {errors.email ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.email}
              </Text>
            ) : null}

            <Text
              style={styles.label}>
              Password
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.password &&
                  styles.inputError,
              ]}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={text => {
                  setPassword(text);

                  if (
                    errors.password
                  ) {
                    setErrors({
                      ...errors,
                      password: '',
                    });
                  }
                }}
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }>

                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={20}
                  color="#777777"
                />
              </TouchableOpacity>
            </View>

            {errors.password ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.password}
              </Text>
            ) : null}

            <Text
              style={styles.label}>
              Confirm Password
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.confirmPassword &&
                  styles.inputError,
              ]}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#999999"
                value={
                  confirmPassword
                }
                onChangeText={text => {
                  setConfirmPassword(
                    text,
                  );

                  if (
                    errors.confirmPassword
                  ) {
                    setErrors({
                      ...errors,
                      confirmPassword:
                        '',
                    });
                  }
                }}
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }>

                <Ionicons
                  name={
                    showConfirmPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={20}
                  color="#777777"
                />
              </TouchableOpacity>
            </View>

            {errors.confirmPassword ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.confirmPassword}
              </Text>
            ) : null}

            <Text
              style={styles.label}>
              Select Role
            </Text>

            <View
              style={
                styles.roleContainer
              }>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role ===
                    'member' &&
                    styles.selectedRole,
                ]}
                onPress={() =>
                  handleRoleSelect(
                    'member',
                  )
                }>

                <Ionicons
                  name="person-outline"
                  size={22}
                  color={
                    role ===
                    'member'
                      ? '#FFFFFF'
                      : '#4169D8'
                  }
                />

                <Text
                  style={[
                    styles.roleText,
                    role ===
                      'member' &&
                      styles.selectedRoleText,
                  ]}>
                  Member
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role ===
                    'trainer' &&
                    styles.selectedRole,
                ]}
                onPress={() =>
                  handleRoleSelect(
                    'trainer',
                  )
                }>

                <Ionicons
                  name="fitness-outline"
                  size={22}
                  color={
                    role ===
                    'trainer'
                      ? '#FFFFFF'
                      : '#4169D8'
                  }
                />

                <Text
                  style={[
                    styles.roleText,
                    role ===
                      'trainer' &&
                      styles.selectedRoleText,
                  ]}>
                  Trainer
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.managerRoleButton,
                role ===
                  'manager' &&
                  styles.selectedRole,
              ]}
              onPress={() =>
                handleRoleSelect(
                  'manager',
                )
              }>

              <Ionicons
                name="business-outline"
                size={22}
                color={
                  role ===
                  'manager'
                    ? '#FFFFFF'
                    : '#4169D8'
                }
              />

              <Text
                style={[
                  styles.roleText,
                  role ===
                    'manager' &&
                    styles.selectedRoleText,
                ]}>
                Gym Manager
              </Text>
            </TouchableOpacity>

            {errors.role ? (
              <Text
                style={
                  styles.errorText
                }>
                {errors.role}
              </Text>
            ) : null}

            <TouchableOpacity
              style={
                styles.registerButton
              }
              onPress={
                handleRegister
              }>

              <Text
                style={
                  styles.registerButtonText
                }>
                Create Account
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.loginContainer
            }>

            <Text
              style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Login',
                )
              }>

              <Text
                style={
                  styles.loginLink
                }>
                Login
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  logoCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    color: '#333333',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 7,
  },

  subtitle: {
    color: '#707070',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  label: {
    color: '#3D3D3D',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 5,
  },

  inputContainer: {
    height: 47,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    paddingHorizontal: 13,
    marginBottom: 3,
  },

  inputError: {
    borderColor: '#E53935',
  },

  input: {
    flex: 1,
    color: '#333333',
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 0,
  },

  errorText: {
    color: '#E53935',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 6,
    marginLeft: 2,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  roleButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    gap: 8,
  },

  managerRoleButton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    gap: 8,
    marginBottom: 3,
  },

  selectedRole: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  roleText: {
    color: '#4169D8',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedRoleText: {
    color: '#FFFFFF',
  },

  registerButton: {
    height: 48,
    backgroundColor: '#4169D8',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  loginText: {
    color: '#707070',
    fontSize: 13,
  },

  loginLink: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },
});

export default RegisterScreen;
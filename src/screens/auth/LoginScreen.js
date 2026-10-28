import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useDispatch} from 'react-redux';

import {login} from '../../redux/slices/authSlice';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [storedUserData, setStoredUser] = useState([]);

  useEffect(() => {
    storedUser();
  }, []);

  // Get registered users from AsyncStorage
  const storedUser = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('registeredUsers');

      if (storedUserData) {
        const users = JSON.parse(storedUserData);

        setStoredUser(Array.isArray(users) ? users : [users]);
      } else {
        setStoredUser([]);
      }
    } catch (error) {
      console.log('Error getting registered users:', error);
      setStoredUser([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // First validate empty fields
    if (!validateForm()) {
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('registeredUsers');

      // No registered users
      if (!storedUsers) {
        setErrors({
          email: 'No registered account found',
        });

        return;
      }

      const parsedUsers = JSON.parse(storedUsers);

      const users = Array.isArray(parsedUsers)
        ? parsedUsers
        : [parsedUsers];

      const enteredEmail = email.trim().toLowerCase();

      // ---------------------------------------
      // STEP 1: Find user only by email
      // ---------------------------------------
      const userByEmail = users.find(
        user =>
          user &&
          typeof user.email === 'string' &&
          user.email.trim().toLowerCase() === enteredEmail,
      );

      // ---------------------------------------
      // STEP 2: Email does not exist
      // ---------------------------------------
      if (!userByEmail) {
        setErrors({
          email: 'Email is not registered',
        });

        return;
      }

      // ---------------------------------------
      // STEP 3: Email exists, check password
      // ---------------------------------------
      if (
        typeof userByEmail.password !== 'string' ||
        userByEmail.password !== password
      ) {
        setErrors({
          password: 'Incorrect password',
        });

        return;
      }

      // ---------------------------------------
      // STEP 4: Login successful
      // ---------------------------------------

      const memberId =
        userByEmail.memberId ||
        userByEmail.id ||
        userByEmail.email;

      const loggedInUser = {
        ...userByEmail,
        id: userByEmail.id || memberId,
        memberId,
        profileCompleted:
          userByEmail?.profileCompleted === true,
      };

      dispatch(
        login({
          token: null,
          user: loggedInUser,
        }),
      );

      await AsyncStorage.setItem(
        'currentMemberId',
        String(memberId),
      );

      console.log('Login successful:', loggedInUser);

      navigation.replace('OTP', {
        email: userByEmail.email,
        mobile: userByEmail.mobile,
        role: userByEmail.role,
      });
    } catch (error) {
      console.log('Login error:', error);

      setErrors({
        email: 'Unable to login. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#333333"
            />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="barbell-outline"
                size={38}
                color="#4169D8"
              />
            </View>

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login to continue your fitness journey.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>

            {/* ================= EMAIL ================= */}
            <Text style={styles.label}>Email</Text>

            <View
              style={[
                styles.inputContainer,
                errors.email && styles.inputError,
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

                  // Clear only email error
                  if (errors.email) {
                    setErrors(prev => ({
                      ...prev,
                      email: '',
                    }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Email Error */}
            {errors.email ? (
              <Text style={styles.errorText}>
                {errors.email}
              </Text>
            ) : null}


            {/* ================= PASSWORD ================= */}
            <Text style={styles.label}>Password</Text>

            <View
              style={[
                styles.inputContainer,
                errors.password && styles.inputError,
              ]}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={text => {
                  setPassword(text);

                  // Clear only password error
                  if (errors.password) {
                    setErrors(prev => ({
                      ...prev,
                      password: '',
                    }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
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

            {/* Password Error */}
            {errors.password ? (
              <Text style={styles.errorText}>
                {errors.password}
              </Text>
            ) : null}


            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() =>
                navigation.navigate('ForgotPassword')
              }>
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>


            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}>

              <Text style={styles.loginButtonText}>
                Login
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>


          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Register')
              }>
              <Text style={styles.registerLink}>
                Create Account
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
    marginTop: 25,
    marginBottom: 25,
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

  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 5,
  },

  forgotText: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: {
    height: 48,
    backgroundColor: '#4169D8',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  registerText: {
    color: '#707070',
    fontSize: 13,
  },

  registerLink: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },
});

export default LoginScreen;
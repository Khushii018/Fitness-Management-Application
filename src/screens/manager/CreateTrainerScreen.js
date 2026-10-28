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

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  addTrainer,
} from '../../redux/slices/managerSlice';

const CreateTrainerScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const currentUser = useSelector(
    state => state.auth.user,
  );

  const [fullName, setFullName] =
    useState('');

  const [mobile, setMobile] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [errors, setErrors] =
    useState({});

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const nameRegex =
    /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

  

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

    if (!email.trim()) {
      newErrors.email =
        'Email is required';
    } else if (
      !emailRegex.test(
        email.trim().toLowerCase(),
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

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const generateTrainerId = () => {
    return `trainer_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  const handleCreateTrainer = async () => {
    if (isCreating) {
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsCreating(true);

      if (!currentUser) {
        Alert.alert(
          'Session Error',
          'Logged in manager information was not found.',
        );

        return;
      }

      if (currentUser?.role !== 'manager') {
        Alert.alert(
          'Access Denied',
          'Only a manager can create a trainer.',
        );

        return;
      }

      const managerId =
        currentUser?.managerId ||
        currentUser?.id;

      if (!managerId) {
        Alert.alert(
          'Manager Error',
          'Manager ID was not found.',
        );

        return;
      }

      const trainerId =
        generateTrainerId();

      const normalizedEmail =
        email.trim().toLowerCase();

      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      let users = [];

      if (storedUsers) {
        try {
          const parsedUsers =
            JSON.parse(storedUsers);

          users = Array.isArray(
            parsedUsers,
          )
            ? parsedUsers
            : [];
        } catch (error) {
          users = [];
        }
      }

      const existingUser =
        users.find(
          user =>
            String(
              user?.email || '',
            )
              .trim()
              .toLowerCase() ===
            normalizedEmail,
        );

      if (existingUser) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists.',
        );

        return;
      }

      const trainerData = {
        id: trainerId,

        trainerId: trainerId,

        managerId: String(
          managerId,
        ),

        fullName:
          fullName.trim(),

        mobile:
          mobile.trim(),

        email:
          normalizedEmail,

        password:
          password,

        role:
          'trainer',

        createdBy:
          'manager',

        createdById:
          String(managerId),

        createdAt:
          new Date().toISOString(),
      };

      const updatedUsers = [
        ...users,
        trainerData,
      ];

      await AsyncStorage.setItem(
        'registeredUsers',
        JSON.stringify(updatedUsers),
      );

      dispatch(
        addTrainer(trainerData),
      );


      Alert.alert(
        'Trainer Created',
        `${trainerData.fullName} has been created successfully.`,
        [
          {
            text: 'OK',

            onPress: () =>
              navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Create trainer error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to create trainer. Please try again.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}>

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
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
            activeOpacity={0.8}>

            <Ionicons
              name="arrow-back"
              size={23}
              color="#111111"
            />

          </TouchableOpacity>

          <View style={styles.header}>

            <View
              style={
                styles.logoCircle
              }>

              <Ionicons
                name="fitness-outline"
                size={34}
                color="#4169D8"
              />

            </View>

            <Text style={styles.title}>
              Create Trainer
            </Text>

            <Text
              style={styles.subtitle}>
              Create a trainer account
              from the manager dashboard.
            </Text>

          </View>

          <View
            style={
              styles.trainerBadge
            }>

            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#4169D8"
            />

            <Text
              style={
                styles.trainerBadgeText
              }>
              Trainer account
            </Text>

          </View>

          <View
            style={styles.formCard}>

            <Text style={styles.label}>
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
                placeholder="Enter trainer name"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  clearError(
                    'fullName',
                  );
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

            <Text style={styles.label}>
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

                  clearError(
                    'mobile',
                  );
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

            <Text style={styles.label}>
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
                placeholder="Enter trainer email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearError('email');
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

            <Text style={styles.label}>
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
                placeholder="Create password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={text => {
                  setPassword(text);

                  clearError(
                    'password',
                  );
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
                }
                activeOpacity={0.8}>

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

            <Text style={styles.label}>
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
                placeholder="Confirm password"
                placeholderTextColor="#999999"
                value={
                  confirmPassword
                }
                onChangeText={text => {
                  setConfirmPassword(
                    text,
                  );

                  clearError(
                    'confirmPassword',
                  );
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
                }
                activeOpacity={0.8}>

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
                {
                  errors.confirmPassword
                }
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.createButton,
                isCreating &&
                  styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={
                handleCreateTrainer
              }
              disabled={isCreating}>

              <Text
                style={
                  styles.createButtonText
                }>
                {isCreating
                  ? 'Creating...'
                  : 'Create Trainer'}
              </Text>

              {!isCreating ? (
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                />
              ) : null}

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
    paddingBottom: 30,
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
    marginTop: 12,
    marginBottom: 18,
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
    color: '#111111',
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

  trainerBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 18,
    gap: 7,
  },

  trainerBadgeText: {
    color: '#4169D8',
    fontSize: 12,
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 20,
    elevation: 3,
    shadowColor: '#000000',
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

  createButton: {
    height: 49,
    backgroundColor: '#4169D8',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateTrainerScreen;
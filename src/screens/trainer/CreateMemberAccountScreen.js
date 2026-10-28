import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useSelector, useDispatch} from 'react-redux';

import {setMembers} from '../../redux/slices/trainerSlice';

const CreateMemberAccountScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const myMembers = useSelector(
    state => state.trainer?.members || [],
  );

  const currentTrainer = useSelector(
    state => state.auth?.user || null,
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const getCurrentTrainerId = () => {
    return (
      currentTrainer?.trainerId ||
      currentTrainer?.id ||
      currentTrainer?.userId ||
      null
    );
  };

  const getCurrentTrainerEmail = () => {
    return (
      currentTrainer?.email
        ?.trim()
        .toLowerCase() || ''
    );
  };

  const getCurrentTrainerName = () => {
    return (
      currentTrainer?.fullName ||
      currentTrainer?.name ||
      'Trainer'
    );
  };

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = fullName.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedMobile =
      mobile.trim();

    if (!trimmedName) {
      newErrors.fullName =
        'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.fullName =
        'Enter a valid full name';
    }

    if (!trimmedEmail) {
      newErrors.email =
        'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      newErrors.email =
        'Enter a valid email address';
    }

    if (!trimmedMobile) {
      newErrors.mobile =
        'Mobile number is required';
    } else if (
      !/^[0-9]{10}$/.test(
        trimmedMobile,
      )
    ) {
      newErrors.mobile =
        'Enter a valid 10 digit mobile number';
    }

    if (!password) {
      newErrors.password =
        'Password is required';
    } else if (password.length < 6) {
      newErrors.password =
        'Password must contain at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        'Please confirm the password';
    } else if (
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const trainerId =
        getCurrentTrainerId();

      if (!trainerId) {
        Alert.alert(
          'Trainer Not Found',
          'Please log in with a trainer account before creating a member account.',
        );

        return;
      }

      const trainerIdString =
        String(trainerId);

      const trainerEmail =
        getCurrentTrainerEmail();

      const trainerName =
        getCurrentTrainerName();

      const storedUsers =
        await AsyncStorage.getItem(
          'registeredUsers',
        );

      let users = [];

      if (storedUsers) {
        try {
          const parsedUsers =
            JSON.parse(storedUsers);

          users = Array.isArray(parsedUsers)
            ? parsedUsers
            : [parsedUsers];
        } catch (error) {
          users = [];
        }
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const normalizedMobile =
        mobile.trim();

      const emailExists = users.some(
        user =>
          user?.email
            ?.trim()
            .toLowerCase() ===
          normalizedEmail,
      );

      if (emailExists) {
        setErrors(prev => ({
          ...prev,
          email:
            'An account with this email already exists',
        }));

        return;
      }

      const mobileExists = users.some(
        user =>
          user?.mobile &&
          String(user.mobile).trim() ===
            normalizedMobile,
      );

      if (mobileExists) {
        setErrors(prev => ({
          ...prev,
          mobile:
            'An account with this mobile number already exists',
        }));

        return;
      }

      const memberId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      const newUser = {
        id: memberId,

        memberId: memberId,

        fullName: fullName.trim(),

        name: fullName.trim(),

        email: normalizedEmail,

        mobile: normalizedMobile,

        password: password,

        role: 'member',

        trainerId: trainerIdString,

        trainerIds: [
          trainerIdString,
        ],

        trainerEmail:
          trainerEmail,

        trainerEmails:
          trainerEmail
            ? [trainerEmail]
            : [],

        trainers: [
          {
            id: trainerIdString,
            email: trainerEmail,
            name: trainerName,
          },
        ],

        createdByTrainerId:
          trainerIdString,

        createdByTrainerEmail:
          trainerEmail,

        createdAt:
          new Date().toISOString(),
      };

      const updatedUsers = [
        ...users,
        newUser,
      ];

      await AsyncStorage.setItem(
        'registeredUsers',
        JSON.stringify(updatedUsers),
      );

      const newMember = {
        id: memberId,

        memberId: memberId,

        name: fullName.trim(),

        fullName: fullName.trim(),

        email: normalizedEmail,

        mobile: normalizedMobile,

        status: 'Active',

        weight: 'Not added',

        goal: 'Not selected',

        trainerId: trainerIdString,

        trainerIds: [
          trainerIdString,
        ],

        trainerEmail:
          trainerEmail,

        trainerEmails:
          trainerEmail
            ? [trainerEmail]
            : [],

        createdByTrainerId:
          trainerIdString,

        createdAt:
          new Date().toISOString(),
      };

      const existingMemberIndex =
        myMembers.findIndex(
          member =>
            String(
              member?.id ||
                member?.memberId ||
                '',
            ) ===
            String(memberId),
        );

      let updatedMembers;

      if (existingMemberIndex >= 0) {
        updatedMembers =
          myMembers.map(
            (member, index) =>
              index ===
              existingMemberIndex
                ? {
                    ...member,
                    ...newMember,
                  }
                : member,
          );
      } else {
        updatedMembers = [
          ...myMembers,
          newMember,
        ];
      }

      dispatch(
        setMembers(updatedMembers),
      );

      Alert.alert(
        'Account Created',
        `${fullName.trim()}'s member account has been created successfully.`,
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
        'Error creating member account:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to create the member account. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled">

            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  navigation.goBack()
                }
                activeOpacity={0.8}>
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#333333"
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerTextContainer
                }>
                <Text style={styles.title}>
                  Create Member Account
                </Text>

                <Text
                  style={styles.subtitle}>
                  Create an account for a new
                  member
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={23}
                  color="#4169D8"
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  New Member
                </Text>

                <Text style={styles.infoText}>
                  The member will be able to log
                  in using the email and password
                  you create here.
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <View style={styles.inputGroup}>
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
                    size={19}
                    color="#777777"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor="#999999"
                    value={fullName}
                    onChangeText={text => {
                      setFullName(text);

                      if (
                        errors.fullName
                      ) {
                        setErrors(prev => ({
                          ...prev,
                          fullName: '',
                        }));
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
              </View>

              <View style={styles.inputGroup}>
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
                    size={19}
                    color="#777777"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={text => {
                      setEmail(text);

                      if (
                        errors.email
                      ) {
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

                {errors.email ? (
                  <Text
                    style={
                      styles.errorText
                    }>
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
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
                    size={19}
                    color="#777777"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#999999"
                    value={mobile}
                    onChangeText={text => {
                      const number =
                        text.replace(
                          /[^0-9]/g,
                          '',
                        );

                      setMobile(
                        number.slice(
                          0,
                          10,
                        ),
                      );

                      if (
                        errors.mobile
                      ) {
                        setErrors(prev => ({
                          ...prev,
                          mobile: '',
                        }));
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
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  styles.accountSectionTitle,
                ]}>
                Account Information
              </Text>

              <View style={styles.inputGroup}>
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
                    size={19}
                    color="#777777"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Create password"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);

                      if (
                        errors.password
                      ) {
                        setErrors(prev => ({
                          ...prev,
                          password: '',
                        }));
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
                    }
                    activeOpacity={0.8}>
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={19}
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
              </View>

              <View style={styles.inputGroup}>
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
                    size={19}
                    color="#777777"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#999999"
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(
                        text,
                      );

                      if (
                        errors.confirmPassword
                      ) {
                        setErrors(prev => ({
                          ...prev,
                          confirmPassword:
                            '',
                        }));
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
                    }
                    activeOpacity={0.8}>
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={19}
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
              </View>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }>
                Create Member Account
              </Text>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
              The member account will be
              created with the Member role.
            </Text>
          </ScrollView>
        </View>
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

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: '#333333',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 3,
  },

  subtitle: {
    color: '#777777',
    fontSize: 11,
  },

  infoCard: {
    backgroundColor: '#EAF0FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  infoText: {
    color: '#666666',
    fontSize: 10,
    lineHeight: 15,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    padding: 16,
  },

  sectionTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },

  accountSectionTitle: {
    marginTop: 8,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    color: '#444444',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 7,
  },

  inputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  inputError: {
    borderColor: '#D93025',
  },

  input: {
    flex: 1,
    color: '#333333',
    fontSize: 13,
    marginLeft: 9,
    paddingVertical: 0,
  },

  errorText: {
    color: '#D93025',
    fontSize: 10,
    marginTop: 5,
  },

  createButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4169D8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7,
  },

  bottomText: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 15,
  },
});

export default CreateMemberAccountScreen;
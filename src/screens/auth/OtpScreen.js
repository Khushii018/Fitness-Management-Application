import React, {useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useDispatch, useSelector} from 'react-redux';

import {login} from '../../redux/slices/authSlice';

const OTPScreen = ({navigation, route}) => {
  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
  ]);

  const inputRefs = useRef([]);

  const dispatch = useDispatch();

  const authUser = useSelector(
    state => state.auth?.user,
  );

  const generateToken = () => {
    return (
      Math.random().toString(36).substring(2) +
      Date.now().toString(36)
    );
  };

  const handleOtpChange = (text, index) => {
    const number = text.replace(
      /[^0-9]/g,
      '',
    );

    const newOtp = [...otp];
    newOtp[index] = number;

    setOtp(newOtp);

    if (number && index < 3) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyPress = (
    {nativeEvent},
    index,
  ) => {
    if (
      nativeEvent.key === 'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the 4-digit OTP.',
      );

      return;
    }

    if (enteredOtp === '1234') {
      try {
        const token = generateToken();

        if (!authUser) {
          Alert.alert(
            'Error',
            'User information not found.',
          );

          return;
        }

        await AsyncStorage.setItem(
          'authToken',
          token,
        );

        await AsyncStorage.setItem(
          'isLoggedIn',
          'true',
        );

        dispatch(
          login({
            token: token,
            user: authUser,
          }),
        );

        navigation.replace(
          'Authentication',
          {
            role: authUser.role,
            email: authUser.email,
            mobile: authUser.mobile,
          },
        );
      } catch (error) {
        console.log(
          'Error creating login session:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to complete login.',
        );
      }
    } else {
      Alert.alert(
        'Invalid OTP',
        'The OTP you entered is incorrect.',
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
            style={styles.backButton}
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
                name="shield-checkmark-outline"
                size={38}
                color="#4169D8"
              />

            </View>

            <Text
              style={styles.title}>
              Enter OTP
            </Text>

            <Text
              style={styles.subtitle}>
              Enter the 4-digit OTP sent to your
              registered mobile number.
            </Text>

          </View>

          <View
            style={styles.formCard}>

            <Text
              style={styles.otpLabel}>
              Verification Code
            </Text>

            <View
              style={
                styles.otpContainer
              }>

              {otp.map(
                (value, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      inputRefs.current[
                        index
                      ] = ref;
                    }}
                    style={
                      styles.otpInput
                    }
                    value={value}
                    onChangeText={text =>
                      handleOtpChange(
                        text,
                        index,
                      )
                    }
                    onKeyPress={event =>
                      handleKeyPress(
                        event,
                        index,
                      )
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ),
              )}

            </View>

            <TouchableOpacity
              style={
                styles.verifyButton
              }
              onPress={
                handleVerify
              }>

              <Text
                style={
                  styles.verifyButtonText
                }>
                Verify
              </Text>

              <Ionicons
                name="checkmark"
                size={20}
                color="#FFFFFF"
              />

            </TouchableOpacity>

          </View>

          <View
            style={
              styles.resendContainer
            }>

            <Text
              style={
                styles.resendText
              }>
              Didn't receive the OTP?
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'OTP Sent',
                  'A new OTP has been sent.',
                );
              }}>

              <Text
                style={
                  styles.resendLink
                }>
                Resend OTP
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

  otpLabel: {
    color: '#3D3D3D',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 20,
  },

  otpInput: {
    width: 55,
    height: 55,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 9,
    color: '#333333',
    fontSize: 20,
    fontWeight: '600',
  },

  verifyButton: {
    height: 48,
    backgroundColor: '#4169D8',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  resendText: {
    color: '#707070',
    fontSize: 13,
  },

  resendLink: {
    color: '#4169D8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },
});

export default OTPScreen;
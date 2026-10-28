import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const StepIndicator = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({length: totalSteps}).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.circle,
                (isActive || isCompleted) && styles.activeCircle,
              ]}>
              <Text
                style={[
                  styles.number,
                  (isActive || isCompleted) && styles.activeNumber,
                ]}>
                {step}
              </Text>
            </View>

            {step < totalSteps && (
              <View
                style={[
                  styles.line,
                  isCompleted && styles.activeLine,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DDE3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeCircle: {
    backgroundColor: '#4169D8',
    borderColor: '#4169D8',
  },

  number: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '700',
  },

  activeNumber: {
    color: '#FFFFFF',
  },

  line: {
    width: 35,
    height: 2,
    backgroundColor: '#D9DDE3',
  },

  activeLine: {
    backgroundColor: '#4169D8',
  },
});

export default StepIndicator;
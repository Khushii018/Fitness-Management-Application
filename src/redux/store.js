import {configureStore} from '@reduxjs/toolkit';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  persistStore,
  persistReducer,
} from 'redux-persist';

import authReducer from './slices/authSlice';
import memberReducer from './slices/memberSlice';
import trainerReducer from './slices/trainerSlice';
import managerReducer from './slices/managerSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: [
    'isLoggedIn',
    'token',
    'user',
  ],
};

const memberPersistConfig = {
  key: 'member',
  storage: AsyncStorage,
  whitelist: [
    'profile',
    'membership',
    'workoutPlans',
    'appointments',
    'dietPlans',
    'attendance',
    'workoutHistory',
  ],
};

const trainerPersistConfig = {
  key: 'trainer',
  storage: AsyncStorage,
  whitelist: [
    'members',
    'appointments',
    'workoutPlans',
    'fitnessAssessments',
    'dietPlans',
  ],
};

const managerPersistConfig = {
  key: 'manager',
  storage: AsyncStorage,
  whitelist: [
    'trainers',
    'members',
  ],
};

const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authReducer,
);

const persistedMemberReducer = persistReducer(
  memberPersistConfig,
  memberReducer,
);

const persistedTrainerReducer = persistReducer(
  trainerPersistConfig,
  trainerReducer,
);

const persistedManagerReducer = persistReducer(
  managerPersistConfig,
  managerReducer,
);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    member: persistedMemberReducer,
    trainer: persistedTrainerReducer,
    manager: persistedManagerReducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
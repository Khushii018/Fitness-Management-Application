import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  membership: null,
  workoutPlans: [],
  appointments: [],
  dietPlans: [],
  attendance: [],
  workoutHistory: [],
};

const memberSlice = createSlice({
  name: 'member',

  initialState,

  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload || null;
    },

    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      }
    },

    setMembership: (state, action) => {
      state.membership = action.payload || null;
    },

    setWorkoutPlans: (state, action) => {
      state.workoutPlans = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addWorkoutPlan: (state, action) => {
      if (action.payload) {
        state.workoutPlans.push(action.payload);
      }
    },

    updateWorkoutPlan: (state, action) => {
      const updatedPlan = action.payload;

      const index = state.workoutPlans.findIndex(
        plan =>
          String(plan.id) === String(updatedPlan.id),
      );

      if (index !== -1) {
        state.workoutPlans[index] = {
          ...state.workoutPlans[index],
          ...updatedPlan,
        };
      }
    },

    setAppointments: (state, action) => {
      state.appointments = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addAppointment: (state, action) => {
      if (action.payload) {
        state.appointments.push(action.payload);
      }
    },

    updateAppointment: (state, action) => {
      const updatedAppointment = action.payload;

      const index = state.appointments.findIndex(
        appointment =>
          String(appointment.id) ===
          String(updatedAppointment.id),
      );

      if (index !== -1) {
        state.appointments[index] = {
          ...state.appointments[index],
          ...updatedAppointment,
        };
      }
    },

    setDietPlans: (state, action) => {
      state.dietPlans = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addDietPlan: (state, action) => {
      if (action.payload) {
        state.dietPlans.push(action.payload);
      }
    },

    updateDietPlan: (state, action) => {
      const updatedPlan = action.payload;

      const index = state.dietPlans.findIndex(
        plan =>
          String(plan.id) === String(updatedPlan.id),
      );

      if (index !== -1) {
        state.dietPlans[index] = {
          ...state.dietPlans[index],
          ...updatedPlan,
        };
      }
    },

    setAttendance: (state, action) => {
      state.attendance = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addAttendance: (state, action) => {
      if (action.payload) {
        state.attendance.push(action.payload);
      }
    },

    updateAttendance: (state, action) => {
      const updatedAttendance = action.payload;

      const index = state.attendance.findIndex(
        attendance =>
          String(attendance.id) ===
          String(updatedAttendance.id),
      );

      if (index !== -1) {
        state.attendance[index] = {
          ...state.attendance[index],
          ...updatedAttendance,
        };
      }
    },

    setWorkoutHistory: (state, action) => {
      state.workoutHistory = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addWorkoutHistory: (state, action) => {
      if (action.payload) {
        state.workoutHistory.push(action.payload);
      }
    },

    removeWorkoutHistory: (state, action) => {
      state.workoutHistory = state.workoutHistory.filter(
        item =>
          String(item.id) !== String(action.payload),
      );
    },

    clearMemberData: state => {
      state.profile = null;
      state.membership = null;
      state.workoutPlans = [];
      state.appointments = [];
      state.dietPlans = [];
      state.attendance = [];
      state.workoutHistory = [];
    },
  },
});

export const {
  setProfile,
  updateProfile,

  setMembership,

  setWorkoutPlans,
  addWorkoutPlan,
  updateWorkoutPlan,

  setAppointments,
  addAppointment,
  updateAppointment,

  setDietPlans,
  addDietPlan,
  updateDietPlan,

  setAttendance,
  addAttendance,
  updateAttendance,

  setWorkoutHistory,
  addWorkoutHistory,
  removeWorkoutHistory,

  clearMemberData,
} = memberSlice.actions;

export default memberSlice.reducer;
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  members: [],
  appointments: [],
  workoutPlans: [],
  fitnessAssessments: [],
  dietPlans: [],
};

const trainerSlice = createSlice({
  name: 'trainer',

  initialState,

  reducers: {
    setMembers: (state, action) => {
      state.members = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addMember: (state, action) => {
      if (action.payload) {
        state.members.push(action.payload);
      }
    },

    updateMember: (state, action) => {
      const updatedMember = action.payload;

      const index = state.members.findIndex(
        member =>
          String(member.id) === String(updatedMember.id),
      );

      if (index !== -1) {
        state.members[index] = {
          ...state.members[index],
          ...updatedMember,
        };
      }
    },

    removeMember: (state, action) => {
      state.members = state.members.filter(
        member =>
          String(member.id) !== String(action.payload),
      );
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

    removeAppointment: (state, action) => {
      state.appointments = state.appointments.filter(
        appointment =>
          String(appointment.id) !== String(action.payload),
      );
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

    removeWorkoutPlan: (state, action) => {
      state.workoutPlans = state.workoutPlans.filter(
        plan =>
          String(plan.id) !== String(action.payload),
      );
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

    removeDietPlan: (state, action) => {
      state.dietPlans = state.dietPlans.filter(
        plan =>
          String(plan.id) !== String(action.payload),
      );
    },

    setFitnessAssessments: (state, action) => {
      state.fitnessAssessments = Array.isArray(
        action.payload,
      )
        ? action.payload
        : [];
    },

    addFitnessAssessment: (state, action) => {
      if (action.payload) {
        state.fitnessAssessments.push(action.payload);
      }
    },

    updateFitnessAssessment: (state, action) => {
      const updatedAssessment = action.payload;

      const index = state.fitnessAssessments.findIndex(
        assessment =>
          String(assessment.id) ===
          String(updatedAssessment.id),
      );

      if (index !== -1) {
        state.fitnessAssessments[index] = {
          ...state.fitnessAssessments[index],
          ...updatedAssessment,
        };
      }
    },

    removeFitnessAssessment: (state, action) => {
      state.fitnessAssessments =
        state.fitnessAssessments.filter(
          assessment =>
            String(assessment.id) !==
            String(action.payload),
        );
    },

    clearTrainerData: state => {
      state.members = [];
      state.appointments = [];
      state.workoutPlans = [];
      state.fitnessAssessments = [];
      state.dietPlans = [];
    },
  },
});

export const {
  setMembers,
  addMember,
  updateMember,
  removeMember,

  setAppointments,
  addAppointment,
  updateAppointment,
  removeAppointment,

  setWorkoutPlans,
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan,

  setDietPlans,
  addDietPlan,
  updateDietPlan,
  removeDietPlan,

  setFitnessAssessments,
  addFitnessAssessment,
  updateFitnessAssessment,
  removeFitnessAssessment,

  clearTrainerData,
} = trainerSlice.actions;

export default trainerSlice.reducer;
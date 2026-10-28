import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  trainers: [],
  members: [],
};

const managerSlice = createSlice({
  name: 'manager',

  initialState,

  reducers: {
    setTrainers: (state, action) => {
      state.trainers = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addTrainer: (state, action) => {
      if (!action.payload) {
        return;
      }

      state.trainers.push(action.payload);
    },

    setMembers: (state, action) => {
      state.members = Array.isArray(action.payload)
        ? action.payload.map(member => {
            let trainerId = null;

            if (member?.trainerId) {
              trainerId = String(member.trainerId);
            } else if (
              Array.isArray(member?.trainerIds) &&
              member.trainerIds.length > 0
            ) {
              trainerId = String(member.trainerIds[0]);
            }

            return {
              ...member,
              trainerId,
              trainerIds: trainerId
                ? [trainerId]
                : [],
            };
          })
        : [];
    },

    addMember: (state, action) => {
      if (!action.payload) {
        return;
      }

      const member = action.payload;

      let trainerId = null;

      if (member?.trainerId) {
        trainerId = String(member.trainerId);
      } else if (
        Array.isArray(member?.trainerIds) &&
        member.trainerIds.length > 0
      ) {
        trainerId = String(member.trainerIds[0]);
      }

      state.members.push({
        ...member,
        trainerId,
        trainerIds: trainerId
          ? [trainerId]
          : [],
      });
    },

    assignMemberToTrainer: (state, action) => {
      const {
        memberId,
        trainerId,
      } = action.payload || {};

      if (!memberId || !trainerId) {
        return;
      }

      const memberIndex =
        state.members.findIndex(
          member =>
            String(member?.id) ===
            String(memberId),
        );

      if (memberIndex === -1) {
        return;
      }

      const normalizedTrainerId =
        String(trainerId);

      const member =
        state.members[memberIndex];

      state.members[memberIndex] = {
        ...member,
        trainerId: normalizedTrainerId,
        trainerIds: [
          normalizedTrainerId,
        ],
      };
    },

    removeMemberFromTrainer: (
      state,
      action,
    ) => {
      const {
        memberId,
        trainerId,
      } = action.payload || {};

      if (!memberId) {
        return;
      }

      const memberIndex =
        state.members.findIndex(
          member =>
            String(member?.id) ===
            String(memberId),
        );

      if (memberIndex === -1) {
        return;
      }

      const member =
        state.members[memberIndex];

      if (
        trainerId &&
        member?.trainerId &&
        String(member.trainerId) !==
          String(trainerId)
      ) {
        return;
      }

      state.members[memberIndex] = {
        ...member,
        trainerId: null,
        trainerIds: [],
      };
    },

    clearManagerData: state => {
      state.trainers = [];
      state.members = [];
    },
  },
});

export const {
  setTrainers,
  addTrainer,
  setMembers,
  addMember,
  assignMemberToTrainer,
  removeMemberFromTrainer,
  clearManagerData,
} = managerSlice.actions;

export default managerSlice.reducer;
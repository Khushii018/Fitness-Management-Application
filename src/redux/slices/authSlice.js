import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    login: (state, action) => {
      const {token, user} = action.payload || {};

      state.isLoggedIn = true;
      state.token = token || null;
      state.user = user || null;
    },

    logout: state => {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
    },

    setUser: (state, action) => {
      state.user = action.payload || null;
    },

    setToken: (state, action) => {
      state.token = action.payload || null;
    },

    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  login,
  logout,
  setUser,
  setToken,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
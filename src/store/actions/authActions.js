import custAxios from '../../configs/axios.config';
import { AUTH_CONSTANTS } from '../constants/authConstants';

// Login Action
export const loginAction = (values) => {
  return async (dispatch) => {
    dispatch({ type: AUTH_CONSTANTS.LOGIN_REQUEST });

    try {
      const response = await custAxios.post('/auth/sign-in/email', values);
      
      if (response.data && (response.data.token || response.data.data)) {

        const data = response.data.data || response.data;
        const { token, user } = data;
        
        if (!token || !user) {
          throw new Error('Invalid response format: missing token or user');
        }

        if (token) {
          sessionStorage.setItem('token', token);
        }
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        dispatch({
          type: AUTH_CONSTANTS.LOGIN_SUCCESS,
          payload: {
            token,
            user,
          },
        });

        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));

        return { success: true, data: response.data, token, user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      dispatch({
        type: AUTH_CONSTANTS.LOGIN_FAILURE,
        payload: error.response?.data?.message || error.message || 'Login failed',
      });
      return { success: false, error: error.response?.data || error.message };
    }
  };
};

// Logout Action
export const logoutAction = () => {
  return async (dispatch) => {
    dispatch({ type: AUTH_CONSTANTS.LOGOUT_REQUEST });

    try {
      // Clear sessionStorage
      const response = await custAxios.post('/auth/sign-out');
      if(response.status){
        
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
  
        dispatch({ type: AUTH_CONSTANTS.LOGOUT_SUCCESS });
        dispatch({ type: AUTH_CONSTANTS.CLEAR_TOKEN });
        dispatch({ type: AUTH_CONSTANTS.CLEAR_USER });
  
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));
      }
      return response.status;
    } catch (error) {
      dispatch({
        type: AUTH_CONSTANTS.LOGOUT_FAILURE,
        payload: error.message || 'Logout failed',
      });
      return { success: false, error: error.message };
    }
  };
};

export const me = () => async (dispatch) => {
  dispatch({
    type: AUTH_CONSTANTS.ME_REQUEST,
  });
  try {
    const res = await custAxios.get("/me");

    if (res?.data?.data) {
      await dispatch({
        type: AUTH_CONSTANTS.ME_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: AUTH_CONSTANTS.ME_FAILURE,
      payload: error?.response?.data?.message || "Server Error",
    });
    return error?.response?.data;
  }
};


// Set Token Action
export const setTokenAction = (token) => {
  return {
    type: AUTH_CONSTANTS.SET_TOKEN,
    payload: token,
  };
};


export const clearTokenAction = () => {
  return {
    type: AUTH_CONSTANTS.CLEAR_TOKEN,
  };
};


export const setUserAction = (user) => {
  return {
    type: AUTH_CONSTANTS.SET_USER,
    payload: user,
  };
};

// Clear User Action
export const clearUserAction = () => {
  return {
    type: AUTH_CONSTANTS.CLEAR_USER,
  };
};

// Change Password — better-auth verifies currentPassword server-side before applying newPassword
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await custAxios.post('/auth/change-password', {
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    return { success: true, data: res?.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message || 'Failed to change password',
    };
  }
};

// Change Email — better-auth sends a confirmation link to newEmail; the address
// only updates once that link is clicked, so this resolving successfully means
// "verification sent", not "email changed yet".
export const changeEmail = async (newEmail) => {
  try {
    const res = await custAxios.post('/auth/change-email', { newEmail });
    return { success: true, data: res?.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message || 'Failed to change email',
    };
  }
};

// Check Auth Action
export const checkAuthAction = () => {
  return async (dispatch) => {
    dispatch({ type: AUTH_CONSTANTS.CHECK_AUTH_REQUEST });

    try {
      const token = sessionStorage.getItem('token');
      const userString = sessionStorage.getItem('user');

      if (token && userString) {
        const user = JSON.parse(userString);
        
        dispatch({
          type: AUTH_CONSTANTS.CHECK_AUTH_SUCCESS,
          payload: {
            token,
            user,
          },
        });

        dispatch(setTokenAction(token));
        dispatch(setUserAction(user));

        return { success: true, isAuthenticated: true };
      } else {
        dispatch({ type: AUTH_CONSTANTS.CHECK_AUTH_FAILURE });
        return { success: false, isAuthenticated: false };
      }
    } catch (error) {
      dispatch({
        type: AUTH_CONSTANTS.CHECK_AUTH_FAILURE,
        payload: error.message || 'Auth check failed',
      });
      return { success: false, isAuthenticated: false };
    }
  };
};


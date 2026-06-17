import custAxios from '../../configs/axios.config';
import { ADMIN_CONSTANTS } from '../constants/adminConstants';

const DASHBOARD_STALE_MS = 5 * 60 * 1000; // 5 minutes

export const dashboard = (force = false) => async (dispatch, getState) => {
  const { dashboardLastFetched } = getState().admin;
  const isFresh = dashboardLastFetched && Date.now() - dashboardLastFetched < DASHBOARD_STALE_MS;
  if (isFresh && !force) return;

  dispatch({
    type: ADMIN_CONSTANTS.DASHBOARD_REQUEST,
  });
  try {
    const res = await custAxios.get("/admin/dashboard");
    if (res?.data?.data) {
      dispatch({
        type: ADMIN_CONSTANTS.DASHBOARD_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.DASHBOARD_FAILURE,
      payload: error?.response?.data?.message || "Server Error",
    });
    return error?.response?.data;
  }
};

export const createMerch = (formData) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.CREATE_MERCH_REQUEST,
  });
  try {
    const res = await custAxios.post('/admin/addMerch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.CREATE_MERCH_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.CREATE_MERCH_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const getMerchs = () => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.GET_MERCHS_REQUEST,
  });
  try {
    const res = await custAxios.get('/public/merchs');
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_MERCHS_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.GET_MERCHS_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const deleteMerch = (id) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.DELETE_MERCH_REQUEST,
  });
  try {
    const res = await custAxios.delete(`/admin/deleteMerch/${id}`);
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.DELETE_MERCH_SUCCESS,
        payload: id,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.DELETE_MERCH_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const updateMerch = (id, formData) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.UPDATE_MERCH_REQUEST,
  });
  try {
    const res = await custAxios.patch(`/admin/updateMerch/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.UPDATE_MERCH_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.UPDATE_MERCH_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const getComics = () => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.GET_COMICS_REQUEST,
  });
  try {
    const res = await custAxios.get('/public/comics');
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_COMICS_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.GET_COMICS_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const getAdminComics = () => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.GET_COMICS_REQUEST,
  });
  try {
    const res = await custAxios.get('/admin/getComics');
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_COMICS_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.GET_COMICS_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const createComic = (formData) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.CREATE_COMIC_REQUEST,
  });
  try {
    const res = await custAxios.post('/admin/addComic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.CREATE_COMIC_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.CREATE_COMIC_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const deleteComic = (id) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.DELETE_COMIC_REQUEST,
  });
  try {
    const res = await custAxios.delete(`/admin/deleteComic/${id}`);
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.DELETE_COMIC_SUCCESS,
        payload: id,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.DELETE_COMIC_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const updateComic = (id, formData) => async (dispatch) => {
  dispatch({
    type: ADMIN_CONSTANTS.UPDATE_COMIC_REQUEST,
  });
  try {
    const res = await custAxios.patch(`/admin/updateComic/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.UPDATE_COMIC_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.UPDATE_COMIC_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const getOrders = () => async (dispatch) => {
  dispatch({ type: ADMIN_CONSTANTS.GET_ORDERS_REQUEST });
  try {
    const res = await custAxios.get('/admin/orders');
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_ORDERS_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.GET_ORDERS_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const getDonations = () => async (dispatch) => {
  dispatch({ type: ADMIN_CONSTANTS.GET_DONATIONS_REQUEST });
  try {
    const res = await custAxios.get('/admin/donations');
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_DONATIONS_SUCCESS,
        payload: res?.data?.data,
      });
    }
    return res?.data;
  } catch (error) {
    dispatch({
      type: ADMIN_CONSTANTS.GET_DONATIONS_FAILURE,
      payload: error?.response?.data?.message || 'Server Error',
    });
    return error?.response?.data;
  }
};

export const updateOrderStatus = (id, status) => async (dispatch) => {
  try {
    const res = await custAxios.patch(`/admin/orders/${id}/status`, { status });
    if (res?.data?.success) {
      dispatch({
        type: ADMIN_CONSTANTS.GET_ORDERS_SUCCESS,
        // Refresh orders after update — we'll refetch from component side
      });
    }
    return res?.data;
  } catch (error) {
    return error?.response?.data;
  }
};

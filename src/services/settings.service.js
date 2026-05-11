import custAxios, { formAxios, publicAxios } from "../configs/axios.config";

const SettingsAPI = {
  get: () => publicAxios.get('/public/settings'),
  update: (id, data) => {
    // We use formAxios here because we're sending FormData for title and logo
    return formAxios.patch(`/admin/settings/${id}`, data);
  }
};

export default SettingsAPI;

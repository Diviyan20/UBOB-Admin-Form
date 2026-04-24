const SERVER_URL =
  "https://wp6gcj3019.execute-api.ap-southeast-5.amazonaws.com";

export const api = {
  login: `${SERVER_URL}/admin/login`,
  logout: `${SERVER_URL}/admin/logout`,
  outlet_info: `${SERVER_URL}/api/outlets`,  
  register_outlet: `${SERVER_URL}/admin/register_outlet`,
  check_auth: `${SERVER_URL}/admin/check-auth`,

  videos: (outletId: string) => `${SERVER_URL}/videos/${outletId}`,
};

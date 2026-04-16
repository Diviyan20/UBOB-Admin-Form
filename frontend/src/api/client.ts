const SERVER_URL =
  "https://wp6gcj3019.execute-api.ap-southeast-5.amazonaws.com";

export const api = {
  login: `${SERVER_URL}/admin/login`,
  logout: `${SERVER_URL}/admin/logout`,
  outletInfo: (outletId: string) => `${SERVER_URL}/outlet_info/${outletId}`,  
  register_outlet: `${SERVER_URL}/api/register_outlet`,
  check_auth: `${SERVER_URL}/admin/check-auth`,

  videos: (outletId: string) => `${SERVER_URL}/videos/${outletId}`,
};

const SERVER_URL =
  "https://wp6gcj3019.execute-api.ap-southeast-5.amazonaws.com";

  const DEVELOPMENT_URL = "https://kcs4utnpog.execute-api.ap-southeast-5.amazonaws.com";

export const api = {
  login: `${DEVELOPMENT_URL}/admin/login`,
  logout: `${DEVELOPMENT_URL}/admin/logout`,
  outlet_info: `${DEVELOPMENT_URL}/api/outlets`,
  outlets:`${DEVELOPMENT_URL}/admin/outlets`,
  register_outlet: `${DEVELOPMENT_URL}/admin/register_outlet`,
  check_auth: `${DEVELOPMENT_URL}/admin/check-auth`,

  videos: (outletId: string) => `${DEVELOPMENT_URL}/videos/${outletId}`,
};

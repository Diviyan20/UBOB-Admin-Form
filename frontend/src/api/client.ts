const SERVER_URL =
  "https://wp6gcj3019.execute-api.ap-southeast-5.amazonaws.com";

  const DEVELOPMENT_URL = "https://kcs4utnpog.execute-api.ap-southeast-5.amazonaws.com";

export const api = {
  // Admin Login, Logout & Authentication
  login: `${DEVELOPMENT_URL}/admin/login`,
  logout: `${DEVELOPMENT_URL}/admin/logout`,
  check_auth: `${DEVELOPMENT_URL}/admin/check-auth`,

  // Outlet Endpoints
  outlet_info: `${DEVELOPMENT_URL}/api/outlets`,
  outlets:`${DEVELOPMENT_URL}/admin/outlets`,
  register_outlet: `${DEVELOPMENT_URL}/admin/register_outlet`,
  outlet_screens: `${DEVELOPMENT_URL}/outlet-screens`,
  outlet_screen: (screenId: string) => `${DEVELOPMENT_URL}/outlet-screens/${screenId}`,

  // Media Library Endpoints
  media_library: `${DEVELOPMENT_URL}/admin/media-library`,
  videos: (outletId: string) => `${DEVELOPMENT_URL}/videos/${outletId}`,
};

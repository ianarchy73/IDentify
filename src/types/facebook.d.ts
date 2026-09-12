interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

interface FacebookProfile {
  id: string;
  name?: string;
  email?: string;
}

interface FacebookSdk {
  init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  getLoginStatus(callback: (response: FacebookLoginResponse) => void): void;
  logout(callback: () => void): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: { scope: string; auth_type?: 'reauthorize' | 'rerequest' },
  ): void;
  api(
    path: string,
    options: { fields: string },
    callback: (profile: FacebookProfile) => void,
  ): void;
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: FacebookSdk;
  }
}

export {};

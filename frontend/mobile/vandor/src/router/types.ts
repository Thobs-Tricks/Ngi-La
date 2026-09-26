export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  MySpaza: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  ChangePassword: undefined;
};

export type MySpazaStackParamList = {
  MySpazaForm: { lat?: number; lng?: number } | undefined;
  MapPicker: { lat?: number; lng?: number } | undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

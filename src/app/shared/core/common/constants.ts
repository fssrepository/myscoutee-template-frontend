export const AUTH_MODES = ['selector', 'firebase'] as const;

export type AuthMode = typeof AUTH_MODES[number];

export const CURRENT_PROFILE_FORM_VERSION = 2;

export const PROFILE_STATUSES = [
  'public',
  'friends only',
  'host only',
  'inactive',
  'blocked',
  'deleted',
  'onboarding'
] as const;

export type ProfileStatus = typeof PROFILE_STATUSES[number];

export const USER_GENDERS = ['woman', 'man'] as const;

export type UserGender = typeof USER_GENDERS[number];

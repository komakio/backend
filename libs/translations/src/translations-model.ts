export interface LanguageCode {
  name: string;
  crowdin_code: string;
  editor_code: string;
  iso_639_1: string;
  iso_639_3: string;
  locale: string;
  android_code: string;
  osx_code: string;
  osx_locale: string;
}

export interface Translation {
  languageCodes: string[];
  BACKEND_NOTIFICATION_REQUEST_STARTED_V1: string;
  BACKEND_NOTIFICATION_REQUEST_ACCEPT_V1: string;
}

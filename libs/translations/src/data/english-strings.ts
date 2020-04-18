import { Translation } from '../translations-model';

export const englishStrings: Translation = {
  BACKEND_NOTIFICATION_REQUEST_STARTED_V1: '{{name}} is in need of your help.',
  BACKEND_NOTIFICATION_REQUEST_ACCEPT_V1: '{{name}} accepted you request.',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_SUBJECT:
    'Good news, {{name}} has agreed to help you out!',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_TITLE: 'Hey {{name}},',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_PARAGRAPH1:
    '{{name}} has agreed to help you out. Give them a call to let them know what you need help with. You can find their contact details below.',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_PARAGRAPH2:
    'Remember to follow our <0>user instructions</0> and avoid direct contact for everyone’s safety.',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_NAME: 'Name: {{name}}',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_PHONE: 'Phone number: {{number}}',
  BACKEND_EMAIL_REQUEST_ACCEPT_V1_SIGNATURE:
    'Have a great day, <br />The Komak Team',
};

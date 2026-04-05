# Firebase Realtime Database security rules

This project now includes Firebase Realtime Database rules in:

- `firebase/database.rules.json`
- `firebase.json`

## What these rules enforce

- `secureauth/users/{uid}`: only the logged-in owner (`auth.uid === uid`) can read/write their profile.
- `secureauth/sessions/{uid}`: only the logged-in owner can read/write their own session record.
- `secureauth/mobileIndex/{mobile}`:
  - public read is enabled to support current mobile-number login lookup flow in the app.
  - write is restricted to the authenticated owner and must match their profile mobile.
- `secureauth/commandHistory` and `secureauth/locationHistory`: authenticated users only.

## Deploy rules

1. Install Firebase CLI (once):
   - `npm i -g firebase-tools`
2. Login:
   - `firebase login`
3. Select your Firebase project:
   - `firebase use --add`
4. Deploy database rules:
   - `firebase deploy --only database`

## Optional hardening

To remove public `mobileIndex` reads, change that rule to `auth != null`, then update app login to use a secure backend lookup instead of direct client read.

# Customer Mobile App

React Native + Expo mobile application.

## Folder Structure

```text
customer/
├── app/                  # Expo Router screens/routes
├── components/           # Reusable UI
├── services/             # Backend/API calls
├── hooks/                # Custom hooks
├── context/              # Global state
├── types/                # TypeScript types
├── constants/            # Constants
├── utils/                # Helper functions
├── storage/              # Local persistence
├── config/               # Configuration
├── assets/               # Images, icons, fonts
│
├── app.json
├── package.json
├── tsconfig.json
└── .env
```

## Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Start with Android:

```bash
npx expo start --android
```

Start with web:

```bash
npx expo start --web
```

Check Expo dependencies:

```bash
npx expo install --check
```

## Testing with Expo Go

```bash
npx expo start
```

Scan the QR code with Expo Go.

## EAS / Android APK

Install EAS CLI:

```bash
npm install --global eas-cli
```

Login:

```bash
eas login
```

Check logged-in account:

```bash
eas whoami
```

Configure EAS:

```bash
eas build:configure
```

Build Android APK:

```bash
eas build --platform android --profile preview
```

Build Android production APK:

```bash
eas build --platform android --profile production-apk
```

Install the latest Android build on an emulator:

```bash
eas build:run -p android --latest
```
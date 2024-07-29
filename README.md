# UsherTally

UsherTally is a real-time people counter application designed to help event organizers monitor and manage attendance effortlessly. With features like real-time updates, easy section management, and secure authentication, UsherTally streamlines the process of keeping track of attendee numbers.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Development](#development)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Updates**: Get live updates on attendee counts using Pusher.
- **Easy Section Management**: Manage seating sections with ease.
- **Secure Authentication**: Ensure data security with robust authentication features.
- **Responsive Design**: Access the application on any device with a responsive UI.
- **User Testimonials**: Built-in section for user feedback and testimonials.

## Tech Stack

- **Frontend**: NextJS, Tailwind CSS, ShadCN
- **Backend**: Node.js, Firestore, MongoDB
- **Real-time Updates**: Pusher
- **Authentication**: Firebase

## Project Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.x or later)
- npm or yarn
- Firebase account
- MongoDB account
- Pusher account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ushertally.git
   cd ushertally
   ```

2. Install dependencies::
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:

   Create a .env.local file in the root of the project and add the following:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   MONGODB_URI=your_mongodb_uri
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open http://localhost:3000 to view the application in the browser.

## Development

### Available Scripts

- `npm run dev` or `yarn dev`: Starts the development server.
- `npm run build` or `yarn build`: Builds the application for production.
- `npm start` or `yarn start`: Starts the production server.
- `npm run lint` or `yarn lint`: Runs ESLint to check for code issues.

### Folder Structure

```
ushertally/
├── public/
│   ├── favicon.ico
│   ├── images/
│   └── ...
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   └── ...
├── .env.local
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── ...
```

- public/: Static files like images and icons.
- src/components/: Reusable components.
- src/pages/: NextJS pages.
- src/styles/: Global and component-specific styles.
- src/utils/: Utility functions.

## Contributing

We welcome contributions to UsherTally! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch:

```
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them:

```
git commit -m "Add new feature"
```

4. Push to your branch:

```
git push origin feature/your-feature-name
```

5. Create a pull request describing your changes.

## License

This project is licensed under the MIT License. See the [License](LICENSE) file for details.

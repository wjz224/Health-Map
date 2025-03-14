# <p align="center">Health-Map</p>

<p align="center">

</p>

## Project Description

Health-Map is a project designed to facilitate the collection and visualization of health-related data on a map. It consists of a backend built with Python (FastAPI) and a mobile frontend developed with React Native. Users can submit data points representing health information, including symptoms and diseases, at specific locations. The application allows users to filter and display this information on a map, providing insights into health trends and potential outbreaks.

## Features

-   **Data Submission**: Users can submit health-related data points, including symptoms, diseases, and location information, via the mobile app.
-   **Data Visualization**: The application visualizes the collected health data on a map, displaying markers for each data point.
-   **Filtering**: Users can filter data points based on symptoms and diseases to identify specific health trends.
-   **Clustering**: The backend clusters data points with similar disease profiles to identify potential outbreaks or health hotspots.
-   **User Authentication**: Implements basic user functionality for data contributions.
-   **Mobile App**: A React Native mobile app for both iOS and Android platforms.
-   **API**: A RESTful API built with FastAPI.

## Table of Contents

-   [Project Description](#project-description)
-   [Features](#features)
-   [Installation and Setup](#installation-and-setup)
-   [Running the Project](#running-the-project)
-   [Dependencies](#dependencies)
-   [Contribution Guide](#contribution-guide)
-   [License](#license)
-   [Contact](#contact)

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd Health-Map
    ```

2.  **Backend Setup:**

    a.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

    b.  Create a virtual environment (optional but recommended):

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    venv\Scripts\activate  # On Windows
    ```

    c.  Install dependencies:

    ```bash
    pip install -r requirements.txt
    pip install cloud-sql-python-connector["pymysql"] SQLAlchemy==2.0.7
    ```

    d.  Set up environment variables. Create a `.env` file in the `backend` directory with the following variables:

    ```
    INSTANCE_CONNECTION_NAME=<your_instance_connection_name>
    DB_USER=<your_db_user>
    DB_PASS=<your_db_password>
    DB_NAME=<your_db_name>
    ```

    Replace the placeholders with your actual database credentials and instance connection name.

3.  **Mobile App Setup:**

    a.  Navigate to the `mobile` directory:

    ```bash
    cd ../mobile
    ```

    b.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Google Maps API Key:**

    a.  Obtain a Google Maps API key and enable the necessary APIs (Maps SDK for Android, Maps SDK for iOS, and Places API).

    b.  In `mobile/app.json`, replace `"AIzaSyBpp_whL-8FTEE0vsGexhJ2zlpG9Ywvi4I"` with your actual API key under `expo` -> `android` -> `config` -> `googleMaps` -> `apiKey`.

## Running the Project

1.  **Backend:**

    a.  Navigate to the `backend` directory.

    b.  Run the FastAPI application:

    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8080
    ```

    This command starts the server, making it accessible at `http://localhost:8080`.

2.  **Mobile App:**

    a.  Navigate to the `mobile` directory.

    b.  Start the Expo development server:

    ```bash
    npm start
    # or
    yarn start
    ```

    This will open a QR code in your terminal. Use the Expo Go app on your mobile device to scan the QR code and run the application. Alternatively, you can run the app in an emulator using `npm run android` or `npm run ios`.

## Dependencies

-   **Backend (Python):**
    -   `fastapi`: Web framework for building APIs.
    -   `uvicorn`: ASGI server for running FastAPI applications.
    -   `python-dotenv`: For loading environment variables from a `.env` file.
    -   `cloud-sql-python-connector`: Google Cloud SQL Connector for Python.
    -   `SQLAlchemy`: Python SQL toolkit and Object-Relational Mapper.

-   **Mobile App (React Native):**
    -   `expo`: Framework for building React Native applications.
    -   `react-native`: JavaScript framework for writing natively rendering mobile applications.
    -   `react-native-maps`: Provides MapView component for displaying maps.
    -   `expo-location`: Provides access to the device's location services.
    -   `@react-navigation/native-stack`: Navigation library for React Native.
    -   `react-native-element-dropdown`: Dropdown component for React Native.
    -   `react-native-sectioned-multi-select`: Sectioned multi-select component.

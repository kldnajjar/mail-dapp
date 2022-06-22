import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const SignIn = lazy(() => import("./views/Signin"));
const SignUp = lazy(() => import("./views/Signup"));
const Profile = lazy(() => import("./views/Profile"));
const Mail = lazy(() => import("./views/Mail"));

const Navigator = () => {
  const loading = <div className="loading-content">Loading...</div>;
  return (
    <div>
      <Routes>
        <Route
          path="/profile"
          element={
            <Suspense fallback={loading}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/mail"
          element={
            <Suspense fallback={loading}>
              <Mail />
            </Suspense>
          }
        />
        <Route
          path="/sign-up"
          element={
            <Suspense fallback={loading}>
              <SignUp />
            </Suspense>
          }
        />
        <Route
          path="/sign-in"
          element={
            <Suspense fallback={loading}>
              <SignIn />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <Suspense fallback={loading}>
              <SignIn />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

export default Navigator;

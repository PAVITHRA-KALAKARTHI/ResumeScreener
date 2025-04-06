import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

declare global {
  interface Window {
    google: any;
  }
}

const AuthPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      const token = response.credential;
      const decoded = jwtDecode(token);
      console.log("Decoded user info:", decoded);

      const res = await fetch("http://localhost:5000/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store user data and token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(decoded));
        
        // Redirect to dashboard
        console.log("Authentication successful, redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication failed. Please try again.");
    }
  }, [navigate]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: "12063884765-427du25qov1rcev5mruu2glor2ahd5k2.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            // Remove redirect mode to handle the response directly
            auto_select: false
          });

          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            {
              type: "standard",
              theme: "filled_blue",
              size: "large",
              shape: "rectangular",
              width: 280,
              logo_alignment: "center",
              text: "signin_with",
            }
          );
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
          setError("Failed to initialize Google Sign-In");
        }
      } else {
        console.warn("Google Sign-In not loaded yet");
        setTimeout(initializeGoogleSignIn, 1000);
      }
    };

    initializeGoogleSignIn();
  }, [handleCredentialResponse]); // Add handleCredentialResponse to dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <div id="google-signin-btn"></div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
// import { signUp } from "../services/authService";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Replace these with your actual image URLs
  const backgroundImageUrl = "your-background-image-url";
  // const logo = "your-logo-url";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (validateForm()) {
      setIsLoading(true);
      try {
       
        // const response = await signUp({
        //     name: formData.fullName,
        //     email: formData.email,
        //     password: formData.password,
        //   });
        toast.success('Account created successfully!');
        // localStorage.setItem('token', response.token);
        // console.log(response.name)
        navigate("/login");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="login-page">
      <div className="flex min-h-screen w-full">
        <div
          className="hidden md:flex w-4/5 flex-col justify-center items-center bg-black p-8 text-center relative"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 flex-col justify-center items-center text-blue-500">
            <h1 className="text-2xl md:text-3xl font-semibold text">
              Welcome to
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Task Manager
            </h2>
            <p className="text-sm md:text-base">Manage your task Together</p>
          </div>
        </div>

        <div className="w-full min-h-90 flex flex-col items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="md:w-96 w-80 flex flex-col items-center justify-center"
          >
            <img src="booklogo.jpeg" alt="" className='w-15 h-15' />
            <h1 className="text-2xl md:text-2xl font-bold text-blue-800">
              CREATE ACCOUNT
            </h1>

            <p className="text-sm text-gray-500/90 mt-3">
              Join our community of book lovers
            </p>

            <div className="w-full mt-6">
              <div
                className={`flex items-center w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-black/60 ${
                  errors.fullName && submitted
                    ? "border-red-500"
                    : isNameFocused
                    ? "border-black/60 bg-gray-50"
                    : "border-gray-300/60"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    stroke="#6B7280"
                    strokeWidth="2"
                  />
                  <path
                    d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  className="bg-transparent text-black/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                />
              </div>
              {errors.fullName && submitted && (
                <div className="text-red-500 text-xs mt-1 text-left pl-6 w-full">
                  {errors.fullName}
                </div>
              )}
            </div>

            <div className="w-full mt-4">
              <div
                className={`flex items-center w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-black/60 ${
                  errors.email && submitted
                    ? "border-red-500"
                    : isEmailFocused
                    ? "border-black/60 bg-gray-50"
                    : "border-gray-300/60"
                }`}
              >
                <svg
                  width="16"
                  height="11"
                  viewBox="0 0 16 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                    fill="#6B7280"
                  />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="bg-transparent text-black/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                />
              </div>
              {errors.email && submitted && (
                <div className="text-red-500 text-xs mt-1 text-left pl-6 w-full">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="w-full mt-4">
              <div
                className={`flex items-center w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-black/60 ${
                  errors.password && submitted
                    ? "border-red-500"
                    : isPasswordFocused
                    ? "border-black/80 bg-gray-50"
                    : "border-gray-300/60"
                }`}
              >
                <svg
                  width="13"
                  height="17"
                  viewBox="0 0 13 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                    fill="#6B7280"
                  />
                </svg>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="bg-transparent text-black/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="m-3 cursor-pointer"
                >
                  {!showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && submitted && (
                <div className="text-red-500 text-xs mt-1 pl-6 text-left w-full">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="w-full mt-4">
              <div
                className={`flex items-center w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-black/60 ${
                  errors.confirmPassword && submitted
                    ? "border-red-500"
                    : isConfirmPasswordFocused
                    ? "border-black/80 bg-gray-50"
                    : "border-gray-300/60"
                }`}
              >
                <svg
                  width="13"
                  height="17"
                  viewBox="0 0 13 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                    fill="#6B7280"
                  />
                </svg>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  className="bg-transparent text-black/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                />

                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="m-3 cursor-pointer"
                >
                  {!showConfirmPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.confirmPassword && submitted && (
                <div className="text-red-500 text-xs mt-1 pl-6 text-left w-full">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full h-11 rounded-full text-white bg-black hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="flex items-center gap-4 w-full my-5">
              <div className="w-full h-px bg-gray-300/90"></div>
              <p className="w-full text-nowrap text-sm text-gray-500/90">
                or sign up with
              </p>
              <div className="w-full h-px bg-gray-300/90"></div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              <button
                type="button"
                className="w-12 h-12 bg-gray-500/10 flex items-center justify-center rounded-full hover:shadow-md"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              </button>

              <button
                type="button"
                className="w-12 h-12 bg-gray-500/10 flex items-center justify-center rounded-full hover:shadow-md"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                  alt="Facebook"
                  className="w-5 h-5"
                />
              </button>
            </div>

            <p className="text-gray-500/90 text-sm mt-4">
              Already have an account?
              <Link
                to="/login"
                className="text-indigo-400 hover:underline ml-1"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
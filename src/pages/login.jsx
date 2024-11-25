import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../utils/api';
import { login } from '../utils/auth';

import {  toast } from 'react-toastify';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchWithAuth('/api/auth/signin', {
        method: 'POST',
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
      });
      login(data.token); // Save token in localStorage
      navigate('/');     // Redirect to home
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid credentials');
    }
  };

  return (
    <div
      style={{
        // backgroundImage: `url('/images/signin.jpg')`,
        background:
          "linear-gradient(180deg, rgba(0,23,36,1) 0%, rgba(12,0,41,1) 50%, rgba(70,70,106,1) 100%)",
      }}
      className="flex items-center justify-center h-screen bg-cover w-full"
    >
      <div className="w-full m-auto bg-white shadow-md md:max-w-sm lg:max-w-sm md:rounded-md lg:rounded-md dark:bg-gray-800">
        <div className="p-6">
          <Link className="w-full flex justify-center items-center" to="/">
            
            <div>
            <img
                alt="fullmetal"
                src={'https://app.fullmetal.ai/images/fullmetal.png'}
                className="mx-auto rounded-full w-12 mb-2"
            ></img>

            <h1 className="text-xl font-semibold text-center text-gray-700 dark:text-white">
                Welcome to Fullmetal.Ai
            </h1>
            </div>
            
          </Link>
            <form onSubmit={handleLogin} className="mt-6">
              <div className="mt-4">
                <label className="block text-sm text-gray-800 dark:text-gray-200" htmlFor="email">
                 Email {' '}
                  <span className='text-sm text-red-400'>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring`}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-800 dark:text-gray-200" htmlFor="password">
                  Password{' '}
                  <span className='text-sm text-red-400'>*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"                  
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring`}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="">
                  <input
                    className="border-gray-300 rounded cursor-pointer dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                    type="checkbox"
                    id={"rememberMe"}
                    name={"rememberMe"}
                  />

                  <label
                    className="ml-1 text-sm text-gray-600 cursor-pointer dark:text-gray-400"
                    htmlFor={"rememberMe"}
                  >
                    Remember me
                  </label>
                </div>

                <div className="pr-0">
                  <Link
                    className="text-sm text-gray-600 cursor-pointer dark:text-gray-400"
                    to="/auth/forgot-password"
                  >
                    Forgot Password
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <button
                  //disabled={loading}
                  type="submit"
                  className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-default hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                >
                  Login
                </button>
              </div>
            </form>
          {/* <div className="flex items-center justify-between mt-4">
            <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/5"></span>

            <span className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
                or sign in with Social Media
            </span>

            <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/5"></span>
          </div> */}

          {/* <div className="mt-3 mt-3 flex items-center justify-center">
            <GoogleOAuthProvider clientId={config.googleClientId}>
              <GoogleLogin
                shape="circle"
                type="standard"
                logo_alignment="left"
                theme="filled_black"
                size="large"
                onSuccess={handleLogin}
                onError={() => console.log("Error")}
              />
            </GoogleOAuthProvider>
          </div> */}
        </div>

        <div className="py-4 bg-gray-100 dark:bg-gray-700 rounded-b-md">
          <Link
            className="block text-xs font-medium text-center text-gray-800 dark:text-gray-200 hover:underline"
            to="/auth/signup"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

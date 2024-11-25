import { isAuthenticated } from '../utils/auth';
import { Link } from 'react-router-dom';
import { BiLogIn, BiSolidChat, BiSolidHome } from 'react-icons/bi';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear token
    navigate('/login'); // Redirect to login
  };

  return (
    <>
      {!isAuthenticated() ? (
        <div className="text-right mt-2 mb-2 w-full">
          <Link
            to="/login"
            className=" justify-end bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
          >
            Login <BiLogIn size={20} className="inline-block" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex w-full mt-2 mb-2">
            <div className="text-left w-full mt-2">
              <Link
                to="/"
                className="mr-2 justify-start bg-yellow-500 hover:bg-yellow-700 text-gray-900 font-bold py-2 px-4 rounded"
              >
                Home{' '}
                <BiSolidHome
                  size={20}
                  className="inline-block mb-2"
                  color="black"
                />
              </Link>
            </div>
            <div className="text-right w-full">
              <Link
                to="/npc-chat"
                className="mr-2 justify-end bg-green-600 hover:bg-green-700 text-gray-900 font-bold py-2 px-4 rounded"
              >
                Chat with NPCs{' '}
                <BiSolidChat
                  size={20}
                  className="inline-block text-gray-900"
                  color="black"
                />
              </Link>
              <button
                className=" justify-end bg-gray-800 hover:bg-red-700 text-white py-2 px-4 rounded font-bold"
                onClick={handleLogout}
              >
                Logout <BiLogIn size={20} className="inline-block" />
              </button>
            </div>
          </div>
        </>
      )}
      <hr className="w-full mb-5" />
    </>
  );
}

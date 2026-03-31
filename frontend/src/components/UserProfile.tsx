import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const UserProfile = () => {
  const { logout } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{profile?.username}</h3>
          <p className="text-sm text-gray-400">{profile?.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;

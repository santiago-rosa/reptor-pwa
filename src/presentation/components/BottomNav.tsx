import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function BottomNav() {
  const navItems = [
    {
      to: '/routines',
      label: 'Routines',
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'History',
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: '/progress',
      label: 'Progress',
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  const { user, signOut, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // After signing out, navigate to the login page
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors ${
              isActive ? 'text-blue-500 font-medium' : 'text-gray-400 hover:text-gray-300'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
      {/* Profile section – shows email when logged in and sign‑out button */}
      {user && (
        <div className="flex flex-col items-center justify-center px-2 text-xs text-gray-400">
          <span className="mb-1">{user.email}</span>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white py-0.5 px-2 rounded"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { getProfileCompleteness } from '../../utils/profileCompleteness';

interface Props {
  user: User;
}

export default function ProfileWarningBanner({ user }: Props) {
  const navigate = useNavigate();
  const { score, missing } = getProfileCompleteness(user);
  if (missing.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base flex-shrink-0">🚨</span>
        <p className="text-sm font-medium text-red-700 truncate">
          Profile {score}% complete — missing: {missing.join(', ')}
        </p>
      </div>
      <button
        onClick={() => navigate('/profile/edit')}
        className="flex-shrink-0 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors"
      >
        Complete →
      </button>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Droplet, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-blood-700 mb-6 shadow-md shadow-red-200">
        <Droplet className="w-9 h-9 fill-current" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-[#17212B] tracking-tight">
        404
      </h1>
      <h2 className="mt-2 text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-sm text-[#73808C] max-w-sm">
        The emergency coordination link or page you are looking for does not exist or has been moved.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};


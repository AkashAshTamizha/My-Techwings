import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="text-brand-blue font-semibold mt-6 inline-block">
        Back to home →
      </Link>
    </div>
  );
}

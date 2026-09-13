import { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { Loader } from '../components/common/Loader';
import { getServices } from '../services/api';

export default function Service() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data.services))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Service</h1>
      <p className="text-slate-600 mt-4 max-w-2xl">
        Our in-house technicians handle repairs, upgrades, and warranty claims for every laptop and device we sell.
      </p>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          {services.map((s) => {
            const Icon = FiIcons[s.icon] || FiIcons.FiTool;
            return (
              <div key={s._id} className="border border-slate-200 rounded-lg p-5 flex gap-4">
                <span className="text-brand-blue text-2xl shrink-0">
                  <Icon />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                  {s.price && <p className="text-sm font-semibold text-brand-blue mt-2">{s.price}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value, sub, icon, color = 'brand' }) => {
  const colors = {
    brand:  'bg-brand-50 text-brand-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="card flex items-start gap-4">
      {icon && (
        <div className={`rounded-lg p-3 text-2xl ${colors[color]}`}>{icon}</div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;

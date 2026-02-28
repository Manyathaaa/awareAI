const Spinner = ({ size = 'md' }) => {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[120px]">
      <div className={`${s} animate-spin rounded-full border-4 border-brand-100 border-t-brand-600`} />
    </div>
  );
};

export default Spinner;

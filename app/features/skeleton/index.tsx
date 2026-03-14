export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 animate-pulse">
      <div className="flex justify-between items-center mb-12">
        <div className="h-10 w-48 bg-slate-800 rounded-xl"></div>
        <div className="h-12 w-12 bg-slate-800 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[2/3] w-full bg-slate-800 rounded-2xl"></div>
            <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
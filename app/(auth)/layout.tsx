export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-violet-700 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 13H8v-1l2-2v-4l-2-1V9h8v1l-2 1v4l2 2v1z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FitLife</span>
          </div>
          <p className="text-white/60 text-sm">Your personal fitness companion</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

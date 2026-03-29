export default function IndexPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white">
          Bienvenido a <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Mixdesign Pro 2</span>
        </h1>
        <p className="text-xl text-slate-300">
          Una aplicación moderna de diseño y desarrollo web
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-blue-400 transition">
          <h3 className="text-lg font-semibold text-white mb-2">Rápido</h3>
          <p className="text-slate-300">Construido con Vite para máximo rendimiento</p>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-purple-400 transition">
          <h3 className="text-lg font-semibold text-white mb-2">Moderno</h3>
          <p className="text-slate-300">React 19 con TypeScript para desarrollo seguro</p>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-blue-400 transition">
          <h3 className="text-lg font-semibold text-white mb-2">Hermoso</h3>
          <p className="text-slate-300">Tailwind CSS para estilos increíbles</p>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-8 border border-slate-600">
        <h2 className="text-2xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
        <p className="text-slate-300">
          Comienza a crear componentes hermosos y funcionales con Mixdesign Pro 2
        </p>
      </div>
    </div>
  )
}
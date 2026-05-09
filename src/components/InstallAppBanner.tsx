"use client";
import { useState, useEffect } from "react";
import { X, Smartphone, Download } from "lucide-react";

const InstallAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detectar dispositivo
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    if (isIOS) setDeviceType('ios');
    else if (isAndroid) setDeviceType('android');
    
    // Solo mostrar en móvil y si no han cerrado el banner antes
    const bannerDismissed = localStorage.getItem('installBannerDismissed');
    if (isMobile && !bannerDismissed) {
      // Mostrar después de 3 segundos para no ser intrusivo
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  const openInstructions = () => {
    setShowModal(true);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white p-4 z-50 shadow-lg animate-slide-down">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">¡Usa OnlyHub como app!</p>
              <p className="text-xs opacity-90">Mejor experiencia móvil</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openInstructions}
              className="bg-white text-cyan-600 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-1 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
            <button
              onClick={dismissBanner}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal con instrucciones */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Instalar OnlyHub</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                  <div className="bg-cyan-500 p-2 rounded-full">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">¿Por qué instalar OnlyHub?</p>
                    <p className="text-sm text-gray-600">✓ Acceso más rápido ✓ Notificaciones ✓ Mejor experiencia</p>
                  </div>
                </div>

                {deviceType === 'ios' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">📱 En iPhone/iPad:</h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Abre <strong>Safari</strong> (no Chrome)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Toca el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Selecciona <strong>"Agregar a pantalla de inicio"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Toca <strong>"Agregar"</strong></span>
                      </li>
                    </ol>
                  </div>
                )}

                {deviceType === 'android' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">🤖 En Android:</h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Abre <strong>Chrome</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Toca los <strong>3 puntos</strong> (menú)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Selecciona <strong>"Agregar a pantalla de inicio"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-cyan-100 text-cyan-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Toca <strong>"Agregar"</strong></span>
                      </li>
                    </ol>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        💡 <strong>Tip:</strong> También puede aparecer automáticamente un banner que dice "Instalar app"
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      dismissBanner();
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-colors"
                  >
                    ¡Entendido!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppBanner;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, MapPin, Phone, ArrowRight, CheckCircle2, Home, Key, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';
import { departmentService } from '@/services/departmentService';
import { contactService } from '@/services/contactService';
import { Department } from '@/types/department';
import ImageGalleryModal from '@/components/public/ImageGalleryModal';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';

const LandingPage: React.FC = () => {
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptForGallery, setSelectedDeptForGallery] = useState<Department | null>(null);

  const WHATSAPP_NUMBER = '51937506403'; 
  const WHATSAPP_MESSAGE = 'Hola, vi sus departamentos en internet y me gustaría agendar una visita.';
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactService.create(contactForm);
      toast.success('Mensaje enviado exitosamente. Nos pondremos en contacto pronto.');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Ocurrió un error al enviar el mensaje. Por favor intenta por WhatsApp.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deps = await departmentService.getAll({ isAvailable: true });
        setAvailableDepartments(deps);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Navigation (Glassmorphism) */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">SmartRent</span>
            </div>
            <div>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Portal Inquilinos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (Architectural Style) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Signature Element: Architectural dot grid background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {availableDepartments.length} Departamentos Disponibles
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6">
              El espacio perfecto para tu <span className="text-emerald-400">nuevo comienzo.</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Departamentos modernos, diseñados para brindarte confort absoluto y máxima seguridad en las mejores ubicaciones.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a 
                href="#departamentos" 
                className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] flex items-center justify-center gap-2"
              >
                Ver Catálogo <ArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="#contacto" 
                className="px-8 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Contáctanos
              </a>
            </div>
          </div>

          <div className="flex-1 w-full relative hidden md:block">
            {/* Abstract architectural visual */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1200" 
                alt="Interior moderno" 
                className="w-full h-full object-cover"
              />
              {/* Glassmorphism float card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-white">
                <div className="flex items-center gap-4 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-display font-semibold text-lg">Acabados Premium</h3>
                </div>
                <p className="text-sm text-slate-200">Cada detalle pensado para tu comodidad y estilo de vida.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Un estándar superior.</h2>
            <p className="text-lg text-slate-500 max-w-2xl">No solo alquilamos espacios, ofrecemos un entorno diseñado para que vivas sin preocupaciones.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-slate-200">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Seguridad Absoluta</h3>
              <p className="text-slate-600 leading-relaxed">Accesos controlados, vigilancia continua e infraestructura diseñada para que descanses con total tranquilidad.</p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-emerald-100">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Ubicación Clave</h3>
              <p className="text-slate-600 leading-relaxed">Vive conectado. Cerca de vías principales, comercios y servicios esenciales para optimizar tu tiempo.</p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-blue-100">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Diseño Funcional</h3>
              <p className="text-slate-600 leading-relaxed">Ambientes iluminados naturalmente, distribución inteligente y materiales nobles que elevan tu día a día.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Departments Section */}
      <section id="departamentos" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Propiedades Disponibles</h2>
              <p className="text-lg text-slate-600">Catálogo actualizado en tiempo real. Agenda tu visita hoy.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          ) : availableDepartments.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Building2 className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">100% Ocupado</h3>
              <p className="text-slate-500 max-w-md mx-auto">En este momento no contamos con propiedades vacantes. Te invitamos a visitarnos próximamente.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableDepartments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  
                  <div 
                    className="h-64 bg-slate-200 relative overflow-hidden cursor-pointer group/image"
                    onClick={() => setSelectedDeptForGallery(dept)}
                  >
                    <img 
                      src={dept.images && dept.images.length > 0 ? getImageUrl(dept.images[0]) : `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800`} 
                      alt="Interior" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Overlay Ver Galería */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full font-semibold text-slate-900 flex items-center gap-2 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300 shadow-xl">
                        <ImageIcon className="w-5 h-5" /> Ver Galería
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-slate-900 text-sm font-bold rounded-full shadow-lg">
                        Dpto. {dept.code}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6 flex-1">
                      <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{dept.name}</h3>
                      <p className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" /> {dept.address?.street}, {dept.address?.city}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-6 border-y border-slate-100 mb-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Precio</span>
                        <span className="text-xl font-bold text-slate-900">S/ {dept.monthlyPrice || dept.rentAmount || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Área</span>
                        <span className="text-xl font-bold text-slate-900">{dept.features?.squareMeters || dept.area || 0} m²</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuartos</span>
                        <span className="text-lg font-semibold text-slate-700">{dept.features?.bedrooms || dept.bedrooms || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Baños</span>
                        <span className="text-lg font-semibold text-slate-700">{dept.features?.bathrooms || dept.bathrooms || 0}</span>
                      </div>
                    </div>

                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
                    >
                      <Phone className="w-5 h-5" />
                      Contactar por WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-24 bg-white relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-12">La experiencia SmartRent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-4xl font-display font-bold text-emerald-600 mb-2">+50</div>
              <p className="text-slate-600 font-medium">Inquilinos felices</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-4xl font-display font-bold text-blue-600 mb-2">100%</div>
              <p className="text-slate-600 font-medium">Transparencia en contratos</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-4xl font-display font-bold text-indigo-600 mb-2">24/7</div>
              <p className="text-slate-600 font-medium">Soporte y mantenimiento</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-slate-900 relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                ¿Tienes alguna consulta?
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Envíanos un mensaje directo a través del sistema o comunícate vía WhatsApp. Nuestro equipo responderá a la brevedad para ayudarte a encontrar tu nuevo hogar.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">WhatsApp Directo</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xl text-white font-medium hover:text-emerald-400 transition-colors">
                      +51 937 506 403
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Ubicación de Oficina</p>
                    <p className="text-lg text-white font-medium">
                      Calle Callao 261, Tacna
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input 
                      type="tel" 
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mensaje</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="¿En qué departamento estás interesado?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Enviando...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">SmartRent</span>
          </div>
          <div className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} SmartRent. Elegancia y Confort.
          </div>
        </div>
      </footer>

      {/* Galería Modal */}
      {selectedDeptForGallery && (
        <ImageGalleryModal 
          department={selectedDeptForGallery} 
          onClose={() => setSelectedDeptForGallery(null)} 
        />
      )}
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

interface ContactFormProps {
  departmentName: string;
  departmentId: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ departmentName, departmentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interestedInVisit: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío (en producción iría a una API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Contact form submitted:', {
      ...formData,
      departmentId,
      departmentName,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Mensaje enviado exitosamente!
        </h3>
        <p className="text-gray-600 mb-6">
          Gracias por tu interés en <strong>{departmentName}</strong>. 
          Nos pondremos en contacto contigo pronto.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              message: '',
              interestedInVisit: false,
            });
          }}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary-600" />
        Contactar por este departamento
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Tu nombre completo"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="tu@email.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (opcional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+52 123 456 7890"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Hola, estoy interesado en este departamento. Me gustaría conocer más detalles sobre..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Checkbox para visita */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="interestedInVisit"
            name="interestedInVisit"
            checked={formData.interestedInVisit}
            onChange={handleInputChange}
            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="interestedInVisit" className="text-sm text-gray-700">
            Estoy interesado en agendar una visita presencial al departamento
          </label>
        </div>

        {/* Información del departamento */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Departamento de interés:</h4>
          <p className="text-gray-700">{departmentName}</p>
          <p className="text-sm text-gray-500">ID: {departmentId}</p>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar mensaje
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Al enviar este formulario, aceptas que nos contactemos contigo 
          para proporcionarte información sobre este departamento.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
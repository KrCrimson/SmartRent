import React, { useState, useEffect } from 'react';
import { Mail, Inbox, Phone, Clock, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactService } from '@services/contact.service';
import type { ContactRequest } from '../types/contact';
import toast from 'react-hot-toast';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await contactService.getRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Error al cargar peticiones');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'REVIEWED' | 'CONTACTED') => {
    try {
      await contactService.updateStatus(id, newStatus);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                <Inbox className="w-8 h-8 text-indigo-600" />
                Peticiones de Reserva
              </h1>
              <p className="text-slate-500 mt-1">Bandeja de entrada de personas interesadas</p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email, dpto..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600">No hay mensajes</h3>
            <p className="text-slate-500">La bandeja está vacía.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <div key={req.id} className={`p-6 flex flex-col lg:flex-row gap-6 hover:bg-slate-50 transition-colors ${req.status === 'PENDING' ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{req.name}</h3>
                      {req.status === 'PENDING' && <span className="px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">NUEVO</span>}
                      {req.interestedInVisit && <span className="px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">QUIERE VISITAR</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-4">
                      <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {req.email}</span>
                      {req.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {req.phone}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-100/50 p-4 rounded-xl text-slate-700 text-sm">
                      <span className="font-semibold text-indigo-700 block mb-1">Dpto: {req.departmentName}</span>
                      {req.message}
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col items-start lg:items-end gap-2 justify-center lg:min-w-[140px]">
                    <select
                      className={`text-sm font-semibold rounded-lg border px-3 py-2 outline-none w-full cursor-pointer
                        ${req.status === 'PENDING' ? 'bg-white border-slate-300 text-slate-700' : 
                          req.status === 'REVIEWED' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                          'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="REVIEWED">En revisión</option>
                      <option value="CONTACTED">Contactado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPage;

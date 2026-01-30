import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Image,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Alert, AlertStatus } from '@/types/alert';

interface AlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onStatusChange?: (alertId: string, status: AlertStatus) => void;
  onAddComment?: (alertId: string, comment: string) => void;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'user' | 'system';
}

// Mock comments - en una app real esto vendría del backend
const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Sistema',
    content: 'Alerta creada automáticamente',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'system'
  },
  {
    id: '2',
    author: 'Juan Pérez',
    content: 'Revisé el área, confirmo que hay una fuga en la tubería principal. Necesito herramientas especiales.',
    timestamp: '2024-01-15T11:15:00Z',
    type: 'user'
  },
  {
    id: '3',
    author: 'Sistema',
    content: 'Estado cambiado de PENDIENTE a EN_PROGRESO',
    timestamp: '2024-01-15T11:20:00Z',
    type: 'system'
  }
];

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  isOpen,
  onClose,
  alert,
  onStatusChange,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!isOpen || !alert) return null;

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'EN_PROGRESO':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'RESUELTO':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELADO':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_PROGRESO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESUELTO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE':
        return 'bg-red-100 text-red-800';
      case 'ALTA':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAJA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (status: AlertStatus) => {
    if (onStatusChange && alert) {
      onStatusChange(alert.id, status);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment && alert) {
      onAddComment(alert.id, newComment.trim());
      setNewComment('');
    }
  };

  const nextImage = () => {
    if (alert?.images && alert.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === alert.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (alert?.images && alert.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? alert.images!.length - 1 : prev - 1
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {alert.title}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
                  {getStatusIcon(alert.status)}
                  {alert.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {alert.departmentInfo?.building} - {alert.departmentInfo?.number}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(alert.createdAt)}
                </div>
                {alert.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {alert.assignedTo}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex h-[calc(95vh-80px)]">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Priority and Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {alert.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reportado por
                    </label>
                    <p className="text-sm text-gray-900">
                      {alert.reporterInfo ? `${alert.reporterInfo.firstName} ${alert.reporterInfo.lastName}` : 'Usuario'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* Images */}
                {alert.images && alert.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes ({alert.images.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {alert.images.map((imagen, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer aspect-square"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setShowImageModal(true);
                          }}
                        >
                          <img
                            src={imagen}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                {onStatusChange && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar Estado
                    </label>
                    <div className="flex gap-2">
                      {['PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CANCELADO'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status as AlertStatus)}
                          disabled={alert.status === status}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            alert.status === status
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Sidebar */}
            <div className="w-80 border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comentarios
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.type === 'system' 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        comment.type === 'system' ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      comment.type === 'system' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              {onAddComment && (
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Agregar un comentario..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="w-full px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Agregar Comentario
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && alert?.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60">
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={alert.images[currentImageIndex]}
              alt={`Imagen ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {alert.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <div className="absolute top-4 right-4 flex items-center gap-4">
              {alert.images.length > 1 && (
                <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  {currentImageIndex + 1} / {alert.images.length}
                </span>
              )}
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertDetailsModal;
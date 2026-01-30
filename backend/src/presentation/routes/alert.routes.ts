import { Router } from 'express';
import { AlertDependencyContainer } from '@infrastructure/containers/AlertDependencyContainer';
import { createAlertRoutes } from '@infrastructure/routes/alertRoutes';

// Inicializar dependencias de alertas
AlertDependencyContainer.register();

// Crear router de alertas con el controlador inyectado
const router = createAlertRoutes(AlertDependencyContainer.alertController);

export default router;
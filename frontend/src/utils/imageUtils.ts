export const getImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si es un URL de Cloudinary u otro servicio en la nube que no sea localhost
  if (url.startsWith('http') && !url.includes('localhost:5000')) {
    return url;
  }
  
  // Extraemos la ruta relativa del path si es localhost:5000
  let relativePath = url;
  if (url.includes('localhost:5000')) {
    const urlObj = new URL(url);
    relativePath = urlObj.pathname;
  }

  // Si no tiene slash inicial, lo agregamos
  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  return `${backendUrl}${relativePath}`;
};

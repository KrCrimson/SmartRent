import mongoose from 'mongoose';
import { DepartmentModel } from './src/infrastructure/database/schemas/DepartmentSchema';

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  // Encontrar departamentos que tengan imágenes
  const deps = await DepartmentModel.find({ images: { $not: { $size: 0 } } });
  let count = 0;
  for (const dep of deps) {
    // Si la primera imagen empieza con http://localhost, la eliminamos porque está rota
    if (dep.images[0] && dep.images[0].includes('localhost:5000')) {
      dep.images = [];
      await dep.save();
      count++;
    }
  }
  console.log(`Se limpiaron las imágenes rotas de ${count} departamentos.`);
  process.exit(0);
});

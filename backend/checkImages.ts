import mongoose from 'mongoose';
import { DepartmentModel } from './src/infrastructure/database/schemas/DepartmentSchema';

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const deps = await DepartmentModel.find({});
  console.log(JSON.stringify(deps.map(d => ({ code: d.code, images: d.images })), null, 2));
  process.exit(0);
});

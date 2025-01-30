import express from 'express';
import { 
    getAllpod, 
    addPod, 
    updatePod, 
    deletePodData, 
    tesUploadFile, 
    upload, 
    getFile, 
    updateUploadFile
} from './pod.controller';

const routes = express.Router();

routes.get('/pod', getAllpod);  
routes.post('/pod', addPod);
routes.put('/pod/:id', updatePod);
routes.delete('/pod/:id', deletePodData);
routes.post('/upload', upload.single('file'), tesUploadFile);
routes.get('/upload', getFile);
routes.put('/upload/:id', upload.single('file'), updateUploadFile);

export default routes;

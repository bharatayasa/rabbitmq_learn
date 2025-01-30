import express from 'express';
import { 
    getAllpod, 
    addPod, 
    updatePod, 
    deletePodData
} from './pod.controller';

const routes = express.Router();

routes.get('/pod', getAllpod);
routes.post('/pod', addPod);
routes.put('/pod/:id', updatePod);
routes.delete('/pod/:id', deletePodData);

export default routes;

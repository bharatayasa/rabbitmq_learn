import express from 'express';
import { 
    getAllpod, 
} from './pod.controller';

const routes = express.Router();

routes.get('/pod', getAllpod);

export default routes;

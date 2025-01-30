import express, { Request, Response, NextFunction } from 'express';
import routes from './routes/pod/pod.routes';
const app = express();
app.use(express.json());

import {
    consumeAndAddToDatabase, 
    consumeAndUpdateDatabase, 
    consumeAnddeleteDatabase, 
    consumePodData, 
    fetchInitialData
} from '../src/routes/pod/consumer';

app.use('/', routes);
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to the API!',
    });
});

// consumeFromQueue();
consumeAndAddToDatabase()
consumeAndUpdateDatabase()
consumeAnddeleteDatabase()
consumePodData()
fetchInitialData()

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log("POD-1 API");
    console.log("POD-1 API");
    console.log("POD-1 API"); 
    console.log("POD API SEBAGAI PENERIMA"); 
});

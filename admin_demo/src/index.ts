import express, { Request, Response, NextFunction } from 'express';
import routes from './routes/pod/pod.routes';
import { client } from './database';

const app = express();
app.use(express.json());  

app.get("/pods/query", async (req, res) => {
    try {
        await client.connect();

        const result = await client.query("SELECT * FROM pod");

        res.status(200).json({
            message: "success to get all pod data: ", 
            data: result.rows
        })

        await client.end();
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).send("Internal Server Error");
    }
});

(async () => {
    // await initializeDB();

    app.use('/', routes);

    app.get('/', (req: Request, res: Response) => {
        try {
            res.status(200).json({
                message: "hallo from backend admin demo"
            })
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error,
            });
        }
    })

    app.use((req: Request, res: Response) => {
        res.status(404).json({
            error: 'Route not found',
        });
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
        });
    });

    const PORT = 3002;
    const HOST = '0.0.0.0'
    app.listen(PORT, () => {
        console.log(`Server is running at http://${HOST}:${PORT}`);
    });
})();

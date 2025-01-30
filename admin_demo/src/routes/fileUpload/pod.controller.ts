import { Request, Response } from 'express';
import prisma from "../../../prisma/prisma";
import { 
    publishToQueue,
    updateQueue, 
    deleteQueue
} from './publish.to..queue';

const addPod = async (req: Request, res: Response) => {
    try {
        const { url, identification, username, password } = req.body;

        // Tambahkan data ke database terlebih dahulu
        const podData = await prisma.pod.create({
            data: {
                url,
                identification,
                username,
                password,
            },
        });

        // Buat pesan yang berisi data termasuk ID
        const podMessage = {
            id: podData.id, // Sertakan ID dari data yang baru ditambahkan
            url: podData.url,
            identification: podData.identification,
            username: podData.username,
            password: podData.password,
        };

        // Kirim pesan ke antrean RabbitMQ
        await publishToQueue(podMessage);

        // Kirim respons ke klien
        res.status(200).json({
            message: 'Successfully added pod and sent to RabbitMQ',
            data: podData,
        });

    } catch (error) {
        console.error('Error adding pod:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error,
        });
    }
};

const updatePod = async (req: Request, res: Response) => {
    try {
        const { url, identification, username, password } = req.body;
        const id = req.params.id;

        const updateMessage = {
            action: 'update',
            id,
            data: { url, identification, username, password },
        };

        // Kirim pesan ke RabbitMQ
        await updateQueue(updateMessage);

        const updatePod = await prisma.pod.update({
            where: {
                id: id
            },
            data: {
                url,
                identification,
                username,
                password,
            }
        })

        res.status(200).json({
            message: 'Update request sent to RabbitMQ',
            data: updatePod, 
            queue: updateMessage,
        });

    } catch (error) {
        console.error('Error updating pod:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error,
        });
    }
};

const getAllpod = async (req: Request, res: Response) => {
    try {
        const podData = await prisma.pod.findMany({
            where: {
                deleted_at: null,
            },
        });

        res.status(200).json({
            message: "get all pod data",
            data: podData,
        });
    } catch (error) {
        res.status(500).json({
            message: "internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

const deletePodData = async (req: Request, res: Response) => {
    try {
        const id = req.params.id; 

        const deletePodData = await prisma.pod.delete({
            where: {
                id: id
            }
        })

        
        const deleteMessge = {
            action: 'delete',
            id,
            data: { id },
        };

        // Kirim pesan ke RabbitMQ
        await deleteQueue(deleteMessge);

        res.status(200).json({
            message: "success to delete data", 
            data: deletePodData, 
            queue: deleteMessge
        })
    } catch (error) {
        res.status(500).json({
            message: "internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}

export {
    addPod,
    updatePod, 
    getAllpod,
    deletePodData
};

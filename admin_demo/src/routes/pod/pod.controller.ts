import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import prisma from "../../../prisma/prisma";
import multer from 'multer';
import { 
    publishToQueue,
    updateQueue, 
    deleteQueue, 
    sendDataToPods
} from './publish.to..queue';

const addPod = async (req: Request, res: Response) => {
    try {
        const { url, identification, username, password } = req.body;

        const podData = await prisma.pod.create({
            data: {
                url,
                identification,
                username,
                password,
            },
        });

        console.log("INI ADALAH DATA YANG DIKIRIM DARI BODY", podData);

        const podMessage = {
            id              : podData.id,
            url             : podData.url,
            identification  : podData.identification,
            username        : podData.username,
            password        : podData.password,
        };

        await sendDataToPods(podMessage);

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

        if (podData.length === 0) {
            res.status(404).json({
                message: "Database is empty",
                data: podData,
            });
            console.log("DATA NOT FOUND, MAYBE EMPTY AT DATABASE");
            return;
        }

        res.status(200).json({
            message: "Get all pod data",
            data: podData,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
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

// Pastikan folder "uploads" ada
const uploadsDir = path.join(__dirname, './uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}`);
    },
});

const upload = multer({ storage });

const tesUploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({ message: "File is required" });
            return;
        }

        const { test } = req.body;

        const newUpload = await prisma.upload.create({
            data: {
                test: test, 
                fileName: file.filename, 
            },
        });

        res.status(201).json({
            message: "File uploaded successfully",
            data: newUpload,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

const getFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.upload.findMany({
            where: {
                deleted_at: null
            }
        })

        res.status(200).json({
            data: data
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

const updateUploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { test } = req.body;
        const file = req.file;

        if (!id) {
            res.status(400).json({ message: "ID is required" });
            return;
        }

        const existingData = await prisma.upload.findUnique({
            where: { id },
        });

        if (!existingData) {
            res.status(404).json({ message: "Data not found" });
            return;
        }

        const updatedUpload = await prisma.upload.update({
            where: { id },
            data: {
                test: test || existingData.test,
                fileName: file ? file.filename : existingData.fileName,
            },
        });

        res.status(200).json({
            message: "File updated successfully",
            data: updatedUpload,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export {
    addPod,
    updatePod, 
    getAllpod,
    deletePodData, 
    tesUploadFile,
    upload, 
    getFile, 
    updateUploadFile
};

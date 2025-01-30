import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma';

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

export {
    getAllpod
};

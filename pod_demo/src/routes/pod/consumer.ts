import amqp from 'amqplib';
import prisma from '../../../prisma/prisma';
const dotenv = require('dotenv');
dotenv.config();

const connectionUrl = process.env.RABBITMQ_URL;

const update_pod = 'update-pod';
const delete_pod = 'delete-pod';
const insert_pod_data = 'create-pod';

// const consumeAndAddToDatabase = async () => {
//     try {
//         const connection = await amqp.connect(`${connectionUrl}`);
//         const channel = await connection.createChannel(); // Buat channel
//         await channel.assertQueue(insert_pod_data, { 
//             durable: true 
//         }); // Pastikan antrean ada

//         console.log(`Waiting for messages in queue (create): ${insert_pod_data}`);

//         channel.consume(insert_pod_data, async (msg) => {
//             if (msg !== null) {
//                 const messageContent = msg.content.toString();
//                 console.log(`Received message: ${messageContent}`);

//                 try {
//                     // Parsing data dari pesan
//                     const podData = JSON.parse(messageContent);

//                     // Validasi sederhana data yang diterima
//                     if (!podData.url || !podData.identification || !podData.username || !podData.password) {
//                         console.error('Invalid message format:', podData);
//                         channel.nack(msg, false, false); // Nack jika data tidak valid
//                         return;
//                     }

//                     // Masukkan data ke database
//                     await prisma.pod.create({
//                         data: {
//                             id: podData.id, 
//                             url: podData.url,
//                             identification: podData.identification,
//                             username: podData.username,
//                             password: podData.password,
//                         },
//                     });

//                     console.log('Data successfully added to the database:', podData);

//                     // Ack pesan setelah berhasil diproses
//                     channel.ack(msg);
//                 } catch (error) {
//                     console.error('Error processing message:', error);
//                     channel.nack(msg, false, false); // Nack jika terjadi error
//                 }
//             }
//         });
//     } catch (error) {
//         console.error('Error setting up RabbitMQ consumer:', error);
//     }
// };

const consumeAndAddToDatabase = async () => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();
        await channel.assertQueue(insert_pod_data, { 
            durable: true 
        });

        console.log(`Waiting for messages in queue (create): ${insert_pod_data}`);

        channel.consume(insert_pod_data, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log(`Received message: ${messageContent}`);

                try {
                    const podData = JSON.parse(messageContent);

                    if (!podData.url || !podData.identification || !podData.username || !podData.password) {
                        console.error('Invalid message format:', podData);
                        channel.nack(msg, false, true);
                        return;
                    }

                    await prisma.pod.create({
                        data: {
                            id: podData.id, 
                            url: podData.url,
                            identification: podData.identification,
                            username: podData.username,
                            password: podData.password,
                        },
                    });

                    console.log('Data successfully added to the database:', podData);

                    // Jangan kirim ack untuk tetap menyimpan pesan di antrean
                    // Jika tetap ingin ack tapi data tersedia di antrean, gunakan requeue secara manual
                    // channel.nack(msg, false, true);
                } catch (error) {
                    console.error('Error processing message:', error);
                    channel.nack(msg, false, true); // Requeue pesan jika terjadi error
                }
            }
        }, { noAck: false }); // Gunakan noAck=false untuk memastikan manual ack/nack
    } catch (error) {
        console.error('Error setting up RabbitMQ consumer:', error);
    }
};

const consumeAndUpdateDatabase = async () => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();
        await channel.assertQueue(update_pod, { durable: true });

        console.log(`Waiting for messages in queue (update): ${update_pod}`);

        channel.consume(update_pod, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log(`Received message: ${messageContent}`);

                try {
                    const message = JSON.parse(messageContent);

                    if (message.action === 'update' && message.id && message.data) {
                        const { id, data } = message;

                        // Update database
                        const updatedPod = await prisma.pod.update({
                            where: { id },
                            data,
                        });

                        console.log('Data successfully updated in the database:', updatedPod);

                        // Acknowledge message after successful processing
                        channel.ack(msg);
                    } else {
                        console.error('Invalid update message format:', message);
                        channel.nack(msg, false, false); // Nack if the message format is invalid
                    }
                } catch (error) {
                    console.error('Error processing update message:', error);
                    channel.nack(msg, false, false); // Nack if an error occurs
                }
            }
        });
    } catch (error) {
        console.error('Error setting up RabbitMQ consumer:', error);
    }
};

const consumeAnddeleteDatabase = async () => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();
        await channel.assertQueue(delete_pod, { durable: true });

        console.log(`Waiting for messages in queue (delete): ${delete_pod}`);

        channel.consume(delete_pod, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log(`Received message: ${messageContent}`);

                try {
                    const message = JSON.parse(messageContent);

                    if (message.action === 'delete' && message.id && message.data) {
                        const { id } = message;

                        // Update database
                        const updatedPod = await prisma.pod.delete({
                            where: { id },
                        });

                        console.log('Data successfully deleted in the database:', updatedPod);

                        // Acknowledge message after successful processing
                        channel.ack(msg);
                    } else {
                        console.error('Invalid update message format:', message);
                        channel.nack(msg, false, false); // Nack if the message format is invalid
                    }
                } catch (error) {
                    console.error('Error processing update message:', error);
                    channel.nack(msg, false, false); // Nack if an error occurs
                }
            }
        });
    } catch (error) {
        console.error('Error setting up RabbitMQ consumer:', error);
    }
};

const consumePodData = async () => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();

        const exchangeName = 'pod_event_exchange';
        await channel.assertExchange(exchangeName, 'fanout', { durable: true });

        const { queue } = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(queue, exchangeName, '');

        console.log(`Pod is waiting for messages on queue: ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log(`Pod received data: ${JSON.stringify(data)}`);

                try {
                    await prisma.pod.create({
                        data: {
                            id: data.id,
                            url: data.url,
                            identification: data.identification,
                            username: data.username,
                            password: data.password
                        }
                    });

                    console.log('Data saved to pod database');
                    channel.ack(msg);
                } catch (dbError) {
                    console.error('Failed to save data to pod database:', dbError);
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error('Failed to consume data:', error);
    }
};

const fetchInitialData = async () => {
    try {
        const response = await fetch('http://localhost:3001/pod');
        const result = await response.json();

        const initialData = result.data;

        if (!Array.isArray(initialData)) {
            throw new Error('Unexpected data format: "data" is not an array');
        }

        for (const data of initialData) {
            await prisma.pod.create({
                data: {
                    id: data.id,
                    url: data.url,
                    identification: data.identification,
                    username: data.username,
                    password: data.password,
                },
            });
        }

        console.log('Initial data synchronized successfully');
    } catch (error) {
        console.error('Failed to synchronize initial data:', error);
    }
};

export {
    consumeAndAddToDatabase,
    consumeAndUpdateDatabase, 
    consumeAnddeleteDatabase, 
    consumePodData, 
    fetchInitialData
}

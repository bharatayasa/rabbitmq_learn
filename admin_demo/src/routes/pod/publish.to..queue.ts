import amqp from 'amqplib';
const dotenv = require('dotenv');
dotenv.config();

const connectionUrl = process.env.RABBITMQ_URL;

const update_pod = 'update-pod';
const delete_pod = 'delete-pod';

const create_pod = 'create-pod';
const publishToQueue = async (message: any) => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();
        await channel.assertQueue(create_pod, { durable: true });

        const messageString = typeof message === 'string' ? message : JSON.stringify(message);

        channel.sendToQueue(create_pod, Buffer.from(messageString));
        console.log(`Sent message to RabbitMQ: ${messageString}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
        throw new Error('Failed to send message to RabbitMQ');
    }
};

const updateQueue = async (message: any) => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();
        await channel.assertQueue(update_pod, { durable: true });

        const messageString = typeof message === 'string' ? message : JSON.stringify(message);

        channel.sendToQueue(update_pod, Buffer.from(messageString));
        console.log(`Sent message to RabbitMQ: ${messageString}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
        throw new Error('Failed to send message to RabbitMQ');
    }
};

const deleteQueue = async (message: any) => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();  // Buat channel
        await channel.assertQueue(delete_pod, { durable: true }); // Pastikan antrean ada

        // Konversi pesan ke string sebelum dikirim
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);

        channel.sendToQueue(delete_pod, Buffer.from(messageString)); // Kirim pesan
        console.log(`Sent message to RabbitMQ: ${messageString}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
        throw new Error('Failed to send message to RabbitMQ');
    }
};

const sendDataToPods = async (message: any) => {
    try {
        const connection = await amqp.connect(`${connectionUrl}`);
        const channel = await connection.createChannel();

        const exchangeName = 'pod_event_exchange';
        await channel.assertExchange(exchangeName, 'fanout', { durable: true });

        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        channel.publish(exchangeName, '', Buffer.from(messageString));
        console.log(`Data sent to pods: ${message}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Failed to send data:', error);
    }
};

export { 
    publishToQueue,
    updateQueue, 
    deleteQueue, 
    sendDataToPods
};

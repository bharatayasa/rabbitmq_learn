import amqp from 'amqplib';

const create_pod = 'create-pod';
const update_pod = 'update-pod';
const delete_pod = 'delete-pod';

// Fungsi untuk mempublikasikan pesan ke RabbitMQ
const publishToQueue = async (message: any) => {
    try {
        const connection = await amqp.connect('amqp://192.168.199.69:5672');
        const channel = await connection.createChannel();  // Buat channel
        await channel.assertQueue(create_pod, { durable: true }); // Pastikan antrean ada

        // Konversi pesan ke string sebelum dikirim
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);

        channel.sendToQueue(create_pod, Buffer.from(messageString)); // Kirim pesan
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
        const connection = await amqp.connect('amqp://192.168.199.69:5672');
        const channel = await connection.createChannel();  // Buat channel
        await channel.assertQueue(update_pod, { durable: true }); // Pastikan antrean ada

        // Konversi pesan ke string sebelum dikirim
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);

        channel.sendToQueue(update_pod, Buffer.from(messageString)); // Kirim pesan
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
        const connection = await amqp.connect('amqp://192.168.199.69:5672');
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

export { 
    publishToQueue,
    updateQueue, 
    deleteQueue
};

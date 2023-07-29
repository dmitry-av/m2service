import express, { json } from 'express';
import { connect } from 'amqplib';
import { createLogger, format as _format, transports as _transports } from 'winston';

const app = express();
const logger = createLogger({
    level: 'info',
    format: _format.simple(),
    transports: [new _transports.Console()],
});

const QUEUE_NAME = 'task_queue';
const REPLY_QUEUE_NAME = 'reply_queue';

app.use(json());

async function start() {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672/');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.assertQueue(REPLY_QUEUE_NAME, { exclusive: true });

        channel.consume(
            REPLY_QUEUE_NAME,
            (message) => {
                const result = JSON.parse(message.content.toString());
                logger.info('Получен результат обработки задания из микросервиса M2', result);
            },
            { noAck: true }
        );

        // обработка HTTP запросов
        app.post('/process', async (req, res) => {
            try {
                const task = req.body;

                // публикация задания в очередь
                channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(task)), {
                    persistent: true,
                    replyTo: REPLY_QUEUE_NAME,
                    correlationId: generateUuid(),
                });

                logger.info('Задание успешно отправлено в очередь RabbitMQ');
                res.json({ message: 'Задание успешно отправлено в очередь RabbitMQ' });
            } catch (error) {
                logger.error('Произошла ошибка при отправке задания в очередь RabbitMQ', error);
                res.status(500).json({ error: 'Произошла ошибка при отправке задания в очередь RabbitMQ' });
            }
        });

        const port = 3000;
        app.listen(port, () => {
            logger.info(`Микросервис M1 запущен на порту ${port}`);
        });
    } catch (error) {
        logger.error('Произошла ошибка при запуске микросервиса M1', error);
    }
}

function generateUuid() {
    return Math.random().toString() + Date.now().toString();
}

start();

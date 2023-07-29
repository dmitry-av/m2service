import { connect } from 'amqplib';
import { createLogger, format as _format, transports as _transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: _format.simple(),
    transports: [new _transports.Console()],
});

const QUEUE_NAME = 'task_queue';

async function processTask(task) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ result: `Processed task: ${JSON.stringify(task)}` });
        }, 3000);
    });
}

async function startWorker() {
    try {
        const connection = await connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672/');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);

        logger.info('Микросервис M2 ожидает задания из очереди RabbitMQ');

        channel.consume(
            QUEUE_NAME,
            async (message) => {
                const task = JSON.parse(message.content.toString());
                logger.info('Получено задание из очереди RabbitMQ', task);

                // обработка задания
                const result = await processTask(task);

                // отправка результата обратно в М1
                channel.sendToQueue(
                    message.properties.replyTo,
                    Buffer.from(JSON.stringify(result)),
                    {
                        correlationId: message.properties.correlationId,
                    }
                );

                logger.info('Задание успешно обработано и результат отправлен обратно в M1');
                channel.ack(message);
            },
            { noAck: false }
        );
    } catch (error) {
        logger.error('Произошла ошибка при запуске микросервиса M2', error);
    }
}

startWorker();

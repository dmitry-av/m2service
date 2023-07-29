## Механизм асинхронной обработки HTTP запросов с помощью RabbitMQ

### Инструкции для запуска
#### С помощью Docker и Docker-compose:
Запустите команду *docker-compose up*, подождите пока все сервисы запустятся успешно, приложение доступно для http запросов. Посылаем POST запрос, например, {"task":2} на http://localhost:3000/process
В логах запущенных сервисов видим обработку запроса и в итоге результат выполения задания на m1.

#### Вручую:  
Выполняем установку модулей в с помощью *npm install*, далее запускаем оба сервиса (указываем адрес вашего rabbitmq сервера, пример дан для powershell терминала):    
*$env:RABBITMQ_URL="amqp://localhost:5673/"; npm start*   
(либо каждый сервис отдельно вручную в каждом терминале, также с передачей env variable)
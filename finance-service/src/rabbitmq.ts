import amqp from 'amqplib';
import { pool } from './config/database';

let connection: any;
let channel: amqp.Channel;

export async function consumeUserCreatedQueue() {
  try {
    const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();

    const queue = 'user-created-queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('Finance Service conectado ao RabbitMQ. A aguardar mensagens...');

    // Começa a consumir mensagens da fila
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const eventData = JSON.parse(msg.content.toString());
          const { userId } = eventData;

          console.log(`Evento recebido para criar categorias do utilizador ID: ${userId}`);

          // categorias padrão para este novo utilizador
          const defaultCategories = [
            { name: 'Alimentação', type: 'expense' },
            { name: 'Salário', type: 'income' },
            { name: 'Transporte', type: 'expense' },
            { name: 'Lazer', type: 'expense' }
          ];

          for (const category of defaultCategories) {
            await pool.query(
              'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3)',
              [userId, category.name, category.type]
            );
          }

          console.log(`Categorias padrão criadas com sucesso para o utilizador ${userId}!`);

          // Confirma ao RabbitMQ que a mensagem foi processada com sucesso
          channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem da fila:', error);
          // Rejeita a mensagem e recoloca-a na fila se houver erro transiente (opcional)
          channel.nack(msg, false, true);
        }
      }
    });

  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ no Finance Service:', error);
  }
}
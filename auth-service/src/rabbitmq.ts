import amqp from 'amqplib';

let channel: amqp.Channel;
let connection: any;

export async function connectRabbitMQ() {
  try {
    const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();
    
    // verificar que a fila existe
    await channel.assertQueue('user-created-queue', { durable: true });
    
    console.log('Auth Service conectado ao RabbitMQ com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ no Auth Service:', error);
  }
}

export async function publishUserCreated(userData: { userId: number; email: string }) {
  if (!channel) {
    console.error('❌ Canal do RabbitMQ não inicializado.');
    return;
  }
  
  const queue = 'user-created-queue';
  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(userData)),
    { persistent: true }
  );
  
  console.log(`Evento de utilizador criado publicado para o ID: ${userData.userId}`);
}
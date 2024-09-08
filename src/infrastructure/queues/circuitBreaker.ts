import CircuitBreaker from 'opossum';
import { publishToQueue } from '../../services/RabbitMQPublisher';

const options = {
  timeout: 5000, 
  errorThresholdPercentage: 50, 
  resetTimeout: 30000,
};

const circuitBreaker = new CircuitBreaker(async (message: any, queueName: string) => {
  await publishToQueue(queueName, message);
}, options);

circuitBreaker.fallback((message: any, queueName: string) => {
  console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
});

export const publishUserCreationMessage = async (message: any) => {
  return circuitBreaker.fire(message, 'chat-service-create-user');
};

export const publishProfileImageUpdateMessage = async (message: any) => {
  return circuitBreaker.fire(message, 'chat-service-update-profile-image');
};

export const publishProfileUpdateMessage = async (message: any) => {
  return circuitBreaker.fire(message, 'chat-service-update-profile');
};
  
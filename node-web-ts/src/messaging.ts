import exp from "constants";
import { ConsumerConfig, Kafka, KafkaConfig, Producer } from "kafkajs";

const kafkaConfig: KafkaConfig = {
  brokers: [process.env.KAFKA_BROKER!],
  clientId: "example-consumer",
};
const kafka = new Kafka(kafkaConfig);

const producer = kafka.producer();

const consumerConfig: ConsumerConfig = { groupId: "log-group" };
const consumer = kafka.consumer(consumerConfig);

let loggedMessages: Array<{
  offset: string;
  text: string;
  timestamp: string;
}> = [];

export async function setupMessaging() {
  await producer.connect();
  console.log("Connected producer to Kafka.");
  await consumer.connect();
  await consumer.subscribe({ topics: ["test"] });
  consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log("Received message: "+message);
      let date = new Date(parseInt(message.timestamp)).toISOString()
      loggedMessages.push({
        timestamp: date,
        offset: message.offset,
        text: message.value!.toString(),
      });
    },
  });
  console.log("Connected consumer to Kafka");
}

export async function sendMessage(message: string) {
  producer.send({
    topic: "test",
    messages: [
      {
        key: "foo",
        value: message,
      },
    ],
  });
}

export function getMessages(): {
  offset: string;
  text: string;
  timestamp: string;
}[] {
  return loggedMessages;
}

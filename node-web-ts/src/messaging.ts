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

export interface Message {
  offset: string;
  text: string;
  timestamp: string;
}

let loggedMessages: Array<Message> = [];

export async function setupMessaging() {
  await producer.connect();
  console.log("Connected producer to Kafka.");
  await consumer.connect();
  await consumer.subscribe({ topics: ["test"] });
  consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log("Received message: " + message);
      let date = new Date(parseInt(message.timestamp)).toISOString();
      const msg = {
        timestamp: date,
        offset: message.offset,
        text: message.value!.toString(),
      };
      loggedMessages.push(msg);
      console.log("notify listeners: " + listeners);
      listeners.forEach((l) => l(msg));
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
let listeners: Listener[] = [];
export interface Listener {
  (msg: Message):void;
}

export function subscribe(listener: Listener) {
  listeners.push(listener);
  console.log("listener subscribed to messages");
}

export function unsubscribe(listener: Listener) {
  listeners = listeners.filter((x) => x != listener);
}

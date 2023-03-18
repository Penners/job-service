import { ApiHandler } from "sst/node/api";
import { Time } from "@job-service/core/time";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";

const sqs = new AWS.SQS();

export const bulkAddJobs = ApiHandler(async (_evt) => {
  console.log("Lamdba event:", _evt);
  // Send a message to queue
  if (!_evt.body) {
    return {
      statusCode: 500,
      body: "No Params",
    };
  }
  const body = JSON.parse(_evt.body);

  console.log("Queue", Queue.Queue);

  await sqs
    .sendMessage({
      // Get the queue url from the environment variable
      QueueUrl: Queue.Queue.queueUrl,
      MessageGroupId: "Import",
      MessageBody: JSON.stringify({
        ordered: true,
        foo: "bar",
        url: "https://test.com",
      }),
    })
    .promise();

  console.log("Message queued!");

  return {
    body: `Event Queued The time is ${Time.now()}`,
  };
});

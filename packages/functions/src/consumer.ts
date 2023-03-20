import { jobSchema } from "@job-service/core/validator";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
import axios, { AxiosHeaders } from "axios";

type Response = { batchItemFailures: { itemIdentifier: string }[] };

const sqs = new AWS.SQS();

export const handler = async (event: SQSEvent): Promise<Response> => {
  const records = event.Records;

  const response: Response = { batchItemFailures: [] };

  const requests = records.map(async (record) => {
    try {
      await makeRequest(record);
      await sqs.deleteMessage({
        QueueUrl: Queue.Queue.queueUrl,
        ReceiptHandle: record.receiptHandle,
      });
    } catch (e) {
      console.log("Pushing Failure:", record.messageId);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(requests);
  return response;
};

export const makeRequest = async (record: SQSRecord) => {
  const body = JSON.parse(record.body);
  const params = jobSchema.parse(body);
  return axios
    .request({
      method: params.method,
      headers: params.headers as AxiosHeaders,
      data: params.body,
      url: params.url,
    })
    .then((req) => {
      console.log(`Request Success:`, {
        url: params.url,
        method: params.method,
        headers: params.headers as AxiosHeaders,
        data: params.body,
      });
      return true;
    })
    .catch((e) => {
      console.log(`Request Failed:`, {
        url: params.url,
        method: params.method,
        headers: params.headers as AxiosHeaders,
        data: params.body,
      });
      throw e;
    });
};

import { jobSchema } from "@job-service/core/validator";
import { SQSEvent, SQSRecord } from "aws-lambda";
import axios, { AxiosHeaders } from "axios";

type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent): Promise<Response> => {
  const records = event.Records;

  const response: Response = { batchItemFailures: [] };

  const requests = records.map(async (record) => {
    try {
      await makeRequest(record);
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
    .then((req) => console.log(`Request Success:`, params.url))
    .catch((e) => {
      console.log(`Request Failed:`, params.url);
      throw e;
    });
};

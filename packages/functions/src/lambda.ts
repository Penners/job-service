import { ApiHandler } from "sst/node/api";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import crypto from "crypto";
import { arraySchema, jobSchema } from "@job-service/core/validator";
import { ZodError, z } from "zod";
import { SendMessageBatchRequestEntry } from "aws-sdk/clients/sqs";

const sqs = new AWS.SQS();

export const bulkAddJobs = ApiHandler(async (_evt) => {
  try {
    const body = _evt?.body && JSON.parse(_evt?.body);
    const jobsArray = arraySchema.parse(body);

    const messageMap = new Map<string, SendMessageBatchRequestEntry>();
    const validationErrors: any = [];

    jobsArray.forEach((event) => {
      const message = jobSchema.safeParse(event);

      if (message.success === false) {
        validationErrors.push({
          payload: event,
          error: message.error,
        });
        return;
      }

      const messageBody = JSON.stringify({
        url: message.data.url,
        headers: message.data?.headers,
        method: message.data?.method,
        body: message.data?.body,
      });
      const messageId = crypto
        .createHash("md5")
        .update(messageBody)
        .digest("hex");
      messageMap.set(messageId, {
        Id: messageId,
        MessageBody: messageBody,
      });
    });

    const result = await sqs
      .sendMessageBatch({
        QueueUrl: Queue.Queue.queueUrl,
        Entries: Array.from(messageMap.values()),
      })
      .promise();

    return {
      statusCode:
        result.Failed.length === 0 && validationErrors.length === 0 ? 200 : 207,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        successful: result.Successful.map((message) => {
          const body = messageMap.get(message.Id)?.MessageBody;
          const bodyOjb = body && JSON.parse(body);
          return {
            ...message,
            payload: bodyOjb,
          };
        }),
        failed: result.Failed.map((message) => {
          const body = messageMap.get(message.Id)?.MessageBody;
          const bodyOjb = body && JSON.parse(body);
          return {
            ...message,
            payload: bodyOjb,
          };
        }),
        invalid: validationErrors,
      }),
    };
  } catch (e) {
    let statusCode = 500;
    if (e instanceof ZodError) {
      statusCode = 400;
    }
    return {
      statusCode: statusCode,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(e),
    };
  }
});

import { StackContext, Api, Queue } from "sst/constructs";

export function API({ stack }: StackContext) {
  const queue = new Queue(stack, "Queue", {
    consumer: "packages/functions/src/consumer.handler",
  });
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [queue],
      },
    },
    routes: {
      "POST /bulkAddJobs": "packages/functions/src/lambda.bulkAddJobs",
    },
  });
  queue.bind([queue]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

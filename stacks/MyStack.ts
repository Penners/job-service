import { StackContext, Api, Queue } from "sst/constructs";

export function API({ stack }: StackContext) {
  const queue = new Queue(stack, "Queue", {
    consumer: "packages/functions/src/consumer.handler",
    cdk: {
      queue: {
        fifo: true,
        contentBasedDeduplication: true,
      },
    },
  });
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [queue],
      },
    },
    routes: {
      "POST /": "packages/functions/src/lambda.handler",
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

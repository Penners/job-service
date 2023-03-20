Simple Async HTTP event callbacks for serverless job execution.

Designed to be invoked for tasks that'd take longer than a normal response cycle. Not designed for truely long running tasks of spanning multiple minutes.
Examples include running a vercel cron then queuing up time consuming tasks that can be completed asynchronously via HTTP callback.

Current use case is to

The Queue is a simple queue. Order of message processing is not guarenteed and there is no de-duping in place.

HTTP API signature

```
POST /bulkAddJobs

[
    {
        "url": "https://example.com?query=yes",
        "method": "POST"
        "body": {
            "foo": "bar"
        },
        headers: {
            "apiKey": "1234"
        }
    },
    {
        "url": string,
        "method"?: string // defaults to GET
        "body?": any
        "headers"?: Record<string, string>
    }
]

```

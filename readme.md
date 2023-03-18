Simple Async HTTP event callbacks for serverless job execution.

Designed to be invoked tasks for that'd take longer than a normal response cycle. Not designed for tasks of over 30 seconds.
Examples include running a vercel cron then queuing up time consuming tasks that can be completed asynchronously via HTTP callback.

Current use case is to

```
POST /

[
    {
        "url": "https://example.com?query=yes",
        "body": {
            "foo": "bar"
        },
        headers: {
            "apiKey": "1234"
        }
    }
]

```

Simple Async HTTP event callbacks for serverless job execution.

Designed to be invoked for tasks that'd take longer than a normal response cycle. Not designed for truely long running tasks of spanning multiple minutes. 
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

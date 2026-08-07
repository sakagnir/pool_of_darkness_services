import client from "prom-client";

client.collectDefaultMetrics();

export const httpRequestsTotal =
    new client.Counter({
        name: "karaoke_http_requests_total",
        help: "Nombre total de requêtes HTTP"
    });

export const httpErrorsTotal =
    new client.Counter({
        name: "karaoke_http_errors_total",
        help: "Nombre total d'erreurs HTTP"
    });

export const httpRequestDuration =
    new client.Histogram({
        name: "karaoke_http_request_duration_seconds",
        help: "Durée des requêtes HTTP",
        buckets: [
            0.005,
            0.01,
            0.05,
            0.1,
            0.5,
            1,
            2,
            5
        ]
    });

export async function metrics(req, res) {
    res.set(
        "Content-Type",
        client.register.contentType
    );

    res.end(
        await client.register.metrics()
    );
}
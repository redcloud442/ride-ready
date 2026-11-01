// Thrown from services; the app error handler sends 4xx messages to the client as-is.
export const httpError = (statusCode: number, message: string) => Object.assign(new Error(message), { statusCode });

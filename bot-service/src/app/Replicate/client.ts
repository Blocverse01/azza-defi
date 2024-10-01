import Replicate from 'replicate';

let replicateClient: Replicate | undefined = undefined;

export const getReplicateClient = (authKey: string) => {
    if (replicateClient) return replicateClient;

    replicateClient = new Replicate({
        auth: authKey,
    });

    return replicateClient;
};

export type Email = {
    to: string;
    subject: string;
    body: string;
};

export type ProviderResponse = {
    success: boolean;
    error?: string;
};

export interface EmailProvider {
    send(email: Email): Promise<ProviderResponse>;
}

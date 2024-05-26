interface GraphQLResponse<T> {
    data: T;
    errors?: Array<{ message: string }>;
}

interface ChangeUserStatusResponse {
  changeUserStatus: {
    status: {
      message: string;
      emoji: string;
      indicatesLimitedAvailability: boolean;
    };
  };
}

class GitHubGraphQLClient {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public async query<T>(query: string, variables: Record<string, any> = {}): Promise<GraphQLResponse<T>> {
        const url = 'https://api.github.com/graphql';

        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: 'post',
            contentType: 'application/json',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            payload: JSON.stringify({
                query,
                variables,
            }),
        };

        const response = UrlFetchApp.fetch(url, options);
        const responseBody: GraphQLResponse<T> = JSON.parse(response.getContentText());

        if (responseBody.errors) {
            console.error('GraphQL error:', responseBody.errors);
            throw new Error(`GraphQL error: ${JSON.stringify(responseBody.errors)}`);
        }

        return responseBody;
    }

    public async updateUserStatus(message: string, emoji: string, limitedAvailability: boolean): Promise<ChangeUserStatusResponse> {
        const query = `
            mutation($message: String!, $emoji: String!, $limitedAvailability: Boolean!) {
                changeUserStatus(input: { message: $message, emoji: $emoji, limitedAvailability: $limitedAvailability }) {
                    clientMutationId
                    status {
                        message
                        emoji
                        indicatesLimitedAvailability
                    }
                }
            }
        `;

        const variables = {
            message,
            emoji,
            limitedAvailability,
        };

        try {
            const response = await this.query<ChangeUserStatusResponse>(query, variables);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

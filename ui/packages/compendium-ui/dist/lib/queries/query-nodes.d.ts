interface UseQueryNodesProps {
    ids: string[];
}
export declare const QUERY_NODE_FRAGMENT: (i: number) => string;
export declare const useQueryNodes: ({ ids }: UseQueryNodesProps) => {
    client: import("@apollo/client").ApolloClient<any>;
    observable: import("@apollo/client").ObservableQuery<any, {
        [key: string]: string;
    }>;
    previousData?: any;
    error?: import("@apollo/client").ApolloError | undefined;
    loading: boolean;
    networkStatus: import("@apollo/client").NetworkStatus;
    called: boolean;
    variables: {
        [key: string]: string;
    } | undefined;
    startPolling: (pollInterval: number) => void;
    stopPolling: () => void;
    subscribeToMore: <TSubscriptionData = any, TSubscriptionVariables = {
        [key: string]: string;
    }>(options: import("@apollo/client").SubscribeToMoreOptions<any, TSubscriptionVariables, TSubscriptionData>) => () => void;
    updateQuery: <TVars = {
        [key: string]: string;
    }>(mapFn: (previousQueryResult: any, options: Pick<import("@apollo/client").WatchQueryOptions<TVars, any>, "variables">) => any) => void;
    refetch: (variables?: Partial<{
        [key: string]: string;
    }> | undefined) => Promise<import("@apollo/client").ApolloQueryResult<any>>;
    reobserve: (newOptions?: Partial<import("@apollo/client").WatchQueryOptions<{
        [key: string]: string;
    }, any>> | undefined, newNetworkStatus?: import("@apollo/client").NetworkStatus | undefined) => Promise<import("@apollo/client").ApolloQueryResult<any>>;
    fetchMore: <TFetchData = any, TFetchVars = {
        [key: string]: string;
    }>(fetchMoreOptions: import("@apollo/client").FetchMoreQueryOptions<TFetchVars, TFetchData> & {
        updateQuery?: ((previousQueryResult: any, options: {
            fetchMoreResult: TFetchData;
            variables: TFetchVars;
        }) => any) | undefined;
    }) => Promise<import("@apollo/client").ApolloQueryResult<TFetchData>>;
    data: any[] | null;
};
export {};

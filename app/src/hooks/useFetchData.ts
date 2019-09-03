import { useState, useEffect, useCallback } from "react";

type TDataFetcherFunction<TArgs extends any[], TReturnData> = (...dataFetcherArgs: TArgs) => Promise<TReturnData>;

const useFetchData = <TArgs extends any[], TReturnData>(dataFetcher: TDataFetcherFunction<TArgs, TReturnData>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TReturnData>();
    const [error, setError] = useState<Error | undefined>();
    const [args, setArgs] = useState<TArgs | undefined>(undefined);

    useEffect(() => {
        if (!args) {
            return;
        }

        let isCanceled = false;

        const getData = async () => {
            setIsLoading(true);
            setError(undefined);

            const data = await dataFetcher(...args);

            if (isCanceled) {
                return;
            }

            setData(data);
            setIsLoading(false);
        };

        const cancelDataGet = () => {
            isCanceled = true;
        };
        
        getData();

        return cancelDataGet; 
    }, [dataFetcher, args]);

    const cancelFetch = useCallback(() => {
        setArgs(undefined);
        setIsLoading(false);
        setError(undefined);
    }, []);

    return {
        isLoading,
        data,
        error,
        doFetch: setArgs,
        cancelFetch,
    };
};

export default useFetchData;
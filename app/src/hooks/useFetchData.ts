import { useState, useEffect, useCallback } from "react";

type TDataFetcherFunction<TArgs extends any[], TReturnData> = (...dataFetcherArgs: TArgs) => Promise<TReturnData>;

const useFetchData = <TArgs extends any[], TReturnData>(dataFetcher: TDataFetcherFunction<TArgs, TReturnData>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TReturnData>();
    const [error, setError] = useState<Error>();
    const [args, setArgs] = useState<TArgs>();

    useEffect(() => {
        if (!args) {
            return;
        }

        let isCanceled = false;

        const getData = async () => {
            setIsLoading(true);
            setError(undefined);

            let data: TReturnData | undefined = undefined;
            let error: Error | undefined = undefined;
            try {
                data = await dataFetcher(...args);
                if (isCanceled) {
                    return;
                }
            }
            catch (e) {
                error = e;
            }

            if (isCanceled) {
                return;
            }

            setData(data);
            setError(error);
            setIsLoading(false);
        };

        const cancelDataGet = () => {
            isCanceled = true;
        };
        
        getData();
        return cancelDataGet; 
    }, [dataFetcher, args]);

    const doFetch = useCallback((...args: TArgs) => setArgs(args), []);

    const cancelFetch = useCallback(() => {
        setArgs(undefined);
        setIsLoading(false);
        setError(undefined);
    }, []);

    return {
        isLoading,
        data,
        error,
        doFetch,
        cancelFetch,
    };
};

export default useFetchData;
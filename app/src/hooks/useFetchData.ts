import { useEffect, useCallback, useReducer, Reducer } from "react";

// data fetcher argument
type TDataFetcherFunction<TArgs extends any[], TReturnData> = (...dataFetcherArgs: TArgs) => Promise<TReturnData>;

// reducer state
interface ReducerState<TData, TArgs extends any[]> {
    isLoading: boolean;
    data?: TData;
    error?: Error;
    args?: TArgs;
};

// reducer action types
enum ReducerActionType {
    START_LOADING,
    CANCEL_LOADING,
    SET_RESULTS,
    SET_ARGS,
}

// loading action
interface ReducerStartLoadingAction {
    type: ReducerActionType.START_LOADING,
}

// cancel loading action
interface ReducerCancelLoadingAction {
    type: ReducerActionType.CANCEL_LOADING,
}

// set results action
interface ReducerSetResultsAction<TData> {
    type: ReducerActionType.SET_RESULTS,
    payload: {
        data?: TData;
        error?: Error;
    },
}

// set args action
interface ReducerSetArgsAction<TArgs extends any[]> {
    type: ReducerActionType.SET_ARGS;
    payload: TArgs;
};

// action types
type TReducerAction<TData, TArgs extends any[]> =
    | ReducerStartLoadingAction
    | ReducerCancelLoadingAction
    | ReducerSetResultsAction<TData>
    | ReducerSetArgsAction<TArgs>;

// reducer
type TReducer<TData, TArgs extends any[]> = Reducer<ReducerState<TData, TArgs>, TReducerAction<TData, TArgs>>;

// reducer creator function
const getReducer = <TData, TArgs extends any[]>(): TReducer<TData, TArgs> => (state, action) => {
    switch (action.type) {
        case ReducerActionType.START_LOADING:
            return {
                ...state,
                isLoading: true,
                error: undefined,
            };

        case ReducerActionType.CANCEL_LOADING:
                return {
                    ...state,
                    isLoading: false,
                    error: undefined,
                    args: undefined,
                };

        case ReducerActionType.SET_RESULTS:
            return {
                ...state,
                isLoading: false,
                data: action.payload.data,
                error: action.payload.error,
            };

        case ReducerActionType.SET_ARGS:
            return {
                ...state,
                args: action.payload,
            };
    }
};

const useFetchData = <TArgs extends any[], TReturnData>(dataFetcher: TDataFetcherFunction<TArgs, TReturnData>) => {
    const reducer = getReducer<TReturnData, TArgs>();
    const initialState: ReducerState<TReturnData, TArgs> = { isLoading: false };
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isLoading, data, error, args } = state;

    useEffect(() => {
        if (!args) {
            return;
        }

        let isCanceled = false;

        const getData = async () => {
            dispatch({ type: ReducerActionType.START_LOADING });

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

            dispatch({
                type: ReducerActionType.SET_RESULTS,
                payload: { data, error },
            });
        };

        const cancelDataGet = () => {
            isCanceled = true;
        };
        
        getData();
        return cancelDataGet; 
    }, [dataFetcher, args]);

    const doFetch = useCallback((...args: TArgs) => dispatch({ type: ReducerActionType.SET_ARGS, payload: args }), []);
    const cancelFetch = useCallback(() => dispatch({ type: ReducerActionType.CANCEL_LOADING }), []);

    return {
        isLoading,
        data,
        error,
        doFetch,
        cancelFetch,
    };
};

export default useFetchData;
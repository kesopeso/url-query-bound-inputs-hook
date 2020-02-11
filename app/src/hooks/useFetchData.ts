import { useCallback, useReducer, Reducer, useRef } from 'react';

// data fetcher type
type TDataFetcher<TData> = () => Promise<TData>;

// reducer state
interface ReducerState<TData, TError> {
    loadCount: number;
    isLoading: boolean;
    isCanceled: boolean;
    data?: TData;
    error?: TError;
}

// reducer action types
enum ReducerActionType {
    START_LOADING,
    CANCEL_LOADING,
    SET_RESULTS,
}

// loading action
interface ReducerStartLoadingAction {
    type: ReducerActionType.START_LOADING;
}

// cancel loading action
interface ReducerCancelLoadingAction {
    type: ReducerActionType.CANCEL_LOADING;
}

// set results action
interface ReducerSetResultsAction<TData, TError> {
    type: ReducerActionType.SET_RESULTS;
    payload: {
        data?: TData;
        error?: TError;
    };
}

// action types
type TReducerAction<TData, TError> =
    | ReducerStartLoadingAction
    | ReducerCancelLoadingAction
    | ReducerSetResultsAction<TData, TError>;

// reducer
type TReducer<TData, TError> = Reducer<ReducerState<TData, TError>, TReducerAction<TData, TError>>;

// reducer creator function
const getReducer = <TData, TError>(): TReducer<TData, TError> => (state, action) => {
    switch (action.type) {
        case ReducerActionType.START_LOADING:
            return {
                ...state,
                loadCount: state.loadCount + 1,
                isLoading: true,
                isCanceled: false,
            };

        case ReducerActionType.CANCEL_LOADING:
            return {
                ...state,
                isLoading: false,
                isCanceled: state.isCanceled || state.isLoading,
            };

        case ReducerActionType.SET_RESULTS:
            return {
                ...state,
                isLoading: false,
                isCanceled: false,
                data: action.payload.data,
                error: action.payload.error,
            };
    }
};

const useFetchData = <TData, TError = Error>() => {
    const reducer = getReducer<TData, TError>();
    const initialState: ReducerState<TData, TError> = {
        loadCount: 0,
        isLoading: false,
        isCanceled: false,
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const { loadCount, isLoading, isCanceled, data, error } = state;

    const fetchTokenRef = useRef<number | undefined>(undefined);
    const loadCountRef = useRef(loadCount);
    loadCountRef.current = loadCount;

    const doFetch = useCallback(
        (dataFetcher: TDataFetcher<TData>) => {
            const getData = async () => {
                let data: TData | undefined = undefined;
                let error: TError | undefined = undefined;

                const fetchToken = loadCountRef.current;
                fetchTokenRef.current = fetchToken;

                try {
                    dispatch({ type: ReducerActionType.START_LOADING });
                    data = await dataFetcher();
                } catch (e) {
                    error = e as TError;
                }

                /*
                 * We need to check if the fetched result is relevant (there were
                 * no new requests issued and the current request was not canceled).
                 */
                const shouldIgnoreResult = fetchTokenRef.current !== fetchToken;
                if (shouldIgnoreResult) {
                    return;
                }

                dispatch({
                    type: ReducerActionType.SET_RESULTS,
                    payload: { data, error },
                });
            };

            getData();
        },
        [fetchTokenRef, loadCountRef, dispatch]
    );

    const cancelFetch = useCallback(
        () => {
            fetchTokenRef.current = undefined;
            dispatch({ type: ReducerActionType.CANCEL_LOADING });
        },
        [fetchTokenRef, dispatch]
    );

    return {
        loadCount,
        isLoading,
        isCanceled,
        data,
        error,
        doFetch,
        cancelFetch,
    };
};

export default useFetchData;

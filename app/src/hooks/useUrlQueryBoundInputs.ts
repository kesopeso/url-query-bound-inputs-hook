import {History} from 'history';
import { useEffect } from 'react';

export interface QueryTransformation {
    queryParamName: string;
    setElementValue: (value: string) => void;
}

type TSetQueryParam = (queryParamName: string, value: string) => void

interface UseUrlQueryBoundInputsHook {
    setQueryParam: TSetQueryParam;
}

// gets param from url query
const getParamFromQuery = (search: string, queryParamName: string) => {
    const searchSplit = (search.indexOf('?') === 0 ? search.substring(1) : search).split('&');
    const itemIdx = searchSplit.findIndex((p) => p.indexOf(queryParamName) === 0);
    const result = itemIdx === -1 ? '' : searchSplit[itemIdx];
    const resultSplitted = result.split('=');
    const valueIdx = resultSplitted.length >= 2 ? 1 : 0;
    const resultValue = decodeURIComponent(resultSplitted[valueIdx]);
    return resultValue;
};

// sets url query using history API
const setQueryParam = (queryParamName: string, value: string, history: History) => {
    const newQueryValue = !value ? '' : `?${queryParamName}=${value}`;
    history.push({ search: newQueryValue });
};

// sets element values using transformations array
const setElementValues = (search: string, transformations: QueryTransformation[]) => {
    for (const transformation of transformations) {
        const value = getParamFromQuery(search, transformation.queryParamName);
        transformation.setElementValue(value);
    }
};

/**
 * Hook for changing url query from inputs.
 * This hook also sets initial input values based on starting url query.
 * 
 * @param search url query prefixed with '?'
 * @param history history object from RouteComponentProps
 * @param transformations array of transformations for different query parameters
 *
 * @returns object
 */
const useUrlQueryBoundInputs = ( 
    search: string,
    history: History,
    transformations: QueryTransformation[]
) => {
    useEffect(() => {
        setElementValues(search, transformations);
    }, [search, transformations]);

    var hook: UseUrlQueryBoundInputsHook = {
        setQueryParam: (queryParamName, value) => setQueryParam(queryParamName, value, history),
    };
    return hook;
};

export default useUrlQueryBoundInputs;
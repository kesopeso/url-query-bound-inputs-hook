import { useEffect } from 'react';

export interface QueryTransformation {
    queryParamName: string;
    setElementValue: (value: string) => void;
}

type TEffectCallback = (search: string) => void; 

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
 * @param {string} search url query prefixed with '?'
 * @param {QueryTransformation[]} transformations array of transformations for different query parameters
 * @param {TEffectCallback} applyEffectCallback function to execute when search is changed
 * @param {TEffectCallback} cancelEffectCallback clean up function
 * 
 * @returns void
 */
const useUrlQueryBoundInputs = ( 
    search: string,
    transformations: QueryTransformation[],
    applyEffectCallback: TEffectCallback,
    cancelEffectCallback: TEffectCallback
) => {
    useEffect(() => {
        setElementValues(search, transformations);
        applyEffectCallback(search);
        return () => cancelEffectCallback(search);
    }, [
        search,
        transformations,
        applyEffectCallback,
        cancelEffectCallback
    ]);
};

export default useUrlQueryBoundInputs;
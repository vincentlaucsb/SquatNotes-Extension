import React, { useCallback, useRef, useState } from "react";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export function useStateRef<T>(initialValue: T)
    : [T, SetState<T>, React.MutableRefObject<T>] {
    const [state, setState] = useState(initialValue);
    const ref = useRef(state);

    const dispatch: SetState<T> = useCallback((setStateAction: T | ((value: T) => T)) => {
        ref.current = typeof setStateAction === "function" ?
            (setStateAction as ((value: T) => T))(ref.current)
            : setStateAction;

        setState(ref.current);
    }, []);

    return [state, dispatch, ref];
}
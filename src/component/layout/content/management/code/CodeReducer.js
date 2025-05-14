
export const initialState = {
    subCodeList: [],
    path: "",
    pCode:"root",
};

const CodeReducer = (state, action) => {
    switch (action.type) {
        case "subCodeList":
            return { ...state, subCodeList: [action.list ?? []] };

        case "path":
            return { ...state, path: action.path ?? ""}
        
        case "pCode" :
            return { ...state, pCode: action.pCode}
    }
}

export default CodeReducer;
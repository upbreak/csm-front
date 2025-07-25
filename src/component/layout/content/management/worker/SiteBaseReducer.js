const SiteBaseReducer = (state, action) => {
    switch (action.type) {
        case "EMPTY":
            return {...state, list: []}
        case "INIT":
            const list = Array.isArray(action.list) ? action.list.map((item, idx) => ({...item, index: idx, unableEdit: item.is_deadline === 'Y'})) : [];
            
            return {...state, list: JSON.parse(JSON.stringify(list)), initialList: JSON.parse(JSON.stringify(list)), count: action.count};
        case "SITE_NM":
            const siteNmList = [];
            Array.isArray(action.list) && action.list.forEach(item => {
                siteNmList.push({
                    value: item?.sno ?? '',
                    label: item?.site_nm ?? ''
                });
            });

            return {...state, siteNmList: JSON.parse(JSON.stringify(siteNmList))};            
        case "WORK_STATE_CODE":
            return {...state, workStateCodes: structuredClone(Array.isArray(action.code) ? action.code : [])};

        case "PROJECT_SETTING":
            let projectSet = {};
            if(action.list.length > 0){
                projectSet = action.list[0];
            }
            
            return {...state, projectSetting: projectSet};

        case "DEADLINE_CANCEL_CODE":
            return {...state, deadlineCode: action.list};

        default:
            return state;
    }
}

export default SiteBaseReducer;
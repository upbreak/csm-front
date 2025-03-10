

const DeviceReducer = (state, action) => {
    switch (action.type) {
        case "INIT":

            const devices = action.list.map((device) =>  ( {...device} ) )
            devices.forEach( device => {
                if(device.is_use === "Y"){
                    device.is_use = "사용중"
                }else{
                    device.is_use = "사용안함"
                }
            });
            
            return { ...state, list: JSON.parse(JSON.stringify(action.list)), count: action.count, devices: JSON.parse(JSON.stringify(devices))};

        case "SITE_NM":

            const siteNm = [];
            action.list.map((item, idx) => {
                siteNm.push({ value: item.sno, label: item.site_nm });
            })

            const selectList = {
                siteNm: siteNm
            }
            return { ...state, selectList: JSON.parse(JSON.stringify(selectList)) };
    }
}

export default DeviceReducer;
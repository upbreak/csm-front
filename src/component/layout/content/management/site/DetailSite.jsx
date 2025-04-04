import { useState, useEffect } from "react";
import { dateUtil } from "../../../../../utils/DateUtil";
import DateInput from "../../../../module/DateInput";
import Button from "../../../../module/Button";
import Select from 'react-select';
import whether0 from "../../../../../assets/image/whether/0.png";
import whether1 from "../../../../../assets/image/whether/1.png";
import whether2 from "../../../../../assets/image/whether/2.png";
import whether3 from "../../../../../assets/image/whether/3.png";
import whether4 from "../../../../../assets/image/whether/4.png";
import whether5 from "../../../../../assets/image/whether/5.png";
import whether6 from "../../../../../assets/image/whether/6.png";
import whether7 from "../../../../../assets/image/whether/7.png";
import whether13 from "../../../../../assets/image/whether/13.png";
import whether14 from "../../../../../assets/image/whether/14.png";
import Map from "../../../../module/Map";

/**
 * @description: 현장 상세 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-04
 * @modified 최종 수정일: 2025-03-14
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - dateUtil: 날짜 포맷
 * - DateInput: 커스텀 캘린더
 * 
 */
const DetailSite = ({isEdit, detailData, projectData, handleChangeValue, addressData, isSiteAdd}) => {
    const [data, setData] = useState(null);
    const [openingDate, setOpeningDate] = useState(dateUtil.now());
    const [closingPlanDate, setClosingPlanDate] = useState(dateUtil.now());
    const [closingForecastDate, setClosingForecastDate] = useState(dateUtil.now());
    const [closingActualDate, setClosingActualDate] = useState(dateUtil.now());
    const [etc, setEtc] = useState("")
    const [projectOption, setProjectOption] = useState([]);


    // 현장 데이터 변경 이벤트
    const handleChange = (name, value) => {
        if (data === null) return

        if(name === "site_pos"){
            const sitePos = {
                road_address: value.roadAddress,
                building_name: value.buildingName,
                zone_code: value.zonecode,
                address_name_depth1: value.sido,
                address_name_depth2: value.sigungu,
                address_name_depth3: value.bname1,
                address_name_depth4: value.bname,
                address_name_depth5: value.jibunAddress.replace(value.sido, "").replace(value.sigungu, "").replace(value.bname1, "").replace(value.bname, "").trim(),
                road_address_name_depth1: value.sido,
                road_address_name_depth2: value.sigungu,
                road_address_name_depth3: value.bname1,
                road_address_name_depth4: value.roadname,
                road_address_name_depth5: value.roadAddress.replace(value.sido, "").replace(value.sigungu, "").replace(value.bname1, "").replace(value.roadname, "").trim(),                
            }
            handleChangeValue(name, sitePos)
        }else if (name === "site_date"){   
            
            const siteDate = {
                opening_date : dateUtil.parseToGo(openingDate),
                closing_plan_date : dateUtil.parseToGo(closingPlanDate),
                closing_forecast_date: dateUtil.parseToGo(closingForecastDate),
                closing_actual_date: dateUtil.parseToGo(closingActualDate),
                reg_date: detailData.site_date.reg_date,
                reg_uno:detailData.site_date.reg_uno,
                reg_user: detailData.site_date.reg_user,
            } 
            handleChangeValue(name, siteDate)
            
        }else if (name === "etc") {

            handleChangeValue(name, etc.replace(/\n/g, "\\n"))
        }

    }

    // 캘린더에 사용할 수 있도록 날짜 데이터 초기화 및 textarea 반영을 위해 비고 초기화
    const setDateInit = () => {
        setOpeningDate(dateUtil.format(detailData.site_date.opening_date));
        setClosingPlanDate(dateUtil.format(detailData.site_date.closing_plan_date));
        setClosingForecastDate(dateUtil.format(detailData.site_date.closing_forecast_date));
        setClosingActualDate(dateUtil.format(detailData.site_date.closing_actual_date));
        setEtc(detailData.etc)
    }


    // 날씨 api 정보 확인
    const getIsWhether = (whether) => {
        if(whether?.length === 0) return false;
        return true;
    }

    // 날씨(강수형태) && 날씨(하늘상태)
    const getPtyNSkyData = (whether) => {

        let whetherIcon = whether0
        let whetherText = "맑음" 

        const temp = whether?.filter(item => item.key === "PTY");
        // 하늘 상태 추가
        const cloudy = whether?.filter(item => item.key === "SKY");
        switch (temp[0]?.value) {
            case "0":
                switch (cloudy[0]?.value) {
                    case "1":
                        whetherIcon = whether0;
                        whetherText = "맑음";
                        break;
                    case "3":
                        whetherIcon = whether13;
                        whetherText = "구름많음";
                        break;
                    case "4":
                        whetherIcon = whether14;
                        whetherText = "흐림";
                }
                break;
            case "1":
                whetherIcon = whether1;
                whetherText = "비";
                break;
            case "2":
                whetherIcon = whether2;
                whetherText = "비/눈";
                break;
            case "3":
                whetherIcon = whether3;
                whetherText = "눈";
                break;
            case "4":
                whetherIcon = whether4;
                whetherText = "소나기";
                break;
            case "5":
                whetherIcon = whether5;
                whetherText = "빗방울";
                break;
            case "6":
                whetherIcon = whether6;
                whetherText = "비/눈";
                break;
            case "7":
                whetherIcon = whether7
                whetherText = "눈";
            default: break;
        }

        return <>
            <img src={whetherIcon} style={{ width: "19px" }} /> {whetherText}
        </>
    }

    // 날씨(강수량)
    const getRn1Data = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp = whether?.filter(item => item.key === "RN1");
        return ` 강수량: ${temp[0]?.value}(㎜) `;
    }

    // 날씨(기온)
    const getT1hData = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp = whether?.filter(item => item.key === "T1H");
        return ` 기온: ${temp[0]?.value}(°C) `;
    }

    // 날씨(풍속,풍향)
    const getWindData = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp1 = whether?.filter(item => item.key === "WSD");
        const temp2 = whether?.filter(item => item.key === "VEC");
        return ` ${temp2[0]?.value} ${temp1[0]?.value}(㎧) `;
    }

    useEffect(() => {
        setData(detailData);
        if(detailData.site_date !== undefined){
            setDateInit();
        }
        
        const options = projectData.map(item => {
            return {value: item.jno, label:item.project_nm};
        });
        setProjectOption(options);
    }, [isEdit]);

    useEffect(() => {
        if(addressData !== null){
            handleChange("site_pos", addressData)
        }
    }, [addressData])

    useEffect(() => {
        if (data !== null){
            handleChange("site_date")
        }
    }, [openingDate, closingPlanDate, closingForecastDate, closingActualDate])

    return ( data !== null &&
        <>
            <div className="grid-site">
            {/* 첫 번째 열 */}
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "1" }}>
                <div className="grid-site-title">
                    현장상세
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        지역 (코드)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {data.loc_name}{`(${data.loc_code||"-"})`}
                        </div>
                        {/* {isEdit ? (
                            <input
                            style={{ width: "100%", padding: "0.5rem" }}
                            type="text"
                            name={"loc_name"}
                            value={data.loc_name + ` (${data.loc_code||"-"})`}      
                            onChange={(e) => handelChange(e.target.name, e.target.value)}
                            />
                            ) : (
                                <div className="read-only-input">
                                {data.loc_name}{`(${data.loc_code||"-"})`}
                                </div>
                                )} */}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        현장명
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {data.site_nm}
                        </div>
                        {/* {isEdit ? (
                            <input
                            style={{ width: "100%", padding: "0.5rem" }}
                            type="text"
                            name={"site_nm"}
                            value={data.site_nm}
                            onChange={(e) => handelChange(e.target.name, e.target.value)}
                            />
                            ) : (
                                <div className="read-only-input">
                                {data.site_nm}
                                </div>
                                )} */}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        시작일
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={openingDate} setTime={setOpeningDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data?.site_date?.opening_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(계획)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingPlanDate} setTime={setClosingPlanDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data?.site_date?.closing_plan_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(예정)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingForecastDate} setTime={setClosingForecastDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data?.site_date?.closing_forecast_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(실행)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingActualDate} setTime={setClosingActualDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data?.site_date?.closing_actual_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        기본 프로젝트
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {/* <div className="read-only-input">
                            {data.default_project_name}
                        </div> */}
                        {isEdit ? (
                            <div style={{display: "flex", marginLeft: "5px"}}>
                                <Select
                                    onChange={(item) => handleChangeValue("default_jno", item.value)}
                                    defaultValue={projectOption.find(option => option.value === data.default_jno)}
                                    options={projectOption || []}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 999999999, // 모달보다 높게
                                        }),
                                        container: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                        }),
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="read-only-input">
                                {data.default_project_name}
                            </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "9" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        주소
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            { 
                            addressData !== null ?
                            `${addressData?.roadAddress}` 
                            :
                                `${data?.site_pos?.road_address}`
                            }
                            {isEdit ? (
                                <Button
                                text={"변경"}
                                onClick={() => {
                                    handleChangeValue("searchOpen", true)
                                }}
                                style={{width : "50px", padding:"0.25rem"}}
                                ></Button>
                            ) : (
                                <></>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "10" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        현장 날씨
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {
                                getIsWhether(data.whether) ?
                                <>
                                    <>{getPtyNSkyData(data.whether)}</>
                                    /
                                    <>{getRn1Data(data.whether)}</>
                                    /
                                    <>{getT1hData(data.whether)}</>
                                    /
                                    <>{getWindData(data.whether)}</>
                                </>                                                         
                                : "날씨 정보가 없습니다."
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "11" }}>
                <div style={{ width: "100%" }}>
                    <label className="text-label">비고</label>
                    <div className="form-textbox">
                        {isEdit ? (
                            <textarea
                            rows={4}
                            value={(data !== null ? etc.replace(/\\n/g, "\n") : "")}
                            name={"etc"}
                            onChange={(e) => {
                                // 실제 개행문자 '\n'을 '\\n'으로 치환하여 상태에 저장
                                setEtc(e.target.value);
                            }}
                            onBlur={() => handleChange("etc")}
                            />
                        ) : (
                            /* 보기 모드 */
                            <div className="view-mode" style={{ whiteSpace: "pre-wrap" }}>
                                {data.etc?.replace(/\\n/g, "\n")}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 두 번째 열 */}
            <div className="form-control" style={{ gridColumn: "2", gridRow: "2 / span 9" }}>
                 <Map roadAddress={data?.site_pos?.road_address}></Map>
            </div>
        </div>
    </>
    );
}
export default DetailSite;
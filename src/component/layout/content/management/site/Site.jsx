import { useState, useEffect, useReducer } from "react";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios"
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import SiteReducer from "./SiteReducer"
import DetailModal from "./DetailModal";
import Loading from "../../../../module/Loading";
import NonUsedProjectModal from "../../../../module/modal/NonUsedProjectModal";
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
import Modal from "../../../../module/Modal";
import Button from "../../../../module/Button";
import { Common } from "../../../../../utils/Common";
import warningWhether from "../../../../../assets/image/warningWhether.png"

/**
 * @description: 현장 관리 페이지
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 2025-03-14
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - DetailModal: 상세화면
 * - Modal: 요청 성공/실패 모달
 * 
 * @additionalInfo
 * - API:
 *    Http Method - GET : /site (현장관리 조회), /site/stats (현장상태 조회), /project/count (프로젝트별 근로자 수 조회)
 *    Http Method - PUT : /site (현장관리 수정)
 * - 주요 상태 관리: useReducer
 */
const Site = () => {
    const [state, dispatch] = useReducer(SiteReducer, {
        list: [],
        code: [],
        dailyTotalCount: {},
    })

    const { user } = useAuth();

    const [isMod, setIsMod] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetail, setIsDetail] = useState(false);
    const [detailTitle, setDetailTitle] = useState("");
    const [detailData, setDetailData] = useState({});
    const [isSiteAdd, setIsSiteAdd] = useState({});
    const [isNonPjModal, setIsNonPjModal] = useState(false);
    const [addSiteJno, setAddSiteJno] = useState("");

    // 기상특보
    const [warningListOpen, setWarningListOpen] = useState(false);
    const [warningData, setWarningData] = useState([]);

    // modal - 현장 수정용
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    // modal - 현장 추가용
    const [isModal2, setIsModal2] = useState(false);
    const [modalTitle2, setModalTitle2] = useState("");
    const [modalText2, setModalText2] = useState("");
    const [modal2type, setModal2Type] = useState("");
    const [modal2Confirm, setModal2Confirm] = useState("");
    const [modal2Cancel, setModal2Cancel] = useState("");

    // 현장 상세
    const onClickRow = (idx) => {
        let item;
        if (state.list[idx].type === "main") {
            item = state.list[idx];
        } else {
            for (let i = idx; i > -1; i--) {
                if (state.list[i].type === "main") {
                    item = state.list[i];
                    break;
                }
            }
        }

        setDetailTitle(`${item.site_nm}`)
        setDetailData(item);
        setIsDetail(true);
        setIsSiteAdd(false);
    }

    // 현장 관리 추가
    const onClickSaveBtn = () => {
        setIsNonPjModal(true);
    }

    // 현장 관리 추가 창 닫기
    const handleAddSiteModalExitBtn = () => {
        setIsNonPjModal(false);
    }

    // 현장 관리 추가 프로젝트 선택
    const handleOnClickProjectRow = (item) => {
        setAddSiteJno(item.jno);
        setIsModal2(true);
        setModalTitle2("현장 생성");
        setModalText2("선택한 프로젝트로 현장을 생성하겠습니까?");
        setModal2Confirm("예");
        setModal2Cancel("아니요");
        setModal2Type("ADD_SITE");
    }

    // 현장 생성 확인 모달 "예"
    const handleModal2Confirm = () => {
        if (modal2type === "ADD_SITE") {
            setIsModal2(false);
            addSite();
        } else if (modal2type === "ADD_SITE_RES") {
            setIsModal2(false);
        }
    }

    // 현장 생성 확인 모달 "아니요"
    const handleModal2Cancel = () => {
        if (modal2type === "ADD_SITE") {
            setAddSiteJno("");
            setIsModal2(false);
        } else if (modal2type === "ADD_SITE_RES") {
            setIsModal2(false);
        }
    }

    // 현장 관리 추가
    const addSite = async () => {
        const param = {
            jno: addSiteJno,
            uno: user.uno,
            user_name: user.userName
        };

        setIsLoading(true);
        const res = await Axios.POST("/site", param);

        setModalTitle2("현장 생성");
        if (res?.data?.result === "Success") {
            setModalText2("선택한 프로젝트로 현장이 생성되었습니다.");
            getData();
        } else {
            setModalText2("선택한 프로젝트로 현장을 생성하는데 실패하였습니다.");
        }
        setModal2Confirm("확인");
        setModal2Cancel("");
        setModal2Type("ADD_SITE_RES");
        setIsModal2(true);

        setIsLoading(false);
    }

    // 현장 상세 화면 종료
    const handleExitBtn = () => {
        setIsDetail(false);
        setDetailData({});
    }

    // 날씨 api 정보 확인
    const getIsWhether = (whether) => {
        if (whether.length === 0) return false;
        return true;
    }

    // 현장 데이터 수정
    const saveData = async (data) => {
        data = {
            ...data,
            mod_uno: user.uno,
            mod_user: user.userName,
        }

        const res = await Axios.PUT("/site", data)

        if (res?.data?.result === "Success") {
            setModalText("현장 수정에 성공하였습니다.")
            setIsDetail(false);
            getData();
        } else {
            setModalText("현장 수정에 실패하였습니다.")
            setIsMod(false);
        }
        setModalTitle("현장관리 수정")
        setIsOpenModal(true);
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
                break;
            default: return "";
        }

        return <>
            <img src={whetherIcon} style={{ width: "19px" }} /> {whetherText}
        </>
    }

    // 날씨(강수량)
    const getRn1Data = (whether) => {
        const temp = whether?.filter(item => item.key === "RN1");
        return ` 강수량: ${temp[0]?.value}(㎜) `;
    }

    // 날씨(기온)
    const getT1hData = (whether) => {
        const temp = whether?.filter(item => item.key === "T1H");
        return ` 기온: ${temp[0]?.value}(°C) `;
    }

    // 날씨(풍속,풍향)
    const getWindData = (whether) => {
        const temp1 = whether?.filter(item => item.key === "WSD");
        const temp2 = whether?.filter(item => item.key === "VEC");
        return ` ${temp2[0]?.value} ${temp1[0]?.value}(㎧) `;
    }

    // 현장상태 조회
    const getSiteStatsData = async () => {
        const res = await Axios.GET(`/site/stats?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "STATS", list: res?.data?.values?.list });
        }
    }

    // 프로젝트별 근로자 수 조회
    const getWorkerCountData = async () => {
        const res = await Axios.GET(`/project/count?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}`);
        
        if (res?.data?.result === "Success") {
            dispatch({ type: "COUNT", list: res?.data?.values?.list });
        }
    }


    // 현장 정보 조회
    const getData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/site?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}&pCode=SITE_STATUS`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", site: res?.data?.values?.site, code: res?.data?.values?.code });
        }

        setIsLoading(false);
    }

    // 기상특보 현황 조회
    const getWarningData = async () => {
        const res = await Axios.GET(`/api/whether/wrn`)

        if (res?.data?.result === "Success") {
            setWarningData(res.data.values.list)
        } else if (res?.data?.result === "Failure") {

        }
    }

    // 기상특보현황에 마우스 올라간 경우
    useEffect(() => {
        if (warningListOpen) {
            getWarningData()
        }
    }, [warningListOpen])

    // 현장상태 5초마다 갱신
    useEffect(() => {
        getData();

        const interval = setInterval(() => {
            getSiteStatsData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // 프로젝트별 근로자 수 5초마다 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            // getWorkerCountData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div>
            <Loading
                isOpen={isLoading}
            />
            <Modal
                isOpen={isOpenModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
            <Modal
                isOpen={isModal2}
                title={modalTitle2}
                text={modalText2}
                confirm={modal2Confirm}
                fncConfirm={handleModal2Confirm}
                cancel={modal2Cancel}
                fncCancel={handleModal2Cancel}
            />
            <NonUsedProjectModal
                isOpen={isNonPjModal}
                fncExit={handleAddSiteModalExitBtn}
                onClickRow={handleOnClickProjectRow}
            />
            {
                isDetail &&
                <DetailModal
                    isOpen={isDetail}
                    setIsOpen={setIsDetail}
                    title={detailTitle}
                    detailData={detailData}
                    isEditBtn={true}
                    exitBtnClick={handleExitBtn}
                    saveBtnClick={(data) => saveData(data)}
                    isSiteAdd={isSiteAdd}
                />
            }
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">현장 관리</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>
                    <div className="table-header-right">
                        <Button text={"추가"} onClick={() => onClickSaveBtn()} />
                    </div>
                </ol>

                <div className="card mb-4">
                    <div className="card-body">
                        <div className="square-title">현장 목록</div>
                        <div className="square-container">
                            {
                                state.code.length === 0 ?
                                    <></>
                                    :
                                    state.code.map((item, idx) => (
                                        <div className="square-inner" key={idx}>
                                            <div className="square" style={{ backgroundColor: item.code_color }}></div>{item.code_nm}
                                        </div>
                                    ))
                            }
                            {/* 기상특보 현황 :: start */}
                            <div
                                className="square-title"
                                style={{ position: "absolute", right: "3rem" }}
                                onMouseEnter={() => setWarningListOpen(true)}
                                onMouseLeave={() => setWarningListOpen(false)}
                            >
                                <img src={warningWhether} style={{width:"30px", margin:"5px"}}></img>
                                기상특보현황</div>
                            {
                                warningListOpen ?
                                    <div style={{ width: "70%", height: "70%" }}>
                                        <div style={{ ...modalStyle }}>
                                            <div style={{ ...header }}>기상특보</div>
                                            {
                                                warningData.length === 0 ?
                                                    <div>
                                                        현재 조회된 기상특보는 없습니다.
                                                    </div>

                                                    :
                                                    warningData.map((item, idx) => (
                                                        <div style={{ ...listStyle }} key={idx}>
                                                            <div className="square-title" >{item.warning}</div>
                                                            <ul style={{ listStylePosition: "inside", paddingLeft: "0" }}>
                                                                {item.area.map((area, areaIdx) => (
                                                                    <li style={{ paddingLeft: "1.2em", textIndent: "-1.0em" }} key={areaIdx}>{area}</li>
                                                                ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    </div>
                                    :
                                    <></>
                            }
                            {/* 기상특보현황 :: end */}
                        </div>

                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="fixed-left" rowSpan={2} style={{ width: "10px", left: "0px" }}></th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "100px", left: "10px" }}>발주처</th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "250px", left: "110px" }}>현장</th>
                                <th colSpan={2} style={{ width: "100px" }}>진행현황</th>
                                <th colSpan={2} style={{ width: "80px" }}>HTENC</th>
                                <th colSpan={2} style={{ width: "80px" }}>협력사</th>
                                <th rowSpan={2} style={{ width: "40px" }}>소계<br />(M/D)</th>
                                <th rowSpan={2} style={{ width: "40px" }}>장비</th>
                                <th rowSpan={2} style={{ width: "400px" }}>작업내용</th>
                                <th className="fixed-right" rowSpan={2} style={{ width: "180px", right: 0 }}>날씨</th>
                            </tr>
                            <tr>
                                <th style={{ width: "50px" }}>공정률<br />(%)</th>
                                <th style={{ width: "50px" }}>누계<br />(M/D)</th>
                                <th style={{ width: "40px" }}>공사</th>
                                <th style={{ width: "40px" }}>안전</th>
                                <th style={{ width: "40px" }}>관리</th>
                                <th style={{ width: "40px" }}>근로자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.list.length === 0 ?
                                    <tr>
                                        <td className="center" colSpan={13}>현장 관리 내용이 없습니다.</td>
                                    </tr>
                                    :
                                    state.list.map((item, idx) => (
                                        item.type === "main" ?
                                            <tr key={idx}>
                                                {/* 현장구분 */}
                                                <td className="fixed-left" rowSpan={item.rowSpan} style={{ padding: 0, position: 'sticky', left: "0px" }}>
                                                    <div style={{
                                                        backgroundColor: item.siteStatsColor,
                                                        width: '100%',
                                                        position: 'absolute',
                                                        top: 0,
                                                        bottom: 0,
                                                        margin: "0.5px"
                                                    }}></div>
                                                </td>
                                                {/* 발주처 */}
                                                <td className="center fixed-left" rowSpan={item.rowSpan} style={{ left: "10px" }}>{item.originalOrderCompName || ""}</td>
                                                {/* 현장 */}
                                                <td className="left ellipsis text-hover fixed-left" style={{ cursor: "pointer", left: "110px" }} onClick={() => onClickRow(idx)}>{item.site_nm || ""}</td>
                                                {/* 공정률 */}
                                                <td className="center" rowSpan={item.rowSpan} style={{ fontWeight: "bold" }}>66%</td>
                                                {/* 누계 */}
                                                <td className="right" rowSpan={item.rowSpan} style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_all), 0))
                                                    }
                                                </td>
                                                {/* 공사 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_work), 0))
                                                    }
                                                </td>
                                                {/* 안전 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_safe), 0))
                                                    }
                                                </td>
                                                {/* 관리 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_manager), 0))
                                                    }
                                                </td>
                                                {/* 근로자 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_not_manager), 0))
                                                    }
                                                </td>
                                                {/* 소계 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_date), 0))
                                                    }
                                                </td>
                                                {/* 장비 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(0)
                                                    }
                                                </td>
                                                {/* 작업내용 */}
                                                <td className="left ellipsis">
                                                    {
                                                        item.project_list.length === 1 ?
                                                            item.project_list[0]?.daily_content_list.length !== 0 ?
                                                                <ul>
                                                                    <li>
                                                                        {
                                                                            item.project_list[0].daily_content_list.length > 1 ?
                                                                                `${item.project_list[0].daily_content_list.length} 외 ${item.project_list[0].daily_content_list.length - 1} 건`
                                                                                :
                                                                                `${item.project_list[0].daily_content_list.length}`
                                                                        }
                                                                    </li>
                                                                </ul>
                                                                :
                                                                <ul>
                                                                    <li className="center" style={{ color: "#a5a5a5" }}>
                                                                        -
                                                                    </li>
                                                                </ul>
                                                            :
                                                            ""
                                                    }

                                                </td>
                                                {/* 날씨 */}
                                                <td className="center fixed-right" rowSpan={item.rowSpan}>
                                                    {
                                                        getIsWhether(item.whether) ?
                                                            <>
                                                                <>{getPtyNSkyData(item.whether)}</>
                                                                /
                                                                <>{getRn1Data(item.whether)}</>
                                                                <br />
                                                                <>{getT1hData(item.whether)}</>
                                                                /
                                                                <>{getWindData(item.whether)}</>
                                                            </>
                                                            : "날씨 정보가 없습니다."
                                                    }
                                                </td>
                                            </tr>
                                            :
                                            <tr key={idx}>
                                                {/* 현장 */}
                                                <td className="left ellipsis text-hover fixed-left" style={{ cursor: "pointer", left: "110px" }} onClick={() => onClickRow(idx)}><li>{item.project_nm}</li></td>
                                                {/* 공사 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_work)}</td>
                                                {/* 안전 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_safe)}</td>
                                                {/* 관리 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_manager)}</td>
                                                {/* 근로자 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_not_manager)}</td>
                                                {/* 소계 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>{Common.formatNumber(item.worker_count_date)}</td>
                                                {/* 장비 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>{Common.formatNumber(0)}</td>
                                                {/* 작업내용 */}
                                                <td className="left ellipsis">
                                                    {
                                                        item?.daily_content_list.length === 0 ?
                                                            <ul>
                                                                <li>
                                                                    {
                                                                        item.daily_content_list.length > 1 ?
                                                                            `${item.daily_content_list.length} 외 ${item.daily_content_list.length - 1} 건`
                                                                            :
                                                                            `${item.daily_content_list.length}`
                                                                    }
                                                                </li>
                                                            </ul>
                                                            :
                                                            <ul>
                                                                <li className="center" style={{ color: "#a5a5a5" }}>
                                                                    -
                                                                </li>
                                                            </ul>
                                                    }
                                                </td>
                                                {/* 날씨 */}
                                                {/* <td className="center">날씨....</td> */}
                                            </tr>
                                    ))
                            }
                            <tr style={{fontWeight: "bold"}}>
                                <td colSpan={3} className="fixed-left" style={{backgroundColor: "#004377"}}></td>
                                <td colSpan={2} className="center">일일 누계</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_work)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_safe)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_manager)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_not_manager)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_date)}</td>
                                <td className="right">{Common.formatNumber(0)}</td>
                                <td style={{backgroundColor: "#004377", boxShadow: "inset -0.4px 0 0 0 #004377"}}></td>
                                <td className="fixed-right" style={{backgroundColor: "#004377", boxShadow: "inset 0.4px 0 0 0 #004377"}}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}

export default Site;


const modalStyle = {
    position: "absolute",
    boxSizing: "border-box",
    right: "0px",
    zIndex: '9998',
    backgroundColor: 'rgb(255,255,255)',
    padding: "10px 0px",
    border: "1px solid rgb(200,200,200)",
    borderRadius: "10px",
    width: '30vw',
    minWidth: "18rem",
    maxWidth: "32rem",
    height: "30rem",
    boxShadow: '10px 10px 1px rgb(0, 0, 0, 0.3)',
    margin: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: "unset",
    overflowY: "auto",
    overflowX: "hidden",
    alignItems: "center"
};

const header = {
    backgroundColor: 'beige',
    color: 'black',
    display: "flex",
    flexDirection: "column",
    textAlign: 'center',
    justifyContent: "center",
    borderRadius: "10px",
    width: "90%",
    height: "10%",
    margin: ".5rem .5rem",
    fontWeight: "bold",

}

const listStyle = {
    width: "85%",
    textWrap: "wrap",
    wordBreak: "break-all",
}
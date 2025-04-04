
import { useEffect, useState } from "react";
import Exit from "../../../assets/image/exit.png";
import { Axios } from "../../../utils/axios/Axios";
import { useAuth } from "../../context/AuthContext";
import "../../../assets/css/Table.css"
import Modal from "../Modal";

// 조직도 모달
const OrganizationModal = ({isOpen, fncExit, type, projectNo}) => {
    // 조직도 상세 모달 오픈 코드
    const { project } = useAuth();
    const [ client, setClient ] = useState([]);
    const [ hitech, setHitech ] = useState([]);
    const [ modalOpen, setModalOpen ] = useState(false);


    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }

    // 조직도 데이터 가져오기
    const getOrganization = async () => {
        let jno = null;
        if(type === "detail"){
            jno = projectNo || null;
        }else{
            jno = project?.jno || null
        }

        if(jno === null){
            setModalOpen(true)
            setClient([])
            setHitech([])
            return
        }else{
            setModalOpen(false)
        }

        const res = await Axios.GET(`/project/organization/${jno}`)
        if(res?.data?.result === "Success"){
            setClient(res?.data?.values?.client)
            setHitech(res?.data?.values?.hitech)            
        }

    }

    // 조직도가 열린 경우, 바깥영역의 스크롤 없애기
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            // 엔터 키 이벤트 핸들러
            const handleKeyDown = (event) => {
                if (event.key === "Escape") {
                    fncExit();
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    // 조직도 열림 상태와 프로젝트가 변경된 경우
    useEffect (() => {
        // 데이터 불러오기
        getOrganization()

    }, [project, isOpen])

    return <>
            {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <Modal
                            isOpen={modalOpen}
                            title={"조직도"}
                            text={"프로젝트를 선택해주세요."}
                            confirm={"확인"}
                            fncConfirm={() => {
                                setModalOpen(false)
                                fncExit()
                            }}
                        >
                        </Modal> 
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px", margin : "5px 0px"}}>
                            <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>조직도</h2>

                            <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                            </div>
                        </div>
                        
                        <div className="table-container" style={tableStyle}>
                            {
                                client.length === 0  && hitech.length === 0 ?
                                <h5 style={nonProjectStyle}>PROJECT를 선택하세요.</h5>
                                :
                                <table>
                                    <thead className="fixed">
                                        <tr>
                                            <th style={{width: "120px" }}>공종</th>
                                            <th style={{width: "120px"}}>담당</th>
                                            <th style={{width: "200px"}}>담당상세</th>
                                            <th style={{width: "110px"}}>이름</th>
                                            <th style={{width: "110px"}}>직위</th>
                                            <th style={{width: "145px"}}>소속</th>
                                            <th style={{width: "125px"}}>핸드폰</th>
                                            <th style={{width: "125px"}}>전화</th>
                                            <th className="fixed-left">이메일</th>
                                        </tr>
                                        <tr>
                                            {
                                                client?.length ?
                                                <th colSpan={9} className="sub-title">{client[0]?.organizations[0]?.dept_name || ""}</th>
                                                :
                                                null
                                            }
                                        </tr>
                                    </thead>                                
                                    <tbody>
                                        {
                                            client.map((arr, arrIdx) => {
                                                return arr.organizations.map((item, idx) => {
                                                    return  <tr key={idx}>
                                                        { idx === 0 ? 
                                                            <td style={{...wrapText, ...tdStyle}} rowSpan={arr.organizations.length}> {arr.func_name}</td>
                                                            :
                                                            null
                                                        }
    
                                                            {/* 담당 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.cd_nm}</td>
                                                            {/* 담당상세 */}
                                                            <td className="left" style={{...wrapText, ...tdStyle}}>{item.charge_detail}</td>
                                                            {/* 이름 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.user_name}</td>
                                                            {/* 직위 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.duty_name}</td>
                                                            {/* 소속 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.dept_name}</td>                                                            
                                                            {/* 핸드폰 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.cell}</td>                                                            
                                                            {/* 전화 */}
                                                            <td className="center" style={{...wrapText, ...tdStyle}}>{item.tel}</td>                                                            
                                                            {/* 이메일 */}
                                                            <td className="left" style={{...wrapText, ...tdStyle, wordBreak :"break-all"}}>{item.email}</td>  
                                                    </tr>
                                                    })
                                                    
                                                }) 
                                            }
                                    </tbody>
                                    <thead className="fixed" style={{top:'40px'}}>
                                        <tr>
                                            <th colSpan={7} className="sub-title">(주)하이테크엔지니어링</th>
                                            <th colSpan={2} className="sub-title">
                                                <div style = {legend}>
                                                    <div style={{fontWeight:"bold"}}>내부직원</div>
                                                    <div style={{color : "lightgray"}}>퇴사직원</div>
                                                    <div>외부직원</div>
                                                    <div style={{backgroundColor : "beige"}}>협력업체직원</div>
                                                </div> 
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        hitech.map((arr, arrIdx) => {
                                            return arr.organizations.map((item, idx) => {
                                                return  <tr key={idx}>
                                                    { idx === 0 ? 
                                                        <td style={{...wrapText, ...tdStyle}} rowSpan={arr.organizations.length}> {arr.func_name}</td>
                                                        :
                                                        null
                                                    }

                                                        {/* 담당 */}
                                                        <td className="center" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.cd_nm}</td>
                                                        {/* 담당상세 */}
                                                        <td className="left" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.charge_detail}</td>
                                                        {/* 이름 */}
                                                        <td 
                                                            className="center" 
                                                            style={{...wrapText, ...tdStyle, 
                                                                    color: item.is_use === 'N' ? "lightgray"  :  "",// 퇴사자  
                                                                    fontWeight : item.is_use === "Y" ? item.co_id === "1" ? "bold" : "" : "", // 내부직원
                                                                    backgroundColor : item.is_use === "Y" ? item.co_id !== "1" && item.co_id !== null ? "beige" : "" : "" // 협력사
                                                                    }}>
                                                                {item.user_name}
                                                        </td>
                                                        {/* 직위 */}
                                                        <td className="center" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.duty_name}</td>
                                                        {/* 소속 */}
                                                        <td className="center" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.dept_name}</td>                                                            
                                                        {/* 핸드폰 */}
                                                        <td className="center" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.cell}</td>                                                            
                                                        {/* 전화 */}
                                                        <td className="center" style={{...wrapText, ...tdStyle, color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.tel}</td>                                                            
                                                        {/* 이메일 */}
                                                        <td className="left" style={{...wrapText, ...tdStyle, wordBreak :"break-all", color : item.is_use === 'N' ?  "lightgray" : ""}}>{item.email}</td>  
                                                </tr>
                                                })
                                                
                                            }) 
                                            
                                        }
                                    </tbody>
                                </table>
                            }
                        </div>
                    </div>
                </div>
                : 
                <></>
            }
    </>
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
};
  
const modalStyle = {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '1300px',
    width: '95%',
    height: '80%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
};

const tableStyle = {
    margin: '15px 0px',
    height: "calc(100% - 60px)",
    overflow: "scroll",
};

const nonProjectStyle = {
    backgroundColor: 'beige',
    color: 'black',
    padding: '1rem',
    textAlign: 'center',

}

const legend = {
    backgroundColor :'white',
    display: 'flex',
    border : '1px solid black',
    margin : '2px 5px',
    justifyContent : 'space-around',
    padding : '4px 0px'
}


const wrapText = {
    whiteSpace : "normal",
    textOverflow : "unset",
    textWrap : "wrap",
}

const tdStyle = {
    height : "28px",
    padding : "5px 8px",
    fontSize : "13px"
}


export default OrganizationModal
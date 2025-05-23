import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useNavigate } from "react-router-dom";
import "../../../../../assets/css/Table.css";

/**
 * @description: 안전관리자 테이블
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /company/safe-manager (안전관리자)
 */
const CompanySafeManager = ({jno, styles}) => {
    const navigate = useNavigate();

    const [manager, setManager] = useState([]);

    // 안전관리자 정보 조회
    const getData = async () => {
        if (jno != null) {   
            try {
                const res = await Axios.GET(`/company/safe-manager?jno=${jno}`);
                
                if (res?.data?.result === "Success") {
                    setManager(res?.data?.values?.list);
                }
            } catch(err) {
                navigate("/error");
            }
        }
    };

    useEffect(() => {
        getData();
    }, [jno]);

    return(
        <>
            <table style={{...styles}}>
                <thead>
                    <tr>
                        <th>안전관리자</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        manager.length === 0 ?
                            <tr>
                                <td className="center">-</td>
                            </tr>
                        :
                        manager.map((item, idx) => (
                            <tr key={idx}>
                                <td >
                                    {
                                    (item.team_leader === "Y" ) ? 
                                    <div
                                        style={{
                                            boxSizing: "border-box",
                                            display: "inline-block",
                                            margin: "0px 5px 0px 0px",
                                            padding: "3px",
                                            borderRadius: "3px",
                                            backgroundColor: "#004377",
                                            color: "white",
                                            fontSize: "12px",
                                        }}
                                        >
                                        팀장 
                                    </div>
                                    : <div style={{ display:"inline-block", width:"28px", margin:"0px 2px"}}></div>
                                        }
                                    {`${item.user_name} ${item.duty_name} (${item.user_id})`}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
}
export default CompanySafeManager;